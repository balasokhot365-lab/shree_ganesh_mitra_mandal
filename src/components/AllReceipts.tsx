import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { IReceipt, PaymentMode, PaymentStatus, ActiveTab } from "../types";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { ReceiptModal } from "./ReceiptModal";
import {
  Search,
  Receipt,
  FilePlus,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  Eye,
  Phone,
  MapPin,
  User,
  IndianRupee,
  RefreshCw,
  X,
  ArrowUpDown,
  Download,
  ShieldCheck,
  AlertCircle,
  SlidersHorizontal,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface AllReceiptsProps {
  setActiveTab?: (tab: ActiveTab) => void;
}

export const AllReceipts: React.FC<AllReceiptsProps> = ({ setActiveTab }) => {
  const { t, language } = useLanguage();
  const { user, isAdmin } = useAuth();
  const tableTopRef = useRef<HTMLDivElement>(null);

  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dedicated search fields
  const [searchName, setSearchName] = useState("");
  const [searchReceiptNo, setSearchReceiptNo] = useState("");
  const [searchGeneral, setSearchGeneral] = useState("");

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [collectorFilter, setCollectorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "amount_high" | "amount_low"
  >("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPageInput, setJumpPageInput] = useState<string>("");

  // Modal & Selection State
  const [selectedReceipt, setSelectedReceipt] = useState<IReceipt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mark Paid / Status Change Action Dialog
  const [statusModalReceipt, setStatusModalReceipt] = useState<IReceipt | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<PaymentStatus>("paid");
  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<PaymentMode>("Cash");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchReceipts = useCallback(async () => {
    try {
      const data = await api.getReceipts();
      setReceipts(data || []);
    } catch (err) {
      console.error("Error fetching all receipts:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const canChangeStatus = Boolean(
    user?.isMainAdmin || user?.role === "admin" || user?.canUpdateReceiptStatus,
  );

  // Unique list of collectors for dropdown filter
  const collectorsList = useMemo(() => {
    const map = new Map<string, string>();
    receipts.forEach((r) => {
      if (r.collectedByName) {
        map.set(r.collectedByName, r.collectedByName);
      }
    });
    return Array.from(map.values());
  }, [receipts]);

  // Filtered and sorted receipts
  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((rec) => {
        // Search by donor name
        if (searchName.trim()) {
          const qName = searchName.trim().toLowerCase();
          if (!rec.donorName?.toLowerCase().includes(qName)) {
            return false;
          }
        }

        // Search by receipt number
        if (searchReceiptNo.trim()) {
          const qNo = searchReceiptNo.trim().toLowerCase();
          if (!rec.receiptNo?.toLowerCase().includes(qNo)) {
            return false;
          }
        }

        // General search (phone, address, collector, notes)
        if (searchGeneral.trim()) {
          const qGen = searchGeneral.trim().toLowerCase();
          const matchGeneral =
            (rec.donorName && rec.donorName.toLowerCase().includes(qGen)) ||
            (rec.receiptNo && rec.receiptNo.toLowerCase().includes(qGen)) ||
            (rec.donorMobile && rec.donorMobile.includes(qGen)) ||
            (rec.donorAddress &&
              rec.donorAddress.toLowerCase().includes(qGen)) ||
            (rec.collectedByName &&
              rec.collectedByName.toLowerCase().includes(qGen)) ||
            (rec.notes && rec.notes.toLowerCase().includes(qGen));
          if (!matchGeneral) return false;
        }

        // Status filter
        if (statusFilter !== "all" && rec.paymentStatus !== statusFilter) {
          return false;
        }

        // Payment mode filter
        if (modeFilter !== "all" && rec.paymentMode !== modeFilter) {
          return false;
        }

        // Collector filter
        if (
          collectorFilter !== "all" &&
          rec.collectedByName !== collectorFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        if (sortBy === "oldest") {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        if (sortBy === "amount_high") {
          return Number(b.amount) - Number(a.amount);
        }
        if (sortBy === "amount_low") {
          return Number(a.amount) - Number(b.amount);
        }
        return 0;
      });
  }, [
    receipts,
    searchName,
    searchReceiptNo,
    searchGeneral,
    statusFilter,
    modeFilter,
    collectorFilter,
    sortBy,
  ]);

  // Aggregated stats of filtered items
  const stats = useMemo(() => {
    let totalPaid = 0;
    let totalUnpaid = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    receipts.forEach((r) => {
      const amt = Number(r.amount) || 0;
      if (r.paymentStatus === "paid") {
        totalPaid += amt;
        paidCount++;
      } else {
        totalUnpaid += amt;
        unpaidCount++;
      }
    });

    const filteredTotalAmount = filteredReceipts.reduce(
      (sum, r) => sum + (Number(r.amount) || 0),
      0,
    );

    return {
      totalReceipts: receipts.length,
      totalPaid,
      totalUnpaid,
      paidCount,
      unpaidCount,
      filteredCount: filteredReceipts.length,
      filteredTotalAmount,
    };
  }, [receipts, filteredReceipts]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredReceipts.length / pageSize));

  // Reset page to 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchName,
    searchReceiptNo,
    searchGeneral,
    statusFilter,
    modeFilter,
    collectorFilter,
    sortBy,
    pageSize,
  ]);

  // Ensure currentPage doesn't exceed totalPages if dataset shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Paginated subset of receipts for current page
  const paginatedReceipts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReceipts.slice(startIndex, startIndex + pageSize);
  }, [filteredReceipts, currentPage, pageSize]);

  const startIndexDisplay =
    filteredReceipts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndexDisplay = Math.min(
    currentPage * pageSize,
    filteredReceipts.length,
  );

  const handlePageChange = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleJumpPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setJumpPageInput("");
    }
  };

  // Generate dynamic pagination button numbers with ellipsis
  const paginationRange = useMemo(() => {
    const delta = 1; // Number of pages around current page
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (typeof i === "number" && i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (typeof i === "number" && i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      if (typeof i === "number") {
        l = i;
      }
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchName("");
    setSearchReceiptNo("");
    setSearchGeneral("");
    setStatusFilter("all");
    setModeFilter("all");
    setCollectorFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchName.trim()) ||
    Boolean(searchReceiptNo.trim()) ||
    Boolean(searchGeneral.trim()) ||
    statusFilter !== "all" ||
    modeFilter !== "all" ||
    collectorFilter !== "all" ||
    sortBy !== "newest";

  // WhatsApp Share Formatter
  const handleWhatsAppShare = (rec: IReceipt) => {
    let mobile = rec.donorMobile ? rec.donorMobile.replace(/\D/g, "") : "";
    if (mobile.length === 10) mobile = "91" + mobile;

    const isPaid = rec.paymentStatus === "paid";
    const dateFormatted = new Date(rec.createdAt).toLocaleDateString("mr-IN");

    const message =
      language === "mr"
        ? `🚩 *श्री गणेश मित्र मंडळ, शिरसवडी * 🚩\n` +
          `॥ श्री गणेशाय नमः ॥\n\n` +
          `प्रिय *${rec.donorName}*,\n` +
          `आपली गणेशोत्सव २०२६ वर्गणी पावती:\n\n` +
          `📄 *पावती क्र:* ${rec.receiptNo}\n` +
          `💰 *रक्कम:* ₹ ${Number(rec.amount).toLocaleString("en-IN")}/-\n` +
          `💳 *पेमेंट मोड:* ${rec.paymentMode}\n` +
          `📌 *स्थिती:* ${isPaid ? "✅ जमा (PAID)" : "⏳ बाकी (UNPAID)"}\n` +
          `📅 *दिनांक:* ${dateFormatted}\n` +
          `👤 *जमाकर्ता:* ${rec.collectedByName} (${rec.collectedByRole || "कार्यकर्ता"})\n\n` +
          `श्री गणरायाच्या चरणी आपल्या व कुटुंबियांच्या सुख-समृद्धीची प्रार्थना! आपले मनःपूर्वक आभार! 🙏🌺`
        : `🚩 *Shree गणेश Mitra Mandal Padmawadi mala* 🚩\n\n` +
          `Dear *${rec.donorName}*,\n` +
          `Thank you for your Ganpati Festival contribution:\n\n` +
          `📄 *Receipt No:* ${rec.receiptNo}\n` +
          `💰 *Amount:* ₹ ${Number(rec.amount).toLocaleString("en-IN")}\n` +
          `💳 *Mode:* ${rec.paymentMode}\n` +
          `📌 *Status:* ${isPaid ? "✅ PAID" : "⏳ PENDING"}\n` +
          `📅 *Date:* ${dateFormatted}\n` +
          `👤 *Collected By:* ${rec.collectedByName}\n\n` +
          `May Lord Ganesha shower blessings upon you and your family! 🙏✨`;

    const url = mobile
      ? `https://api.whatsapp.com/send?phone=${mobile}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  // Status Change Handler
  const handleOpenStatusModal = (rec: IReceipt) => {
    if (!canChangeStatus) {
      alert(
        "पावती वर्गणी स्थिती बदलण्याचा अधिकार फक्त मुख्य अध्यक्ष किंवा प्राधिकृत सदस्यांना आहे.",
      );
      return;
    }
    setStatusModalReceipt(rec);
    setNewStatus(rec.paymentStatus === "paid" ? "unpaid" : "paid");
    setSelectedPaymentMode(rec.paymentMode || "Cash");
  };

  const handleConfirmStatusChange = async () => {
    if (!statusModalReceipt) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateReceiptStatus(
        statusModalReceipt._id || statusModalReceipt.receiptNo,
        newStatus,
        newStatus === "paid" ? selectedPaymentMode : undefined,
      );

      setReceipts((prev) =>
        prev.map((r) =>
          r._id === updated._id || r.receiptNo === updated.receiptNo
            ? updated
            : r,
        ),
      );

      setStatusModalReceipt(null);
      setSelectedReceipt(updated);
      setIsModalOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to update receipt status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Receipt Handler (Admin Only)
  const handleDeleteReceipt = async (rec: IReceipt) => {
    if (!isAdmin) {
      alert("पावती हटवण्याचा अधिकार फक्त ॲडमिनला आहे.");
      return;
    }
    const confirmDelete = window.confirm(
      `तुम्हाला पावती क्र. ${rec.receiptNo} (${rec.donorName} - ₹${rec.amount}) नक्की हटवायची आहे का?`,
    );
    if (!confirmDelete) return;

    try {
      await api.deleteReceipt(rec._id || rec.receiptNo);
      setReceipts((prev) =>
        prev.filter((r) => r._id !== rec._id && r.receiptNo !== rec.receiptNo),
      );
    } catch (err: any) {
      alert(err.message || "Failed to delete receipt");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-amber-800/50 relative overflow-hidden">
        {/* Background Mandala Accent */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full">
              <Receipt className="w-3.5 h-3.5" />
              <span>
                {language === "mr"
                  ? "सर्व वर्गणी पावत्या व्यवस्थापन"
                  : "All Vargani Receipts Management"}
              </span>
            </div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-white tracking-tight">
              {language === "mr"
                ? "सर्व पावत्या यादी (All Receipts)"
                : "All Receipts Directory"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              {language === "mr"
                ? "दात्याचे नाव, पावती नंबर व मोबाईल नंबर द्वारे त्वरित सर्च, फिल्टर व सुटसुटीत पेजिनेशन."
                : "Instant search by donor name, receipt number, mobile, multi-filters & responsive pagination."}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              id="refresh-all-receipts-btn"
              onClick={() => {
                setIsRefreshing(true);
                fetchReceipts();
              }}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`}
              />
              <span>{language === "mr" ? "रिफ्रेश" : "Refresh"}</span>
            </button>

            {setActiveTab && (
              <button
                id="create-new-receipt-from-all-btn"
                onClick={() => setActiveTab("new_receipt")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>
                  {language === "mr" ? "+ नवीन पावती" : "+ New Receipt"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-amber-800/40">
          <div className="bg-black/30 backdrop-blur-xs rounded-2xl p-3 border border-amber-700/30">
            <div className="text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider">
              {language === "mr" ? "एकूण पावत्या" : "Total Receipts"}
            </div>
            <div className="text-lg sm:text-2xl font-black text-white font-mono mt-0.5">
              {stats.totalReceipts}
            </div>
            <div className="text-[10px] text-stone-400">
              {stats.paidCount} जमा • {stats.unpaidCount} बाकी
            </div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-xs rounded-2xl p-3 border border-emerald-500/30">
            <div className="text-[10px] sm:text-xs text-emerald-300 font-bold uppercase tracking-wider">
              {language === "mr" ? "एकूण जमा वर्गणी" : "Total Paid Amount"}
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-300 font-mono mt-0.5">
              ₹ {stats.totalPaid.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-emerald-400/80">
              {stats.paidCount} पावत्या भरल्या
            </div>
          </div>

          <div className="bg-amber-950/50 backdrop-blur-xs rounded-2xl p-3 border border-amber-500/30">
            <div className="text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider">
              {language === "mr" ? "येणे / बाकी वर्गणी" : "Pending Unpaid"}
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono mt-0.5">
              ₹ {stats.totalUnpaid.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-amber-400/80">
              {stats.unpaidCount} येणे पावत्या
            </div>
          </div>

          <div className="bg-indigo-950/40 backdrop-blur-xs rounded-2xl p-3 border border-indigo-500/30">
            <div className="text-[10px] sm:text-xs text-indigo-300 font-bold uppercase tracking-wider">
              {language === "mr" ? "शोधलेले निकाल" : "Matching Results"}
            </div>
            <div className="text-lg sm:text-2xl font-black text-indigo-200 font-mono mt-0.5">
              {stats.filteredCount}{" "}
              <span className="text-xs font-normal">पावत्या</span>
            </div>
            <div className="text-[10px] text-indigo-300/80 font-mono">
              ₹ {stats.filteredTotalAmount.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Main Search & Filters Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm sm:text-base">
            <Search className="w-5 h-5 text-amber-700" />
            <span>
              {language === "mr"
                ? "पावती शोध (Search by Name & Receipt Number)"
                : "Search by Name & Receipt Number"}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              id="clear-receipt-filters-btn"
              onClick={handleClearFilters}
              className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center space-x-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>
                {language === "mr" ? "फिल्टर्स काढा (Reset)" : "Reset Filters"}
              </span>
            </button>
          )}
        </div>

        {/* Dedicated Search Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Search by Donor Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">
              {language === "mr"
                ? "१. भक्ताच्या / दात्याच्या नावाने शोधा"
                : "1. Search by Donor Name"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-donor-name-input"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder={
                  language === "mr"
                    ? "उदा. राहुल पाटील, सचिन, सुरेश..."
                    : "e.g. Rahul Patil, Sachin..."
                }
                className="w-full pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              {searchName && (
                <button
                  onClick={() => setSearchName("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Search by Receipt Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">
              {language === "mr"
                ? "२. पावती नंबरने शोधा (Receipt #)"
                : "2. Search by Receipt #"}
            </label>
            <div className="relative">
              <Receipt className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-receipt-no-input"
                type="text"
                value={searchReceiptNo}
                onChange={(e) => setSearchReceiptNo(e.target.value)}
                placeholder={
                  language === "mr"
                    ? "उदा. SGM-001 किंवा 001..."
                    : "e.g. SGM-001 or 001..."
                }
                className="w-full pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              {searchReceiptNo && (
                <button
                  onClick={() => setSearchReceiptNo("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3. General Search (Mobile, Address, Collector) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">
              {language === "mr"
                ? "३. मोबाईल / पत्ता / इतर शोधा"
                : "3. Mobile / Address / Other"}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-general-receipts-input"
                type="text"
                value={searchGeneral}
                onChange={(e) => setSearchGeneral(e.target.value)}
                placeholder={
                  language === "mr"
                    ? "मोबाईल, पत्ता, गल्ली किंवा नोंद..."
                    : "Mobile, address, notes..."
                }
                className="w-full pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              {searchGeneral && (
                <button
                  onClick={() => setSearchGeneral("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Filter Chips Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-amber-800 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {language === "mr"
                ? `सर्व (${receipts.length})`
                : `All (${receipts.length})`}
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                statusFilter === "paid"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {language === "mr"
                  ? `जमा (${stats.paidCount})`
                  : `Paid (${stats.paidCount})`}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("unpaid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                statusFilter === "unpaid"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {language === "mr"
                  ? `बाकी (${stats.unpaidCount})`
                  : `Unpaid (${stats.unpaidCount})`}
              </span>
            </button>
          </div>

          {/* Mode & Sort Dropdowns & Page Size */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Payment Mode Selector */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">
                {language === "mr" ? "सर्व पेमेंट मोड" : "All Payment Modes"}
              </option>
              <option value="Cash">Cash (रोख)</option>
              <option value="UPI">UPI</option>
              <option value="GPay">GPay</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Paytm">Paytm</option>
              <option value="NetBanking">NetBanking</option>
              <option value="Cheque">Cheque</option>
            </select>

            {/* Collector Selector */}
            {collectorsList.length > 1 && (
              <select
                value={collectorFilter}
                onChange={(e) => setCollectorFilter(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
              >
                <option value="all">
                  {language === "mr" ? "सर्व जमाकर्ते" : "All Collectors"}
                </option>
                {collectorsList.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
            >
              <option value="newest">
                {language === "mr" ? "नवीनतम प्रथम" : "Newest First"}
              </option>
              <option value="oldest">
                {language === "mr" ? "जुने प्रथम" : "Oldest First"}
              </option>
              <option value="amount_high">
                {language === "mr" ? "जास्त रक्कम प्रथम" : "Highest Amount"}
              </option>
              <option value="amount_low">
                {language === "mr" ? "कमी रक्कम प्रथम" : "Lowest Amount"}
              </option>
            </select>

            {/* Per Page Selection */}
            <div className="flex items-center space-x-1.5 bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1 text-stone-700 font-bold">
              <span className="text-[11px] text-stone-500">
                {language === "mr" ? "प्रति पान:" : "Per page:"}
              </span>
              <select
                id="receipts-page-size-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-transparent font-black text-amber-950 focus:outline-hidden cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Anchor for auto-scrolling on pagination click */}
      <div ref={tableTopRef} className="-mt-2" />

      {/* Receipts Directory Table / Cards */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:px-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-800">
              {language === "mr"
                ? `एकूण ${filteredReceipts.length} पैकी ${startIndexDisplay} ते ${endIndexDisplay} पावत्या दाखवत आहे`
                : `Showing ${startIndexDisplay}–${endIndexDisplay} of ${filteredReceipts.length} receipts`}
            </span>
            {hasActiveFilters && (
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                फिल्टर सक्रिय
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-xs text-stone-500 font-mono">
              {language === "mr" ? "एकूण रक्कम:" : "Total Amount:"}{" "}
              <strong className="text-amber-950 text-sm font-black">
                ₹ {stats.filteredTotalAmount.toLocaleString("en-IN")}
              </strong>
            </div>

            {/* Quick mini-pagination in header on desktop */}
            {totalPages > 1 && (
              <div className="hidden md:flex items-center space-x-1.5 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 text-xs">
                <span className="text-stone-500">
                  {language === "mr" ? "पान" : "Page"}{" "}
                  <strong className="text-amber-950 font-black">
                    {currentPage}
                  </strong>{" "}
                  / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-16 text-center text-amber-800 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600" />
            <p className="text-xs font-bold">
              {language === "mr"
                ? "पावत्या लोड होत आहेत..."
                : "Loading receipts..."}
            </p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <Receipt className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-stone-800 text-sm sm:text-base">
              {language === "mr"
                ? "कोणतीही पावती सापडली नाही"
                : "No matching receipts found"}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {language === "mr"
                ? "कृपया भक्ताचे नाव, पावती क्र. किंवा इतर सर्च फिल्टर तपासून पुन्हा प्रयत्न करा."
                : "Please check your search filters or add a new receipt."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {language === "mr"
                    ? "सर्व फिल्टर्स रिसेट करा"
                    : "Reset All Filters"}
                </span>
              </button>
            )}
          </div>
        ) : (
          /* List of Paginated Receipts */
          <div className="divide-y divide-stone-100">
            {paginatedReceipts.map((rec) => {
              const isPaid = rec.paymentStatus === "paid";
              return (
                <div
                  key={rec._id || rec.receiptNo}
                  className="p-4 sm:px-6 hover:bg-amber-50/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3.5"
                >
                  {/* Left: Receipt Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-950 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-300">
                        {rec.receiptNo}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base tracking-tight truncate">
                        {rec.donorName}
                      </h4>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                        }`}
                      >
                        {isPaid ? "✅ जमा (Paid)" : "⏳ बाकी (Unpaid)"}
                      </span>
                      <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                        {rec.paymentMode}
                      </span>
                    </div>

                    {/* Metadata details */}
                    <div className="text-[11px] sm:text-xs text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {rec.donorMobile && (
                        <span className="flex items-center space-x-1 font-mono text-stone-700">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{rec.donorMobile}</span>
                        </span>
                      )}

                      {rec.donorAddress && (
                        <span className="flex items-center space-x-1 text-stone-600 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{rec.donorAddress}</span>
                        </span>
                      )}

                      <span className="flex items-center space-x-1 text-stone-500">
                        <User className="w-3 h-3 text-stone-400" />
                        <span>
                          जमाकर्ता:{" "}
                          <strong className="text-stone-800">
                            {rec.collectedByName}
                          </strong>
                          {rec.collectedByRole
                            ? ` (${rec.collectedByRole})`
                            : ""}
                        </span>
                      </span>

                      <span className="flex items-center space-x-1 font-mono text-stone-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(rec.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                    </div>

                    {rec.notes && (
                      <p className="text-[11px] text-stone-500 italic bg-stone-50 px-2 py-0.5 rounded-md inline-block">
                        नोंद: {rec.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                    <div className="text-left lg:text-right">
                      <div className="text-lg sm:text-xl font-black text-amber-950 font-mono tracking-tight">
                        ₹ {Number(rec.amount).toLocaleString("en-IN")}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {isPaid ? "पावती पूर्ण" : "वसुली बाकी"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1.5">
                      {/* WhatsApp Share */}
                      <button
                        onClick={() => handleWhatsAppShare(rec)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
                        title={
                          language === "mr"
                            ? "व्हॉट्सॲपवर पाठवा"
                            : "Share on WhatsApp"
                        }
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* View / Print Receipt */}
                      <button
                        onClick={() => {
                          setSelectedReceipt(rec);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                        title={
                          language === "mr"
                            ? "पावती पहा व प्रिंट करा"
                            : "View & Print Receipt"
                        }
                      >
                        <Eye className="w-4 h-4 text-amber-700" />
                        <span className="hidden sm:inline">
                          {language === "mr" ? "पाहा" : "View"}
                        </span>
                      </button>

                      {/* Toggle Paid / Unpaid Status (if authorized) */}
                      {canChangeStatus && (
                        <button
                          onClick={() => handleOpenStatusModal(rec)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            isPaid
                              ? "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs"
                          }`}
                          title={
                            isPaid
                              ? "बाकी (Unpaid) म्हणून नोंदवा"
                              : "जमा (Paid) म्हणून नोंदवा"
                          }
                        >
                          {isPaid ? "बाकी करा" : "जमा करा"}
                        </button>
                      )}

                      {/* Admin Delete Action */}
                      {/* {isAdmin && (
                        <button
                          onClick={() => handleDeleteReceipt(rec)}
                          className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="पावती हटवा"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )} */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Complete Pagination Bottom Bar */}
        {filteredReceipts.length > 0 && (
          <div className="p-4 sm:px-6 bg-stone-50 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Summary Info */}
            <div className="text-xs text-stone-600 font-medium flex items-center space-x-2 order-2 md:order-1">
              <span>
                {language === "mr"
                  ? `दाखवत आहे ${startIndexDisplay} ते ${endIndexDisplay} (एकूण ${filteredReceipts.length} पैकी)`
                  : `Showing ${startIndexDisplay}–${endIndexDisplay} of ${filteredReceipts.length} receipts`}
              </span>
              <span className="text-stone-300">|</span>
              <span>
                {language === "mr"
                  ? `पान ${currentPage} / ${totalPages}`
                  : `Page ${currentPage} of ${totalPages}`}
              </span>
            </div>

            {/* Middle: Pagination Page Buttons */}
            <div className="flex items-center space-x-1 order-1 md:order-2 flex-wrap justify-center">
              {/* First Page */}
              <button
                id="pagination-first-page-btn"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-amber-50 hover:text-amber-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-700 transition-colors cursor-pointer"
                title={language === "mr" ? "पहिले पान" : "First Page"}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page */}
              <button
                id="pagination-prev-page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs hover:bg-amber-50 hover:text-amber-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-700 flex items-center space-x-1 transition-colors cursor-pointer"
                title={language === "mr" ? "मागील पान" : "Previous Page"}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === "mr" ? "मागे" : "Prev"}
                </span>
              </button>

              {/* Numeric Page Buttons with Ellipsis */}
              {paginationRange.map((pageItem, index) => {
                if (pageItem === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2.5 py-1.5 text-stone-400 font-bold text-xs select-none"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(pageItem);
                const isActive = pageNum === currentPage;

                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-800 text-white shadow-xs scale-105 border border-amber-900 font-black"
                        : "bg-white border border-stone-300 text-stone-700 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Page */}
              <button
                id="pagination-next-page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs hover:bg-amber-50 hover:text-amber-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-700 flex items-center space-x-1 transition-colors cursor-pointer"
                title={language === "mr" ? "पुढील पान" : "Next Page"}
              >
                <span className="hidden sm:inline">
                  {language === "mr" ? "पुढे" : "Next"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                id="pagination-last-page-btn"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-amber-50 hover:text-amber-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-700 transition-colors cursor-pointer"
                title={language === "mr" ? "शेवटचे पान" : "Last Page"}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Quick Jump Form */}
            {totalPages > 3 && (
              <form
                onSubmit={handleJumpPageSubmit}
                className="flex items-center space-x-1.5 text-xs order-3"
              >
                <span className="text-stone-500">
                  {language === "mr" ? "पानावर जा:" : "Go to:"}
                </span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  placeholder={`${currentPage}`}
                  className="w-12 px-2 py-1 bg-white border border-stone-300 rounded-lg text-center font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  OK
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Receipt Modal Popup for View, Print & WhatsApp */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={async (id, st) => {
          const updated = await api.updateReceiptStatus(id, st);
          if (updated) {
            setSelectedReceipt(updated);
            setReceipts((prev) =>
              prev.map((r) =>
                r._id === updated._id || r.receiptNo === updated.receiptNo
                  ? updated
                  : r,
              ),
            );
          }
        }}
      />

      {/* Change Status Modal Dialog */}
      {statusModalReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-stone-200 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-stone-900 text-base">
                  {language === "mr"
                    ? "पावती स्थिती बदल (Update Status)"
                    : "Update Receipt Status"}
                </h3>
              </div>
              <button
                onClick={() => setStatusModalReceipt(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-amber-900">
                  {statusModalReceipt.receiptNo}
                </span>
                <span className="font-mono font-black text-amber-950 text-sm">
                  ₹ {Number(statusModalReceipt.amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="font-bold text-stone-900 text-sm">
                {statusModalReceipt.donorName}
              </div>
              <div className="text-xs text-stone-500">
                सध्याची स्थिती:{" "}
                <strong
                  className={
                    statusModalReceipt.paymentStatus === "paid"
                      ? "text-emerald-700"
                      : "text-amber-800"
                  }
                >
                  {statusModalReceipt.paymentStatus === "paid"
                    ? "जमा (Paid)"
                    : "बाकी (Unpaid)"}
                </strong>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  नवीन स्थिती निवडा
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus("paid")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newStatus === "paid"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    ✅ जमा (Paid)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus("unpaid")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newStatus === "unpaid"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    ⏳ बाकी (Unpaid)
                  </button>
                </div>
              </div>

              {newStatus === "paid" && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पेमेंट मोड (Payment Mode)
                  </label>
                  <select
                    value={selectedPaymentMode}
                    onChange={(e: any) =>
                      setSelectedPaymentMode(e.target.value)
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Cash">Cash (रोख)</option>
                    <option value="UPI">UPI</option>
                    <option value="GPay">GPay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setStatusModalReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1"
              >
                {isUpdatingStatus && (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                )}
                <span>बदल जतन करा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
