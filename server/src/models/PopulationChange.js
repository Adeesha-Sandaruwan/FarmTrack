const mongoose = require("mongoose");

const populationChangeSchema = new mongoose.Schema(
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
    changeType: {
      type: String,
      required: true,
      enum: ["addition", "removal", "adjustment"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    direction: {
      type: String,
      required: true,
      enum: ["increase", "decrease"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      maxlength: [200, "Reason cannot exceed 200 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
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

populationChangeSchema.index({ flock: 1, date: -1 });

module.exports = mongoose.model("PopulationChange", populationChangeSchema);