import { getDb, handleDbError } from "./db.js";
import { Firestore } from "firebase-admin/firestore";

export interface IUser {
  _id?: string;
  name: string;
  mobile: string;
  password: string;
  role: "admin" | "karyakarta";
  isMainAdmin: boolean;
  canUpdateReceiptStatus?: boolean;
  canManageExpenses: boolean;
  canCreateAdmin: boolean;
  isActive: boolean;
  currentSessionToken?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface IReceipt {
  _id?: string;
  receiptNo: string;
  serialNumber: number;
  donorName: string;
  donorMobile: string;
  donorAddress: string;
  amount: number;
  amountInWords: string;
  paymentMode:
    | "Cash"
    | "UPI"
    | "GPay"
    | "PhonePe"
    | "Paytm"
    | "NetBanking"
    | "Cheque";
  paymentStatus: "paid" | "unpaid";
  collectedByUserId: string;
  collectedByName: string;
  collectedByRole: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExpense {
  _id?: string;
  voucherNo: string;
  title: string;
  category:
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

// -------------------------------------------------------------
// Multi-Mandal & Admin Configuration (Dynamic from Environment)
// -------------------------------------------------------------
export function getMandalConfig() {
  return {
    mandalId: process.env.MANDAL_ID || "ganesh-mitra-mandal",
    mandalName: process.env.MANDAL_NAME || "श्री गणेश मित्र मंडळ",
    mandalPrefix: process.env.MANDAL_PREFIX || "GMM",
    mandalRegNo: process.env.MANDAL_REG_NO || "महा./१८५/२०२३",
    mandalLocation: process.env.MANDAL_LOCATION || "पद्मावाडी मळा, शिरसवाडी, सातारा",
    mainAdminName: process.env.MAIN_ADMIN_NAME || "उद्धव इंगळे",
    mainAdminMobile: process.env.MAIN_ADMIN_MOBILE || "8275658844",
    mainAdminPassword: process.env.MAIN_ADMIN_PASSWORD || "Akash@#ganpati55_39",
    mainAdminRole: process.env.MAIN_ADMIN_ROLE || "admin",
  };
}

// Helper: Scopes Firestore queries to this specific Mandal collection ID
export function getMandalCollection(
  db: Firestore,
  collectionName: string,
  customMandalId?: string,
) {
  const targetMandalId = customMandalId || getMandalConfig().mandalId;
  return db
    .collection("mandals")
    .doc(targetMandalId)
    .collection(collectionName);
}

// Helper: Firestore strictly disallows `undefined` values. This removes all undefined keys.
function sanitizeForFirestore(obj: any) {
  const clean: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }
  return clean;
}

export function getDefaultMainAdmin(): IUser {
  const config = getMandalConfig();
  return {
    name: `${config.mainAdminName} (मुख्य अध्यक्ष)`,
    mobile: config.mainAdminMobile,
    password: config.mainAdminPassword,
    role: "admin",
    isMainAdmin: true,
    canUpdateReceiptStatus: true,
    canManageExpenses: true,
    canCreateAdmin: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

// In-Memory Cache Variables (keyed for fast local fallback)
let isInitialized = false;
let localUsers: IUser[] = [];
let localReceipts: IReceipt[] = [];
let localExpenses: IExpense[] = [];
let localAuditLogs: IAuditLog[] = [];

// ==========================================
// 1. Initial Database Load
// ==========================================
export async function initDatabase() {
  if (isInitialized) return;

  const config = getMandalConfig();
  const defaultAdmin = getDefaultMainAdmin();
  const { db, isConnected } = await getDb();

  if (isConnected && db) {
    try {
      // Check & Seed Main Admin for THIS mandal
      const userDoc = await getMandalCollection(db, "users")
        .doc(config.mainAdminMobile)
        .get();
      if (!userDoc.exists) {
        await getMandalCollection(db, "users")
          .doc(config.mainAdminMobile)
          .set(sanitizeForFirestore(defaultAdmin));
      } else {
        // Sync password and details from environment if updated
        await getMandalCollection(db, "users")
          .doc(config.mainAdminMobile)
          .update(
            sanitizeForFirestore({
              password: config.mainAdminPassword,
              name: `${config.mainAdminName} (मुख्य अध्यक्ष)`,
              isMainAdmin: true,
              role: "admin",
              isActive: true,
            }),
          );
      }

      // Load Users
      const usersSnap = await getMandalCollection(db, "users").get();
      localUsers = usersSnap.docs.map((doc: any) => ({
        _id: doc.id,
        ...(doc.data() as IUser),
      }));

      // Load Receipts
      const receiptsSnap = await getMandalCollection(db, "receipts")
        .orderBy("serialNumber", "desc")
        .get();
      localReceipts = receiptsSnap.docs.map((doc: any) => ({
        _id: doc.id,
        ...(doc.data() as IReceipt),
      }));

      // Load Expenses
      const expSnap = await getMandalCollection(db, "expenses")
        .orderBy("createdAt", "desc")
        .get();
      localExpenses = expSnap.docs.map((doc: any) => ({
        _id: doc.id,
        ...(doc.data() as IExpense),
      }));

      // Load Audit Logs
      const logsSnap = await getMandalCollection(db, "audit_logs")
        .orderBy("timestamp", "desc")
        .limit(200)
        .get();
      localAuditLogs = logsSnap.docs.map((doc: any) => ({
        _id: doc.id,
        ...(doc.data() as IAuditLog),
      }));

      console.log(
        `🔥 [Mandal ID: ${config.mandalId}] Loaded ${localUsers.length} users, ${localReceipts.length} receipts, ${localExpenses.length} expenses from subcollections`,
      );
    } catch (err) {
      console.error(`Error loading data for mandal ${config.mandalId}:`, err);
      localUsers = [defaultAdmin];
    }
  } else {
    localUsers = [defaultAdmin];
  }

  isInitialized = true;
}

// ==========================================
// 2. Clean / Wipe All Data (Scoped to this Mandal)
// ==========================================
export async function cleanAllData(
  adminMobile: string,
  adminPassword: string,
): Promise<{ success: boolean; message: string }> {
  const config = getMandalConfig();
  const { db, isConnected } = await getDb();
  const cleanMobile = adminMobile.trim();
  const cleanPassword = adminPassword.trim();

  let mainAdmin: IUser | null = null;
  if (isConnected && db) {
    const docSnap = await getMandalCollection(db, "users")
      .doc(cleanMobile)
      .get();
    if (docSnap.exists) {
      mainAdmin = { _id: docSnap.id, ...(docSnap.data() as IUser) };
    }
  } else {
    mainAdmin = localUsers.find((u) => u.mobile === cleanMobile) || null;
  }

  if (
    !mainAdmin ||
    (!mainAdmin.isMainAdmin && mainAdmin.mobile !== config.mainAdminMobile)
  ) {
    throw new Error(
      `केवळ मुख्य अध्यक्ष ${config.mainAdminName} (${config.mainAdminMobile}) सर्व डेटा क्लीन करू शकतात.`,
    );
  }

  if (mainAdmin.password !== cleanPassword) {
    throw new Error(
      "चुकीचा पासवर्ड! डेटा क्लीन करण्यासाठी मुख्य अध्यक्ष यांचा अचूक पासवर्ड प्रविष्ट करा.",
    );
  }

  if (isConnected && db) {
    try {
      const recs = await getMandalCollection(db, "receipts").get();
      for (const d of recs.docs) await d.ref.delete();

      const exps = await getMandalCollection(db, "expenses").get();
      for (const d of exps.docs) await d.ref.delete();

      const logs = await getMandalCollection(db, "audit_logs").get();
      for (const d of logs.docs) await d.ref.delete();

      const users = await getMandalCollection(db, "users").get();
      for (const d of users.docs) {
        if (
          d.id !== mainAdmin.mobile &&
          (d.data() as IUser).mobile !== mainAdmin.mobile
        ) {
          await d.ref.delete();
        }
      }

      await getMandalCollection(db, "users")
        .doc(mainAdmin.mobile)
        .set(
          sanitizeForFirestore({
            name: `${config.mainAdminName} (मुख्य अध्यक्ष)`,
            role: "admin",
            isMainAdmin: true,
            canUpdateReceiptStatus: true,
            canManageExpenses: true,
            canCreateAdmin: true,
            isActive: true,
            password: mainAdmin.password,
            mobile: mainAdmin.mobile,
            createdAt: new Date().toISOString(),
          }),
        );
    } catch (e: any) {
      console.error("Error wiping Firestore collections:", e);
      throw new Error(`डेटाबेस क्लीन करताना त्रुटी आली: ${e.message}`);
    }
  }

  localReceipts = [];
  localExpenses = [];
  localAuditLogs = [];
  localUsers = [mainAdmin];

  await logAudit({
    action: "FACTORY_RESET_ALL_DATA",
    details: `मुख्य अध्यक्ष ${mainAdmin.name} (${mainAdmin.mobile}) यांनी सर्व पावत्या, खर्च व इतर सदस्य क्लीन केले. सर्व हिशोब ० झाला.`,
    performedByUserId: mainAdmin._id || mainAdmin.mobile,
    performedByName: mainAdmin.name,
    performedByRole: "admin",
  });

  return {
    success: true,
    message: "सर्व डेटा यशस्वीरित्या स्वच्छ (Clean) केला गेला आहे.",
  };
}

// ==========================================
// 3. User Helpers
// ==========================================
export async function findUserByMobile(mobile: string): Promise<IUser | null> {
  const config = getMandalConfig();
  const { db, isConnected } = await getDb();
  const cleanMobile = mobile.trim();

  // If searching for Main Admin, ensure synced with current environment variables
  if (cleanMobile === config.mainAdminMobile) {
    const defaultAdmin = getDefaultMainAdmin();
    if (isConnected && db) {
      try {
        const docSnap = await getMandalCollection(db, "users")
          .doc(cleanMobile)
          .get();
        if (docSnap.exists) {
          const u = { _id: docSnap.id, ...(docSnap.data() as IUser) };
          if (u.password !== config.mainAdminPassword || !u.isMainAdmin) {
            u.password = config.mainAdminPassword;
            u.isMainAdmin = true;
            u.role = "admin";
            await docSnap.ref.update({
              password: config.mainAdminPassword,
              name: `${config.mainAdminName} (मुख्य अध्यक्ष)`,
              isMainAdmin: true,
              role: "admin",
              isActive: true,
            });
          }
          return u;
        } else {
          await getMandalCollection(db, "users")
            .doc(cleanMobile)
            .set(sanitizeForFirestore(defaultAdmin));
          return defaultAdmin;
        }
      } catch (e) {
        handleDbError(e);
      }
    }
    const localAdmin = localUsers.find((u) => u.mobile === cleanMobile);
    if (localAdmin) {
      localAdmin.password = config.mainAdminPassword;
      return localAdmin;
    }
    localUsers.push(defaultAdmin);
    return defaultAdmin;
  }

  if (isConnected && db) {
    try {
      const docSnap = await getMandalCollection(db, "users")
        .doc(cleanMobile)
        .get();
      if (docSnap.exists) {
        return { _id: docSnap.id, ...(docSnap.data() as IUser) };
      }
      const qSnap = await getMandalCollection(db, "users")
        .where("mobile", "==", cleanMobile)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        const d = qSnap.docs[0];
        return { _id: d.id, ...(d.data() as IUser) };
      }
    } catch (e) {
      handleDbError(e);
    }
  }
  return localUsers.find((u) => u.mobile === cleanMobile) || null;
}

export async function findUserById(id: string): Promise<IUser | null> {
  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const docSnap = await getMandalCollection(db, "users").doc(id).get();
      if (docSnap.exists) {
        return { _id: docSnap.id, ...(docSnap.data() as IUser) };
      }
      const qSnap = await getMandalCollection(db, "users")
        .where("mobile", "==", id)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        const d = qSnap.docs[0];
        return { _id: d.id, ...(d.data() as IUser) };
      }
    } catch (e) {
      handleDbError(e);
    }
  }
  return localUsers.find((u) => u._id === id || u.mobile === id) || null;
}

export async function updateUserSession(
  userId: string,
  sessionToken: string,
): Promise<void> {
  const { db, isConnected } = await getDb();
  const lastLogin = new Date().toISOString();
  if (isConnected && db) {
    try {
      const docRef = getMandalCollection(db, "users").doc(userId);
      const snap = await docRef.get();
      if (snap.exists) {
        await docRef.update({ currentSessionToken: sessionToken, lastLogin });
      } else {
        const qSnap = await getMandalCollection(db, "users")
          .where("mobile", "==", userId)
          .get();
        for (const d of qSnap.docs) {
          await d.ref.update({ currentSessionToken: sessionToken, lastLogin });
        }
      }
    } catch (e) {
      handleDbError(e);
    }
  }
  const u = localUsers.find((x) => x._id === userId || x.mobile === userId);
  if (u) {
    u.currentSessionToken = sessionToken;
    u.lastLogin = lastLogin;
  }
}

export async function getAllUsers(): Promise<IUser[]> {
  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const snap = await getMandalCollection(db, "users").get();
      localUsers = snap.docs.map((doc: any) => ({
        _id: doc.id,
        ...(doc.data() as IUser),
      }));
      return localUsers;
    } catch (e) {
      handleDbError(e);
    }
  }
  return localUsers;
}

export async function createUser(userData: Omit<IUser, "_id">): Promise<IUser> {
  const { db, isConnected } = await getDb();
  const newUser: IUser = {
    ...userData,
    isMainAdmin: false,
    createdAt: new Date().toISOString(),
  };

  if (isConnected && db) {
    try {
      await getMandalCollection(db, "users")
        .doc(userData.mobile)
        .set(sanitizeForFirestore(newUser));
      newUser._id = userData.mobile;
      console.log(
        `🔥 Saved user to Mandal: ${newUser.name} (${newUser.mobile})`,
      );
    } catch (e) {
      handleDbError(e);
      newUser._id = "usr_" + Date.now();
    }
  } else {
    newUser._id = "usr_" + Date.now();
  }

  localUsers.push(newUser);
  return newUser;
}

export async function updateUser(
  id: string,
  updates: Partial<IUser>,
): Promise<IUser | null> {
  const config = getMandalConfig();
  const targetUser = await findUserById(id);
  if (!targetUser) return null;

  if (targetUser.isMainAdmin || targetUser.mobile === config.mainAdminMobile) {
    updates.role = "admin";
    updates.isActive = true;
    updates.isMainAdmin = true;
  }

  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const cleanUpdates = sanitizeForFirestore(updates);
      const docRef = getMandalCollection(db, "users").doc(id);
      const snap = await docRef.get();
      if (snap.exists) {
        await docRef.update(cleanUpdates);
      } else {
        const qSnap = await getMandalCollection(db, "users")
          .where("mobile", "==", id)
          .get();
        for (const d of qSnap.docs) {
          await d.ref.update(cleanUpdates);
        }
      }
    } catch (e) {
      handleDbError(e);
    }
  }

  const index = localUsers.findIndex((u) => u._id === id || u.mobile === id);
  if (index !== -1) {
    localUsers[index] = { ...localUsers[index], ...updates };
    return localUsers[index];
  }
  return { ...targetUser, ...updates };
}

export async function deleteUser(id: string): Promise<boolean> {
  const config = getMandalConfig();
  const targetUser = await findUserById(id);
  if (!targetUser) return false;

  if (targetUser.isMainAdmin || targetUser.mobile === config.mainAdminMobile) {
    throw new Error(
      `Main Admin (${config.mainAdminMobile}) cannot be deleted!`,
    );
  }

  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      await getMandalCollection(db, "users").doc(id).delete();
      const qSnap = await getMandalCollection(db, "users")
        .where("mobile", "==", id)
        .get();
      for (const d of qSnap.docs) await d.ref.delete();
    } catch (e) {
      handleDbError(e);
    }
  }

  localUsers = localUsers.filter((u) => u._id !== id && u.mobile !== id);
  return true;
}

// ==========================================
// 4. Receipts Management
// ==========================================
export async function getAllReceipts(): Promise<IReceipt[]> {
  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const snap = await getMandalCollection(db, "receipts")
        .orderBy("serialNumber", "desc")
        .get();
      localReceipts = snap.docs.map((doc: any) => ({
        _id: doc.id,
        ...(doc.data() as IReceipt),
      }));
      return localReceipts;
    } catch (e) {
      handleDbError(e);
    }
  }
  return localReceipts;
}

export async function getNextReceiptNumber(): Promise<{
  receiptNo: string;
  serialNumber: number;
}> {
  const config = getMandalConfig();
  const { db, isConnected } = await getDb();
  let maxSerial = 0;
  if (isConnected && db) {
    try {
      const snap = await getMandalCollection(db, "receipts")
        .orderBy("serialNumber", "desc")
        .limit(1)
        .get();
      if (!snap.empty) {
        const lastRec = snap.docs[0].data() as IReceipt;
        if (lastRec.serialNumber) maxSerial = lastRec.serialNumber;
      }
    } catch (e) {
      handleDbError(e);
    }
  }
  if (maxSerial === 0 && localReceipts.length > 0) {
    maxSerial = Math.max(...localReceipts.map((r) => r.serialNumber || 0));
  }
  const nextSerial = maxSerial + 1;
  const padded = String(nextSerial).padStart(4, "0");
  const year = new Date().getFullYear();
  return {
    receiptNo: `${config.mandalPrefix}-${year}-${padded}`,
    serialNumber: nextSerial,
  };
}

export async function createReceipt(
  receiptData: Omit<
    IReceipt,
    "_id" | "receiptNo" | "serialNumber" | "createdAt" | "updatedAt"
  >,
): Promise<IReceipt> {
  const { receiptNo, serialNumber } = await getNextReceiptNumber();
  const now = new Date().toISOString();

  const newReceipt: IReceipt = {
    ...receiptData,
    receiptNo,
    serialNumber,
    createdAt: now,
    updatedAt: now,
    paidDate: receiptData.paymentStatus === "paid" ? now : undefined,
  };

  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const firestorePayload = sanitizeForFirestore(newReceipt);
      const docRef = await getMandalCollection(db, "receipts").add(
        firestorePayload,
      );
      newReceipt._id = docRef.id;
      console.log(`🔥 Created Receipt in Mandal: ${newReceipt.receiptNo}`);
    } catch (e) {
      console.error("❌ Failed to add receipt to Firestore:", e);
      handleDbError(e);
      newReceipt._id = "rec_" + Date.now();
    }
  } else {
    newReceipt._id = "rec_" + Date.now();
  }

  localReceipts.unshift(newReceipt);
  return newReceipt;
}

export async function updateReceiptStatus(
  id: string,
  status: "paid" | "unpaid",
  paymentMode?: string,
): Promise<IReceipt | null> {
  const now = new Date().toISOString();
  const updates: any = {
    paymentStatus: status,
    updatedAt: now,
    paidDate: status === "paid" ? now : null,
  };
  if (paymentMode) {
    updates.paymentMode = paymentMode as any;
  }

  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const cleanUpdates = sanitizeForFirestore(updates);
      const docRef = getMandalCollection(db, "receipts").doc(id);
      const snap = await docRef.get();
      if (snap.exists) {
        await docRef.update(cleanUpdates);
      } else {
        const qSnap = await getMandalCollection(db, "receipts")
          .where("receiptNo", "==", id)
          .get();
        for (const d of qSnap.docs) await d.ref.update(cleanUpdates);
      }
    } catch (e) {
      handleDbError(e);
    }
  }

  const idx = localReceipts.findIndex(
    (r) => r._id === id || r.receiptNo === id,
  );
  if (idx !== -1) {
    localReceipts[idx] = { ...localReceipts[idx], ...updates };
    return localReceipts[idx];
  }
  return null;
}

export async function deleteReceipt(id: string): Promise<boolean> {
  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      await getMandalCollection(db, "receipts").doc(id).delete();
      const qSnap = await getMandalCollection(db, "receipts")
        .where("receiptNo", "==", id)
        .get();
      for (const d of qSnap.docs) await d.ref.delete();
    } catch (e) {
      handleDbError(e);
    }
  }
  localReceipts = localReceipts.filter(
    (r) => r._id !== id && r.receiptNo !== id,
  );
  return true;
}

// ==========================================
// 5. Expenses Management
// ==========================================
export async function getAllExpenses(): Promise<IExpense[]> {
  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const snap = await getMandalCollection(db, "expenses")
        .orderBy("createdAt", "desc")
        .get();
      localExpenses = snap.docs.map((doc: any) => ({
        _id: doc.id,
        ...(doc.data() as IExpense),
      }));
      return localExpenses;
    } catch (e) {
      handleDbError(e);
    }
  }
  return localExpenses;
}

export async function createExpense(
  expenseData: Omit<IExpense, "_id" | "voucherNo" | "createdAt">,
): Promise<IExpense> {
  const config = getMandalConfig();
  const receipts = await getAllReceipts();
  const totalPaidCollection = receipts
    .filter((r) => r.paymentStatus === "paid")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const existingExpenses = await getAllExpenses();
  const currentTotalExpenses = existingExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  );

  const newTotalExpenses =
    currentTotalExpenses + (Number(expenseData.amount) || 0);

  if (newTotalExpenses > totalPaidCollection) {
    const deficit = newTotalExpenses - totalPaidCollection;
    throw new Error(
      `बजेट इशारा / Budget Alert: एकूण जमा रक्कमेपेक्षा (₹${totalPaidCollection.toLocaleString("en-IN")}) खर्च (₹${newTotalExpenses.toLocaleString("en-IN")}) जास्त होत आहे! तूट: ₹${deficit.toLocaleString("en-IN")}. खर्च नोंदवला जाणार नाही.`,
    );
  }

  const count = existingExpenses.length + 1;
  const padded = String(count).padStart(4, "0");
  const year = new Date().getFullYear();
  const voucherNo = `EXP-${year}-${padded}`;
  const now = new Date().toISOString();

  const newExpense: IExpense = {
    ...expenseData,
    voucherNo,
    createdAt: now,
  };

  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const firestorePayload = sanitizeForFirestore(newExpense);
      const docRef = await getMandalCollection(db, "expenses").add(
        firestorePayload,
      );
      newExpense._id = docRef.id;
      console.log(
        `🔥 Created Expense in Mandal ${config.mandalId}: ${newExpense.voucherNo}`,
      );
    } catch (e) {
      console.error("❌ Failed to add expense to Firestore:", e);
      handleDbError(e);
      newExpense._id = "exp_" + Date.now();
    }
  } else {
    newExpense._id = "exp_" + Date.now();
  }

  localExpenses.unshift(newExpense);
  return newExpense;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      await getMandalCollection(db, "expenses").doc(id).delete();
      const qSnap = await getMandalCollection(db, "expenses")
        .where("voucherNo", "==", id)
        .get();
      for (const d of qSnap.docs) await d.ref.delete();
    } catch (e) {
      handleDbError(e);
    }
  }
  localExpenses = localExpenses.filter(
    (e) => e._id !== id && e.voucherNo !== id,
  );
  return true;
}

// ==========================================
// 6. Audit Logs
// ==========================================
export async function logAudit(log: Omit<IAuditLog, "_id" | "timestamp">) {
  const entry: IAuditLog = {
    ...log,
    timestamp: new Date().toISOString(),
  };

  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const firestorePayload = sanitizeForFirestore(entry);
      const docRef = await getMandalCollection(db, "audit_logs").add(
        firestorePayload,
      );
      entry._id = docRef.id;
    } catch (e) {
      handleDbError(e);
      entry._id = "log_" + Date.now();
    }
  } else {
    entry._id = "log_" + Date.now();
  }

  localAuditLogs.unshift(entry);
  if (localAuditLogs.length > 300) {
    localAuditLogs.pop();
  }
}

export async function getAuditLogs(): Promise<IAuditLog[]> {
  const { db, isConnected } = await getDb();
  if (isConnected && db) {
    try {
      const snap = await getMandalCollection(db, "audit_logs")
        .orderBy("timestamp", "desc")
        .limit(100)
        .get();
      localAuditLogs = snap.docs.map((doc: any) => ({
        _id: doc.id,
        ...(doc.data() as IAuditLog),
      }));
      return localAuditLogs;
    } catch (e) {
      handleDbError(e);
    }
  }
  return localAuditLogs;
}

// ==========================================
// 7. Dashboard Stats & Mandal Info
// ==========================================
export async function getDashboardStats() {
  const receipts = await getAllReceipts();
  const expenses = await getAllExpenses();
  const users = await getAllUsers();

  const totalPaidAmount = receipts
    .filter((r) => r.paymentStatus === "paid")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalUnpaidAmount = receipts
    .filter((r) => r.paymentStatus === "unpaid")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalExpenseAmount = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  );

  const remainingBalance = totalPaidAmount - totalExpenseAmount;

  const totalReceiptsCount = receipts.length;
  const paidReceiptsCount = receipts.filter(
    (r) => r.paymentStatus === "paid",
  ).length;
  const unpaidReceiptsCount = receipts.filter(
    (r) => r.paymentStatus === "unpaid",
  ).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayReceipts = receipts.filter(
    (r) => r.createdAt && r.createdAt.startsWith(todayStr),
  );
  const todayPaidAmount = todayReceipts
    .filter((r) => r.paymentStatus === "paid")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const todayExpenseAmount = expenses
    .filter((e) => e.createdAt && e.createdAt.startsWith(todayStr))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const memberPerformanceMap = new Map<
    string,
    {
      userId: string;
      userName: string;
      userRole: string;
      receiptsCount: number;
      paidAmount: number;
      unpaidAmount: number;
    }
  >();

  for (const u of users) {
    memberPerformanceMap.set(u._id || u.mobile, {
      userId: u._id || u.mobile,
      userName: u.name,
      userRole: u.role,
      receiptsCount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
    });
  }

  for (const r of receipts) {
    const key = r.collectedByUserId || r.collectedByName;
    let entry = memberPerformanceMap.get(key);
    if (!entry) {
      entry = {
        userId: key,
        userName: r.collectedByName,
        userRole: r.collectedByRole || "karyakarta",
        receiptsCount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
      };
      memberPerformanceMap.set(key, entry);
    }
    entry.receiptsCount += 1;
    if (r.paymentStatus === "paid") {
      entry.paidAmount += Number(r.amount) || 0;
    } else {
      entry.unpaidAmount += Number(r.amount) || 0;
    }
  }

  const memberLeaderboard = Array.from(memberPerformanceMap.values()).sort(
    (a, b) => b.paidAmount - a.paidAmount,
  );

  const expenseByCategory: Record<string, number> = {};
  for (const exp of expenses) {
    const cat = exp.category || "Other";
    expenseByCategory[cat] =
      (expenseByCategory[cat] || 0) + Number(exp.amount || 0);
  }

  const paymentModeStats: Record<string, number> = {};
  for (const rec of receipts.filter((r) => r.paymentStatus === "paid")) {
    const mode = rec.paymentMode || "Cash";
    paymentModeStats[mode] =
      (paymentModeStats[mode] || 0) + Number(rec.amount || 0);
  }

  const spendingPercentage =
    totalPaidAmount > 0
      ? Math.min(100, Math.round((totalExpenseAmount / totalPaidAmount) * 100))
      : totalExpenseAmount > 0
        ? 100
        : 0;

  return {
    totalPaidAmount,
    totalUnpaidAmount,
    totalExpenseAmount,
    remainingBalance,
    totalReceiptsCount,
    paidReceiptsCount,
    unpaidReceiptsCount,
    todayPaidAmount,
    todayExpenseAmount,
    spendingPercentage,
    memberLeaderboard,
    expenseByCategory,
    paymentModeStats,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getMandalInfo(): Promise<{
  mandalId: string;
  mandalName: string;
  regNo: string;
  location: string;
  mainAdminName: string;
  mainAdminMobile: string;
  mainAdminRole: string;
}> {
  const config = getMandalConfig();
  return {
    mandalId: config.mandalId,
    mandalName: config.mandalName,
    regNo: config.mandalRegNo,
    location: config.mandalLocation,
    mainAdminName: config.mainAdminName,
    mainAdminMobile: config.mainAdminMobile,
    mainAdminRole: "मुख्य अध्यक्ष",
  };
}
