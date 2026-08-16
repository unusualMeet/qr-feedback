import { useCallback, useEffect, useState } from "react";

import FeedbackPage from "./pages/FeedbackPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Toast from "./components/Toast";
import { verifyAdmin } from "./services/api";

function App() {
  const path = window.location.pathname;

  const [adminAuthenticated, setAdminAuthenticated] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const verifyAdminToken = useCallback(async () => {
    const token = localStorage.getItem(
      "projectmate_admin_token"
    );

    if (!token) {
      setCheckingAuth(false);
      return;
    }

    try {
      const { response } = await verifyAdmin(token);

      if (response.ok) {
        setAdminAuthenticated(true);
      } else {
        localStorage.removeItem(
          "projectmate_admin_token"
        );
      }
    } catch (error) {
      console.error(
        "Admin verification error:",
        error
      );

      localStorage.removeItem(
        "projectmate_admin_token"
      );
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (path !== "/admin") return undefined;

    const timer = window.setTimeout(verifyAdminToken, 0);
    return () => window.clearTimeout(timer);
  }, [path, verifyAdminToken]);

  const handleLogin = () => {
    setAdminAuthenticated(true);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("projectmate_admin_token");
    setAdminAuthenticated(false);
  }, []);

  // PUBLIC FEEDBACK PAGE
  if (path === "/") {
    return (
      <>
        <FeedbackPage />
        <Toast />
      </>
    );
  }

  // ADMIN AREA
  if (path === "/admin") {
    if (checkingAuth) {
      return (
        <div className="admin-loading">
          <div className="admin-loader"></div>

          <p>
            Verifying admin access...
          </p>
        </div>
      );
    }

    if (!adminAuthenticated) {
      return (
        <>
          <AdminLogin
            onLogin={handleLogin}
          />
          <Toast />
        </>
      );
    }

    return (
      <>
        <AdminDashboard onLogout={handleLogout} />
        <Toast />
      </>
    );
  }

  // DEFAULT
  return (
    <>
      <FeedbackPage />
      <Toast />
    </>
  );
}

export default App;
