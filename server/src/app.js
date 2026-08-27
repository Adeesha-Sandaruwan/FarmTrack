const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const farmRoutes = require("./routes/farmRoutes");
const flockRoutes = require("./routes/flockRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const productionRoutes = require("./routes/productionRoutes");
const healthRecordRoutes = require("./routes/healthRecordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Finance & Analytics
const salesRoutes = require("./routes/salesRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const financeRoutes = require("./routes/financeRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

/* =========================================================
   CORS
========================================================= */

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FarmTrack API is running",
  });
});

/* =========================================================
   AUTH
========================================================= */

app.use("/api/auth", authRoutes);

/* =========================================================
   EXISTING ROUTES
========================================================= */

app.use("/api/users", userRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/flocks", flockRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* =========================================================
   FINANCE & ANALYTICS
========================================================= */

app.use("/api/sales", salesRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/finance", financeRoutes);

/* =========================================================
   ERROR HANDLING
========================================================= */

app.use(notFound);
app.use(errorHandler);

module.exports = app;