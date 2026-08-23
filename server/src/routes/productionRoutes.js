const express = require("express");
const { body } = require("express-validator");

const {
  getProductionRecords,
  createProductionRecord,
  updateProductionRecord,
  deleteProductionRecord,
} = require("../controllers/productionController");

const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getProductionRecords)
  .post(
    [
      body("flock").isMongoId().withMessage("A valid flock is required."),

      body("date")
        .isISO8601()
        .withMessage("A valid date is required."),

      body("eggCount")
        .isInt({ min: 0 })
        .withMessage("Egg count cannot be negative."),

      body("damagedEggs")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Damaged eggs cannot be negative."),

      body("averageBirdWeight")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Average bird weight cannot be negative."),
    ],
    validateRequest,
    createProductionRecord
  );

router
  .route("/:id")
  .patch(
    authorize("admin", "manager"),
    [
      body("date")
        .optional()
        .isISO8601()
        .withMessage("A valid date is required."),

      body("eggCount")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Egg count cannot be negative."),

      body("damagedEggs")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Damaged eggs cannot be negative."),

      body("averageBirdWeight")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Average bird weight cannot be negative."),
    ],
    validateRequest,
    updateProductionRecord
  )
  .delete(authorize("admin", "manager"), deleteProductionRecord);

module.exports = router;