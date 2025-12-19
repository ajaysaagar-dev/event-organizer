import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { executeQuery, escapeSql } from "../utils/db";
import "../css/common.css";

export default function Account_Login_Page() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      // Query to find user by email and password
      const query = `SELECT id, name, email FROM users WHERE email = ${escapeSql(trimmedEmail)} AND password = ${escapeSql(trimmedPassword)}`;
      const result = await executeQuery(query);

      if (!result.success) {
        alert(result.error || "Login failed");
        return;
      }

      if (!result.rows || result.rows.length === 0) {
        alert("Invalid email or password");
        return;
      }

      const user = result.rows[0];
      login(user);
      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Server not reachable. Check backend / tunnel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <main>
        <section className="content">
          <h1 className="h1">Welcome back</h1>
          <p className="subtitle">Sign in to continue</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="btns">
            <button
              type="button"
              className="btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <Link to="/account/signup" className="btn signup">
              Sign Up
            </Link>
          </div>
        </section>

        <section className="right-panel">
          <div>
            <h2>EVENT ORGANIZER</h2>
            <p>Platform For Accessing Tasks</p>
          </div>
        </section>
      </main>
    </div>
  );
}
