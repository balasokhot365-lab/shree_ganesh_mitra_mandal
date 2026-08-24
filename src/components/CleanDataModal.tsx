import React, { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  AlertTriangle,
  Trash2,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";

interface CleanDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const CleanDataModal: React.FC<CleanDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!mobile.trim()) {
      setErrorMsg("कृपया मुख्य अध्यक्षांचा मोबाईल नंबर प्रविष्ट करा.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg(
        "डेटा क्लीन करण्यासाठी मुख्य अध्यक्षांचा पासवर्ड आवश्यक आहे.",
      );
      return;
    }

    if (!isConfirmed) {
      setErrorMsg("कृपया खालील सुरक्षा पुष्टीकरण चेकबॉक्स निवडा.");
      return;
    }

    setIsCleaning(true);
    try {
      const response = await api.cleanAllData({
        mobile: mobile.trim(),
        password: password.trim(),
      });

      setPassword("");
      setIsConfirmed(false);
      onSuccess(
        response.message ||
          "सर्व डेटा यशस्वीरित्या क्लीन केला गेला आहे. सर्व हिशोब ० झाला आहे.",
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "डेटा क्लीन करताना त्रुटी आली.");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-red-300 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-amber-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-950/60 rounded-2xl border border-red-500/40">
              <ShieldAlert className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight">
                डेटाबेस पूर्ण स्वच्छता
              </h3>
              <p className="text-[11px] text-red-200 font-semibold">
                Factory Reset & Clean All Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isCleaning}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="p-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start space-x-3 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-red-950">
                ⚠️ अत्यंत संवेदनशील कृती (Destructive Action):
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-red-850 font-medium">
                <li>सर्व वर्गणी पावत्या (Receipts) कायमस्वरूपी हटतील.</li>
                <li>सर्व खर्च नोंदी (Expenses) हटतील.</li>
                <li>
                  इतर सर्व कार्यकर्त्यांची खाती हटतील (फक्त मुख्य अध्यक्ष
                  राहतील).
                </li>
                <li>
                  <strong>सर्व हिशोब, शिल्लक व आकडेवारी ० (शून्य) होईल.</strong>
                </li>
              </ul>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-900 rounded-xl text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">
                मुख्य अध्यक्ष मोबाईल नंबर (Main Admin Mobile)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="8275658844"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">
                मुख्य अध्यक्ष पासवर्ड (Main Admin Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="पासवर्ड टाका (उदा. Akash@#ganpati55_39)"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox Confirmation */}
            <div className="pt-1">
              <label className="flex items-start space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-red-600 rounded border-stone-300 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-stone-700 leading-tight">
                  मी खात्री करतो की मला सर्व पावत्या व खर्च कायमचे हटवून सर्व
                  हिशोब ० करायचा आहे.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isCleaning}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करा (Cancel)
              </button>

              <button
                type="submit"
                disabled={isCleaning || !isConfirmed}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white text-xs font-black shadow-md shadow-red-900/30 flex items-center space-x-1.5 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {isCleaning
                    ? "डेटा क्लीन होत आहे..."
                    : "सर्व डेटा क्लीन करा (Clean Data)"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
