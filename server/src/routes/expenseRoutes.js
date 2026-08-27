const express = require("express");
const { body, param } = require("express-validator");

const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const expenseCategories = [
  "feed",
  "medicine",
  "labour",
  "electricity",
  "water",
  "transportation",
  "equipment",
  "other",
];

router.use(protect);

router.get("/", getExpenses);

router.post(
  "/",
  authorize("admin", "manager"),
  [
    body("flock")
      .optional({ values: "falsy" })
      .isMongoId()
      .withMessage("Invalid flock ID."),

    body("category")
      .isIn(expenseCategories)
      .withMessage("Invalid expense category."),

    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Expense amount must be zero or greater."),

    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be valid."),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters."),
  ],
  validateRequest,
  createExpense
);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid expense ID."),
  validateRequest,
  getExpenseById
);

router.patch(
  "/:id",
  authorize("admin", "manager"),
  [
    param("id").isMongoId().withMessage("Invalid expense ID."),

    body("flock")
      .optional({ values: "falsy" })
      .isMongoId()
      .withMessage("Invalid flock ID."),

    body("category")
      .optional()
      .isIn(expenseCategories)
      .withMessage("Invalid expense category."),

    body("amount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Expense amount must be zero or greater."),

    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be valid."),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters."),
  ],
  validateRequest,
  updateExpense
);

router.delete(
  "/:id",
  authorize("admin", "manager"),
  param("id").isMongoId().withMessage("Invalid expense ID."),
  validateRequest,
  deleteExpense
);

module.exports = router;