const mongoose = require("mongoose");


const expenseSchema = new mongoose.Schema(

  {

    // Related farm
    farm: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "Farm",

      required: true,

      index: true,

    },


    // Related flock (optional)
    // Used for flock-level cost calculation
    flock: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "Flock",

      required: false,

      index: true,

    },


    // Expense type
    category: {

      type: String,

      required: [
        true,
        "Expense category is required"
      ],

      enum: [

        "feed",

        "medicine",

        "labour",

        "electricity",

        "water",

        "transportation",

        "equipment",

        "other"

      ],

    },


    // Expense amount
    amount: {

      type: Number,

      required: [
        true,
        "Expense amount is required"
      ],

      min: [
        0,
        "Amount cannot be negative"
      ],

    },


    // Expense date
    date: {

      type: Date,

      required: true,

      default: Date.now,

    },


    // Description
    description: {

      type: String,

      trim: true,

      maxlength: [
        500,
        "Description cannot exceed 500 characters"
      ],

      default: "",

    },


    // User who created expense
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



module.exports = mongoose.model(
  "Expense",
  expenseSchema
);