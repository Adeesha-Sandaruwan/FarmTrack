const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const userResponse = (user) => ({
  id: user._id,
  farmName: user.farmName,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  flockSize: user.flockSize,
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

const register = asyncHandler(async (req, res) => {
  const { farmName, name, email, phoneNumber, flockSize, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({
    farmName,
    name,
    email,
    phoneNumber,
    flockSize,
    password,
    role: "worker",
  });

  sendAuthResponse(res, 201, user, "Registration successful.");
});

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