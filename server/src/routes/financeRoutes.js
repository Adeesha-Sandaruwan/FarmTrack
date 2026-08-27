const express = require("express");

const {
  getFinanceSummary,
} = require("../controllers/financeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// GET /api/finance/summary
router.get("/summary", getFinanceSummary);

module.exports = router;