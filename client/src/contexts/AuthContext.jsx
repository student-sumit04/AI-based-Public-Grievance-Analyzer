import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("grievance_user") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("grievance_token"));

  const saveSession = (payload) => {
    localStorage.setItem("grievance_token", payload.token);
    localStorage.setItem("grievance_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    saveSession(data);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem("grievance_token");
    localStorage.removeItem("grievance_user");
    setUser(null);
    setToken(null);
  };

  const value = useMemo(() => ({ user, token, login, register, logout, isAuthenticated: Boolean(token) }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
