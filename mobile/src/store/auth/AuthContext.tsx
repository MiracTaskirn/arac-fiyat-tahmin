import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getToken, removeToken, saveToken } from "./authStorage";
import { loginRequest, registerRequest } from "../../services/auth/authService";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await getToken();
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (error) {
        console.log("Auth load error:", error);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest({ email, password });
    await saveToken(data.access_token);
    setToken(data.access_token);
  };

  const register = async (email: string, password: string) => {
    await registerRequest({email, password });
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      isReady,
      login,
      register,
      logout,
    }),
    [token, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}