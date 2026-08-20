const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: true,
      enum: ["feed", "medicine", "vaccine", "equipment", "supplies"],
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "litre", "ml", "bag", "bottle", "dose", "piece", "box"],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, "Current stock cannot be negative"],
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: [0, "Reorder level cannot be negative"],
    },
    unitCost: {
      type: Number,
      default: 0,
      min: [0, "Unit cost cannot be negative"],
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: [100, "Supplier cannot exceed 100 characters"],
      default: "",
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
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

inventoryItemSchema.index({ farm: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);