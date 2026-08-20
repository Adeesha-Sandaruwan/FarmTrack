const mongoose = require("mongoose");

const flockSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    batchCode: {
      type: String,
      required: [true, "Batch code is required"],
      trim: true,
      uppercase: true,
      maxlength: [30, "Batch code cannot exceed 30 characters"],
    },
    breed: {
      type: String,
      required: [true, "Breed is required"],
      trim: true,
      maxlength: [60, "Breed cannot exceed 60 characters"],
    },
    flockType: {
      type: String,
      required: [true, "Flock type is required"],
      enum: ["layer", "broiler", "breeder", "other"],
    },
    source: {
      type: String,
      trim: true,
      maxlength: [100, "Source cannot exceed 100 characters"],
      default: "",
    },
    placementDate: {
      type: Date,
      required: [true, "Placement date is required"],
    },
    initialPopulation: {
      type: Number,
      required: [true, "Initial population is required"],
      min: [1, "Initial population must be at least 1"],
    },
    currentPopulation: {
      type: Number,
      required: true,
      min: [0, "Current population cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "closed", "sold"],
      default: "active",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

flockSchema.index({ farm: 1, batchCode: 1 }, { unique: true });

module.exports = mongoose.model("Flock", flockSchema);