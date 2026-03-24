import { createContext, useState } from "react";

export const AuthContext = createContext();

/* ── read localStorage once, synchronously, at module load time ── */
const loadUser = () => {
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") return JSON.parse(stored);
  } catch {}
  return null;
};

export const AuthProvider = ({ children }) => {
  /* initialise directly from localStorage — no useEffect, no flicker */
  const [user, setUser] = useState(loadUser);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};