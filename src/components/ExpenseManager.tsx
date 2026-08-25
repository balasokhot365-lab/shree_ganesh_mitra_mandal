import React, { useState, useEffect, useCallback } from "react";
import { IExpense, ExpenseCategory, IDashboardStats } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  PlusCircle,
  Search,
  Trash2,
  Printer,
  AlertTriangle,
  Receipt,
  IndianRupee,
  ShieldCheck,
  Calendar,
  User,
  Tag,
  FileText,
} from "lucide-react";

export const ExpenseManager: React.FC = () => {
  const { user, isAdmin, canManageExpenses } = useAuth();
  const { t, language } = useLanguage();

  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Mandap");
  const [amount, setAmount] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "UPI" | "BankTransfer" | "Cheque"
  >("Cash");
  const [authorizedByAdmin, setAuthorizedByAdmin] = useState(
    "उद्धव इंगळे (मुख्य अध्यक्ष)",
  );
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reason, setReason] = useState("");
  const [billImage, setBillImage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);

  // Voucher print view
  const [printingVoucher, setPrintingVoucher] = useState<IExpense | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expList, dashboardStats] = await Promise.all([
        api.getExpenses(),
        api.getDashboardStats(),
      ]);
      setExpenses(expList);
      setStats(dashboardStats);
    } catch (err) {
      console.error("Error fetching expense data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Bill Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setBudgetWarning(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg(
        language === "mr"
          ? "कृपया वैध रक्कम टाका."
          : "Please enter a valid amount.",
      );
      return;
    }

    // Budget Deficit Pre-validation Check
    const totalCollected = stats?.totalPaidAmount || 0;
    const currentExpenses = stats?.totalExpenseAmount || 0;
    const prospectiveTotal = currentExpenses + numAmount;

    if (prospectiveTotal > totalCollected) {
      const deficit = prospectiveTotal - totalCollected;
      const warningText =
        language === "mr"
          ? `बजेट इशारा: एकूण जमा रक्कमेपेक्षा (₹${totalCollected.toLocaleString("en-IN")}) खर्च (₹${prospectiveTotal.toLocaleString("en-IN")}) जास्त होत आहे! तूट: ₹${deficit.toLocaleString("en-IN")}. खर्च नोंदवला जाऊ शकत नाही.`
          : `Budget Alert: Expense exceeds total collections! Deficit: ₹${deficit.toLocaleString("en-IN")}. Expense cannot be recorded.`;
      setBudgetWarning(warningText);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createExpense({
        title: title.trim(),
        category,
        amount: numAmount,
        paidTo: paidTo.trim(),
        paymentMethod,
        authorizedByAdmin: authorizedByAdmin.trim(),
        expenseDate,
        reason: reason.trim(),
        billImage: billImage || undefined,
      });

      // Reset form & Refresh
      setTitle("");
      setAmount("");
      setPaidTo("");
      setReason("");
      setBillImage("");
      setIsAddOpen(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "खर्च नोंदवताना त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string, voucherNo: string) => {
    if (!window.confirm(`खर्च व्हाउचर ${voucherNo} नक्की हटवायचा आहे का?`))
      return;
    try {
      await api.deleteExpense(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "खर्च हटवताना त्रुटी आली.");
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.authorizedByAdmin &&
        e.authorizedByAdmin.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseSum = filteredExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-800 via-red-800 to-rose-950 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-rose-200 uppercase tracking-wider flex items-center space-x-1.5">
            <span>💸</span>
            <span>{t.mandalName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif mt-1">
            {t.menuExpenseManager}
          </h2>
          <p className="text-xs sm:text-sm text-rose-200 mt-0.5">
            {language === "mr"
              ? "मंडळाच्या सर्व खर्चांचे पारदर्शक व्यवस्थापन व व्हाउचर छपाई."
              : "Transparent Mandal expense recording, budget validation & voucher printing."}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-rose-950/70 border border-rose-400/30 rounded-xl px-4 py-2.5 text-right">
            <span className="text-[10px] text-rose-300 block uppercase font-medium">
              एकूण खर्च (Total Expenses)
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-200 font-mono">
              ₹ {(stats?.totalExpenseAmount || 0).toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-rose-300">
              शिल्लक: ₹ {(stats?.remainingBalance || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {canManageExpenses && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold px-4 py-3 rounded-xl text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addExpense}</span>
            </button>
          )}
        </div>
      </div>

      {/* Budget Warning Banner if Over Budget */}
      {stats && stats.totalExpenseAmount > stats.totalPaidAmount && (
        <div className="bg-red-100 border-2 border-red-500 text-red-900 rounded-xl p-4 flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <div className="text-xs sm:text-sm font-bold">
            ⚠️ गंभीर इशारा: मंडळाचा खर्च एकूण जमा रक्कमेपेक्षा जास्त झाला आहे!
            कृपया नवीन खर्चावर तात्काळ नियंत्रण आणा.
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="खर्च नाव, व्यापारी, व्हाउ. क्र. शोधा..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-stone-600 shrink-0">
            वर्गवारी:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="ALL">सर्व खर्च (All Categories)</option>
            <option value="Mandap">मंडप व स्टेज (Mandap)</option>
            <option value="Decoration">डेकोरेशन (Decoration)</option>
            <option value="Prasad">प्रसाद (Prasad)</option>
            <option value="Sound_DJ">साउंड व DJ (Sound)</option>
            <option value="Murti_Idol">गणेश मूर्ती (Murti)</option>
            <option value="Mahaprasad">महाप्रसाद (Mahaprasad)</option>
            <option value="Visarjan">विसर्जन (Visarjan)</option>
            <option value="Electricity_Light">लायटिंग (Lighting)</option>
            <option value="Stationery">स्टेशनरी (Stationery)</option>
            <option value="Other">इतर (Other)</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500 border border-stone-200">
          <div className="animate-spin w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="font-semibold text-sm">खर्चाची माहिती लोड होत आहे...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-stone-500 border border-stone-200">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="text-base font-bold text-stone-800">
            कोणताही खर्च सापडला नाही
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            नवीन खर्च नोंदवण्यासाठी वरील बटनावर क्लिक करा.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200">
                  <th className="py-3 px-4">व्हाउचर क्र.</th>
                  <th className="py-3 px-4">खर्चाचे नाव व वर्गवारी</th>
                  <th className="py-3 px-4">कोणाला दिले (Paid To)</th>
                  <th className="py-3 px-4">अध्यक्ष अधिकार (Authorized)</th>
                  <th className="py-3 px-4">पेमेंट मोड</th>
                  <th className="py-3 px-4">तारीख</th>
                  <th className="py-3 px-4 text-right">रक्कम</th>
                  <th className="py-3 px-4 text-center">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp._id || exp.voucherNo}
                    className="hover:bg-stone-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-rose-900">
                      {exp.voucherNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">
                        {exp.title}
                      </div>
                      <span className="inline-block bg-rose-50 text-rose-800 text-[10px] px-2 py-0.5 rounded font-semibold border border-rose-200 mt-0.5">
                        {t[`cat_${exp.category}` as keyof typeof t] ||
                          exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {exp.paidTo}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div className="flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {exp.authorizedByAdmin || "अध्यक्ष"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] font-mono">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                      {exp.expenseDate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-700 text-sm">
                      ₹ {Number(exp.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setPrintingVoucher(exp)}
                          className="p-1.5 hover:bg-stone-100 rounded text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                          title="व्हाउचर प्रिंट करा"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleDeleteExpense(
                                exp._id || exp.voucherNo,
                                exp.voucherNo,
                              )
                            }
                            className="p-1.5 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            title="खर्च हटवा"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 border-t border-stone-200 px-4 py-3 flex items-center justify-between font-bold text-xs">
            <span className="text-stone-600">
              एकूण खर्च संख्या: {filteredExpenses.length}
            </span>
            <span className="text-rose-900 font-mono text-sm">
              एकूण रक्कम: ₹ {totalExpenseSum.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2 text-rose-800">
                <PlusCircle className="w-6 h-6" />
                <h3 className="font-bold text-base text-stone-900">
                  {t.addExpense}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setErrorMsg(null);
                  setBudgetWarning(null);
                }}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Budget Alert Message */}
            {budgetWarning && (
              <div className="bg-amber-100 border-2 border-amber-500 text-amber-950 p-3 rounded-xl text-xs font-bold space-y-1">
                <div className="flex items-center space-x-1.5 text-red-700 font-extrabold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>बजेट मर्यादा इशारा (Budget Exceeded Alert)</span>
                </div>
                <p>{budgetWarning}</p>
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    <span className="text-red-500 mr-1">*</span>खर्चाचे नाव /
                    तपशील (Title):
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="उदा. मंडप भाडे ॲडव्हान्स / महाप्रसाद किराणा"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    वर्गवारी (Category):
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ExpenseCategory)
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Mandap">मंडप व स्टेज व्यवस्था</option>
                    <option value="Decoration">डेकोरेशन व फुलांची सजावट</option>
                    <option value="Prasad">प्रसाद व नैवेद्य</option>
                    <option value="Sound_DJ">साउंड व DJ सिस्टीम</option>
                    <option value="Murti_Idol">श्री गणेश मूर्ती</option>
                    <option value="Mahaprasad">महाप्रसाद अन्नदान</option>
                    <option value="Visarjan">विसर्जन मिरवणूक व गुलाल</option>
                    <option value="Electricity_Light">
                      विजेचा खर्च व लायटिंग
                    </option>
                    <option value="Police_Permission">शासकीय व परवानगी</option>
                    <option value="Stationery">स्टेशनरी व पावती छपाई</option>
                    <option value="Other">इतर संकीर्ण खर्च</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    <span className="text-red-500 mr-1">*</span>खर्च रक्कम (₹
                    Amount):
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="उदा. 2500"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-rose-800 font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Paid To (Vendor/Person) */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    <span className="text-red-500 mr-1">*</span>कोणाला दिले
                    (Paid To):
                  </label>
                  <input
                    type="text"
                    required
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    placeholder="उदा. श्री स्वामी समर्थ मंडप डेकोरेटर्स"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    पेमेंट पद्धत (Payment Method):
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Cash">💵 रोख (Cash)</option>
                    <option value="UPI">📱 Google Pay / UPI</option>
                    <option value="BankTransfer">🏦 बँक ट्रान्सफर</option>
                    <option value="Cheque">📜 चेक (Cheque)</option>
                  </select>
                </div>

                {/* Authorized By Admin */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    अधिकार देणारे अध्यक्ष / अधिकारी:
                  </label>
                  <input
                    type="text"
                    value={authorizedByAdmin}
                    onChange={(e) => setAuthorizedByAdmin(e.target.value)}
                    placeholder="उदा. आकाश खोत (मुख्य अध्यक्ष)"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Expense Date */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    खर्च तारीख:
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Reason */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    सविस्तर कारण व उद्दिष्ट (Reason):
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="उदा. गणपती आगमनासाठी साऊंड सिस्टीम भाडे अग्रिम रक्कम"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Bill Photo Upload */}
                {/* <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    बिल / पावती फोटो (Bill Attachment):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  />
                  {billImage && (
                    <img
                      src={billImage}
                      alt="Bill preview"
                      className="h-20 w-auto rounded-lg mt-2 border"
                    />
                  )}
                </div> */}
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-xl text-xs"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "नोंदवत आहे..." : "✓ खर्च नोंदवा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Print Preview Modal */}
      {printingVoucher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-stone-900">
                खर्च व्हाउचर छपाई (Voucher Print)
              </h3>
              <button
                onClick={() => setPrintingVoucher(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            {/* Printable Voucher Box */}
            <div
              id="voucher-print"
              className="border-2 border-dashed border-stone-400 p-4 rounded-xl bg-amber-50/40 text-xs space-y-2 text-stone-900"
            >
              <div className="text-center border-b pb-2">
                <div className="text-red-700 font-extrabold text-[11px]">
                  ॥ श्री गणेशाय नमः ॥
                </div>
                <h4 className="font-serif font-black text-base text-amber-950">
                  श्री गणेश मित्र मंडळ, शिरसवडी
                </h4>
                <div className="text-[10px] text-stone-600">
                  खर्च व्हाउचर (Expense Payment Voucher)
                </div>
              </div>

              <div className="flex justify-between font-mono text-[11px]">
                <span>
                  व्हाउचर क्र.: <strong>{printingVoucher.voucherNo}</strong>
                </span>
                <span>
                  तारीख: <strong>{printingVoucher.expenseDate}</strong>
                </span>
              </div>

              <div className="border-t border-b py-2 space-y-1">
                <div>
                  खर्चाचे नाव: <strong>{printingVoucher.title}</strong>
                </div>
                <div>
                  वर्गवारी: <strong>{printingVoucher.category}</strong>
                </div>
                <div>
                  कोणाला दिले: <strong>{printingVoucher.paidTo}</strong>
                </div>
                <div>
                  पेमेंट पद्धत: <strong>{printingVoucher.paymentMethod}</strong>
                </div>
                <div>
                  अधिकार देणारे:{" "}
                  <strong>{printingVoucher.authorizedByAdmin}</strong>
                </div>
                {printingVoucher.reason && (
                  <div>
                    तपशील: <em>{printingVoucher.reason}</em>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-rose-50 p-2 rounded border border-rose-200">
                <span className="font-bold text-rose-900">
                  एकूण दिलेली रक्कम:
                </span>
                <span className="font-black text-base text-rose-900 font-mono">
                  ₹ {printingVoucher.amount.toLocaleString("en-IN")} /-
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[10px] text-stone-700">
                <div className="border-t border-stone-400 pt-1">
                  पावती घेणारा (Receiver Sign)
                </div>
                <div className="border-t border-stone-400 pt-1">
                  अध्यक्ष / खजिनदार सही (Mandal)
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रिंट करा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
