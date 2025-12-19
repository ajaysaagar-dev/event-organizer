import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../css/common.css";

export default function Account_Page() {
  return (
    <div className="auth-layout">
      <main>
        <section className="content">
          <img className="logo" src={logo} alt="Logo" />

          <h1 className="h1">Welcome</h1>
          <p className="subtitle">Login or create a new account to continue</p>

          <div className="btns">
            <Link to="/account/login" className="btn">
              Login
            </Link>

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
