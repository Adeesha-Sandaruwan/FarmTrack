const express = require("express");
const { body } = require("express-validator");

const {
  getHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
} = require("../controllers/healthRecordController");

const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const recordTypes = ["vaccination", "treatment", "incident", "weight-check"];
const severities = ["low", "medium", "high", "critical"];

router.use(protect);

router
  .route("/")
  .get(getHealthRecords)
  .post(
    [
      body("flock").isMongoId().withMessage("A valid flock is required."),
      body("recordType")
        .isIn(recordTypes)
        .withMessage("Please select a valid health record type."),
      body("title").trim().notEmpty().withMessage("Record title is required."),
      body("date").isISO8601().withMessage("A valid date is required."),
      body("severity").optional().isIn(severities),
      body("quantity").optional().isFloat({ min: 0 }),
      body("nextDueDate").optional().isISO8601(),
    ],
    validateRequest,
    createHealthRecord
  );

router
  .route("/:id")
  .patch(
    authorize("admin", "manager"),
    [
      body("recordType").optional().isIn(recordTypes),
      body("title").optional().trim().notEmpty(),
      body("date").optional().isISO8601(),
      body("severity").optional().isIn(severities),
      body("quantity").optional().isFloat({ min: 0 }),
      body("nextDueDate").optional().isISO8601(),
    ],
    validateRequest,
    updateHealthRecord
  )
  .delete(authorize("admin", "manager"), deleteHealthRecord);

module.exports = router;