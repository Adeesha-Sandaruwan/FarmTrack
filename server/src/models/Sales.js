const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
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
      required: [true, "Sale category is required"],
      enum: ["egg", "chicken", "other"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },

    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
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

// Automatically calculate total amount
salesSchema.pre("validate", function (next) {
  if (this.quantity != null && this.unitPrice != null) {
    this.amount = Number(this.quantity) * Number(this.unitPrice);
  }

  next();
});

salesSchema.index({ farm: 1, date: -1 });
salesSchema.index({ farm: 1, category: 1 });

module.exports = mongoose.model("Sales", salesSchema);