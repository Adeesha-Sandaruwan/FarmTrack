const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  farm: user.farm,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const sendAuthResponse = (res, statusCode, user, message) => {
  res.status(statusCode).json({
    success: true,
    message,
    token: generateToken(user._id),
    user: userResponse(user),
  });
};

// POST /api/auth/register
// Public registrations always become workers for security.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "worker",
  });

  sendAuthResponse(res, 201, user, "Registration successful.");
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated.");
  }

  sendAuthResponse(res, 200, user, "Login successful.");
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: userResponse(req.user),
  });
});

module.exports = {
  register,
  login,
  getMe,
};