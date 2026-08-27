const express = require("express");
const { body, query, param } = require("express-validator");

const {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
} = require("../controllers/salesController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const saleValidation = [
  body("flock")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Invalid flock ID."),

  body("category")
    .isIn(["egg", "chicken", "other"])
    .withMessage("Invalid sale category."),

  body("quantity")
    .isFloat({ min: 0 })
    .withMessage("Quantity must be zero or greater."),

  body("unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be zero or greater."),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be valid."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
];

router.use(protect);

router.get("/", getSales);

router.post(
  "/",
  authorize("admin", "manager"),
  saleValidation,
  validateRequest,
  createSale
);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid sale ID."),
  validateRequest,
  getSaleById
);

router.patch(
  "/:id",
  authorize("admin", "manager"),
  [
    param("id").isMongoId().withMessage("Invalid sale ID."),
    ...saleValidation.map((validator) => validator.optional?.() || validator),
  ],
  validateRequest,
  updateSale
);

router.delete(
  "/:id",
  authorize("admin", "manager"),
  param("id").isMongoId().withMessage("Invalid sale ID."),
  validateRequest,
  deleteSale
);

module.exports = router;