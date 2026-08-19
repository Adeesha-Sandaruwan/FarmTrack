const express = require("express");
const { body } = require("express-validator");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("farmName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Farm / flock name must be between 2 and 100 characters."),
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Full name must be between 2 and 50 characters."),
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required.")
      .isLength({ max: 25 })
      .withMessage("Phone number cannot exceed 25 characters."),
    body("flockSize")
      .isIn(["under-500", "500-2000", "2000-10000", "over-10000"])
      .withMessage("Please select a flock size."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateRequest,
  login
);

router.get("/me", protect, getMe);

module.exports = router;