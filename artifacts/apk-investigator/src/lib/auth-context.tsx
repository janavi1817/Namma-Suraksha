import React, { createContext, useContext, useState, useCallback } from "react";

interface Officer {
  id: string;
  name: string;
  district: string;
  rank: string;
}

interface AuthContextType {
  officer: Officer | null;
  isAuthenticated: boolean;
  login: (officerId: string, password: string, district: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const OFFICERS: Record<string, { name: string; rank: string; password: string }> = {
  "KCID001": { name: "Ravi Kumar", rank: "Inspector", password: "rakshak2026" },
  "KCID002": { name: "Priya Sharma", rank: "Sub-Inspector", password: "rakshak2026" },
  "KCID003": { name: "Arun Reddy", rank: "DSP", password: "rakshak2026" },
  "admin": { name: "Admin Officer", rank: "Superintendent", password: "admin" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [officer, setOfficer] = useState<Officer | null>(() => {
    const saved = sessionStorage.getItem("rakshak_officer");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((officerId: string, password: string, district: string): boolean => {
    const record = OFFICERS[officerId];
    if (record && record.password === password) {
      const o: Officer = { id: officerId, name: record.name, district, rank: record.rank };
      setOfficer(o);
      sessionStorage.setItem("rakshak_officer", JSON.stringify(o));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setOfficer(null);
    sessionStorage.removeItem("rakshak_officer");
  }, []);

  return (
    <AuthContext.Provider value={{ officer, isAuthenticated: !!officer, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
