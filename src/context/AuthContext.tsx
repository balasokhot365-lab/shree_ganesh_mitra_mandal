import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { IUser } from "../types";
import { api, getStoredToken, getStoredUser, clearSession } from "../services/api";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  login: (mobile: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isMainAdmin: boolean;
  canManageExpenses: boolean;
  sessionExpiredMsg: string | null;
  clearSessionExpiredMsg: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null);

  const clearSessionExpiredMsg = () => setSessionExpiredMsg(null);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    try {
      const u = await api.getCurrentUser();
      setUser(u);
      setToken(getStoredToken());
    } catch (err: any) {
      if (err.message && err.message.includes("Session expired")) {
        setSessionExpiredMsg(err.message);
      }
      setUser(null);
      setToken(null);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    // Listen for custom session expired event
    const handleSessionExpired = (e: any) => {
      setSessionExpiredMsg(e.detail || "दुसऱ्या डिव्हाइसवर लॉगिन झाल्यामुळे तुमचे सत्र समाप्त झाले आहे.");
      setUser(null);
      setToken(null);
    };

    window.addEventListener("ganesh_session_expired", handleSessionExpired);
    return () => {
      window.removeEventListener("ganesh_session_expired", handleSessionExpired);
    };
  }, [refreshUser]);

  // Periodic heartbeat session check every 12 seconds for real-time single-device login enforcement
  useEffect(() => {
    if (!user || !token) return;

    const interval = setInterval(async () => {
      try {
        await api.getCurrentUser();
      } catch (err: any) {
        console.warn("Session check failed:", err.message);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [user, token]);

  const login = async (mobile: string, pass: string) => {
    setIsLoggingIn(true);
    try {
      const res = await api.login(mobile, pass);
      setUser(res.user);
      setToken(res.token);
      setSessionExpiredMsg(null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const isMainAdmin = Boolean(user?.isMainAdmin);
  const canManageExpenses = isAdmin || !!user?.canManageExpenses;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggingIn,
        login,
        logout,
        refreshUser,
        isAdmin,
        isMainAdmin,
        canManageExpenses,
        sessionExpiredMsg,
        clearSessionExpiredMsg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
