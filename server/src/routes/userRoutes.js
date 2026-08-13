const express = require("express");
const { body } = require("express-validator");

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect, authorize("admin"));

router
  .route("/")
  .get(getUsers)
  .post(
    [
      body("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters."),
      body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters."),
      body("role")
        .isIn(["admin", "manager", "worker"])
        .withMessage("Role must be admin, manager, or worker."),
    ],
    validateRequest,
    createUser
  );

router
  .route("/:id")
  .get(getUserById)
  .patch(
    [
      body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters."),
      body("email")
        .optional()
        .isEmail()
        .withMessage("A valid email is required.")
        .normalizeEmail(),
      body("role")
        .optional()
        .isIn(["admin", "manager", "worker"])
        .withMessage("Role must be admin, manager, or worker."),
      body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be true or false."),
    ],
    validateRequest,
    updateUser
  )
  .delete(deleteUser);

module.exports = router;