const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
      index: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: ["stock-in", "usage", "adjustment", "wastage"],
    },
    direction: {
      type: String,
      required: true,
      enum: ["increase", "decrease"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.01, "Quantity must be greater than zero"],
    },
    unitCost: {
      type: Number,
      min: [0, "Unit cost cannot be negative"],
      default: 0,
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
      maxlength: [100, "Reference cannot exceed 100 characters"],
      default: "",
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

stockTransactionSchema.index({ item: 1, date: -1 });

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);