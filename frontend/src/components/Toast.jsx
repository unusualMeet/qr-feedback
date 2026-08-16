import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const toastListeners = new Set();

let toastId = 0;

const showToast = (message, type = "success") => {
  const id = ++toastId;
  toastListeners.forEach((listener) => listener({ id, message, type }));
};

export const toast = {
  success: (message) => showToast(message, "success"),
  error: (message) => showToast(message, "error"),
};

function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts((previous) => [...previous, toast]);

      window.setTimeout(() => {
        setToasts((previous) => previous.filter((item) => item.id !== toast.id));
      }, 4000);
    };

    toastListeners.add(handler);

    return () => {
      toastListeners.delete(handler);
    };
  }, []);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            className={`toast toast-${item.type}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            role="alert"
          >
            <span className="toast-icon">{item.type === "success" ? "✓" : "!"}</span>

            <span className="toast-message">{item.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Toast;
