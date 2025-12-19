import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../css/common.css";

export default function Account_Signup_Page() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      alert("Signup successful. Please login.");
      navigate("/account/login");
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <main>
        <section className="content">
          <h1 className="h1">Create your account</h1>
          <p className="subtitle">Join ARTI AI in seconds</p>

          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="btns">
            <button className="btn" onClick={handleSignup} disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>

            <div className="footer-link">
              Already have an account?
              <Link to="/account/login"> Login</Link>
            </div>
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
