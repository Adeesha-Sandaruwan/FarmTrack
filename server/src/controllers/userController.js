const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  farm: user.farm,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users: users.map(safeUser),
  });
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.status(200).json({
    success: true,
    user: safeUser(user),
  });
});

// POST /api/users
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, farm } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    farm: farm || null,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully.",
    user: safeUser(user),
  });
});

// PATCH /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const allowedFields = ["name", "email", "role", "farm", "isActive"];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      user[field] = req.body[field];
    }
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    user: safeUser(user),
  });
});

// DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (user._id.equals(req.user._id)) {
    res.status(400);
    throw new Error("You cannot delete your own account.");
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully.",
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};