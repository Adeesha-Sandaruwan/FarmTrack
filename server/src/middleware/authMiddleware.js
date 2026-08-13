const jwt = require("jsonwebtoken");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authorizationHeader = req.headers.authorization;

  if (
    authorizationHeader &&
    authorizationHeader.startsWith("Bearer ")
  ) {
    token = authorizationHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("User account is unavailable.");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired authentication token.");
  }
});

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error("You do not have permission to perform this action.")
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};