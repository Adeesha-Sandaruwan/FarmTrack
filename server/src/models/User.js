const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    farmName: {
      type: String,
      trim: true,
      minlength: [2, "Farm / flock name must be at least 2 characters"],
      maxlength: [100, "Farm / flock name cannot exceed 100 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [25, "Phone number cannot exceed 25 characters"],
    },
    flockSize: {
      type: String,
      enum: ["under-500", "500-2000", "2000-10000", "over-10000"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "manager", "worker"],
        message: "Role must be admin, manager, or worker",
      },
      default: "worker",
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);