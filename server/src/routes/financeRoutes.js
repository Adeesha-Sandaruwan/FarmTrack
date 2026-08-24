const express = require("express");

const router = express.Router();


const {
    getFinanceSummary
} = require("../controllers/financeController");



// GET /api/finance/summary

router.get(
    "/summary",
    getFinanceSummary
);


module.exports = router;