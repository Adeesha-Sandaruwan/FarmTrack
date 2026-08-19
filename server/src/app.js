const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const farmRoutes = require("./routes/farmRoutes");


const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FarmTrack API is running",
  });
});
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;