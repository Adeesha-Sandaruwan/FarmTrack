const mongoose = require("mongoose");

const mortalityRecordSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    flock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flock",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    count: {
      type: Number,
      required: [true, "Mortality count is required"],
      min: [1, "Mortality count must be at least 1"],
    },
    cause: {
      type: String,
      trim: true,
      maxlength: [100, "Cause cannot exceed 100 characters"],
      default: "Unknown",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mortalityRecordSchema.index({ flock: 1, date: -1 });

module.exports = mongoose.model("MortalityRecord", mortalityRecordSchema);