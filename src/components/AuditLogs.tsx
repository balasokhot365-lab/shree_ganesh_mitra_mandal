import React, { useState, useEffect, useCallback } from "react";
import { IAuditLog } from "../types";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { History, ShieldCheck, Search, RefreshCw, User, Calendar } from "lucide-react";

export const AuditLogs: React.FC = () => {
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((l) => {
    const q = searchTerm.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.performedByName.toLowerCase().includes(q) ||
      l.performedByRole.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-800 via-stone-900 to-amber-950 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center space-x-1.5">
            <span>🛡️</span>
            <span>{t.mandalName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif mt-1">
            {t.menuAuditLog}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
            {language === "mr"
              ? "प्रत्येक पावती, खर्च व सदस्य बदलांची पडताळणी व सुरक्षित ऑडिट नोंदी."
              : "Tamper-proof real-time audit logs of every receipt, expense, and member change."}
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{t.refresh}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="कृती, सदस्य किंवा तपशील शोधा..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Audit Logs List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500 border border-stone-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-2" />
          <p className="font-semibold text-sm">नोंदी लोड होत आहेत...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500 border border-stone-200">
          <History className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-stone-800">कोणतीही ऑडिट नोंद सापडली नाही</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
          {filteredLogs.map((log, idx) => (
            <div key={log._id || idx} className="p-4 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {log.action}
                  </span>
                  <span className="text-stone-500 text-[11px] flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    <span>{new Date(log.timestamp).toLocaleString("en-IN")}</span>
                  </span>
                </div>
                <div className="font-medium text-stone-900 text-sm">
                  {log.details}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0 bg-stone-100 px-3 py-1.5 rounded-lg">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span className="font-bold text-stone-800">{log.performedByName}</span>
                <span className="text-[10px] text-stone-500">
                  ({log.performedByRole === "admin" ? "अध्यक्ष" : "कार्यकर्ता"})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
