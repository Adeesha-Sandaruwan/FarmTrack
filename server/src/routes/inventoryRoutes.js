const express = require("express");
const { body } = require("express-validator");

const {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getStockTransactions,
  createStockTransaction,
} = require("../controllers/inventoryController");

const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const categories = ["feed", "medicine", "vaccine", "equipment", "supplies"];

const units = [
  "kg",
  "g",
  "litre",
  "ml",
  "bag",
  "bottle",
  "dose",
  "piece",
  "box",
];

router.use(protect);

router
  .route("/")
  .get(getInventoryItems)
  .post(
    authorize("admin", "manager"),
    [
      body("name")
        .trim()
        .notEmpty()
        .withMessage("Item name is required."),

      body("category")
        .isIn(categories)
        .withMessage("Please select a valid category."),

      body("unit")
        .isIn(units)
        .withMessage("Please select a valid unit."),

      body("openingStock")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Opening stock cannot be negative."),

      body("reorderLevel")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Reorder level cannot be negative."),

      body("unitCost")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Unit cost cannot be negative."),
    ],
    validateRequest,
    createInventoryItem
  );

router
  .route("/:id")
  .get(getInventoryItemById)
  .patch(
    authorize("admin", "manager"),
    [
      body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Item name cannot be empty."),

      body("category")
        .optional()
        .isIn(categories)
        .withMessage("Invalid category."),

      body("unit")
        .optional()
        .isIn(units)
        .withMessage("Invalid unit."),

      body("reorderLevel")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Reorder level cannot be negative."),

      body("unitCost")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Unit cost cannot be negative."),

      body("status")
        .optional()
        .isIn(["active", "archived"])
        .withMessage("Status must be active or archived."),
    ],
    validateRequest,
    updateInventoryItem
  )
  .delete(authorize("admin", "manager"), deleteInventoryItem);

router
  .route("/:id/transactions")
  .get(getStockTransactions)
  .post(
    [
      body("transactionType")
        .isIn(["stock-in", "usage", "adjustment", "wastage"])
        .withMessage("Invalid transaction type."),

      body("direction")
        .isIn(["increase", "decrease"])
        .withMessage("Direction must be increase or decrease."),

      body("quantity")
        .isFloat({ min: 0.01 })
        .withMessage("Quantity must be greater than zero."),

      body("date")
        .isISO8601()
        .withMessage("A valid date is required."),

      body("unitCost")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Unit cost cannot be negative."),
    ],
    validateRequest,
    createStockTransaction
  );

module.exports = router;