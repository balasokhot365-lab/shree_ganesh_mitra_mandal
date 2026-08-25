import React, { useState, useEffect } from "react";
import { IReceipt, IMandalInfo } from "../types";
import { GaneshaIcon, ShivajiMaharajIcon, MandalSeal } from "./FestiveIcons";
import { convertNumberToWords } from "../locales/translations";
import { api } from "../services/api";

interface PrintableReceiptProps {
  receipt: IReceipt;
  id?: string;
  isCompact?: boolean;
  mainAdminName?: string;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  receipt,
  id = "receipt-print-area",
  isCompact = false,
  mainAdminName: propMainAdminName,
}) => {
  const [mandalInfo, setMandalInfo] = useState<IMandalInfo>({
    mandalName: "श्री गणेश मित्र मंडळ",
    regNo: "धर्मादाय आयुक्तांकडील नोंदणी क्रमांक - महाराष्ट्र / 15416 / सातारा",
    location: "पद्मावती मळा,शिरसवडी , सातारा",
    mainAdminName: propMainAdminName || "उद्धव इंगळे",
    mainAdminMobile: "8275658844",
    mainAdminRole: "मुख्य अध्यक्ष",
  });

  useEffect(() => {
    let isMounted = true;
    api
      .getMandalInfo()
      .then((info) => {
        if (isMounted && info) {
          setMandalInfo((prev) => ({
            ...prev,
            ...info,
            mainAdminName:
              propMainAdminName || info.mainAdminName || prev.mainAdminName,
          }));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [propMainAdminName]);

  const dbAdminName = propMainAdminName || mandalInfo.mainAdminName;

  const formattedDate = receipt.createdAt
    ? new Date(receipt.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const formattedTime = receipt.createdAt
    ? new Date(receipt.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const amountInMarathiWords =
    receipt.amountInWords || convertNumberToWords(receipt.amount, "mr");

  return (
    <div
      id={id}
      style={{
        backgroundColor: "#FFFDF5",
        borderColor: "#78350F",
        color: "#1C1917",
      }}
      className={`border-4 border-double rounded-2xl p-4 sm:p-6 text-stone-900 shadow-md relative select-text font-sans ${
        isCompact ? "max-w-md mx-auto text-xs" : "max-w-2xl mx-auto"
      }`}
    >
      {/* Decorative Traditional Border Corner Accents */}
      <div
        style={{ color: "#78350F" }}
        className="absolute top-1.5 left-2 text-sm font-bold select-none"
      >
        卐
      </div>
      <div
        style={{ color: "#78350F" }}
        className="absolute top-1.5 right-2 text-sm font-bold select-none"
      >
        卐
      </div>
      <div
        style={{ color: "#78350F" }}
        className="absolute bottom-1.5 left-2 text-sm font-bold select-none"
      >
        卐
      </div>
      <div
        style={{ color: "#78350F" }}
        className="absolute bottom-1.5 right-2 text-sm font-bold select-none"
      >
        卐
      </div>

      {/* Top Header with Lord Ganesha on Top-Left & Shivaji Maharaj on Top-Right */}
      <div
        style={{ borderBottomColor: "#D97706" }}
        className="flex items-center justify-between border-b-2 pb-3 mb-3 gap-2"
      >
        {/* Top-Left Corner: Lord Ganesha Portrait */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 shadow-md border border-amber-800/40 overflow-hidden flex items-center justify-center">
            <img
              src={
                new URL("../assets/images/ganpati.jpg", import.meta.url).href
              }
              alt="Lord Ganesha"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full z-10"
              onError={(e) => {
                // Fallback to SVG if image file is not rendered
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <GaneshaIcon size={isCompact ? 48 : 56} />
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-amber-900 mt-0.5 tracking-tight">
            श्री गणेश
          </span>
        </div>

        {/* Center: Mandal Branding & Auspicious Header */}
        <div className="text-center px-1 flex-1 min-w-0">
          <div
            style={{ color: "#B91C1C" }}
            className="font-black text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-1.5"
          >
            <span>🚩</span>
            <span>॥ नवसाला पावणारा पद्मावतीचा राजा ॥</span>
            <span>🚩</span>
          </div>
          <h1
            style={{ color: "#451A03" }}
            className="text-lg sm:text-2xl font-black tracking-tight font-serif mt-0.5 leading-tight"
          >
            {mandalInfo.mandalName}
          </h1>
          <p
            style={{ color: "#78350F" }}
            className="text-xs sm:text-sm font-extrabold"
          >
            {/* {mandalInfo.location} */}
            पद्मावती मळा,शिरसवडी , सातारा
          </p>
          <div
            style={{
              backgroundColor: "#B45309",
              color: "#FFFBEB",
            }}
            className="inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold mt-1 shadow-xs"
          >
            सार्वजनिक गणेशोत्सव वर्गणी पावती (२०२६)
          </div>
          {mandalInfo.regNo && (
            <p
              style={{ color: "#57534E" }}
              className="text-[9px] sm:text-[10px] mt-0.5 font-semibold"
            >
              {/* नोंदणी क्र. {mandalInfo.regNo} */}
              धर्मादाय आयुक्तांकडील नोंदणी क्रमांक - महाराष्ट्र / 15416 / सातारा
            </p>
          )}
        </div>

        {/* Top-Right Corner: Chhatrapati Shivaji Maharaj Portrait */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 shadow-md border border-amber-800/40 overflow-hidden flex items-center justify-center">
            <img
              src={
                new URL("../assets/images/shivaji.jpg", import.meta.url).href
              }
              alt="Chhatrapati Shivaji Maharaj"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full z-10"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <ShivajiMaharajIcon size={isCompact ? 48 : 56} />
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-amber-900 mt-0.5 tracking-tight">
            छ. शिवाजी महाराज
          </span>
        </div>
      </div>

      {/* Receipt Meta Bar: Receipt No, Date, Payment Status */}
      <div
        style={{
          backgroundColor: "#FEF3C7",
          borderColor: "#FDE68A",
        }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-xl p-2.5 mb-3 text-xs"
      >
        <div>
          <span style={{ color: "#57534E" }} className="block text-[10px]">
            पावती क्रमांक / Receipt No:
          </span>
          <span
            style={{ color: "#451A03" }}
            className="font-mono font-bold text-xs sm:text-sm"
          >
            {receipt.receiptNo}
          </span>
        </div>
        <div>
          <span style={{ color: "#57534E" }} className="block text-[10px]">
            दिनांक व वेळ / Date:
          </span>
          <span
            style={{ color: "#1C1917" }}
            className="font-semibold text-xs sm:text-sm"
          >
            {formattedDate}{" "}
            <span
              style={{ color: "#78716C" }}
              className="text-[10px] font-normal"
            >
              ({formattedTime})
            </span>
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex sm:justify-end items-center">
          <span
            style={{
              backgroundColor:
                receipt.paymentStatus === "paid" ? "#D1FAE5" : "#FEF3C7",
              color: receipt.paymentStatus === "paid" ? "#065F46" : "#92400E",
              borderColor:
                receipt.paymentStatus === "paid" ? "#6EE7B7" : "#FCD34D",
            }}
            className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide border"
          >
            {receipt.paymentStatus === "paid"
              ? "✓ वर्गणी जमा (PAID)"
              : "⏳ येणे बाकी (UNPAID)"}
          </span>
        </div>
      </div>

      {/* Main Donor Information Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#FDE68A",
        }}
        className="space-y-2 text-xs sm:text-sm border rounded-xl p-3 sm:p-4 shadow-xs"
      >
        {/* Donor Name */}
        <div
          style={{ borderBottomColor: "#FEF3C7" }}
          className="flex flex-col sm:flex-row sm:items-baseline border-b pb-1.5"
        >
          <span
            style={{ color: "#57534E" }}
            className="font-semibold sm:w-44 shrink-0 text-xs"
          >
            श्री. / सौ. / मे. (नाव):
          </span>
          <span
            style={{ color: "#451A03" }}
            className="font-bold text-sm sm:text-base tracking-wide uppercase"
          >
            {receipt.donorName}
          </span>
        </div>

        {/* Donor Mobile */}
        {receipt.donorMobile && (
          <div
            style={{ borderBottomColor: "#FEF3C7" }}
            className="flex flex-col sm:flex-row sm:items-baseline border-b pb-1.5"
          >
            <span
              style={{ color: "#57534E" }}
              className="font-semibold sm:w-44 shrink-0 text-xs"
            >
              मोबाईल नंबर:
            </span>
            <span
              style={{ color: "#1C1917" }}
              className="font-mono font-semibold text-xs sm:text-sm"
            >
              +91 {receipt.donorMobile}
            </span>
          </div>
        )}

        {/* Donor Address */}
        {receipt.donorAddress && (
          <div
            style={{ borderBottomColor: "#FEF3C7" }}
            className="flex flex-col sm:flex-row sm:items-baseline border-b pb-1.5"
          >
            <span
              style={{ color: "#57534E" }}
              className="font-semibold sm:w-44 shrink-0 text-xs"
            >
              पत्ता / गल्ली:
            </span>
            <span
              style={{ color: "#292524" }}
              className="font-medium text-xs sm:text-sm"
            >
              {receipt.donorAddress}
            </span>
          </div>
        )}

        {/* In Words */}
        <div
          style={{ borderBottomColor: "#FEF3C7" }}
          className="flex flex-col sm:flex-row sm:items-baseline border-b pb-1.5"
        >
          <span
            style={{ color: "#57534E" }}
            className="font-semibold sm:w-44 shrink-0 text-xs"
          >
            अक्षरी रक्कम (In Words):
          </span>
          <span
            style={{ color: "#9A3412" }}
            className="font-bold italic text-xs sm:text-sm"
          >
            {amountInMarathiWords}
          </span>
        </div>

        {/* Mode & Collector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="flex items-center">
            <span
              style={{ color: "#57534E" }}
              className="font-semibold text-xs mr-2"
            >
              पेमेंट पद्धत:
            </span>
            <span
              style={{
                backgroundColor: "#FEF3C7",
                color: "#78350F",
                borderColor: "#FCD34D",
              }}
              className="font-bold px-2.5 py-0.5 rounded-md text-xs border"
            >
              {receipt.paymentMode}
            </span>
          </div>
          <div className="flex items-center sm:justify-end">
            <span
              style={{ color: "#57534E" }}
              className="font-semibold text-xs mr-2"
            >
              जमाकर्ता (Karyakarta):
            </span>
            <span
              style={{
                backgroundColor: "#FFFBEB",
                color: "#451A03",
                borderColor: "#FDE68A",
              }}
              className="font-bold text-xs px-2.5 py-0.5 rounded-md border"
            >
              {receipt.collectedByName || "प्रतिनिधी"}
              {receipt.collectedByRole ? ` (${receipt.collectedByRole})` : ""}
            </span>
          </div>
        </div>

        {receipt.notes && (
          <div
            style={{
              backgroundColor: "#FFFBEB",
              borderColor: "#FEF3C7",
              color: "#57534E",
            }}
            className="text-[11px] p-2 rounded-lg border mt-1"
          >
            <span style={{ color: "#9A3412" }} className="font-semibold">
              नोंद:
            </span>{" "}
            {receipt.notes}
          </div>
        )}
      </div>

      {/* Amount High-Impact Display Box */}
      <div
        style={{
          backgroundColor: "#78350F",
          color: "#FFFBEB",
        }}
        className="mt-3 flex items-center justify-between rounded-xl p-3 sm:p-3.5 shadow-sm"
      >
        <div>
          <span
            style={{ color: "#FDE68A" }}
            className="text-[10px] sm:text-xs block uppercase font-bold"
          >
            एकूण प्राप्त देणगी / वर्गणी रक्कम
          </span>
          <span style={{ color: "#FEF3C7" }} className="text-xs font-medium">
            (Total Vargani Amount)
          </span>
        </div>
        <div className="text-right">
          <div
            style={{ color: "#FEF08A" }}
            className="text-2xl sm:text-3xl font-black font-mono tracking-tight"
          >
            ₹ {Number(receipt.amount).toLocaleString("en-IN")} /-
          </div>
        </div>
      </div>

      {/* Signature & Seal Footer */}
      <div
        style={{ borderTopColor: "#D97706" }}
        className="mt-4 pt-2 border-t flex items-end justify-between text-center text-xs"
      >
        {/* Collector Sign */}
        <div className="flex flex-col items-center">
          <div
            style={{ color: "#44403C" }}
            className="h-8 flex items-end pb-1 font-serif text-xs italic font-medium"
          >
            {receipt.collectedByName || "प्रतिनिधी"}
          </div>
          <div
            style={{ borderTopColor: "#57534E" }}
            className="w-24 sm:w-32 border-t border-dashed pt-0.5"
          >
            <span
              style={{ color: "#1C1917" }}
              className="text-[10px] font-bold block"
            >
              पावती जमाकर्ता
            </span>
            <span style={{ color: "#78716C" }} className="text-[8px]">
              (Sign of Collector)
            </span>
          </div>
        </div>

        {/* Mandal Official Seal in Center */}
        <div className="flex justify-center -mb-1">
          <MandalSeal size={isCompact ? 64 : 76} />
        </div>

        {/* Main Admin Official Signature Block (Only Anand Naik from DB) */}
        <div className="flex flex-col items-center">
          <div
            style={{ color: "#991B1B" }}
            className="min-h-8 flex flex-col justify-end items-center pb-1 font-serif text-xs font-bold italic leading-tight"
          >
            <span className="font-extrabold text-xs sm:text-[13px] text-red-900 tracking-tight">
              {dbAdminName}
            </span>
          </div>
          <div
            style={{ borderTopColor: "#57534E" }}
            className="w-28 sm:w-36 border-t border-dashed pt-0.5"
          >
            <span
              style={{ color: "#1C1917" }}
              className="text-[10px] font-bold block"
            >
              मुख्य अध्यक्ष
            </span>
            <span style={{ color: "#78716C" }} className="text-[8px]">
              (Ganesh Mandal)
            </span>
          </div>
        </div>
      </div>

      {/* Auspicious Blessing Tagline */}
      <div
        style={{
          borderTopColor: "#FDE68A",
          color: "#78350F",
        }}
        className="mt-3 text-center text-[10px] sm:text-xs font-semibold italic border-t pt-1.5"
      >
        ॥ श्री गणरायाच्या कृपेने आपल्या घरी सुख, समृद्धी आणि शांती लाभो हीच
        प्रार्थना! धन्यवाद! ॥
      </div>
    </div>
  );
};
