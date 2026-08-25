import { IUser, IReceipt, IExpense, IDashboardStats, IAuditLog, IMandalInfo } from "../types";

const API_BASE = "/api";

export function getStoredToken(): string | null {
  return localStorage.getItem("ganesh_session_token");
}

export function getStoredUserId(): string | null {
  return localStorage.getItem("ganesh_user_id");
}

export function saveSession(token: string, user: IUser) {
  localStorage.setItem("ganesh_session_token", token);
  localStorage.setItem("ganesh_user_id", user._id || user.mobile);
  localStorage.setItem("ganesh_user_obj", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("ganesh_session_token");
  localStorage.removeItem("ganesh_user_id");
  localStorage.removeItem("ganesh_user_obj");
}

export function getStoredUser(): IUser | null {
  const data = localStorage.getItem("ganesh_user_obj");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = getStoredToken();
  const userId = getStoredUserId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && (data.code === "SESSION_SUPERSEDED" || data.code === "SESSION_EXPIRED")) {
      clearSession();
      window.dispatchEvent(new CustomEvent("ganesh_session_expired", { detail: data.error }));
    }
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
  // Auth
  login: async (mobile: string, password: string): Promise<{ token: string; user: IUser }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.");
      }
      saveSession(data.token, data.user);
      return data;
    } catch (err: any) {
      throw new Error(err.message || "सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.");
    }
  },

  getCurrentUser: async (): Promise<IUser> => {
    const data = await fetchWithAuth("/auth/me");
    return data.user;
  },

  logout: async () => {
    try {
      await fetchWithAuth("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      clearSession();
    }
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<IDashboardStats> => {
    const data = await fetchWithAuth("/dashboard/stats");
    return data.stats;
  },

  // Mandal Info (Main Admin Name & Registration Details dynamically from DB)
  getMandalInfo: async (): Promise<IMandalInfo> => {
    try {
      const res = await fetch(`${API_BASE}/mandal/info`);
      const data = await res.json().catch(() => ({}));
      if (data.success && data.info) {
        return data.info;
      }
      return {
        mandalName: "श्री गणेश मित्र मंडळ",
        regNo: "महा./१८५/२०२३",
        location: "पद्मावाडी मळा, शिरसवाडी, सातारा",
        mainAdminName: "उद्धव इंगळे",
        mainAdminMobile: "8275658844",
        mainAdminRole: "मुख्य अध्यक्ष",
      };
    } catch {
      return {
        mandalName: "श्री गणेश मित्र मंडळ",
        regNo: "महा./१८५/२०२३",
        location: "पद्मावाडी मळा, शिरसवाडी, सातारा",
        mainAdminName: "उद्धव इंगळे",
        mainAdminMobile: "8275658844",
        mainAdminRole: "मुख्य अध्यक्ष",
      };
    }
  },

  // Receipts
  getReceipts: async (params?: { status?: string; search?: string; collector?: string }): Promise<IReceipt[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.collector) query.append("collector", params.collector);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const data = await fetchWithAuth(`/receipts${queryString}`);
    return data.receipts;
  },

  createReceipt: async (receiptData: {
    donorName: string;
    donorMobile: string;
    donorAddress: string;
    amount: number;
    amountInWords?: string;
    paymentMode: string;
    paymentStatus: string;
    notes?: string;
  }): Promise<IReceipt> => {
    const data = await fetchWithAuth("/receipts", {
      method: "POST",
      body: JSON.stringify(receiptData),
    });
    return data.receipt;
  },

  updateReceiptStatus: async (receiptId: string, status: "paid" | "unpaid", paymentMode?: string): Promise<IReceipt> => {
    const data = await fetchWithAuth(`/receipts/${receiptId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, paymentMode }),
    });
    return data.receipt;
  },

  deleteReceipt: async (receiptId: string): Promise<void> => {
    await fetchWithAuth(`/receipts/${receiptId}`, { method: "DELETE" });
  },

  // Expenses
  getExpenses: async (): Promise<IExpense[]> => {
    const data = await fetchWithAuth("/expenses");
    return data.expenses;
  },

  createExpense: async (expenseData: {
    title: string;
    category: string;
    amount: number;
    paidTo: string;
    paymentMethod: string;
    authorizedByAdmin: string;
    expenseDate?: string;
    reason?: string;
    billImage?: string;
  }): Promise<IExpense> => {
    const data = await fetchWithAuth("/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    });
    return data.expense;
  },

  deleteExpense: async (expenseId: string): Promise<void> => {
    await fetchWithAuth(`/expenses/${expenseId}`, { method: "DELETE" });
  },

  // Users
  getUsers: async (): Promise<IUser[]> => {
    const data = await fetchWithAuth("/users");
    return data.users;
  },

  createUser: async (userData: {
    name: string;
    mobile: string;
    password: string;
    role: string;
    canUpdateReceiptStatus?: boolean;
    canManageExpenses: boolean;
    canCreateAdmin: boolean;
    isActive: boolean;
  }): Promise<IUser> => {
    const data = await fetchWithAuth("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return data.user;
  },

  updateUser: async (userId: string, updates: Partial<IUser>): Promise<IUser> => {
    const data = await fetchWithAuth(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await fetchWithAuth(`/users/${userId}`, { method: "DELETE" });
  },

  // Main Admin Factory Reset / Clean All Data
  cleanAllData: async (credentials: {
    mobile: string;
    password: string;
  }): Promise<{ success: boolean; message: string; stats?: IDashboardStats }> => {
    const data = await fetchWithAuth("/admin/clean-all-data", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return data;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<IAuditLog[]> => {
    const data = await fetchWithAuth("/audit-logs");
    return data.logs;
  },
};
