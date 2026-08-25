export type Language = "mr" | "en";

export const translations = {
  mr: {
    // App Header & Mandal Info
    mandalName: "श्री गणेश मित्र मंडळ, शिरसवडी ",
    mandalTagline: "॥ श्री गणेशाय नमः ॥ सार्वजनिक गणेशोत्सव उत्सव",
    mandalLocation: "शिरसवडी , सातारा (महाराष्ट्र)",
    regNo: "नोंदणी क्र. धर्मादाय आयुक्तांकडील नोंदणी क्रमांक - महाराष्ट्र / 15416 / सातारा",
    liveDbConnected: "MongoDB कनेक्टेड (रिअल टाईम)",
    liveDbDisconnected: "स्थानिक मोड",

    // Sidebar Menus
    menuDashboard: "मुख्य डॅशबोर्ड",
    menuNewReceipt: "नवीन पावती तयार करा",
    menuUnpaidReceipts: "अपूर्ण / येणे पावत्या",
    menuExpenseManager: "खर्च व्यवस्थापक",
    menuMembers: "सदस्य व कामगिरी",
    menuReports: "आर्थिक अहवाल व CSV",
    menuAuditLog: "ऑडिट नोंदी व पडताळणी",
    menuLogout: "लॉगआउट करा",

    // Dashboard Cards & Stats
    totalPaidCollection: "एकूण जमा वर्गणी",
    totalUnpaidPending: "एकूण येणे / बाकी वर्गणी",
    totalExpenses: "एकूण झालेला खर्च",
    remainingBalance: "शिल्लक शिल्लक रक्कम (Balance)",
    todayCollection: "आजची जमा",
    todayExpense: "आजचा खर्च",
    totalReceiptsIssued: "एकूण दिलेल्या पावत्या",
    paidReceipts: "जमा पावत्या",
    unpaidReceipts: "बाकी पावत्या",
    budgetStatus: "बजेट व खर्च स्थिती (Progress)",
    budgetSafe: "बजेट सुरक्षित",
    budgetWarning: "जास्त खर्च इशारा",
    budgetOverLimit: "खर्च मर्यादेबाहेर!",
    remainingBudgetPercent: "शिल्लक निधी",

    // Actions & Buttons
    addNewReceipt: "नवीन पावती जोडा",
    addExpense: "नवीन खर्च नोंदवा",
    printReceipt: "पावती प्रिंट करा",
    shareWhatsApp: "व्हॉट्सॲपवर पाठवा",
    downloadPDF: "PDF डाउनलोड करा",
    downloadImage: "पावती फोटो जतन करा",
    exportCSV: "CSV मध्ये डाउनलोड करा",
    save: "जतन करा",
    cancel: "रद्द करा",
    search: "शोधा (नाव, मोबा., पावती क्र.)",
    filter: "फिल्टर",
    all: "सर्व",
    paid: "जमा (Paid)",
    unpaid: "बाकी (Unpaid)",
    markAsPaid: "जमा म्हणून नोंदवा",
    delete: "हटवा",
    edit: "बदला",
    refresh: "रिफ्रेश",
    viewReceipt: "पावती पहा",

    // Receipt Form Fields
    receiptNo: "पावती क्र.",
    donorName: "वर्गणीदाराचे / ग्राहकाचे नाव",
    donorMobile: "मोबाईल नंबर (WhatsApp)",
    donorAddress: "पत्ता / कॉलनी / गल्ली",
    amount: "रक्कम (₹)",
    amountInWords: "अक्षरी रक्कम",
    paymentMode: "पेमेंट पद्धत",
    paymentStatus: "पेमेंट स्थिती",
    collectedBy: "पावती जमाकर्ता (नाव)",
    notes: "नोंद / विशेष टिप्पणी",
    receiptSuccessMsg: "पावती यशस्वीरीत्या तयार झाली!",

    // Expense Form Fields
    voucherNo: "व्हाउचर क्र.",
    expenseTitle: "खर्चाचे नाव / तपशील",
    expenseCategory: "खर्चाची वर्गवारी",
    paidToVendor: "कोणाला दिले (व्यापारी / व्यक्ती)",
    authorizedByAdmin: "अधिकार देणारे अध्यक्ष / पदाधिकारी",
    paymentMethod: "पेमेंट पद्धत (खर्च)",
    expenseDate: "खर्च तारीख",
    expenseReason: "सविस्तर कारण व आवश्यकता",
    expenseSuccessMsg: "खर्च यशस्वीरीत्या नोंदवला गेला!",

    // Member & Authority
    memberName: "कार्यकर्ता / सदस्याचे नाव",
    memberMobile: "मोबाईल नंबर (लॉगिन ID)",
    memberPassword: "पासवर्ड",
    memberRole: "पद / भूमिका",
    adminRole: "अध्यक्ष / ॲडमिन (Admin)",
    karyakartaRole: "कार्यकर्ता (Karyakarta)",
    canManageExpenses: "खर्च नोंदवण्याचा अधिकार",
    canCreateAdmin: "नवीन ॲडमिन करण्याचा अधिकार",
    activeStatus: "सक्रिय स्थिती",
    active: "सक्रिय (Active)",
    inactive: "निष्क्रिय (Inactive)",
    mainAdminBadge: "मुख्य संस्थापक अध्यक्ष (सुरक्षित)",
    addNewMember: "नवीन सदस्य जोडा",
    memberLeaderboardTitle: "सदस्य पावती संकलन कामगिरी (Leaderboard)",

    // Expense Categories
    cat_Mandap: "मंडप व स्टेज व्यवस्था",
    cat_Decoration: "डेकोरेशन व फुलांची सजावट",
    cat_Prasad: "प्रसाद व नैवेद्य",
    cat_Sound_DJ: "साउंड व ध्वनिक्षेपक",
    cat_Murti_Idol: "श्री गणेश मूर्ती",
    cat_Mahaprasad: "महाप्रसाद अन्नदान",
    cat_Visarjan: "विसर्जन मिरवणूक व गुलाल",
    cat_Electricity_Light: "विजेचा खर्च व लायटिंग",
    cat_Police_Permission: "परवानगी व शासकीय",
    cat_Stationery: "स्टेशनरी, पावत्या व छपाई",
    cat_Other: "इतर संकीर्ण खर्च",

    // Login Form
    loginTitle: "मंडळ व्यवस्थापन लॉगिन",
    loginSubtitle: "श्री गणेश मित्र मंडळ, शिरसवडी  गणेशोत्सव प्रणाली",
    mobileLabel: "नोंदणीकृत मोबाईल नंबर",
    passwordLabel: "पासवर्ड",
    loginBtn: "लॉगिन करा",
    mainAdminQuickFill: "मुख्य अध्यक्ष लॉगिन (8275658844)",
    singleDeviceNotice: "सुरक्षा सूचना: एकाच वेळी फक्त एकाच डिव्हाइसवर लॉगिन चालू राहील.",

    // Receipt Print Header & Text
    receiptHeaderMandal: "श्री गणेश मित्र मंडळ",
    receiptHeaderSub: "पद्मावती मळा, शिरसवडी , सातारा",
    receiptTrustTitle: "॥ श्री गणेशाय नमः ॥",
    receiptVarganiPavti: "सार्वजनिक गणेशोत्सव वर्गणी पावती",
    receiptThankYou: "श्री गणरायाच्या चरणी आपल्या सुख-समृद्धीची प्रार्थना! आपले मनःपूर्वक आभार!",
    signCollector: "जमाकर्ता सही",
    signPramukh: "अध्यक्ष / खजिनदार",
    date: "दिनांक",
    time: "वेळ",
  },
  en: {
    // App Header & Mandal Info
    mandalName: "Shree Ganesh Mitra Mandal Padmawadi mala",
    mandalTagline: "॥ Shree Ganeshay Namah ॥ Sarvajanik Ganeshotsav",
    mandalLocation: "shirasawadi , Satara (Maharashtra)",
    regNo: "Reg. No. MH/185/2024",
    liveDbConnected: "MongoDB Connected (Real-Time)",
    liveDbDisconnected: "Local Mode",

    // Sidebar Menus
    menuDashboard: "Main Dashboard",
    menuNewReceipt: "New Add Receipt",
    menuUnpaidReceipts: "Unpaid Receipts",
    menuExpenseManager: "Expense Manager",
    menuMembers: "Member & Performance",
    menuReports: "Financial Reports & CSV",
    menuAuditLog: "Audit Log & Verification",
    menuLogout: "Logout",

    // Dashboard Cards & Stats
    totalPaidCollection: "Total Paid Collection",
    totalUnpaidPending: "Total Unpaid / Pending",
    totalExpenses: "Total Mandal Expenses",
    remainingBalance: "Remaining Balance",
    todayCollection: "Today's Collection",
    todayExpense: "Today's Expenses",
    totalReceiptsIssued: "Total Receipts Issued",
    paidReceipts: "Paid Receipts",
    unpaidReceipts: "Unpaid Receipts",
    budgetStatus: "Budget & Expense Progress",
    budgetSafe: "Safe Budget",
    budgetWarning: "High Spending Warning",
    budgetOverLimit: "Budget Over Limit!",
    remainingBudgetPercent: "Remaining Funds",

    // Actions & Buttons
    addNewReceipt: "Add New Receipt",
    addExpense: "Record New Expense",
    printReceipt: "Print Receipt",
    shareWhatsApp: "Share on WhatsApp",
    downloadPDF: "Download PDF",
    downloadImage: "Save Receipt Image",
    exportCSV: "Export to CSV",
    save: "Save",
    cancel: "Cancel",
    search: "Search (Name, Mobile, Receipt No)",
    filter: "Filter",
    all: "All",
    paid: "Paid",
    unpaid: "Unpaid",
    markAsPaid: "Mark as Paid",
    delete: "Delete",
    edit: "Edit",
    refresh: "Refresh",
    viewReceipt: "View Receipt",

    // Receipt Form Fields
    receiptNo: "Receipt No.",
    donorName: "Donor / Grahak Name",
    donorMobile: "Mobile Number (WhatsApp)",
    donorAddress: "Address / Colony / Galli",
    amount: "Amount (₹)",
    amountInWords: "Amount in Words",
    paymentMode: "Payment Mode",
    paymentStatus: "Payment Status",
    collectedBy: "Collected By (User)",
    notes: "Notes / Description",
    receiptSuccessMsg: "Receipt created successfully!",

    // Expense Form Fields
    voucherNo: "Voucher No.",
    expenseTitle: "Expense Title",
    expenseCategory: "Expense Category",
    paidToVendor: "Paid To (Vendor / Person)",
    authorizedByAdmin: "Authorized By Admin",
    paymentMethod: "Payment Method",
    expenseDate: "Expense Date",
    expenseReason: "Reason & Purpose",
    expenseSuccessMsg: "Expense recorded successfully!",

    // Member & Authority
    memberName: "Member / Karyakarta Name",
    memberMobile: "Mobile Number (Login ID)",
    memberPassword: "Password",
    memberRole: "Role",
    adminRole: "Admin (Adhyaksh)",
    karyakartaRole: "Karyakarta (Member)",
    canManageExpenses: "Authority to Manage Expenses",
    canCreateAdmin: "Authority to Assign Admin",
    activeStatus: "Active Status",
    active: "Active",
    inactive: "Inactive",
    mainAdminBadge: "Main Founder Admin (Protected)",
    addNewMember: "Add New Member",
    memberLeaderboardTitle: "Member Collection Leaderboard",

    // Expense Categories
    cat_Mandap: "Mandap & Stage Setup",
    cat_Decoration: "Decoration & Flowers",
    cat_Prasad: "Prasad & Naivedya",
    cat_Sound_DJ: "Sound System & DJ",
    cat_Murti_Idol: "Shree Ganesh Idol (Murti)",
    cat_Mahaprasad: "Mahaprasad & Annadan",
    cat_Visarjan: "Visarjan Procession & Gulal",
    cat_Electricity_Light: "Electricity & Lighting",
    cat_Police_Permission: "Government & Permissions",
    cat_Stationery: "Stationery & Receipt Printing",
    cat_Other: "Other Miscellaneous",

    // Login Form
    loginTitle: "Mandal Management Login",
    loginSubtitle: "Shree Ganesh Mitra Mandal Padmawadi mala System",
    mobileLabel: "Registered Mobile Number",
    passwordLabel: "Password",
    loginBtn: "Login",
    mainAdminQuickFill: "Main Admin Login (8275658844)",
    singleDeviceNotice: "Security Notice: Single active device session allowed at a time.",

    // Receipt Print Header & Text
    receiptHeaderMandal: "Shree Ganesh Mitra Mandal",
    receiptHeaderSub: "Padmawadi mala , shirasawadi satara",
    receiptTrustTitle: "॥ Shree Ganeshay Namah ॥",
    receiptVarganiPavti: "Sarvajanik Ganeshotsav Vargani Receipt",
    receiptThankYou: "Praying to Lord Ganesha for your prosperity and happiness! Thank you!",
    signCollector: "Collector Sign",
    signPramukh: "President / Treasurer",
    date: "Date",
    time: "Time",
  }
};

// Helper to convert number to Marathi & English words
export function convertNumberToWords(amount: number, lang: Language = "mr"): string {
  if (!amount || isNaN(amount)) return "";
  
  if (lang === "mr") {
    // Common Marathi representations
    const num = Math.floor(amount);
    return `${num.toLocaleString('en-IN')} रुपये फक्त`;
  } else {
    return `Rupees ${amount.toLocaleString('en-IN')} Only`;
  }
}
