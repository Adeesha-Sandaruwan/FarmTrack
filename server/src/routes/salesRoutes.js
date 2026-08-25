const express = require("express");

const router = express.Router();

const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
} = require("../controllers/salesController");

const { protect } = require("../middleware/authMiddleware");

// All sales routes require login
router.use(protect);

// /api/sales

router
  .route("/")
  .post(createSale)
  .get(getSales);

router
  .route("/:id")
  .get(getSaleById)
  .put(updateSale)
  .delete(deleteSale);

module.exports = router;