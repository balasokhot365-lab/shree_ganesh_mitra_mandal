import React, { useState, useEffect, useCallback } from "react";
import { IUser, IDashboardStats, IMemberPerformance } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Award,
  TrendingUp,
  Phone,
  CheckCircle,
  XCircle,
  Lock,
  Edit3,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { CleanDataModal } from "./CleanDataModal";

export const MemberPerformance: React.FC = () => {
  const { user, isAdmin, isMainAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [users, setUsers] = useState<IUser[]>([]);
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Member Modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCleanModalOpen, setIsCleanModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "karyakarta">("karyakarta");
  const [canUpdateReceiptStatus, setCanUpdateReceiptStatus] = useState(false);
  const [canManageExpenses, setCanManageExpenses] = useState(false);
  const [canCreateAdmin, setCanCreateAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersList, dashboardStats] = await Promise.all([
        api.getUsers(),
        api.getDashboardStats(),
      ]);
      setUsers(usersList);
      setStats(dashboardStats);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !mobile.trim()) {
      setErrorMsg("नाव आणि मोबाईल नंबर आवश्यक आहे.");
      return;
    }

    if (!editingUser && !password.trim()) {
      setErrorMsg("नवीन सदस्यासाठी पासवर्ड आवश्यक आहे.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await api.updateUser(editingUser._id || editingUser.mobile, {
          name: name.trim(),
          role,
          canUpdateReceiptStatus:
            role === "admin" ? true : canUpdateReceiptStatus,
          canManageExpenses: role === "admin" ? true : canManageExpenses,
          canCreateAdmin,
          isActive,
          ...(password.trim() ? { password: password.trim() } : {}),
        });
      } else {
        await api.createUser({
          name: name.trim(),
          mobile: mobile.trim(),
          password: password.trim(),
          role,
          canUpdateReceiptStatus:
            role === "admin" ? true : canUpdateReceiptStatus,
          canManageExpenses: role === "admin" ? true : canManageExpenses,
          canCreateAdmin,
          isActive,
        });
      }

      setIsAddUserOpen(false);
      setEditingUser(null);
      setName("");
      setMobile("");
      setPassword("");
      setRole("karyakarta");
      setCanUpdateReceiptStatus(false);
      setCanManageExpenses(false);
      setCanCreateAdmin(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "सदस्य जतन करताना त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (u: IUser) => {
    if (u.isMainAdmin) {
      alert(
        "मुख्य अध्यक्ष निष्क्रिय करता येणार नाही (Main Admin cannot be deactivated)!",
      );
      return;
    }
    try {
      await api.updateUser(u._id || u.mobile, { isActive: !u.isActive });
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleReceiptStatusAuth = async (u: IUser) => {
    if (u.isMainAdmin) return;
    try {
      await api.updateUser(u._id || u.mobile, {
        canUpdateReceiptStatus: !u.canUpdateReceiptStatus,
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleExpenseAuth = async (u: IUser) => {
    try {
      await api.updateUser(u._id || u.mobile, {
        canManageExpenses: !u.canManageExpenses,
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleAdminRole = async (u: IUser) => {
    if (u.isMainAdmin || u.mobile === "8149703310") {
      alert("मुख्य अध्यक्षांचे पद बदलता येणार नाही.");
      return;
    }
    const newRole = u.role === "admin" ? "karyakarta" : "admin";
    try {
      await api.updateUser(u._id || u.mobile, {
        role: newRole,
        canUpdateReceiptStatus:
          newRole === "admin" ? true : u.canUpdateReceiptStatus,
        canManageExpenses: newRole === "admin" ? true : u.canManageExpenses,
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (u: IUser) => {
    if (u.isMainAdmin || u.mobile === "8149703310") {
      alert("मुख्य अध्यक्ष उद्धव इंगळे (8149703310) डिलीट करता येणार नाही!");
      return;
    }
    if (!window.confirm(`${u.name} या सदस्याला हटवायचे आहे का?`)) return;
    try {
      await api.deleteUser(u._id || u.mobile);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditUser = (u: IUser) => {
    setEditingUser(u);
    setName(u.name);
    setMobile(u.mobile);
    setPassword("");
    setRole(u.role);
    setCanUpdateReceiptStatus(!!u.canUpdateReceiptStatus);
    setCanManageExpenses(u.canManageExpenses);
    setCanCreateAdmin(u.canCreateAdmin);
    setIsActive(u.isActive);
    setIsAddUserOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center space-x-1.5">
            <span>👥</span>
            <span>{t.mandalName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif mt-1">
            {t.menuMembers}
          </h2>
          <p className="text-xs sm:text-sm text-amber-200 mt-0.5">
            {language === "mr"
              ? "कार्यकर्त्यांची पावती संकलन कामगिरी व अध्यक्ष अधिकार व्यवस्थापन."
              : "Member collection performance tracking and administrative authority controls."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Admin Clean All Data Button */}
          {/* {isMainAdmin && (
            <button
              onClick={() => setIsCleanModalOpen(true)}
              className="bg-red-600/90 hover:bg-red-600 text-white font-extrabold px-3.5 py-3 rounded-xl text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center space-x-1.5 border border-red-400/40 cursor-pointer shrink-0"
              title="सर्व डेटा क्लीन करून हिशोब ० करा (फक्त मुख्य अध्यक्ष)"
            >
              <Trash2 className="w-4 h-4 text-yellow-300" />
              <span>डेटा क्लीन करा (Reset)</span>
            </button>
          )} */}

          {isAdmin && (
            <button
              onClick={() => {
                setEditingUser(null);
                setName("");
                setMobile("");
                setPassword("");
                setRole("karyakarta");
                setCanManageExpenses(false);
                setCanCreateAdmin(false);
                setIsActive(true);
                setIsAddUserOpen(true);
              }}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold px-4 py-3 rounded-xl text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.addNewMember}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-200" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-200 hover:text-white cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Member Collection Performance Leaderboard */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-base text-stone-900">
            {t.memberLeaderboardTitle}
          </h3>
        </div>

        {stats?.memberLeaderboard && stats.memberLeaderboard.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.memberLeaderboard.map((item, idx) => (
              <div
                key={item.userId}
                className="bg-stone-50/80 border border-stone-200 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          idx === 0
                            ? "bg-amber-500 text-white"
                            : idx === 1
                              ? "bg-stone-300 text-stone-800"
                              : "bg-orange-200 text-orange-900"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-stone-900 text-sm">
                        {item.userName}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {item.userRole === "admin" ? "अध्यक्ष" : "कार्यकर्ता"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-stone-200 text-xs">
                    <div>
                      <span className="text-stone-500 block text-[10px]">
                        दिलेल्या पावत्या:
                      </span>
                      <span className="font-bold text-stone-900">
                        {item.receiptsCount} पावत्या
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">
                        एकूण जमा वर्गणी:
                      </span>
                      <span className="font-black text-emerald-700 font-mono text-sm">
                        ₹ {item.paidAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {item.unpaidAmount > 0 && (
                  <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                    बाकी येणे वर्गणी:{" "}
                    <strong>
                      ₹ {item.unpaidAmount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500">कोणतीही नोंद उपलब्ध नाही.</p>
        )}
      </div>

      {/* Admin Member Management Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:px-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-800" />
            <h3 className="font-bold text-base text-stone-900">
              {language === "mr"
                ? "सर्व सदस्य यादी व अधिकार नियंत्रण"
                : "Member Directory & Authority Controls"}
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            एकूण सदस्य: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <th className="py-3 px-4">सदस्य नाव (Name)</th>
                <th className="py-3 px-4">मोबाईल क्र. (Login ID)</th>
                <th className="py-3 px-4">पद (Role)</th>
                <th className="py-3 px-4">पावती स्थिती अधिकार (Paid/Unpaid)</th>
                <th className="py-3 px-4">खर्च अधिकार (Expense Auth)</th>
                <th className="py-3 px-4">स्थिती (Status)</th>
                <th className="py-3 px-4 text-center">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {users.map((u) => (
                <tr
                  key={u._id || u.mobile}
                  className="hover:bg-stone-50/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-900">{u.name}</span>
                      {(u.isMainAdmin || u.mobile === "8149703310") && (
                        <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-300">
                          {t.mainAdminBadge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-stone-700">
                    +91 {u.mobile}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => isAdmin && handleToggleAdminRole(u)}
                      disabled={
                        !isAdmin || u.isMainAdmin || u.mobile === "8149703310"
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        u.role === "admin"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                      }`}
                      title={isAdmin ? "क्लिक करून पद बदला" : ""}
                    >
                      {u.role === "admin"
                        ? "👑 अध्यक्ष (Admin)"
                        : "👤 कार्यकर्ता (Member)"}
                    </button>
                  </td>
                  {/* Paid <-> Unpaid Authority Toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        isAdmin && handleToggleReceiptStatusAuth(u)
                      }
                      disabled={
                        !isAdmin ||
                        u.isMainAdmin ||
                        u.mobile === "8149703310" ||
                        u.role === "admin"
                      }
                      className={`px-2 py-1 rounded text-[10px] font-extrabold flex items-center space-x-1 border transition-colors cursor-pointer ${
                        u.canUpdateReceiptStatus || u.role === "admin"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                      }`}
                      title="पावती स्थिती (Paid <-> Unpaid) बदलण्याचा अधिकार"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>
                        {u.canUpdateReceiptStatus || u.role === "admin"
                          ? "मान्य (Allowed)"
                          : "अमान्य (No)"}
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => isAdmin && handleToggleExpenseAuth(u)}
                      disabled={!isAdmin}
                      className={`px-2 py-1 rounded text-[10px] font-extrabold flex items-center space-x-1 border transition-colors cursor-pointer ${
                        u.canManageExpenses || u.role === "admin"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>
                        {u.canManageExpenses || u.role === "admin"
                          ? "अधिकार प्राप्त"
                          : "नाही"}
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => isAdmin && handleToggleActive(u)}
                      disabled={
                        !isAdmin || u.isMainAdmin || u.mobile === "8149703310"
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {u.isActive
                        ? "✓ सक्रिय (Active)"
                        : "✕ निष्क्रिय (Inactive)"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isAdmin && (
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditUser(u)}
                          className="p-1.5 hover:bg-stone-200 rounded text-stone-700 cursor-pointer"
                          title="माहिती संपादित करा"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!(u.isMainAdmin || u.mobile === "8149703310") && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 hover:bg-red-50 rounded text-red-600 cursor-pointer"
                            title="सदस्य हटवा"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900">
                {editingUser ? "सदस्य माहिती संपादित करा" : t.addNewMember}
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  <span className="text-red-500 mr-1">*</span>
                  {t.memberName}:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. राहुल पाटील"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  <span className="text-red-500 mr-1">*</span>
                  {t.memberMobile}:
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  disabled={!!editingUser}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="१० अंकी मोबाईल क्र."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.memberPassword} {editingUser && "(बदलायचा असेल तरच टाका)"}:
                </label>
                <input
                  type="text"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="लॉगिन पासवर्ड"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.memberRole}:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
                >
                  <option value="karyakarta">👤 कार्यकर्ता (Karyakarta)</option>
                  <option value="admin">👑 अध्यक्ष / ॲडमिन (Admin)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canUpdateReceiptStatus || role === "admin"}
                    onChange={(e) =>
                      setCanUpdateReceiptStatus(e.target.checked)
                    }
                    disabled={role === "admin"}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">
                    🔑 पावती स्थिती बदलण्याचा अधिकार (Authority to change
                    Paid/Unpaid)
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageExpenses || role === "admin"}
                    onChange={(e) => setCanManageExpenses(e.target.checked)}
                    disabled={role === "admin"}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">
                    {t.canManageExpenses}
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">
                    खाते सक्रिय ठेवा (Active Account)
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-stone-200 text-stone-700 font-semibold rounded-xl cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "जतन होत आहे..." : "जतन करा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Admin Clean Data Modal */}
      {/* <CleanDataModal
        isOpen={isCleanModalOpen}
        onClose={() => setIsCleanModalOpen(false)}
        onSuccess={(msg) => {
          setSuccessToast(msg);
          fetchData();
        }}
      /> */}
    </div>
  );
};
