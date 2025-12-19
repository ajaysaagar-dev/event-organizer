import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css/navbar.css";

export default function Navigation() {
  const { logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/home">New</Link>
      <Link to="/urgent">Urgent</Link>
      <Link to="/reminder">Reminder</Link>
      <Link to="/completed">Completed</Link>
      <Link to="/chat">Chat</Link>

      <button onClick={logout}>Logout</button>
    </nav>
  );
}
