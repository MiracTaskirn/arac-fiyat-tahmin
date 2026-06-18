import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");

  useEffect(() => {
    setAuthToken(token || "");
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (email) localStorage.setItem("email", email);
    else localStorage.removeItem("email");
  }, [email]);

  const isAuthed = !!token;

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setToken(res.data.access_token);
    setEmail(email);
  };

  const register = async (email, password) => {
    await api.post("/auth/register", { email, password });
    await login(email, password);
  };

  const logout = () => {
    setToken("");
    setEmail("");
    setAuthToken("");
  };

  const value = useMemo(
    () => ({ token, email, isAuthed, login, register, logout }),
    [token, email, isAuthed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);