import React, { useState, useEffect, useCallback } from "react";
import { IReceipt, PaymentMode } from "../types";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { ReceiptModal } from "./ReceiptModal";
import {
  Search,
  CheckCircle2,
  MessageSquare,
  Eye,
  Phone,
  RefreshCw,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

export const UnpaidReceipts: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<IReceipt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For Mark Paid Action Dialog
  const [payingReceipt, setPayingReceipt] = useState<IReceipt | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<PaymentMode>("Cash");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUnpaid = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getReceipts({ status: "unpaid" });
      setReceipts(data);
    } catch (err) {
      console.error("Error fetching unpaid receipts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnpaid();
  }, [fetchUnpaid]);

  const canChangeStatus = Boolean(
    user?.isMainAdmin || user?.role === "admin" || user?.canUpdateReceiptStatus,
  );

  const handleOpenMarkPaid = (rec: IReceipt) => {
    if (!canChangeStatus) {
      alert(
        "पावती वर्गणी जमा (Paid) किंवा बाकी (Unpaid) करण्याचा अधिकार फक्त मुख्य अध्यक्ष किंवा त्यांनी प्राधिकृत केलेल्या सदस्यांनाच आहे.",
      );
      return;
    }
    setPayingReceipt(rec);
  };

  const handleMarkPaid = async () => {
    if (!payingReceipt) return;
    if (!canChangeStatus) {
      alert("पावती वर्गणी जमा करण्याचा अधिकार नाही.");
      return;
    }
    setIsUpdating(true);
    try {
      const updated = await api.updateReceiptStatus(
        payingReceipt._id || payingReceipt.receiptNo,
        "paid",
        selectedPaymentMode,
      );
      setReceipts((prev) =>
        prev.filter(
          (r) =>
            r._id !== payingReceipt._id &&
            r.receiptNo !== payingReceipt.receiptNo,
        ),
      );
      setPayingReceipt(null);

      // Show updated receipt in modal
      setSelectedReceipt(updated);
      setIsModalOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to update receipt status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReminderWhatsApp = (receipt: IReceipt) => {
    const msg = `🚩 *॥ श्री गणेशाय नमः ॥* 🚩
*श्री गणेश मित्र मंडळ, शिरसवाडी (सातारा)*
सार्वजनिक गणेशोत्सव २०२६ - वर्गणी आठवण संदेश

सस्नेह नमस्कार, *${receipt.donorName}*,
श्री गणेश मित्र मंडळाच्या गणेशोत्सवासाठी आपली वर्गणी नोंद *₹${receipt.amount.toLocaleString("en-IN")}* (पावती क्र. *${receipt.receiptNo}*) बाकी आहे.

उत्सवाच्या चांगल्या नियोजनासाठी कृपया आपली वर्गणी मंडळाच्या कार्यकर्त्यांकडे जमा करावी ही नम्र विनंती.

_आपले नम्र: श्री गणेश मित्र मंडळ, शिरसवाडी_ 🙏`;

    const encoded = encodeURIComponent(msg);
    const cleanMobile = receipt.donorMobile.replace(/\D/g, "");
    const target = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = target
      ? `https://wa.me/${target}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  const filteredReceipts = receipts.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.donorName.toLowerCase().includes(q) ||
      (r.donorMobile && r.donorMobile.includes(q)) ||
      r.receiptNo.toLowerCase().includes(q) ||
      (r.donorAddress && r.donorAddress.toLowerCase().includes(q))
    );
  });

  const totalUnpaidSum = receipts.reduce(
    (sum, r) => sum + (Number(r.amount) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-amber-100 uppercase tracking-wider flex items-center space-x-1.5">
            <span>⏳</span>
            <span>{t.mandalName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif mt-1">
            {t.menuUnpaidReceipts}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
            {language === "mr"
              ? "येणे बाकी असलेल्या पावत्यांची यादी व वर्गणी जमा करण्याची सुविधा."
              : "List of pending / unpaid receipts with one-click payment collection."}
          </p>
        </div>

        <div className="bg-amber-900/60 border border-amber-300/40 rounded-xl p-3 sm:px-5 sm:py-3 text-right">
          <span className="text-[11px] text-amber-200 block uppercase font-medium">
            एकूण बाकी येणे रक्कम (Total Pending)
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-200 font-mono">
            ₹ {totalUnpaidSum.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-amber-100 block">
            {receipts.length} पावत्या प्रलंबित
          </span>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <button
          onClick={fetchUnpaid}
          disabled={loading}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>{t.refresh}</span>
        </button>
      </div>

      {/* Receipts Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500 border border-stone-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-2" />
          <p className="font-semibold text-sm">पावत्या लोड होत आहेत...</p>
        </div>
      ) : filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500 border border-stone-200">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-base font-bold text-stone-800">
            {language === "mr"
              ? "सर्व वर्गणी जमा झाली आहे!"
              : "No unpaid receipts found!"}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {language === "mr"
              ? "कोणतीही बाकी पावती उपलब्ध नाही."
              : "All issued receipts have been paid."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.map((rec) => (
            <div
              key={rec._id || rec.receiptNo}
              className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2.5">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {rec.receiptNo}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                    ⏳ बाकी (Unpaid)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-stone-900 text-sm">
                    {rec.donorName}
                  </div>
                  {rec.donorMobile && (
                    <div className="text-stone-600 flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span className="font-mono">+91 {rec.donorMobile}</span>
                    </div>
                  )}
                  {rec.donorAddress && (
                    <div className="text-stone-500 text-[11px] truncate">
                      📍 {rec.donorAddress}
                    </div>
                  )}
                </div>

                {/* Amount Highlight */}
                <div className="my-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-amber-900 font-semibold uppercase">
                    बाकी रक्कम:
                  </span>
                  <span className="text-base font-black text-amber-900 font-mono">
                    ₹ {Number(rec.amount).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="text-[10px] text-stone-500 flex justify-between border-t border-stone-100 pt-1.5">
                  <span>
                    जमाकर्ता: <strong>{rec.collectedByName}</strong>
                  </span>
                  <span>
                    {new Date(rec.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleOpenMarkPaid(rec)}
                  className={`col-span-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer ${
                    canChangeStatus
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                  }`}
                  title={
                    canChangeStatus
                      ? "वर्गणी जमा नोंदवा"
                      : "फक्त मुख्य अध्यक्ष किंवा प्राधिकृत सदस्य जमा करू शकतात"
                  }
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>जमा</span>
                </button>

                <button
                  onClick={() => handleSendReminderWhatsApp(rec)}
                  className="col-span-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  title="व्हॉट्सॲपवर आठवण पाठवा"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>आठवण</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedReceipt(rec);
                    setIsModalOpen(true);
                  }}
                  className="col-span-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  title="पावती पहा / व्हॉट्सॲप / PDF"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>पहा</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark As Paid Dialog Modal */}
      {payingReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-700 border-b pb-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  वर्गणी जमा नोंदवा (Mark as Paid)
                </h3>
                <p className="text-xs text-stone-500">
                  पावती क्र. {payingReceipt.receiptNo}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl text-xs space-y-1">
              <div>
                वर्गणीदार:{" "}
                <strong className="text-stone-900">
                  {payingReceipt.donorName}
                </strong>
              </div>
              <div>
                रक्कम:{" "}
                <strong className="text-emerald-700 text-sm font-mono">
                  ₹ {payingReceipt.amount.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                पेमेंट पद्धत निवडा:
              </label>
              <select
                value={selectedPaymentMode}
                onChange={(e) =>
                  setSelectedPaymentMode(e.target.value as PaymentMode)
                }
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cash">💵 रोख (Cash)</option>
                <option value="GPay">📱 Google Pay (GPay)</option>
                <option value="PhonePe">📱 PhonePe</option>
                <option value="Paytm">📱 Paytm</option>
                <option value="UPI">⚡ इतर UPI (UPI QR)</option>
                <option value="NetBanking">
                  🏦 बँक ट्रान्सफर (Net Banking)
                </option>
                <option value="Cheque">📜 चेक (Cheque)</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setPayingReceipt(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs rounded-xl"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleMarkPaid}
                disabled={isUpdating}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
              >
                {isUpdating ? "नोंदवत आहे..." : "✓ जमा करा"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={async (id, st) => {
          await api.updateReceiptStatus(id, st);
          fetchUnpaid();
        }}
      />
    </div>
  );
};
