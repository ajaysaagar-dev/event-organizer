import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../config/api";
import Navigation from "../components/Navigation";
import "../css/chat.css";

export default function Chat() {
  const { user } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState({});

  const messagesEndRef = useRef(null);

  /* ---------------- LOAD USERS ---------------- */

  useEffect(() => {
    if (user?.id) loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    const res = await fetch(`${API_URL}/users`);
    const data = await res.json();
    setProfiles(data.filter(p => p.id !== user.id));
  };

  /* ---------------- LOAD MESSAGES ---------------- */

  useEffect(() => {
    if (user?.id && receiver) {
      loadMessages();
      setUnread(prev => ({ ...prev, [receiver.id]: 0 }));
    }
  }, [receiver, user]);

  const loadMessages = async () => {
    const res = await fetch(
      `${API_URL}/chat/${user.id}/${receiver.id}`
    );
    const data = await res.json();
    setMessages(data);
  };

  /* ---------------- POLLING ---------------- */

  useEffect(() => {
    if (!receiver) return;

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [receiver]);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text || !receiver) return;

    await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: user.id,
        receiver_id: receiver.id,
        message: text,
      }),
    });

    setText("");
    loadMessages();
  };

  return (
    <>
      <Navigation />

      <div className="chat-shell">
        <div className="chat-layout">
          {/* ---------- SIDEBAR ---------- */}
          <aside className="chat-sidebar">
            <h2>Chats</h2>

            <div className="chat-search">
              <input placeholder="Search users..." />
            </div>

            <div className="chat-user-list">
              {profiles.map(p => (
                <div
                  key={p.id}
                  className={`chat-user ${
                    receiver?.id === p.id ? "active" : ""
                  }`}
                  onClick={() => setReceiver(p)}
                >
                  <div className="avatar">
  {p.name?.[0]?.toUpperCase() || "U"}
</div>

<div className="chat-user-info">
  <strong>{p.name}</strong>
</div>

                  {unread[p.id] > 0 && (
                    <span className="unread-badge">
                      {unread[p.id]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* ---------- MAIN CHAT ---------- */}
          <main className="chat-main">
            {!receiver ? (
              <div className="chat-placeholder">
                <User size={40} />
                <p>Select a user to start chatting</p>
              </div>
            ) : (
              <>
                <div className="chat-box">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`chat-message ${
                        msg.sender_id === user.id
                          ? "sent"
                          : "received"
                      }`}
                    >
                      {msg.message}
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>

                <form
                  className="chat-input-area"
                  onSubmit={sendMessage}
                >
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message…"
                  />
                  <button type="submit">
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
