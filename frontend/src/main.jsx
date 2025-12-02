import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import UserLayout from "./layout/userLayout";
import AdminLayout from "./layout/adminLayout";
import LoginPage from "./pages/admin/LoginPage";
import PWABadge from "./PWABadge";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

const ProtectedAdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const session = localStorage.getItem("admin_session");
      if (session) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <LoginPage />;
};

const AppContent = () => {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div>
      {isLoginRoute ? (
        <LoginPage />
      ) : isAdminRoute ? (
        <ProtectedAdminRoute>
          <AdminLayout />
        </ProtectedAdminRoute>
      ) : (
        <UserLayout />
      )}
      <PWABadge />
    </div>
  );
};

function AppRoot() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
