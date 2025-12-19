import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- INIT FROM STORAGE ---------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) {
          setUser({ ...parsed, id: Number(parsed.id) });
        } else {
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /* ---------- LOGIN ---------- */
  const login = (userData) => {
    if (!userData?.id) return;

    const normalizedUser = {
      ...userData,
      id: Number(userData.id),
    };

    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  /* ---------- SIGNUP ---------- */
  const signUp = async (display_name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: display_name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error || "Signup failed" };

      return { success: true };
    } catch {
      return { error: "Server not reachable" };
    }
  };

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
