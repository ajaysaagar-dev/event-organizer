import { createContext, useContext, useEffect, useState } from "react";
import { executeQuery, escapeSql } from "../utils/db";

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
      const trimmedName = display_name.trim();
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      // Check if user already exists
      const checkQuery = `SELECT id FROM users WHERE email = ${escapeSql(trimmedEmail)}`;
      const checkResult = await executeQuery(checkQuery);

      if (!checkResult.success) {
        return { error: checkResult.error || "Database error" };
      }

      if (checkResult.rows && checkResult.rows.length > 0) {
        return { error: "Email already registered" };
      }

      // Insert new user
      const insertQuery = `INSERT INTO users (name, email, password, created_at) VALUES (${escapeSql(trimmedName)}, ${escapeSql(trimmedEmail)}, ${escapeSql(trimmedPassword)}, NOW())`;
      const insertResult = await executeQuery(insertQuery);

      if (!insertResult.success) {
        return { error: insertResult.error || "Signup failed" };
      }

      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
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
