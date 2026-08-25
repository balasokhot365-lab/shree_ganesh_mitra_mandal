import React from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { GaneshaIcon, ShivajiMaharajIcon } from "./FestiveIcons";
import { Menu, Globe, LogOut, Shield, Wifi, UserCheck } from "lucide-react";
import { getDesignationInfo } from "../types";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const designationInfo = getDesignationInfo(user);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-200/80 shadow-xs px-4 sm:px-6 py-2.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Mandal Name */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <GaneshaIcon size={32} className="hidden sm:inline-block" />
          <div>
            <h1 className="font-serif font-black text-sm sm:text-base text-amber-950 leading-tight">
              {t.mandalName}
            </h1>
            <div className="text-[10px] text-amber-800 font-semibold hidden sm:block">
              {t.mandalTagline}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Language Toggle, DB Status, User Badge & Logout */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Real-time DB Status Badge */}
        <div className="hidden md:flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB Real-Time</span>
        </div>

        {/* Bilingual Language Switcher (मराठी / English) */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
          <button
            onClick={() => setLanguage("mr")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              language === "mr"
                ? "bg-amber-700 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            मराठी
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              language === "en"
                ? "bg-amber-700 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            English
          </button>
        </div>

        {/* User Role & Designation (पद) Badge */}
        {user && (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 px-2.5 sm:px-3 py-1 rounded-xl text-xs shadow-xs">
            <span className="text-sm shrink-0">{designationInfo.icon}</span>
            <div className="text-left">
              <span className="font-bold text-stone-900 block leading-tight text-[11px] truncate max-w-[100px] sm:max-w-[130px]">
                {user.name}
              </span>
              <span className="text-[9px] text-amber-900 font-black block leading-none">
                {designationInfo.label}
              </span>
            </div>
          </div>
        )}

        {/* Quick Logout Button */}
        <button
          onClick={logout}
          className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          title={t.menuLogout}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
