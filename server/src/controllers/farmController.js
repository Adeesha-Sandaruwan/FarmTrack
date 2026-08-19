const Farm = require("../models/Farm");
const asyncHandler = require("../utils/asyncHandler");

const getMyFarm = asyncHandler(async (req, res) => {
  if (!req.user.farm) {
    res.status(404);
    throw new Error("No farm is assigned to this user.");
  }

  const farm = await Farm.findById(req.user.farm);

  if (!farm) {
    res.status(404);
    throw new Error("Farm not found.");
  }

  res.status(200).json({
    success: true,
    farm,
  });
});

const updateMyFarm = asyncHandler(async (req, res) => {
  if (!req.user.farm) {
    res.status(404);
    throw new Error("No farm is assigned to this user.");
  }

  const farm = await Farm.findById(req.user.farm);

  if (!farm) {
    res.status(404);
    throw new Error("Farm not found.");
  }

  const allowedFields = ["name", "location", "phoneNumber"];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      farm[field] = req.body[field];
    }
  });

  await farm.save();

  res.status(200).json({
    success: true,
    message: "Farm updated successfully.",
    farm,
  });
});

module.exports = {
  getMyFarm,
  updateMyFarm,
};