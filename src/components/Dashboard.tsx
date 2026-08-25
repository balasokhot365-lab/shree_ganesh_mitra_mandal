import React, { useState, useEffect, useCallback } from "react";
import { IDashboardStats, IReceipt, IExpense, ActiveTab } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { GaneshaIcon, ShivajiMaharajIcon } from "./FestiveIcons";
import { ReceiptModal } from "./ReceiptModal";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Clock,
  PlusCircle,
  MessageSquare,
  Printer,
  Eye,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user, isAdmin, canManageExpenses } = useAuth();
  const { t, language } = useLanguage();

  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [recentReceipts, setRecentReceipts] = useState<IReceipt[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<IExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<IReceipt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [dashStats, recList, expList] = await Promise.all([
        api.getDashboardStats(),
        api.getReceipts(),
        api.getExpenses(),
      ]);
      setStats(dashStats);
      setRecentReceipts(recList.slice(0, 6));
      setRecentExpenses(expList.slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Auto-polling for live real-time synchronization every 10 seconds
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const handleWhatsAppShare = (receipt: IReceipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  const spendingPct = stats?.spendingPercentage || 0;
  const isBudgetExceeded = stats
    ? stats.totalExpenseAmount > stats.totalPaidAmount
    : false;

  return (
    <div className="space-y-6">
      {/* Festive Royal Header Hero Banner */}
      <div
        className="rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-lg border border-amber-500/30"
        style={{
          background:
            "linear-gradient(135deg, #7C2D12 0%, #991B1B 45%, #450A0A 100%)",
        }}
      >
        {/* Festive Decorative Background Overlay */}
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <GaneshaIcon size={240} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-0.5 sm:p-1 bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-600 shadow-lg border-2 border-amber-300/80 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={
                  new URL("../assets/images/mandal-logo.jpg", import.meta.url)
                    .href
                }
                alt="Shree Ganesh Mitra Mandal Shirasawadi Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full z-10"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <span>॥ श्री गणेशाय नमः ॥</span>
                <span className="hidden xs:inline">•</span>
                <span className="text-amber-200">सार्वजनिक गणेशोत्सव २०२६</span>
              </div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black font-serif text-white tracking-tight mt-0.5 sm:mt-1 leading-tight">
                {t.mandalName}
              </h1>
              <p className="text-[11px] sm:text-sm text-amber-200/90 mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>📍 {t.mandalLocation}</span>
                <span>•</span>
                <span>{t.regNo}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={() => setActiveTab("new_receipt")}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addNewReceipt}</span>
            </button>

            {canManageExpenses && (
              <button
                onClick={() => setActiveTab("expense_manager")}
                className="bg-rose-700 hover:bg-rose-600 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md border border-rose-400/30 active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <TrendingDown className="w-4 h-4" />
                <span>{t.addExpense}</span>
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-amber-950/60 hover:bg-amber-900 text-amber-200 p-2.5 rounded-xl text-xs border border-amber-600/40 transition-colors cursor-pointer"
              title="रिफ्रेश करा"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Paid Collection */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.totalPaidCollection}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono tracking-tight">
              ₹ {(stats?.totalPaidAmount || 0).toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
              <span>{stats?.paidReceiptsCount || 0} जमा पावत्या</span>
              <span className="font-semibold text-emerald-700">
                आज: ₹ {(stats?.todayPaidAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Total Unpaid / Pending */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.totalUnpaidPending}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-800 font-mono tracking-tight">
              ₹ {(stats?.totalUnpaidAmount || 0).toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
              <span>{stats?.unpaidReceiptsCount || 0} येणे पावत्या</span>
              <button
                onClick={() => setActiveTab("unpaid_receipts")}
                className="text-amber-700 hover:text-amber-900 font-bold underline text-[11px] cursor-pointer"
              >
                पावत्या पहा →
              </button>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.totalExpenses}
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-800 font-mono tracking-tight">
              ₹ {(stats?.totalExpenseAmount || 0).toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
              <span>एकूण खर्च नोंदी</span>
              <span className="font-semibold text-rose-700">
                आज: ₹ {(stats?.todayExpenseAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Remaining Net Balance */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.remainingBalance}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                (stats?.remainingBalance || 0) >= 0
                  ? "text-indigo-900"
                  : "text-red-700"
              }`}
            >
              ₹ {(stats?.remainingBalance || 0).toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
              <span>निव्वळ शिल्लक निधी</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  (stats?.remainingBalance || 0) >= 0
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {(stats?.remainingBalance || 0) >= 0
                  ? "सुरक्षित"
                  : "तूट (Deficit)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Budget Progress Bar */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-sm sm:text-base text-stone-900">
              {t.budgetStatus}
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-stone-500">खर्च वापर:</span>
            <span
              className={`font-black font-mono px-2 py-0.5 rounded ${
                spendingPct > 90
                  ? "bg-red-100 text-red-800"
                  : spendingPct > 70
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {spendingPct}% वापरले
            </span>
            <span className="text-stone-400">|</span>
            <span className="text-stone-500">शिल्लक:</span>
            <span className="font-bold text-stone-900">
              {Math.max(0, 100 - spendingPct)}%
            </span>
          </div>
        </div>

        {/* Progress Bar Visualizer */}
        <div className="w-full bg-stone-100 rounded-full h-3.5 p-0.5 border border-stone-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              spendingPct > 90
                ? "bg-gradient-to-r from-red-500 to-rose-700"
                : spendingPct > 70
                  ? "bg-gradient-to-r from-amber-500 to-orange-600"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600"
            }`}
            style={{ width: `${Math.min(100, Math.max(2, spendingPct))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-stone-500">
          <span>₹ 0</span>
          <span>
            एकूण जमा: ₹ {(stats?.totalPaidAmount || 0).toLocaleString("en-IN")}
          </span>
          <span>
            खर्च: ₹ {(stats?.totalExpenseAmount || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Grid: Recent Receipts & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Receipts List (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                {language === "mr"
                  ? "नुकत्याच दिलेल्या पावत्या (Recent Receipts)"
                  : "Recent Receipts"}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab("new_receipt")}
              className="text-amber-800 hover:text-amber-950 font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>+ नवीन पावती</span>
            </button>
          </div>

          {recentReceipts.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              कोणतीही पावती उपलब्ध नाही.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentReceipts.map((rec) => (
                <div
                  key={rec._id || rec.receiptNo}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {rec.receiptNo}
                      </span>
                      <span className="font-bold text-stone-900 text-sm">
                        {rec.donorName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full border ${
                          rec.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {rec.paymentStatus === "paid" ? "जमा (Paid)" : "बाकी"}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-2">
                      <span>मो. {rec.donorMobile || "-"}</span>
                      <span>•</span>
                      <span>
                        मोड: <strong>{rec.paymentMode}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        जमाकर्ता: <strong>{rec.collectedByName}</strong>
                        {rec.collectedByRole ? ` (${rec.collectedByRole})` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3">
                    <div className="text-right">
                      <div className="text-base font-black text-amber-950 font-mono">
                        ₹ {Number(rec.amount).toLocaleString("en-IN")}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(rec.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleWhatsAppShare(rec)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                        title="व्हॉट्सॲपवर पाठवा"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReceipt(rec);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                        title="पावती पहा / व्हॉट्सॲप / PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses List (1 Column) */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-rose-700" />
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                {language === "mr" ? "अलीकडील खर्च नोंदी" : "Recent Expenses"}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab("expense_manager")}
              className="text-rose-800 hover:text-rose-950 font-bold text-xs cursor-pointer"
            >
              सर्व पहा →
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              कोणताही खर्च उपलब्ध नाही.
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((exp) => (
                <div
                  key={exp._id || exp.voucherNo}
                  className="bg-stone-50/80 rounded-xl p-3 border border-stone-200 space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-stone-900 text-xs">
                      {exp.title}
                    </span>
                    <span className="font-black text-rose-700 font-mono text-sm">
                      ₹ {Number(exp.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>
                      दिले: <strong>{exp.paidTo}</strong>
                    </span>
                    <span>{exp.expenseDate}</span>
                  </div>
                  <div className="text-[10px] text-rose-800 font-semibold">
                    अधिकार: {exp.authorizedByAdmin || "अध्यक्ष"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal Popup for direct preview/print/share */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={async (id, st) => {
          const updated = await api.updateReceiptStatus(id, st);
          if (updated) setSelectedReceipt(updated);
          await fetchDashboardData();
        }}
      />
    </div>
  );
};
