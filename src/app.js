import express from "express";
import cors from "cors";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import recordRoutes from "./routes/record.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// Middleware imports
import { errorHandler } from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";

const app = express();

// --------------------------------------------------
// Global Middleware
// --------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// --------------------------------------------------
// Health Check
// --------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Finance Dashboard API is running",
    version: "1.0.0",
  });
});

// --------------------------------------------------
// API Routes
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// --------------------------------------------------
// 404 Handler
// --------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --------------------------------------------------
// Global Error Handler (must be last)
// --------------------------------------------------
app.use(errorHandler);

export default app;
