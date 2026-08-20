const express = require("express");
const { body } = require("express-validator");

const {
  getFlocks,
  getFlockById,
  createFlock,
  updateFlock,
  deleteFlock,
  getMortalityRecords,
  createMortalityRecord,
  getPopulationChanges,
  createPopulationChange,
} = require("../controllers/flockController");

const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const createFlockValidation = [
  body("batchCode")
    .trim()
    .notEmpty()
    .withMessage("Batch code is required.")
    .isLength({ max: 30 })
    .withMessage("Batch code cannot exceed 30 characters."),

  body("breed")
    .trim()
    .notEmpty()
    .withMessage("Breed is required.")
    .isLength({ max: 60 })
    .withMessage("Breed cannot exceed 60 characters."),

  body("flockType")
    .isIn(["layer", "broiler", "breeder", "other"])
    .withMessage("Flock type must be layer, broiler, breeder, or other."),

  body("placementDate")
    .isISO8601()
    .withMessage("A valid placement date is required."),

  body("initialPopulation")
    .isInt({ min: 1 })
    .withMessage("Initial population must be at least 1."),
];

router.use(protect);

router
  .route("/")
  .get(getFlocks)
  .post(
    authorize("admin", "manager"),
    createFlockValidation,
    validateRequest,
    createFlock
  );

router
  .route("/:id")
  .get(getFlockById)
  .patch(
    authorize("admin", "manager"),
    [
      body("batchCode")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Batch code cannot be empty."),

      body("breed")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Breed cannot be empty."),

      body("flockType")
        .optional()
        .isIn(["layer", "broiler", "breeder", "other"])
        .withMessage("Invalid flock type."),

      body("status")
        .optional()
        .isIn(["active", "closed", "sold"])
        .withMessage("Status must be active, closed, or sold."),
    ],
    validateRequest,
    updateFlock
  )
  .delete(authorize("admin", "manager"), deleteFlock);

router
  .route("/:id/mortality")
  .get(getMortalityRecords)
  .post(
    [
      body("date").isISO8601().withMessage("A valid date is required."),

      body("count")
        .isInt({ min: 1 })
        .withMessage("Mortality count must be at least 1."),

      body("cause")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Cause cannot exceed 100 characters."),

      body("notes")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Notes cannot exceed 500 characters."),
    ],
    validateRequest,
    createMortalityRecord
  );

router
  .route("/:id/population-changes")
  .get(getPopulationChanges)
  .post(
    [
      body("changeType")
        .isIn(["addition", "removal", "adjustment"])
        .withMessage("Invalid population change type."),

      body("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1."),

      body("direction")
        .isIn(["increase", "decrease"])
        .withMessage("Direction must be increase or decrease."),

      body("reason")
        .trim()
        .notEmpty()
        .withMessage("Reason is required.")
        .isLength({ max: 200 })
        .withMessage("Reason cannot exceed 200 characters."),

      body("date").isISO8601().withMessage("A valid date is required."),
    ],
    validateRequest,
    createPopulationChange
  );

module.exports = router;