const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },

    category: {
      type: String,
      required: [true, "Expense category is required"],
      enum: [
        "feed",
        "medicine",
        "labour",
        "electricity",
        "water",
        "transportation",
        "equipment",
        "other",
      ],
    },

    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0, "Expense amount cannot be negative"],
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
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

expenseSchema.index({ farm: 1, date: -1 });
expenseSchema.index({ farm: 1, category: 1 });

module.exports = mongoose.model("Expense", expenseSchema);