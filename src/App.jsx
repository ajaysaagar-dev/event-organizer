import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Account from "./pages/account_page";
import Login from "./pages/account_login_page";
import Register from "./pages/account_signup_page";

import NewTask from "./pages/NewTask";
import Urgent from "./pages/Urgent";
import Reminder from "./pages/Reminder";
import Completed from "./pages/Completed";
import Chat from "./pages/Chat";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/account/login" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/account" replace />} />

        <Route path="/account" element={<Account />} />
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/signup" element={<Register />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <NewTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/urgent"
          element={
            <ProtectedRoute>
              <Urgent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reminder"
          element={
            <ProtectedRoute>
              <Reminder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/completed"
          element={
            <ProtectedRoute>
              <Completed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
