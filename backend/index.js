const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const morgan = require("morgan");

const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// ==========================================
// LOGGING
// ==========================================

app.use(morgan(process.env.NODE_ENV === "production" ? "short" : "combined"));

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
  })
);

app.use(helmet());

// ==========================================
// JSON BODY PARSER
// ==========================================

app.use(express.json());

const feedbackCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many feedback submissions. Please try again later.",
  },
});

// ==========================================
// DATABASE
// ==========================================

connectDB();

// ==========================================
// ROUTES
// ==========================================

// The login route already applies its own limiter. Do not apply it to
// /verify, otherwise a normal dashboard verification request is counted too.
app.use("/api/admin", adminRoutes);

// Feedback limiting belongs only to POST /create. Admin GET/stat/export
// requests must not consume the public submission limit.
app.use("/api/feedback/create", feedbackCreationLimiter);
app.use("/api/feedback", feedbackRoutes);

// ==========================================
// ROOT + HEALTH
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "QR Feedback API is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "QR Feedback API is running",
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (err.message === "Origin is not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// ==========================================
// SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
