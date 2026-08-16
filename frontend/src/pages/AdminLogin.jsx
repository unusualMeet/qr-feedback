import { useState } from "react";
import { motion } from "framer-motion";

import logo from "../assets/projectmate-logo.png";
import { loginAdmin } from "../services/api";
import { toast } from "../components/Toast";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const { response, data } = await loginAdmin({ email, password });

      if (!response.ok || !data.success) {
        const message = data.message || "Invalid admin credentials.";
        setError(message);
        toast.error(message);
        return;
      }

      localStorage.setItem(
        "projectmate_admin_token",
        data.token
      );

      toast.success("Admin login successful");
      onLogin();
    } catch (error) {
      console.error(error);

      const message = "Unable to connect to the server.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">

      <div className="tech-grid"></div>

      <div className="admin-login-glow"></div>

      <motion.div
        className="admin-login-card"
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
      >

        <div className="admin-login-logo">
          <img
            src={logo}
            alt="ProjectMate"
          />
        </div>

        <div className="admin-login-label">
          <span></span>
          ADMIN ACCESS
        </div>

        <h1>
          Welcome
          <span> back.</span>
        </h1>

        <p className="admin-login-description">
          Sign in to access ProjectMate
          feedback analytics.
        </p>

        <form onSubmit={handleLogin}>

          <label>
            ADMIN EMAIL
          </label>

          <input
            type="email"
            placeholder="admin@projectmate.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <label>
            PASSWORD
          </label>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          {error && (
            <motion.div
              className="admin-login-error"
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="submit-loader"></span>
                Authenticating...
              </>
            ) : (
              <>
                Access Dashboard
                <span>→</span>
              </>
            )}
          </button>

        </form>

        <div className="admin-login-footer">
          <span>PROJECTMATE</span>

          <span>
            SECURE ADMIN AREA
          </span>
        </div>

      </motion.div>

    </main>
  );
}

export default AdminLogin;
