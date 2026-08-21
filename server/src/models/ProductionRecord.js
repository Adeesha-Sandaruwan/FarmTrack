const mongoose = require("mongoose");

const productionRecordSchema = new mongoose.Schema(
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
      required: true,
    },
    eggCount: {
      type: Number,
      required: [true, "Egg count is required"],
      min: [0, "Egg count cannot be negative"],
    },
    damagedEggs: {
      type: Number,
      default: 0,
      min: [0, "Damaged eggs cannot be negative"],
    },
    averageBirdWeight: {
      type: Number,
      default: null,
      min: [0, "Average bird weight cannot be negative"],
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

productionRecordSchema.index({ farm: 1, flock: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("ProductionRecord", productionRecordSchema);