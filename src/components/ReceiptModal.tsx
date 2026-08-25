import React, { useRef, useState, useEffect, useCallback } from "react";
import { IReceipt } from "../types";
import { PrintableReceipt } from "./PrintableReceipt";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { convertNumberToWords } from "../locales/translations";
import {
  Download,
  X,
  MessageSquare,
  ShieldCheck,
  Lock,
  Share2,
  Check,
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

// Baseline page width (mm). The page height is derived from the captured
// canvas's own aspect ratio (see buildReceiptPdf) so the output is NEVER
// stretched/squashed — regardless of how wide the receipt happened to be
// rendered on the screen it was captured from (mobile vs desktop).
const PDF_PAGE_WIDTH_MM = 148;
const CAPTURE_SCALE = 2.5;

interface GeneratedReceiptPdf {
  blob: Blob;
  canvas: HTMLCanvasElement;
}

// Single source of truth for turning the on-screen receipt into a PDF.
// Both the Download button and the WhatsApp share button call into this
// (via the de-duplicated getReceiptPdf() below) so there is only ever ONE
// html2canvas capture running against the DOM node at a time.
async function buildReceiptPdf(
  node: HTMLElement,
): Promise<GeneratedReceiptPdf> {
  const canvas = await html2canvas(node, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#FFFDF5",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png", 1.0);
  const pdfWidth = PDF_PAGE_WIDTH_MM;
  const pdfHeight = (canvas.height / canvas.width) * pdfWidth;

  const pdf = new jsPDF({
    orientation: pdfHeight >= pdfWidth ? "portrait" : "landscape",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
  });
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  const blob = pdf.output("blob");
  return { blob, canvas };
}

interface ReceiptModalProps {
  receipt: IReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (
    receiptId: string,
    status: "paid" | "unpaid",
  ) => Promise<void>;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mainAdminName, setMainAdminName] = useState<string>("अतुल पाटील");

  // 🔑 Single in-flight/most-recent PDF generation promise. Every caller —
  // the background pre-generation effect, the Download button, and the
  // WhatsApp share button — awaits THIS SAME promise instead of kicking off
  // its own html2canvas run. That guarantees only one capture ever touches
  // the DOM node at a time, which is what was causing "Download" and
  // "Share to WhatsApp" to visually stomp on each other / produce a
  // distorted-looking PDF when triggered close together.
  const pdfPromiseRef = useRef<Promise<GeneratedReceiptPdf> | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  const getReceiptPdf = useCallback((forceRegenerate = false) => {
    if (!receiptRef.current) {
      return Promise.reject(new Error("Receipt not rendered yet"));
    }
    if (pdfPromiseRef.current && !forceRegenerate) {
      return pdfPromiseRef.current;
    }
    const promise = buildReceiptPdf(receiptRef.current).catch((err) => {
      // Don't leave a rejected promise cached — let the next attempt retry.
      pdfPromiseRef.current = null;
      throw err;
    });
    pdfPromiseRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    let isMounted = true;
    api
      .getMandalInfo()
      .then((info) => {
        if (isMounted && info?.mainAdminName) {
          setMainAdminName(info.mainAdminName);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-generate the PDF as soon as the modal opens + mainAdminName resolves,
  // so Download / Share just reuse it = near-instant on click. Because
  // getReceiptPdf() is de-duplicated above, if the user clicks a button
  // before this finishes, the click simply awaits this same generation
  // instead of starting a second, conflicting one.
  useEffect(() => {
    if (!isOpen || !receipt) return;
    pdfPromiseRef.current = null; // reset for the new receipt
    setIsPreparing(true);

    // Small delay to let the DOM paint the receipt fully before capturing
    const timer = setTimeout(() => {
      getReceiptPdf()
        .catch((err) => console.error("Pre-capture failed:", err))
        .finally(() => setIsPreparing(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, receipt?.receiptNo, mainAdminName, getReceiptPdf]);

  if (!isOpen || !receipt) return null;

  const canChangeStatus = Boolean(
    user?.isMainAdmin || user?.role === "admin" || user?.canUpdateReceiptStatus,
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. WhatsApp Functionality: Share the actual PDF (not a text message) to
  // the recipient's WhatsApp number.
  const handleWhatsAppShare = async () => {
    if (!receipt || isExporting) return;

    const cleanMobile = (receipt.donorMobile || "").replace(/\D/g, "");
    const targetPhone =
      cleanMobile.length === 10
        ? `91${cleanMobile}`
        : cleanMobile.length > 10
          ? cleanMobile
          : "";

    // Desktop Chrome/Edge technically expose navigator.share/canShare, but
    // there's no WhatsApp app on the OS for that share sheet to hand a file
    // to — the call silently no-ops there. Only trust native file-share on
    // an actual phone/tablet, where it hands the PDF straight to the
    // WhatsApp app. Everywhere else (desktop), go straight to WhatsApp Web.
    const isMobileDevice =
      typeof navigator !== "undefined" &&
      (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const canUseNativeShare =
      isMobileDevice &&
      typeof navigator !== "undefined" &&
      !!navigator.share &&
      !!navigator.canShare;

    setIsExporting(true);
    setExportType("whatsapp");

    try {
      // Reuses the pre-generated PDF if it's ready; otherwise awaits the
      // same in-flight generation (never starts a second, competing one).
      const { blob, canvas } = await getReceiptPdf();
      const fileName = `ganesh-mitra-mandal_${receipt.receiptNo}.pdf`;

      const formattedDate = receipt.createdAt
        ? new Date(receipt.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-IN");
      const formattedTime = receipt.createdAt
        ? new Date(receipt.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "";
      const wordsText =
        receipt.amountInWords || convertNumberToWords(receipt.amount, "mr");

      const waText = `🚩 *॥ श्री गणेशाय नमः ॥* 🚩
*श्री गणेश मित्र मंडळ, शिरसवडी  (सातारा)*
सार्वजनिक गणेशोत्सव २०२६ - अधिकृत वर्गणी पावती

सस्नेह नमस्कार, *${receipt.donorName}* जी!
आपली गणेशोत्सव वर्गणी यशस्वीरीत्या प्राप्त झाली असून अधिकृत पावती सोबत जोडली आहे.

📄 *पावती क्रमांक:* ${receipt.receiptNo}
💰 *वर्गणी रक्कम:* ₹${Number(receipt.amount).toLocaleString("en-IN")}/- (${wordsText})
🗓️ *दिनांक:* ${formattedDate}${formattedTime ? ` (${formattedTime})` : ""}
💳 *पेमेंट पद्धत:* ${receipt.paymentMode}
✅ *पावती स्थिती:* ${receipt.paymentStatus === "paid" ? "वर्गणी जमा (PAID)" : "येणे बाकी (UNPAID)"}
👤 *जमाकर्ता:* ${receipt.collectedByName || "प्रतिनिधी"}${receipt.collectedByRole ? ` (${receipt.collectedByRole})` : ""}

॥ श्री गणरायाच्या कृपेने आपल्या घरी सुख, समृद्धी, आरोग्य आणि शांती लाभो हीच प्रार्थना! धन्यवाद! ॥
_श्री गणेश मित्र मंडळ, शिरसवडी  (धर्मादाय आयुक्तांकडील नोंदणी क्रमांक - महाराष्ट्र / 15416 / सातारा)_ 🙏`;

      const encodedMsg = encodeURIComponent(waText);
      const waUrl = targetPhone
        ? `https://api.whatsapp.com/send/?phone=${targetPhone}&text=${encodedMsg}`
        : `https://api.whatsapp.com/send/?text=${encodedMsg}`;

      let sharedDirectly = false;

      // Preferred path (mobile only): hand the actual PDF file to the OS
      // share sheet. This is the ONLY way a web page can make WhatsApp
      // receive a real attached file (image or PDF) instead of just a text
      // message.
      if (canUseNativeShare) {
        try {
          const file = new File([blob], fileName, {
            type: "application/pdf",
          });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `श्री गणेश मित्र मंडळ पावती क्र. ${receipt.receiptNo}`,
              text: waText,
              files: [file],
            });
            sharedDirectly = true;
            showToast(`✅ पावती PDF व्हॉट्सॲपवर पाठवण्यासाठी शेअर केली!`);
          }
        } catch (shareErr: any) {
          if (shareErr?.name === "AbortError") {
            return;
          }
          console.error("navigator.share failed:", shareErr);
        }
      }

      if (!sharedDirectly) {
        let imageCopied = false;
        try {
          if (
            typeof ClipboardItem !== "undefined" &&
            navigator.clipboard?.write
          ) {
            const pngBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, "image/png", 1.0),
            );
            if (pngBlob) {
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": pngBlob }),
              ]);
              imageCopied = true;
            }
          }
        } catch (clipErr) {
          console.warn("Clipboard image copy failed:", clipErr);
        }

        const link = document.createElement("a");
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        const waWindow = window.open(waUrl, "_blank");
        if (!waWindow) {
          showToast(
            "⚠️ Popup blocked! ब्राउझर सेटिंग्जमध्ये पॉपअप्सना परवानगी द्या.",
          );
        }

        showToast(
          imageCopied
            ? `🖼️ पावतीचा फोटो कॉपी झाला व मो. +${targetPhone} साठी व्हॉट्सॲप उघडले! चॅटमध्ये Ctrl+V ने फोटो पेस्ट करा व पाठवा.`
            : targetPhone
              ? `📄 पावती PDF डाऊनलोड झाली व मो. +${targetPhone} साठी व्हॉट्सॲप उघडले!`
              : `📄 पावती PDF डाऊनलोड झाली व व्हॉट्सॲप उघडले!`,
        );
      }
    } catch (err: any) {
      console.error("WhatsApp share error:", err);
      const url = targetPhone
        ? `https://wa.me/${targetPhone}`
        : "https://wa.me/";
      window.open(url, "_blank");
      showToast(`❌ शेअर करताना अडचण आली: ${err?.message || "अज्ञात त्रुटी"}`);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 2. Download PDF — reuses the same de-duplicated generator as the
  // WhatsApp share above, so this never races against a background
  // pre-capture or an in-flight share (that race is what used to produce
  // a randomly distorted/zoomed-looking PDF).
  const handleDownloadPDF = async () => {
    if (!receiptRef.current || isExporting) return;
    setIsExporting(true);
    setExportType("pdf");
    try {
      const { blob } = await getReceiptPdf();
      const fileName = `ganesh-mitra-mandal_${receipt.receiptNo}.pdf`;
      const link = document.createElement("a");
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      showToast(`✅ पावती PDF यशस्वीरित्या डाऊनलोड झाली! (${fileName})`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("❌ PDF निर्मितीमध्ये अडचण आली.");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleTogglePaid = async () => {
    if (!onStatusChange) return;
    setStatusUpdating(true);
    try {
      const newStatus = receipt.paymentStatus === "paid" ? "unpaid" : "paid";
      await onStatusChange(receipt._id || receipt.receiptNo, newStatus);
      showToast(
        `स्थिती बदलली: ${newStatus === "paid" ? "वर्गणी जमा" : "येणे बाकी"}`,
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-amber-300 flex flex-col max-h-[94vh]">
        <div className="bg-gradient-to-r from-amber-800 via-orange-800 to-red-800 text-amber-50 px-4 py-3 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🚩</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight font-serif">
                {t.receiptVarganiPavti}
              </h3>
              <p className="text-[11px] text-amber-200">
                {receipt.receiptNo} • {receipt.donorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white bg-amber-950/50 hover:bg-amber-950 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50 border-b border-amber-200 px-3 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleWhatsAppShare}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            title="पावतीची PDF तयार करून थेट वर्गणीदाराच्या व्हॉट्सॲप नंबरवर पाठवा"
          >
            <MessageSquare className="w-4 h-4 text-emerald-100" />
            <span>
              {exportType === "whatsapp"
                ? "पाठवत आहे..."
                : isPreparing
                  ? "तयार होत आहे..."
                  : "व्हॉट्सॲपवर पाठवा (PDF)"}
            </span>
            {receipt.donorMobile && (
              <span className="bg-emerald-800/90 text-emerald-100 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold">
                +91 {receipt.donorMobile}
              </span>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center space-x-1.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="पावती PDF स्वरूपात डाऊनलोड करा"
            >
              <Download className="w-4 h-4 text-red-100" />
              <span>
                {exportType === "pdf" ? "PDF तयार होत आहे..." : "PDF डाऊनलोड"}
              </span>
            </button>

            {onStatusChange && canChangeStatus && (
              <button
                onClick={handleTogglePaid}
                disabled={statusUpdating}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all border shadow-xs active:scale-95 cursor-pointer ${
                  receipt.paymentStatus === "unpaid"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700 text-white border-amber-700"
                }`}
                title="फक्त मुख्य अध्यक्ष / प्राधिकृत व्यक्ती पावती स्थिती बदलू शकतात"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {statusUpdating
                    ? "बदल होत आहे..."
                    : receipt.paymentStatus === "unpaid"
                      ? "✅ वर्गणी जमा (Mark Paid)"
                      : "⏳ येणे बाकी करा (Mark Unpaid)"}
                </span>
              </button>
            )}

            {onStatusChange && !canChangeStatus && (
              <div
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${
                  receipt.paymentStatus === "paid"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
                title="पावती स्थिती बदलण्याचा अधिकार फक्त मुख्य अध्यक्ष अतुल पाटील यांना आहे"
              >
                <Lock className="w-3 h-3 text-stone-400" />
                <span>
                  {receipt.paymentStatus === "paid"
                    ? "वर्गणी जमा (Paid)"
                    : "येणे बाकी (Unpaid)"}
                </span>
              </div>
            )}
          </div>
        </div>

        {toastMessage && (
          <div className="bg-emerald-50 border-b border-emerald-300 px-4 py-2.5 text-xs font-bold text-emerald-950 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center space-x-1.5">
              <span>{toastMessage}</span>
            </span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-800 hover:text-emerald-950 text-sm font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-100/90">
          <div ref={receiptRef} className="py-1">
            <PrintableReceipt receipt={receipt} mainAdminName={mainAdminName} />
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-4 py-2.5 flex items-center justify-between text-xs text-gray-600">
          <div>
            पावती जमाकर्ता:{" "}
            <strong className="text-gray-900">{receipt.collectedByName}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
