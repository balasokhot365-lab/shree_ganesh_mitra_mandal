export type UserRole = "admin" | "karyakarta";

export const STANDARD_DESIGNATIONS = [
  "मुख्य अध्यक्ष",
  "अध्यक्ष",
  "उपाध्यक्ष",
  "सचिव",
  "सहसचिव",
  "खजिनदार",
  "सहखजिनदार",
  "सल्लागार",
  "कार्यकर्ता",
] as const;

export type StandardDesignation = typeof STANDARD_DESIGNATIONS[number];

export interface IUser {
  _id?: string;
  name: string;
  mobile: string;
  password?: string;
  role: UserRole;
  designation?: string; // पद / भूमिका (उदा. मुख्य अध्यक्ष, अध्यक्ष, उपाध्यक्ष, सचिव, सहसचिव, खजिनदार, सहखजिनदार, सल्लागार, कार्यकर्ता, किंवा सानुकूल)
  isMainAdmin: boolean;
  canUpdateReceiptStatus?: boolean; // Main admin can grant authority to change Paid <-> Unpaid
  canManageExpenses: boolean;
  canCreateAdmin: boolean;
  isActive: boolean;
  currentSessionToken?: string;
  createdAt: string;
  lastLogin?: string;
}

export function getUserDesignation(user?: {
  role?: string;
  designation?: string;
  isMainAdmin?: boolean;
} | null): string {
  if (!user) return "कार्यकर्ता";
  if (user.designation && user.designation.trim()) {
    return user.designation.trim();
  }
  if (user.isMainAdmin) return "मुख्य अध्यक्ष";
  if (user.role === "admin") return "अध्यक्ष";
  return "कार्यकर्ता";
}

export function getDesignationInfo(user?: {
  role?: string;
  designation?: string;
  isMainAdmin?: boolean;
} | null): { label: string; icon: string } {
  const title = getUserDesignation(user);
  if (title === "मुख्य अध्यक्ष" || user?.isMainAdmin) {
    return { label: title, icon: "👑" };
  }
  if (title === "अध्यक्ष") {
    return { label: title, icon: "👑" };
  }
  if (title === "उपाध्यक्ष") {
    return { label: title, icon: "🤝" };
  }
  if (title === "सचिव") {
    return { label: title, icon: "📜" };
  }
  if (title === "सहसचिव") {
    return { label: title, icon: "📝" };
  }
  if (title === "खजिनदार") {
    return { label: title, icon: "💰" };
  }
  if (title === "सहखजिनदार") {
    return { label: title, icon: "💼" };
  }
  if (title === "सल्लागार") {
    return { label: title, icon: "🎖️" };
  }
  if (title === "कार्यकर्ता") {
    return { label: title, icon: "👤" };
  }
  return { label: title, icon: "✨" };
}

export type PaymentMode = "Cash" | "UPI" | "GPay" | "PhonePe" | "Paytm" | "NetBanking" | "Cheque";
export type PaymentStatus = "paid" | "unpaid";

export interface IReceipt {
  _id?: string;
  receiptNo: string;
  serialNumber: number;
  donorName: string;
  donorMobile: string;
  donorAddress: string;
  amount: number;
  amountInWords: string;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  collectedByUserId: string;
  collectedByName: string;
  collectedByRole: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | "Mandap"
  | "Decoration"
  | "Prasad"
  | "Sound_DJ"
  | "Murti_Idol"
  | "Mahaprasad"
  | "Visarjan"
  | "Electricity_Light"
  | "Police_Permission"
  | "Stationery"
  | "Other";

export interface IExpense {
  _id?: string;
  voucherNo: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paidTo: string;
  paymentMethod: "Cash" | "UPI" | "BankTransfer" | "Cheque";
  authorizedByAdmin: string;
  recordedByUserId: string;
  recordedByName: string;
  expenseDate: string;
  reason: string;
  billImage?: string;
  createdAt: string;
}

export interface IAuditLog {
  _id?: string;
  action: string;
  details: string;
  performedByUserId: string;
  performedByName: string;
  performedByRole: string;
  timestamp: string;
}

export interface IMemberPerformance {
  userId: string;
  userName: string;
  userRole: string;
  receiptsCount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface IMandalInfo {
  mandalName: string;
  regNo: string;
  location: string;
  mainAdminName: string;
  mainAdminMobile: string;
  mainAdminRole: string;
}

export interface IDashboardStats {
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  totalExpenseAmount: number;
  remainingBalance: number;
  totalReceiptsCount: number;
  paidReceiptsCount: number;
  unpaidReceiptsCount: number;
  todayPaidAmount: number;
  todayExpenseAmount: number;
  spendingPercentage: number;
  memberLeaderboard: IMemberPerformance[];
  expenseByCategory: Record<string, number>;
  paymentModeStats: Record<string, number>;
  lastUpdated: string;
}

export type ActiveTab = 
  | "dashboard"
  | "new_receipt"
  | "unpaid_receipts"
  | "expense_manager"
  | "members_performance"
  | "financial_reports"
  | "audit_logs";
