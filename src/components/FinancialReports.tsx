import React, { useState, useEffect, useCallback } from "react";
import { IDashboardStats, IReceipt, IExpense } from "../types";
import { api, getStoredToken, getStoredUserId } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  FileSpreadsheet,
  Download,
  Printer,
  PieChart,
  TrendingUp,
  IndianRupee,
  FileText,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { CleanDataModal } from "./CleanDataModal";

export const FinancialReports: React.FC = () => {
  const { isMainAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCleanModalOpen, setIsCleanModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashStats, recList, expList] = await Promise.all([
        api.getDashboardStats(),
        api.getReceipts(),
        api.getExpenses(),
      ]);
      setStats(dashStats);
      setReceipts(recList);
      setExpenses(expList);
    } catch (err) {
      console.error("Error fetching reports data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export CSV Handlers
  const handleExportReceiptsCSV = async () => {
    const token = getStoredToken();
    const userId = getStoredUserId();
    const res = await fetch("/api/reports/export/receipts", {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-user-id": userId || "",
      },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ekdant_Mandal_Receipts_${Date.now()}.csv`;
    a.click();
  };

  const handleExportExpensesCSV = async () => {
    const token = getStoredToken();
    const userId = getStoredUserId();
    const res = await fetch("/api/reports/export/expenses", {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-user-id": userId || "",
      },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ekdant_Mandal_Expenses_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center space-x-1.5">
            <span>📊</span>
            <span>{t.mandalName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif mt-1">
            {t.menuReports}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
            {language === "mr"
              ? "हिशोब अहवाल, वर्गवारी खर्च विवरण व कर/ऑडिटसाठी CSV एक्सेल निर्यात."
              : "Financial statements, category breakdowns & CSV export for accounting and audits."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Admin Clean Data Button */}
          {/* {isMainAdmin && (
            <button
              onClick={() => setIsCleanModalOpen(true)}
              className="bg-red-600/90 hover:bg-red-600 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-md border border-red-400/40 transition-all flex items-center space-x-1.5 cursor-pointer"
              title="सर्व पावत्या व खर्च डेटाबेस मधून हटवून ० करा (फक्त मुख्य अध्यक्ष)"
            >
              <Trash2 className="w-4 h-4 text-yellow-300" />
              <span>डेटा क्लीन करा (Reset)</span>
            </button>
          )} */}

          <button
            onClick={handleExportReceiptsCSV}
            className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>पावत्या CSV Export</span>
          </button>

          <button
            onClick={handleExportExpensesCSV}
            className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-md border border-emerald-500/40 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>खर्च CSV Export</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-stone-900 hover:bg-black text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>अहवाल प्रिंट</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-white hover:opacity-80 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary Stat Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block">
              एकूण जमा (Paid Collections)
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
              ₹ {stats.totalPaidAmount.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-stone-500 block mt-1">
              {stats.paidReceiptsCount} पावत्यांमधून प्राप्त
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block">
              एकूण खर्च (Total Expenses)
            </span>
            <div className="text-2xl font-black text-rose-700 font-mono mt-1">
              ₹ {stats.totalExpenseAmount.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-stone-500 block mt-1">
              {expenses.length} खर्च नोंदी
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block">
              निव्वळ शिल्लक (Net Balance)
            </span>
            <div
              className={`text-2xl font-black font-mono mt-1 ${stats.remainingBalance >= 0 ? "text-indigo-700" : "text-red-700"}`}
            >
              ₹ {stats.remainingBalance.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-stone-500 block mt-1">
              {stats.remainingBalance >= 0
                ? "शिल्लक निधी उपलब्ध"
                : "तूट (Deficit)"}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block">
              येणे बाकी वर्गणी (Unpaid)
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono mt-1">
              ₹ {stats.totalUnpaidAmount.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-stone-500 block mt-1">
              {stats.unpaidReceiptsCount} प्रलंबित पावत्या
            </span>
          </div>
        </div>
      )}

      {/* Breakdowns: Expenses by Category & Payment Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category-wise Expenses */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="font-bold text-base text-stone-900 mb-3 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-rose-600" />
            <span>खर्च वर्गवारी विवरण (Category Breakdown)</span>
          </h3>

          {stats?.expenseByCategory &&
          Object.keys(stats.expenseByCategory).length > 0 ? (
            <div className="space-y-2 text-xs">
              {Object.entries(stats.expenseByCategory).map(([cat, rawAmt]) => {
                const amt = Number(rawAmt) || 0;
                const total = stats.totalExpenseAmount || 1;
                const pct = Math.round((amt / total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between font-semibold text-stone-800">
                      <span>{t[`cat_${cat}` as keyof typeof t] || cat}</span>
                      <span className="font-mono font-bold text-rose-800">
                        ₹ {amt.toLocaleString("en-IN")} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-500">
              कोणताही खर्च नोंदवलेला नाही.
            </p>
          )}
        </div>

        {/* Payment Modes Distribution */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="font-bold text-base text-stone-900 mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>जमा वर्गणी पेमेंट माध्यम वितरण (Payment Modes)</span>
          </h3>

          {stats?.paymentModeStats &&
          Object.keys(stats.paymentModeStats).length > 0 ? (
            <div className="space-y-2 text-xs">
              {Object.entries(stats.paymentModeStats).map(([mode, rawAmt]) => {
                const amt = Number(rawAmt) || 0;
                const total = stats.totalPaidAmount || 1;
                const pct = Math.round((amt / total) * 100);
                return (
                  <div key={mode} className="space-y-1">
                    <div className="flex justify-between font-semibold text-stone-800">
                      <span>{mode}</span>
                      <span className="font-mono font-bold text-emerald-800">
                        ₹ {amt.toLocaleString("en-IN")} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-500">
              कोणतीही जमा रक्कम नोंदवलेली नाही.
            </p>
          )}
        </div>
      </div>

      {/* Main Admin Clean Data Modal */}
      {/* <CleanDataModal
        isOpen={isCleanModalOpen}
        onClose={() => setIsCleanModalOpen(false)}
        onSuccess={(msg) => {
          setToastMsg(msg);
          fetchData();
        }}
      /> */}
    </div>
  );
};
