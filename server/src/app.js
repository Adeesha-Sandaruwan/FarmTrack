const express = require("express");
const cors = require("cors");

// Existing routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const farmRoutes = require("./routes/farmRoutes");
const flockRoutes = require("./routes/flockRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const productionRoutes = require("./routes/productionRoutes");
const healthRecordRoutes = require("./routes/healthRecordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Finance & Analytics routes
const salesRoutes = require("./routes/salesRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const financeRoutes = require("./routes/financeRoutes");

// Error handling
const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

// ========================================
// CORS Configuration
// ========================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

// ========================================
// Body Parser
// ========================================

app.use(express.json());

// ========================================
// Health Check
// ========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FarmTrack API is running",
  });
});

// ========================================
// Existing API Routes
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/farms", farmRoutes);

app.use("/api/flocks", flockRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/production", productionRoutes);

app.use("/api/health-records", healthRecordRoutes);

app.use("/api/dashboard", dashboardRoutes);

// ========================================
// Finance & Analytics API Routes
// ========================================

// Sales
app.use("/api/sales", salesRoutes);

// Expenses
app.use("/api/expenses", expenseRoutes);

// Finance / Analytics
app.use("/api/finance", financeRoutes);

// ========================================
// Error Handling Middleware
// ========================================

app.use(notFound);

app.use(errorHandler);

// ========================================
// Export App
// ========================================

module.exports = app;