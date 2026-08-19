const express = require("express");
const { body } = require("express-validator");

const {
  getMyFarm,
  updateMyFarm,
} = require("../controllers/farmController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/me", protect, getMyFarm);

router.patch(
  "/me",
  protect,
  authorize("admin", "manager"),
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Farm name must be between 2 and 100 characters."),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 150 })
      .withMessage("Location cannot exceed 150 characters."),
    body("phoneNumber")
      .optional()
      .trim()
      .isLength({ max: 25 })
      .withMessage("Phone number cannot exceed 25 characters."),
  ],
  validateRequest,
  updateMyFarm
);

module.exports = router;