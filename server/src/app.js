const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const farmRoutes = require("./routes/farmRoutes");
const flockRoutes = require("./routes/flockRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const productionRoutes = require("./routes/productionRoutes");
const healthRecordRoutes = require("./routes/healthRecordRoutes");

// Finance & Analytics routes
const salesRoutes = require("./routes/salesRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const financeRoutes = require("./routes/financeRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");


const app = express();


// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);


// Body parser
app.use(express.json());


// Health check API
app.get("/api/health", (req, res) => {

  res.status(200).json({

    success: true,

    message: "FarmTrack API is running",

  });

});



// Existing routes

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/farms", farmRoutes);

app.use("/api/flocks", flockRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/production", productionRoutes);

app.use("/api/health-records", healthRecordRoutes);


// Finance & Analytics routes

app.use(
  "/api/sales",
  salesRoutes
);


app.use(
  "/api/expenses",
  expenseRoutes
);


app.use(
  "/api/finance",
  financeRoutes
);



// Error handling middleware

app.use(notFound);

app.use(errorHandler);



module.exports = app;