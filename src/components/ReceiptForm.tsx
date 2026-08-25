import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import {
  IReceipt,
  PaymentMode,
  PaymentStatus,
  getUserDesignation,
} from "../types";
import { convertNumberToWords } from "../locales/translations";
import { ReceiptModal } from "./ReceiptModal";
import {
  PlusCircle,
  Sparkles,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  IndianRupee,
  FileText,
  CreditCard,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ReceiptFormProps {
  onReceiptCreated?: (newReceipt: IReceipt) => void;
}

const QUICK_AMOUNTS = [101, 251, 501, 1001, 2100, 5001, 11000, 21000];

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  onReceiptCreated,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [donorName, setDonorName] = useState("");
  const [donorMobile, setDonorMobile] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdReceipt, setCreatedReceipt] = useState<IReceipt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#EA580C", "#F59E0B", "#DC2626", "#10B981", "#6366F1"],
      });
    } catch {
      // ignore
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
  };

  const numAmount = Number(amount) || 0;
  const wordsText =
    numAmount > 0 ? convertNumberToWords(numAmount, language) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!donorName.trim()) {
      setErrorMsg(
        language === "mr"
          ? "कृपया वर्गणीदाराचे नाव टाका."
          : "Please enter donor name.",
      );
      return;
    }

    if (!numAmount || numAmount <= 0) {
      setErrorMsg(
        language === "mr"
          ? "कृपया वैध रक्कम टाका."
          : "Please enter a valid amount.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const receipt = await api.createReceipt({
        donorName: donorName.trim(),
        donorMobile: donorMobile.trim(),
        donorAddress: donorAddress.trim(),
        amount: numAmount,
        amountInWords: wordsText,
        paymentMode,
        paymentStatus,
        notes: notes.trim(),
      });

      triggerConfetti();
      setCreatedReceipt(receipt);
      setIsModalOpen(true);
      if (onReceiptCreated) onReceiptCreated(receipt);

      // Reset Form fields
      setDonorName("");
      setDonorMobile("");
      setDonorAddress("");
      setAmount("");
      setNotes("");
      setPaymentMode("Cash");
      setPaymentStatus("paid");
    } catch (err: any) {
      setErrorMsg(err.message || "पावती तयार करताना त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form Header Card */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-red-800 text-amber-50 rounded-2xl p-4 sm:p-6 shadow-md mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-amber-200" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🚩</span>
              <span>{t.mandalName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif mt-1">
              {t.menuNewReceipt}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200 mt-0.5">
              {language === "mr"
                ? "पावती तयार केल्यावर थेट व्हॉट्सॲपवर स्क्रीनशॉट पाठवा किंवा PDF डाउनलोड करा."
                : "Generate receipt, share screenshot directly on WhatsApp, or download PDF."}
            </p>
          </div>
          <div className="bg-amber-900/60 border border-amber-500/40 rounded-xl px-3.5 py-2 text-right">
            <span className="text-[10px] text-amber-300 block uppercase font-medium">
              {t.collectedBy}
            </span>
            <span className="font-bold text-white text-xs sm:text-sm">
              {user?.name || "प्रतिनिधी"}
            </span>
            <span className="text-[10px] text-amber-300 ml-1">
              ({getUserDesignation(user)})
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-8 space-y-6"
      >
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2">
            <span className="text-base">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Active Logged-in User / Receipt Creator Banner */}
          <div className="md:col-span-2 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border border-amber-300/80 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-amber-700 text-white font-black flex items-center justify-center text-sm shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "प"}
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  {language === "mr"
                    ? "पावती तयार करणारे (लॉगिन सदस्य / जमाकर्ता):"
                    : "Receipt Being Created By (Logged In User):"}
                </div>
                <div className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <span>{user?.name || "प्रतिनिधी"}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold">
                    {getUserDesignation(user)}
                  </span>
                  {user?.mobile && (
                    <span className="text-xs text-stone-500 font-mono">
                      (मो. {user.mobile})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-[11px] text-amber-900 font-semibold bg-white/80 px-2.5 py-1 rounded-md border border-amber-200">
                पावतीवर हेच नाव नोंदवले जाईल
              </span>
            </div>
          </div>

          {/* Donor Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              <span className="text-red-500 mr-1">*</span>
              {t.donorName}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="उदा. श्री. राहुल सचिन पाटील / मे. गणेश ट्रेडर्स"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Donor Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t.donorMobile}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                maxLength={10}
                value={donorMobile}
                onChange={(e) =>
                  setDonorMobile(e.target.value.replace(/\D/g, ""))
                }
                placeholder="१० अंकी मोबाईल क्र. (उदा. 9876543210)"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {language === "mr"
                ? "या नंबरवर थेट पावती व्हॉट्सॲप पाठवता येईल."
                : "Receipt can be shared to this WhatsApp number."}
            </p>
          </div>

          {/* Donor Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t.donorAddress}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={donorAddress}
                onChange={(e) => setDonorAddress(e.target.value)}
                placeholder="उदा. शिवाजी चौक, गल्ली नं. २,शिरसवडी "
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Amount in Figures */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              <span className="text-red-500 mr-1">*</span>
              {t.amount}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700">
                <IndianRupee className="w-5 h-5 font-bold" />
              </div>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="वर्गणी रक्कम टाका (उदा. 501)"
                className="w-full pl-11 pr-4 py-3 bg-amber-50/50 border-2 border-amber-300 rounded-xl text-lg font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
              />
            </div>

            {/* Quick Amount Selection Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-xs font-semibold text-stone-500 mr-1">
                {language === "mr" ? "नेहमीच्या रकमा:" : "Quick Amounts:"}
              </span>
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    amount === String(val)
                      ? "bg-amber-700 text-white border-amber-800 shadow-xs"
                      : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-amber-100 hover:text-amber-900"
                  }`}
                >
                  ₹{val.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            {/* In Words auto text */}
            {wordsText && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs font-semibold text-amber-900 flex items-center space-x-1.5">
                <span>✍️ अक्षरी:</span>
                <span>{wordsText}</span>
              </div>
            )}
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t.paymentMode}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer"
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
          </div>

          {/* Payment Status (Paid / Unpaid) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t.paymentStatus}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus("paid")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  paymentStatus === "paid"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === "mr" ? "✓ वर्गणी जमा (Paid)" : "✓ Paid"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentStatus("unpaid")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  paymentStatus === "unpaid"
                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <span>⏳</span>
                <span>
                  {language === "mr" ? "येणे बाकी (Unpaid)" : "Unpaid"}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {paymentStatus === "paid"
                ? language === "mr"
                  ? "रक्कम जमा खात्यात जोडली जाईल."
                  : "Amount will be added to total cash received."
                : language === "mr"
                  ? "रक्कम 'अपूर्ण पावत्या' यादीत दिसेल."
                  : "Will show under Unpaid Receipts list."}
            </p>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t.notes}
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-stone-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="उदा. आरती प्रायोजक / महाप्रसाद देणगी / विशेष संकल्प"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            पावती तयार होताच{" "}
            <strong>गणपती बाप्पा व छत्रपती शिवाजी महाराज</strong> यांचे चित्र
            असलेली पावती स्क्रीनवर दिसेल.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-700 via-amber-800 to-red-800 hover:from-amber-800 hover:to-red-900 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-900/20 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>
              {isSubmitting
                ? language === "mr"
                  ? "पावती तयार होत आहे..."
                  : "Generating Receipt..."
                : language === "mr"
                  ? "🚩 पावती तयार करा व सेव्ह करा"
                  : "Generate & Save Receipt"}
            </span>
          </button>
        </div>
      </form>

      {/* Generated Receipt Modal Popup with WhatsApp & Print Options */}
      <ReceiptModal
        receipt={createdReceipt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
