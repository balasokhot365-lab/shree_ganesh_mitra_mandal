import React from "react";
import { ActiveTab, getDesignationInfo } from "../types";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { GaneshaIcon, ShivajiMaharajIcon } from "./FestiveIcons";
import {
  LayoutDashboard,
  FilePlus,
  Receipt,
  Clock,
  TrendingDown,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const { user, logout, isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: "dashboard",
      label: t.menuDashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "new_receipt",
      label: t.menuNewReceipt,
      icon: <FilePlus className="w-4 h-4 text-amber-400" />,
      badge: "New",
    },
    {
      id: "all_receipts",
      label: t.menuAllReceipts,
      icon: <Receipt className="w-4 h-4 text-amber-300" />,
    },
    {
      id: "unpaid_receipts",
      label: t.menuUnpaidReceipts,
      icon: <Clock className="w-4 h-4 text-orange-400" />,
    },
    {
      id: "expense_manager",
      label: t.menuExpenseManager,
      icon: <TrendingDown className="w-4 h-4 text-rose-400" />,
    },
    {
      id: "members_performance",
      label: t.menuMembers,
      icon: <Users className="w-4 h-4 text-amber-300" />,
    },
    {
      id: "financial_reports",
      label: t.menuReports,
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "audit_logs",
      label: t.menuAuditLog,
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 text-stone-100 flex flex-col border-r border-amber-800/40 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mandal Brand Top */}
        <div className="p-4 border-b border-amber-800/50 flex items-center justify-between bg-amber-950/80">
          <div className="flex items-center space-x-3">
            <GaneshaIcon size={38} />
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                ॥ श्री गणेशाय नमः ॥
              </div>
              <h2 className="font-serif font-black text-sm text-white tracking-tight leading-tight">
                श्री गणेश मित्र मंडळ
              </h2>
              <div className="text-[10px] text-amber-200">
                शिरसवडी सातारा (२०२६)
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-stone-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List (8 Menu Items) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? "text-white" : ""}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Badge & Logout Section */}
        <div className="p-3 border-t border-amber-800/50 bg-black/30">
          <div className="bg-amber-950/80 border border-amber-700/40 rounded-xl p-2.5 mb-2 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0] : "U"}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="font-bold text-xs text-white truncate">
                {user?.name}
              </div>
              <div className="text-[10px] text-amber-300 flex items-center space-x-1 font-semibold">
                <span>{getDesignationInfo(user).icon}</span>
                <span>{getDesignationInfo(user).label}</span>
                <span className="text-amber-500">•</span>
                <span className="font-mono text-[9px] text-stone-400">
                  +{user?.mobile}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button (Menu item #8) */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-red-300 hover:bg-red-950/60 hover:text-red-200 border border-red-800/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.menuLogout}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
