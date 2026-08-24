import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ActiveTab } from "./types";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { ReceiptForm } from "./components/ReceiptForm";
import { UnpaidReceipts } from "./components/UnpaidReceipts";
import { ExpenseManager } from "./components/ExpenseManager";
import { MemberPerformance } from "./components/MemberPerformance";
import { FinancialReports } from "./components/FinancialReports";
import { AuditLogs } from "./components/AuditLogs";
import { RefreshCw } from "lucide-react";

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-amber-300">
        <RefreshCw className="w-10 h-10 animate-spin text-amber-500 mb-3" />
        <p className="font-bold text-sm tracking-wider">
          श्री गणेश मित्र मंडळ प्रणाली लोड होत आहे...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <Dashboard setActiveTab={setActiveTab} />
          )}
          {activeTab === "new_receipt" && <ReceiptForm />}
          {activeTab === "unpaid_receipts" && <UnpaidReceipts />}
          {activeTab === "expense_manager" && <ExpenseManager />}
          {activeTab === "members_performance" && <MemberPerformance />}
          {activeTab === "financial_reports" && <FinancialReports />}
          {activeTab === "audit_logs" && <AuditLogs />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-stone-200 py-3 px-4 sm:px-6 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2 lg:pl-8">
          <div>
            🚩 <strong>श्री गणेश मित्र मंडळ, शिरसवाडी</strong> (कोल्हापूर) •
            सार्वजनिक गणेशोत्सव २०२६
          </div>
          <div className="text-[11px] text-stone-400 font-mono">
            नोंदणी क्र. महा./१८५/२०२३ • MongoDB Real-Time Sync
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
