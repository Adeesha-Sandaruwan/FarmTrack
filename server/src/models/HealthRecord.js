const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
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
    recordType: {
      type: String,
      required: true,
      enum: ["vaccination", "treatment", "incident", "weight-check"],
    },
    title: {
      type: String,
      required: [true, "Record title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    medicineOrVaccine: {
      type: String,
      trim: true,
      maxlength: [120, "Medicine or vaccine cannot exceed 120 characters"],
      default: "",
    },
    dosage: {
      type: String,
      trim: true,
      maxlength: [100, "Dosage cannot exceed 100 characters"],
      default: "",
    },
    quantity: {
      type: Number,
      min: [0, "Quantity cannot be negative"],
      default: null,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    nextDueDate: {
      type: Date,
      default: null,
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

healthRecordSchema.index({ flock: 1, date: -1 });

module.exports = mongoose.model("HealthRecord", healthRecordSchema);