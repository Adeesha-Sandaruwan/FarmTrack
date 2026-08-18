import { createContext, useContext, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("farmtrackUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const saveSession = (data) => {
    localStorage.setItem("farmtrackToken", data.token);
    localStorage.setItem("farmtrackUser", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    saveSession(data);
    return data;
  };

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("farmtrackToken");
    localStorage.removeItem("farmtrackUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);