import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { GaneshaIcon, ShivajiMaharajIcon } from "./FestiveIcons";

import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertTriangle,
  ShieldAlert,
  XCircle,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login, isLoggingIn, sessionExpiredMsg, clearSessionExpiredMsg } =
    useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setShowErrorPopup(false);

    if (!mobile.trim() || !password.trim()) {
      const msg =
        language === "mr"
          ? "कृपया मोबाईल नंबर आणि पासवर्ड टाका."
          : "Please enter mobile number and password.";
      setErrorMsg(msg);
      setShowErrorPopup(true);
      return;
    }

    try {
      await login(mobile.trim(), password.trim());
    } catch (err: any) {
      const msg = err.message || "लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.";
      setErrorMsg(msg);
      setShowErrorPopup(true);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background:
          "radial-gradient(circle at top center, #7C2D12 0%, #450A0A 60%, #1C1917 100%)",
      }}
    >
      {/* Decorative Traditional Border Patterns */}
      <div className="absolute top-4 right-4 z-20 flex items-center bg-black/40 backdrop-blur-md p-1 rounded-xl border border-amber-500/30 text-xs">
        <button
          onClick={() => setLanguage("mr")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            language === "mr"
              ? "bg-amber-600 text-white"
              : "text-amber-200 hover:text-white"
          }`}
        >
          मराठी
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            language === "en"
              ? "bg-amber-600 text-white"
              : "text-amber-200 hover:text-white"
          }`}
        >
          English
        </button>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Prominent Error Alert Dialog Modal */}
        {showErrorPopup && errorMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-red-500 text-center space-y-4 animate-scale-up">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border-2 border-red-200">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-black text-red-950">
                  {errorMsg.includes("उपलब्ध नाही") ||
                  errorMsg.includes("not present") ||
                  errorMsg.includes("not found")
                    ? language === "mr"
                      ? "⚠️ युजर सापडला नाही (User Not Present)"
                      : "⚠️ User Not Found in Database"
                    : errorMsg.includes("पासवर्ड") ||
                        errorMsg.includes("password")
                      ? language === "mr"
                        ? "⚠️ चुकीचा पासवर्ड (Wrong Password)"
                        : "⚠️ Incorrect Password"
                      : language === "mr"
                        ? "लॉगिन त्रुटी (Login Error)"
                        : "Login Alert"}
                </h3>
                <p className="text-xs font-semibold text-stone-800 mt-2 leading-relaxed bg-red-50 p-3.5 rounded-xl border border-red-200 text-left">
                  {errorMsg}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowErrorPopup(false)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {language === "mr"
                    ? "समजले, पुन्हा प्रयत्न करा (Try Again)"
                    : "Okay, Try Again"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Expired / Superseded Alert Modal if triggered */}
        {sessionExpiredMsg && (
          <div className="mb-4 bg-red-950/90 border-2 border-red-500 text-red-100 p-4 rounded-2xl shadow-xl space-y-1">
            <div className="flex items-center space-x-2 font-black text-amber-300 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>सत्र समाप्त (Session Terminated)</span>
            </div>
            <p className="text-xs text-stone-200">{sessionExpiredMsg}</p>
            <button
              onClick={clearSessionExpiredMsg}
              className="text-[11px] font-bold text-amber-300 underline mt-1 cursor-pointer block"
            >
              समजले, बंद करा (Dismiss)
            </button>
          </div>
        )}

        <div className="bg-amber-50/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-double border-amber-700/60 overflow-hidden">
          {/* Card Top Banner with Lord Ganesha & Shivaji Maharaj */}
          <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-red-800 text-amber-50 p-5 sm:p-6 text-center relative border-b-2 border-amber-600">
            <div className="flex items-center justify-between mb-3 px-1 gap-2">
              {/* Lord Ganesha Image */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-600 shadow-lg border-2 border-amber-300/80 overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      new URL("../assets/images/ganpati.jpg", import.meta.url)
                        .href
                    }
                    alt="Lord Ganesha"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 -z-10 flex items-center justify-center">
                    <GaneshaIcon size={48} className="drop-shadow-md" />
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-amber-200 mt-1 tracking-tight drop-shadow-xs">
                  श्री गणेश
                </span>
              </div>

              {/* Central Title and Slogan */}
              <div className="text-center flex-1 px-1">
                <span className="text-[11px] font-extrabold text-amber-200 uppercase tracking-widest block drop-shadow-xs">
                  ॥ श्री गणेशाय नमः ॥
                </span>
                <span className="text-xs font-bold text-white block mt-0.5">
                  सार्वजनिक गणेशोत्सव २०२६
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-yellow-300 font-serif tracking-tight mt-1 leading-tight drop-shadow-sm">
                  {t.receiptHeaderMandal}
                </h1>
                <p className="text-[11px] sm:text-xs font-semibold text-amber-100 mt-0.5">
                  {t.receiptHeaderSub}
                </p>
              </div>

              {/* Chhatrapati Shivaji Maharaj Image */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-600 shadow-lg border-2 border-amber-300/80 overflow-hidden flex items-center justify-center">
                  {
                    <img
                      src={
                        new URL("../assets/images/shivaji.jpg", import.meta.url)
                          .href
                      }
                      alt="Chhatrapati Shivaji Maharaj"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  }
                  <div className="absolute inset-0 -z-10 flex items-center justify-center">
                    <ShivajiMaharajIcon size={48} className="drop-shadow-md" />
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-amber-200 mt-1 tracking-tight drop-shadow-xs">
                  छ. शिवाजी महाराज
                </span>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center">
              <h2 className="text-base font-bold text-stone-900">
                {t.loginTitle}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                {language === "mr"
                  ? "नोंदणीकृत मोबाईल नंबर व पासवर्ड वापरून प्रवेश करा."
                  : "Enter your registered mobile number & password."}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-100 border-2 border-red-500 text-red-900 p-3.5 rounded-2xl text-xs font-bold shadow-md flex items-start justify-between gap-2.5 animate-shake">
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none shrink-0">⚠️</span>
                  <div className="leading-snug">{errorMsg}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-red-700 hover:text-red-950 font-black text-sm px-1.5 py-0.5 rounded hover:bg-red-200/60 cursor-pointer"
                  title="बंद करा"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Mobile Input */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {t.mobileLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="१० अंकी नोंदणीकृत मोबाईल नंबर"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-mono font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="पासवर्ड टाका"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-700 via-amber-800 to-red-800 hover:from-amber-800 hover:to-red-900 text-white font-black text-sm rounded-xl shadow-lg shadow-amber-900/30 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoggingIn ? "लॉगिन होत आहे..." : t.loginBtn}</span>
              </button>
            </form>

            {/* Single Device Session Notice */}
            <div className="text-[10px] text-stone-500 text-center leading-tight bg-amber-100/50 p-2 rounded-lg border border-amber-200">
              🔒 <strong>सुरक्षा टीप:</strong> एका वेळी फक्त एकाच डिव्हाइसवर
              लॉगिन चालू राहील. दुसऱ्या डिव्हाइसवर लॉगिन केल्यास आधीचे आपोआप बंद
              होईल.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
