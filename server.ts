import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  initDatabase,
  findUserByMobile,
  findUserById,
  updateUserSession,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  cleanAllData,
  getAllReceipts,
  createReceipt,
  updateReceiptStatus,
  deleteReceipt,
  getAllExpenses,
  createExpense,
  deleteExpense,
  getAuditLogs,
  logAudit,
  getDashboardStats,
  getMandalInfo,
  getMandalConfig,
  IUser
} from "./src/server/dataService.js";

import fs from "fs";
import { fileURLToPath } from "url";

// Robust multi-path .env loader (supports .env, .env.local, .env.txt, Windows CRLF, and UTF-8 BOM)
function loadEnvSafely() {
  const possibleFiles = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env.txt"),
  ];

  try {
    const currentDir = typeof __dirname !== "undefined" 
      ? __dirname 
      : path.dirname(fileURLToPath(import.meta.url));
    possibleFiles.push(path.resolve(currentDir, "..", ".env"));
    possibleFiles.push(path.resolve(currentDir, ".env"));
  } catch {
    // ignore
  }

  for (const filePath of possibleFiles) {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, "utf8");
        // Remove BOM if present
        if (content.charCodeAt(0) === 0xfeff) {
          content = content.slice(1);
        }
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            let val = trimmed.substring(eqIdx + 1).trim();
            // Strip outer quotes
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (key && val) {
              process.env[key] = val;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Also run dotenv standard parser
  dotenv.config({ override: true });
}

loadEnvSafely();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize DB on start
initDatabase().catch(console.error);

// Auth Middleware & Session Check (Single device login enforcement)
async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const userId = req.headers["x-user-id"] as string;

  if (!authHeader || !authHeader.startsWith("Bearer ") || !userId) {
    return res.status(401).json({ error: "Unauthorized: Missing authentication token or user ID" });
  }

  const token = authHeader.split(" ")[1];
  const user = await findUserById(userId);

  if (!user) {
    return res.status(401).json({ error: "User not found or deleted" });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: "Your account is disabled. Please contact Main Admin." });
  }

  // Single Device Enforcement: if DB sessionToken differs from current request token,
  // it means another device logged in with this account.
  if (user.currentSessionToken && user.currentSessionToken !== token) {
    return res.status(401).json({
      error: "दुसऱ्या डिव्हाइसवर लॉगिन झाल्यामुळे तुमचे सत्र समाप्त झाले आहे (Session expired because another device logged into this account).",
      code: "SESSION_SUPERSEDED"
    });
  }

  (req as any).user = user;
  next();
}

// ---------------- API ROUTES ----------------

// Health check
app.get("/api/health", (req, res) => {
  const config = getMandalConfig();
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    mandalId: config.mandalId,
    mandalName: config.mandalName
  });
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: "मोबाईल नंबर आणि पासवर्ड दोन्ही आवश्यक आहेत (Mobile number & password are required)" });
    }

    const cleanMobile = String(mobile).trim().replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      return res.status(400).json({
        error: "कृपया योग्य १० अंकी मोबाईल नंबर टाका (Please enter valid 10-digit mobile number)."
      });
    }

    const user = await findUserByMobile(cleanMobile);

    if (!user) {
      return res.status(404).json({
        error: "हा युजर / मोबाईल नंबर सिस्टीममध्ये उपलब्ध नाही! कृपया योग्य मोबाईल नंबर टाका किंवा मुख्य अध्यक्षांशी संपर्क साधा (This user is not present in database / User not found)."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "तुमचे खाते निष्क्रिय (Inactive) केले आहे. कृपया मुख्य अध्यक्षांशी संपर्क साधा (Account is inactive)."
      });
    }

    if (user.password !== String(password).trim()) {
      return res.status(401).json({
        error: "तुम्ही टाकलेला पासवर्ड चुकीचा आहे! कृपया योग्य पासवर्ड टाका (Wrong / Incorrect password entered)."
      });
    }

    // Generate new unique session token
    const newSessionToken = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    await updateUserSession(user._id || user.mobile, newSessionToken);

    await logAudit({
      action: "USER_LOGIN",
      details: `${user.name} (${user.role === "admin" ? "अध्यक्ष/Admin" : "कार्यकर्ता/Karyakarta"}) logged in successfully.`,
      performedByUserId: user._id || user.mobile,
      performedByName: user.name,
      performedByRole: user.role,
    });

    const userObj = { ...user, currentSessionToken: newSessionToken };
    delete (userObj as any).password;

    res.json({
      success: true,
      token: newSessionToken,
      user: userObj
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Internal server error during login" });
  }
});

// Auth: Check Session / Profile
app.get("/api/auth/me", authenticateUser, (req, res) => {
  const user = (req as any).user as IUser;
  const clean = { ...user };
  delete (clean as any).password;
  res.json({ success: true, user: clean });
});

// Auth: Logout
app.post("/api/auth/logout", authenticateUser, async (req, res) => {
  const user = (req as any).user as IUser;
  await updateUserSession(user._id || user.mobile, "");
  await logAudit({
    action: "USER_LOGOUT",
    details: `${user.name} logged out.`,
    performedByUserId: user._id || user.mobile,
    performedByName: user.name,
    performedByRole: user.role,
  });
  res.json({ success: true, message: "Logged out successfully" });
});

// Mandal Info (Public / Authenticated to get official info & Main Admin name dynamically from database/env)
app.get("/api/mandal/info", async (req, res) => {
  try {
    const info = await getMandalInfo();
    res.json({ success: true, info });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats (Real-time live calculations)
app.get("/api/dashboard/stats", authenticateUser, async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Users Management (Admin view / update)
app.get("/api/users", authenticateUser, async (req, res) => {
  try {
    const users = await getAllUsers();
    const sanitized = users.map(u => {
      const copy = { ...u };
      delete (copy as any).password;
      return copy;
    });
    res.json({ success: true, users: sanitized });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", authenticateUser, async (req, res) => {
  try {
    const currentUser = (req as any).user as IUser;
    if (currentUser.role !== "admin" && !currentUser.canCreateAdmin) {
      return res.status(403).json({ error: "Only Admins can add new members/karyakartas." });
    }

    const { name, mobile, password, role, canManageExpenses, canCreateAdmin, canUpdateReceiptStatus, isActive } = req.body;
    if (!name || !mobile || !password) {
      return res.status(400).json({ error: "Name, mobile, and password are required" });
    }

    const existing = await findUserByMobile(mobile.trim());
    if (existing) {
      return res.status(400).json({ error: "हा मोबाईल नंबर आधीच नोंदणीकृत आहे (User with this mobile already exists)" });
    }

    const created = await createUser({
      name: name.trim(),
      mobile: mobile.trim(),
      password: password.trim(),
      role: role === "admin" ? "admin" : "karyakarta",
      isMainAdmin: false,
      canUpdateReceiptStatus: role === "admin" ? true : !!canUpdateReceiptStatus,
      canManageExpenses: !!canManageExpenses || role === "admin",
      canCreateAdmin: role === "admin" ? !!canCreateAdmin : false,
      isActive: isActive !== undefined ? !!isActive : true,
      createdAt: new Date().toISOString(),
    });

    await logAudit({
      action: "CREATE_USER",
      details: `नवीन सदस्य जोडला: ${created.name} (${created.role === "admin" ? "अध्यक्ष" : "कार्यकर्ता"}, मो. ${created.mobile}) द्वारे ${currentUser.name}`,
      performedByUserId: currentUser._id || currentUser.mobile,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
    });

    const clean = { ...created };
    delete (clean as any).password;
    res.json({ success: true, user: clean });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", authenticateUser, async (req, res) => {
  try {
    const config = getMandalConfig();
    const currentUser = (req as any).user as IUser;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ error: "Only Admins can update member details/authorities." });
    }

    const targetId = req.params.id;
    const targetUser = await findUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updates = { ...req.body };
    // Protect Main Admin
    if (targetUser.isMainAdmin || targetUser.mobile === config.mainAdminMobile) {
      updates.role = "admin";
      updates.isActive = true;
      updates.isMainAdmin = true;
      updates.canUpdateReceiptStatus = true;
      updates.canManageExpenses = true;
      updates.canCreateAdmin = true;
    }

    const updated = await updateUser(targetId, updates);

    await logAudit({
      action: "UPDATE_USER",
      details: `सदस्य अधिकार/माहिती बदलली: ${targetUser.name} द्वारे ${currentUser.name} (Status Authority: ${updates.canUpdateReceiptStatus ? 'होय' : 'नाही'}, Expense: ${updates.canManageExpenses ? 'होय' : 'नाही'})`,
      performedByUserId: currentUser._id || currentUser.mobile,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
    });

    const clean = { ...updated };
    delete (clean as any).password;
    res.json({ success: true, user: clean });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", authenticateUser, async (req, res) => {
  try {
    const config = getMandalConfig();
    const currentUser = (req as any).user as IUser;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ error: "Only Admins can delete members." });
    }

    const targetId = req.params.id;
    const targetUser = await findUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (targetUser.isMainAdmin || targetUser.mobile === config.mainAdminMobile) {
      return res.status(400).json({ error: `मुख्य अध्यक्ष ${config.mainAdminName} (${config.mainAdminMobile}) डिलीट करता येणार नाही (Main Admin cannot be deleted)!` });
    }

    await deleteUser(targetId);

    await logAudit({
      action: "DELETE_USER",
      details: `सदस्य हटवला: ${targetUser.name} (${targetUser.mobile}) द्वारे ${currentUser.name}`,
      performedByUserId: currentUser._id || currentUser.mobile,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
    });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Authority: Factory Clean / Wipe all data (Requires Main Admin Mobile & Password verification)
app.post("/api/admin/clean-all-data", authenticateUser, async (req, res) => {
  try {
    const config = getMandalConfig();
    const currentUser = (req as any).user as IUser;
    
    // Only Main Admin can trigger clean all data
    if (!currentUser.isMainAdmin && currentUser.mobile !== config.mainAdminMobile) {
      return res.status(403).json({
        error: `केवळ मुख्य अध्यक्ष ${config.mainAdminName} (${config.mainAdminMobile}) सर्व डेटा क्लीन करू शकतात.`
      });
    }

    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({
        error: "डेटा क्लीन करण्यासाठी मुख्य अध्यक्षांचा मोबाईल नंबर आणि पासवर्ड आवश्यक आहे."
      });
    }

    const result = await cleanAllData(mobile, password);
    const updatedStats = await getDashboardStats();

    res.json({
      success: true,
      message: result.message,
      stats: updatedStats,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "डेटा क्लीन करताना त्रुटी आली." });
  }
});

// Receipts Management
app.get("/api/receipts", authenticateUser, async (req, res) => {
  try {
    const { status, search, collector } = req.query;
    let receipts = await getAllReceipts();

    if (status && (status === "paid" || status === "unpaid")) {
      receipts = receipts.filter(r => r.paymentStatus === status);
    }

    if (collector) {
      receipts = receipts.filter(r => r.collectedByUserId === collector || r.collectedByName === collector);
    }

    if (search) {
      const q = String(search).toLowerCase();
      receipts = receipts.filter(r =>
        (r.donorName && r.donorName.toLowerCase().includes(q)) ||
        (r.donorMobile && r.donorMobile.includes(q)) ||
        (r.receiptNo && r.receiptNo.toLowerCase().includes(q)) ||
        (r.donorAddress && r.donorAddress.toLowerCase().includes(q)) ||
        (r.collectedByName && r.collectedByName.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, receipts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/receipts", authenticateUser, async (req, res) => {
  try {
    const currentUser = (req as any).user as IUser;
    const {
      donorName,
      donorMobile,
      donorAddress,
      amount,
      amountInWords,
      paymentMode,
      paymentStatus,
      notes
    } = req.body;

    if (!donorName || !amount) {
      return res.status(400).json({ error: "वर्गणीदाराचे नाव आणि रक्कम आवश्यक आहे (Donor Name and Amount are required)" });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "वैध रक्कम टाका (Please enter a valid amount)" });
    }

    const newReceipt = await createReceipt({
      donorName: donorName.trim(),
      donorMobile: (donorMobile || "").trim(),
      donorAddress: (donorAddress || "").trim(),
      amount: numAmount,
      amountInWords: amountInWords || `${numAmount} रुपये फक्त`,
      paymentMode: paymentMode || "Cash",
      paymentStatus: paymentStatus === "unpaid" ? "unpaid" : "paid",
      collectedByUserId: currentUser._id || currentUser.mobile,
      collectedByName: currentUser.name,
      collectedByRole: currentUser.role,
      notes: (notes || "").trim(),
    });

    await logAudit({
      action: "CREATE_RECEIPT",
      details: `पावती तयार केली: क्र. ${newReceipt.receiptNo} | ₹${numAmount} | ${newReceipt.donorName} (${newReceipt.paymentStatus === "paid" ? "जमा/Paid" : "येणे/Unpaid"}) जमाकर्ता: ${currentUser.name}`,
      performedByUserId: currentUser._id || currentUser.mobile,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
    });

    res.json({ success: true, receipt: newReceipt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update unpaid receipt to paid or change status (Restricted to Main Admin or authorized members)
app.put("/api/receipts/:id/status", authenticateUser, async (req, res) => {
  try {
    const config = getMandalConfig();
    const currentUser = (req as any).user as IUser;
    
    // Strict Authority Verification:
    // Only Main Admin, admins, or users granted `canUpdateReceiptStatus` by Main Admin can toggle status
    const hasAuthority = currentUser.isMainAdmin || currentUser.role === "admin" || currentUser.canUpdateReceiptStatus;
    if (!hasAuthority) {
      return res.status(403).json({
        error: `पावती स्थिती (Paid/Unpaid) बदलण्याचा अधिकार फक्त मुख्य अध्यक्ष ${config.mainAdminName} (${config.mainAdminMobile}) किंवा त्यांनी प्राधिकृत केलेल्या सदस्यांनाच आहे. कृपया मुख्य अध्यक्षांशी संपर्क साधा.`
      });
    }

    const { status, paymentMode } = req.body;

    if (!status || (status !== "paid" && status !== "unpaid")) {
      return res.status(400).json({ error: "Valid status ('paid' or 'unpaid') is required" });
    }

    const updated = await updateReceiptStatus(req.params.id, status, paymentMode);
    if (!updated) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    await logAudit({
      action: "UPDATE_RECEIPT_STATUS",
      details: `पावती स्थिती बदलली: क्र. ${updated.receiptNo} (${updated.donorName}, ₹${updated.amount}) -> ${status === "paid" ? "वर्गणी जमा (Paid)" : "येणे बाकी (Unpaid)"} द्वारे ${currentUser.name} (${currentUser.role === 'admin' ? 'अध्यक्ष' : 'प्राधिकृत कार्यकर्ता'})`,
      performedByUserId: currentUser._id || currentUser.mobile,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
    });

    res.json({ success: true, receipt: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/receipts/:id", authenticateUser, async (req, res) => {
  try {
    const currentUser = (req as any).user as IUser;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ error: "Only Admins can delete receipts." });
    }

    await deleteReceipt(req.params.id);

    await logAudit({
      action: "DELETE_RECEIPT",
      details: `पावती हटवली: ID ${req.params.id} द्वारे ${currentUser.name}`,
      performedByUserId: currentUser._id || currentUser.mobile,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
    });

    res.json({ success: true, message: "Receipt deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Expenses Management
app.get("/api/expenses", authenticateUser, async (req, res) => {
  try {
    const expenses = await getAllExpenses();
    res.json({ success: true, expenses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/expenses", authenticateUser, async (req, res) => {
  try {
    const currentUser = (req as any).user as IUser;
    if (currentUser.role !== "admin" && !currentUser.canManageExpenses) {
      return res.status(403).json({
        error: "तुम्हाला खर्च नोंदवण्याचा अधिकार नाही (You do not have authority to add expenses. Please request admin authority)."
      });
    }

    const {
      title,
      category,
      amount,
      paidTo,
      paymentMethod,
      authorizedByAdmin,
      expenseDate,
      reason,
      billImage
    } = req.body;

    if (!title || !amount || !paidTo) {
      return res.status(400).json({ error: "खर्चाचे शीर्षक, रक्कम आणि कोणाला दिले (Paid To) हे आवश्यक आहे" });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "कृपया वैध रक्कम टाका (Please enter a valid amount)" });
    }

    const newExpense = await createExpense({
      title: title.trim(),
      category: category || "Other",
      amount: numAmount,
      paidTo: paidTo.trim(),
      paymentMethod: paymentMethod || "Cash",
      authorizedByAdmin: (authorizedByAdmin || currentUser.name).trim(),
      recordedByUserId: currentUser._id || currentUser.mobile,
      recordedByName: currentUser.name,
      expenseDate: expenseDate || new Date().toISOString().split("T")[0],
      reason: (reason || "").trim(),
      billImage: billImage || undefined,
    });

    await logAudit({
      action: "ADD_EXPENSE",
      details: `खर्च नोंदवला: क्र. ${newExpense.voucherNo} | ₹${numAmount} | ${newExpense.title} (${newExpense.category}) | दिले: ${newExpense.paidTo} | अधिकार: ${newExpense.authorizedByAdmin} | नोंदणीकर्ता: ${currentUser.name}`,
      performedByUserId: currentUser._id || currentUser.mobile,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
    });

    res.json({ success: true, expense: newExpense });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/expenses/:id", authenticateUser, async (req, res) => {
  try {
    const currentUser = (req as any).user as IUser;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ error: "Only Admins can delete expenses." });
    }

    await deleteExpense(req.params.id);

    await logAudit({
      action: "DELETE_EXPENSE",
      details: `खर्च हटवला: ID ${req.params.id} द्वारे ${currentUser.name}`,
      performedByUserId: currentUser._id || currentUser.mobile,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
    });

    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Logs
app.get("/api/audit-logs", authenticateUser, async (req, res) => {
  try {
    const logs = await getAuditLogs();
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CSV Export Reports
app.get("/api/reports/export/receipts", authenticateUser, async (req, res) => {
  try {
    const config = getMandalConfig();
    const receipts = await getAllReceipts();
    const headers = [
      "पावती क्र. (Receipt No)",
      "अनुक्रमांक (Serial)",
      "वर्गणीदार (Donor Name)",
      "मोबाईल (Mobile)",
      "पत्ता (Address)",
      "रक्कम (Amount)",
      "पेमेंट मोड (Payment Mode)",
      "स्थिती (Status)",
      "जमाकर्ता (Collected By)",
      "तारीख (Date)",
      "टिप्पणी (Notes)"
    ];

    const rows = receipts.map(r => [
      `"${r.receiptNo}"`,
      `"${r.serialNumber}"`,
      `"${r.donorName.replace(/"/g, '""')}"`,
      `"${r.donorMobile || ""}"`,
      `"${(r.donorAddress || "").replace(/"/g, '""')}"`,
      `"${r.amount}"`,
      `"${r.paymentMode}"`,
      `"${r.paymentStatus === "paid" ? "जमा (Paid)" : "बाकी (Unpaid)"}"`,
      `"${r.collectedByName.replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString('en-IN')}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${config.mandalId}_Receipts_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reports/export/expenses", authenticateUser, async (req, res) => {
  try {
    const config = getMandalConfig();
    const expenses = await getAllExpenses();
    const headers = [
      "व्हाउचर क्र. (Voucher No)",
      "खर्चाचे नाव (Title)",
      "वर्गवारी (Category)",
      "रक्कम (Amount)",
      "कोणाला दिले (Paid To)",
      "पेमेंट पद्धत (Payment Method)",
      "अध्यक्ष अधिकार (Authorized By)",
      "नोंदणीकर्ता (Recorded By)",
      "खर्च तारीख (Expense Date)",
      "तपशील (Reason)"
    ];

    const rows = expenses.map(e => [
      `"${e.voucherNo}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.amount}"`,
      `"${e.paidTo.replace(/"/g, '""')}"`,
      `"${e.paymentMethod}"`,
      `"${(e.authorizedByAdmin || "").replace(/"/g, '""')}"`,
      `"${e.recordedByName.replace(/"/g, '""')}"`,
      `"${e.expenseDate}"`,
      `"${(e.reason || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${config.mandalId}_Expenses_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware & SPA serving
async function startServer() {
  const config = getMandalConfig();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔥 ${config.mandalName} (Mandal ID: ${config.mandalId}) System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
