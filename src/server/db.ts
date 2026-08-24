import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let isInitialized = false;
let db: Firestore | null = null;
let firebaseApp: App | null = null;

// Firebase service account configuration from environment variables with fallback
function getServiceAccount() {
  // If complete JSON service account provided in env
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      console.warn("⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON from env:", e);
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "ekdant-mandel-2026";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@ekdant-mandel-2026.iam.gserviceaccount.com";
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines in env vars
    privateKey = privateKey.replace(/\\n/g, "\n");
  } else {
    // Default fallback service account key
    privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDD4IHs8IVQIJyD
f0cNDiAUiMewg+0V5tK5+n9tmOPlwTIf+sh9jhd7aYHAB7g8qqaQsrDLjmYKSZMB
yDxee4sBIhNynFknggEDEx5XJM1PPN6Fc18i/v+Df4giRZ3+cJKkOySDnGjrkEad
09k6PUdLyfI6t1v0zYbLf/OwrLdp116VOLImpBaLsEjJO4LEcmiWz03EqtBmbFLD
YPjjQ+crdshbtd7waj5W5bZKoO259Mo2YL2dONWC98YC9gv5HtWCeaEfTwUBPalq
q3d4NZTzg5T9H76bUlRFQR1R2WiCA0W+a6Bot9Nui9HiiPzPuzHJYvQDaS7jSJVu
nAiTU+wjAgMBAAECggEAQ71aIV9isz278uvq3fRzGrbc3EobjVX4rVGYjQXxVo0U
MSQQ/v7LVyY7NXZV/EEF/oeVhaf22PrtyJF/cytlfJxUvm+ck4GtqOsNNJTpHcyO
pfcqwRcPtWG+6h9KTuqOhBZh/9PxIvoPudhASRhVFjw+NZkgx43mXm0fEQwCGCtD
7MUAD9RJ9Eg9vJZyqd8d7Rr0Lgi1WjU6TmvM+FuM14iwzNbTmve4UBQh+h+3a29o
XYOdbgpDsddyvVf3SpjhNamX5NeRRI88gh67EIz0AO2AzDgQhphjZpzHD4KSKhEv
89pnq30zOajhWGEtsEHBWgY8PSmPATvYq1h+ppEVsQKBgQD49UqwR4EJS6znEiA4
zm6EQOF38E2Vjn0Z3CXbqPjeKrntuirVjBDWVMjV1JTBjaG4vqTacha41cKSZucS
N/453Ma/JzCnVSpmXUdmM4keYO9PUGzW1OI/RIy8yeiNgto1eBY5W9h/GeWrgyfH
PNPoLRRTqSyzfWlL8DjRX9ytMQKBgQDJatq75OehUtn002p6CQ+28vTLqIpCavl0
n/rHKBFtao5wM6I+SLkhQeW7px98of0OvDMy/WnrKEGOwL4zvkSLvMy20/OrN8kV
6aUAX4Q6pEAdYGD2K0hFrHrdmXgxSlwfj/USOXv2kK6Ky5TwxRayqf71WCeSnhiC
eFwWoXHJkwKBgHMLfyk40cNG6i6ZrLQziNSq2sY/EMs03lCt7/yy99ZKrkLSDetC
36D76xcNNnS/C2XBC5M6t49QkKpwzQUZROzePiWlaZFaBM7q+gybchjMuKnRQ4p/
M9ICznqLX2DNgCLHTJXTAJezkvOQFzi1vkMDWepTOinzoU4LQ2ZVwzdxAoGAKh6/
WTWYPsM9sxYXGSgV8jNCf+hh6VvHiNz/q3A0nMYAvXP+xLmehVbrfN+JFR4m9lLi
/hHCeZu0ge7Kl7V9Th+QS9dtCGwlEAEJMVfIJh89DSeffzsz5OYZ14eFfAFJ3IvV
OxdsVfaRmZLTNbpxcbFdEN97fwyyoW4cC9t9GSMCgYEAmmoK/Oi/N0KiVRK5aguV
7FwW6zp6ZIwuR2OHBk6wHfTLfVoWYVjYQl/J8Pxt3wgFbYO6HKYXYQ315nBYcR+w
C4+K2I4yaHjpdlrruUxroWj4JlZz4kgaS3pLjZlaew1+a6WNWXnEe4f5Ob+5eb4G
yPbjgBlF6AVG+21Hy76OSIA=
-----END PRIVATE KEY-----`;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function resetDbConnection() {
  db = null;
  isInitialized = false;
}

export function handleDbError(error: any) {
  console.warn("⚠️ Firebase DB Notice:", error?.message || error);
}

export async function getDb(): Promise<{ db: Firestore | null; isConnected: boolean }> {
  if (db && isInitialized) {
    return { db, isConnected: true };
  }

  try {
    const serviceAccount = getServiceAccount();
    const apps = getApps();
    if (apps.length === 0) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
    } else {
      firebaseApp = apps[0];
    }

    db = getFirestore(firebaseApp);
    isInitialized = true;
    console.log(`🔥 Connected to Firebase Cloud Firestore successfully (Project: ${serviceAccount.projectId})`);
    return { db, isConnected: true };
  } catch (error: any) {
    console.error("❌ Firebase Connection Error:", error?.message || error);
    return { db: null, isConnected: false };
  }
}

export function isDbConnected(): boolean {
  return isInitialized && db !== null;
}
