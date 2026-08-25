const express = require("express");

const router = express.Router();

const {
  getFinanceSummary,
} = require("../controllers/financeController");

const { protect } = require("../middleware/authMiddleware");

// All finance analytics routes require login
router.use(protect);

// GET /api/finance/summary
router.get("/summary", getFinanceSummary);

module.exports = router;