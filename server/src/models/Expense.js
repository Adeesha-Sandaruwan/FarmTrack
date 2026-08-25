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
      required: false,
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
      min: [0, "Amount cannot be negative"],
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
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

module.exports = mongoose.model("Expense", expenseSchema);