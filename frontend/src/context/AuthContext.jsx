"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  verifyOtp as verifyOtpApi,
  logoutUser,
  setAuthToken,
  getProfile,
} from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = sessionStorage.getItem("truthscan_user_session");
        return storedUser ? JSON.parse(storedUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const token = sessionStorage.getItem("truthscan_access_token");
        if (token) {
          setAuthToken(token);
          return token;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [trialsUsed, setTrialsUsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("truthscan_trials_used");
        return stored !== null ? parseInt(stored, 10) : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  const [loading, setLoading] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState("");

  const refreshProfile = async () => {
    try {
      const res = await getProfile();
      if (res?.data) {
        setUser(res.data);
        if (typeof res.data.trialsUsed === "number") {
          setTrialsUsed(res.data.trialsUsed);
          sessionStorage.setItem("truthscan_trials_used", String(res.data.trialsUsed));
        }
        sessionStorage.setItem("truthscan_user_session", JSON.stringify(res.data));
      }
    } catch {
      // ignore
    }
  };

  // Sync latest profile on reload if authenticated
  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
      refreshProfile();
    }
  }, [accessToken]);

  const recordTrialUsed = () => {
    setTrialsUsed((prev) => {
      const next = prev + 1;
      try {
        sessionStorage.setItem("truthscan_trials_used", String(next));
      } catch {
        // ignore
      }
      return next;
    });
    setUser((prev) => {
      if (!prev) return prev;
      const nextCount = (prev.trialsUsed || 0) + 1;
      const updated = {
        ...prev,
        trialsUsed: nextCount,
        trialsRemaining: prev.isPremium ? null : Math.max(0, 2 - nextCount),
      };
      try {
        sessionStorage.setItem("truthscan_user_session", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const updateUser = (newUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...newUserData };
      if (typeof merged.trialsUsed === "number") {
        setTrialsUsed(merged.trialsUsed);
      }
      try {
        sessionStorage.setItem("truthscan_user_session", JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await loginUser(credentials);
      if (res.user) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setAuthToken(res.accessToken);
        try {
          sessionStorage.setItem("truthscan_user_session", JSON.stringify(res.user));
          if (res.accessToken) {
            sessionStorage.setItem("truthscan_access_token", res.accessToken);
          }
        } catch {
          // ignore
        }
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await registerUser(userData);
      if (userData.email) {
        setPendingOtpEmail(userData.email);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (data) => {
    setLoading(true);
    try {
      const res = await verifyOtpApi(data);
      if (res.user) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setAuthToken(res.accessToken);
        try {
          sessionStorage.setItem("truthscan_user_session", JSON.stringify(res.user));
          if (res.accessToken) {
            sessionStorage.setItem("truthscan_access_token", res.accessToken);
          }
        } catch {
          // ignore
        }
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setAccessToken(null);
      setAuthToken(null);
      try {
        sessionStorage.removeItem("truthscan_user_session");
        sessionStorage.removeItem("truthscan_access_token");
      } catch {
        // ignore
      }
    }
  };

  const effectiveTrialsUsed = user?.trialsUsed ?? trialsUsed ?? 0;
  const isPremium = !!user?.isPremium;
  const trialsRemaining = isPremium ? 9999 : Math.max(0, 2 - effectiveTrialsUsed);
  const isTrialExhausted = !isPremium && effectiveTrialsUsed >= 2;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isPremium,
        trialsUsed: effectiveTrialsUsed,
        trialsRemaining,
        isTrialExhausted,
        recordTrialUsed,
        refreshProfile,
        loading,
        pendingOtpEmail,
        setPendingOtpEmail,
        login,
        register,
        verifyOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
