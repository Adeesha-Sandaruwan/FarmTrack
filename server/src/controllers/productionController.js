const Flock = require("../models/Flock");
const ProductionRecord = require("../models/ProductionRecord");
const asyncHandler = require("../utils/asyncHandler");

const getFarmId = (req, res) => {
  if (!req.user.farm) {
    res.status(404);
    throw new Error("No farm is assigned to this account.");
  }

  return req.user.farm;
};

const getProductionRecords = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);
  const query = { farm: farmId };

  if (req.query.flock) {
    query.flock = req.query.flock;
  }

  const records = await ProductionRecord.find(query)
    .sort({ date: -1, createdAt: -1 })
    .populate("flock", "batchCode breed")
    .populate("recordedBy", "name");

  res.status(200).json({
    success: true,
    count: records.length,
    records,
  });
});

const createProductionRecord = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const flock = await Flock.findOne({
    _id: req.body.flock,
    farm: farmId,
  });

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  if (flock.status !== "active") {
    res.status(400);
    throw new Error("Production can only be recorded for an active flock.");
  }

  const eggCount = Number(req.body.eggCount);
  const damagedEggs = Number(req.body.damagedEggs || 0);

  if (damagedEggs > eggCount) {
    res.status(400);
    throw new Error("Damaged eggs cannot exceed total egg count.");
  }

  const record = await ProductionRecord.create({
    farm: farmId,
    flock: flock._id,
    date: req.body.date,
    eggCount,
    damagedEggs,
    averageBirdWeight: req.body.averageBirdWeight || null,
    notes: req.body.notes || "",
    recordedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Production record saved successfully.",
    record,
  });
});

const updateProductionRecord = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const record = await ProductionRecord.findOne({
    _id: req.params.id,
    farm: farmId,
  });

  if (!record) {
    res.status(404);
    throw new Error("Production record not found.");
  }

  const allowedFields = [
    "date",
    "eggCount",
    "damagedEggs",
    "averageBirdWeight",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      record[field] = req.body[field];
    }
  });

  if (Number(record.damagedEggs) > Number(record.eggCount)) {
    res.status(400);
    throw new Error("Damaged eggs cannot exceed total egg count.");
  }

  await record.save();

  res.status(200).json({
    success: true,
    message: "Production record updated successfully.",
    record,
  });
});

const deleteProductionRecord = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const record = await ProductionRecord.findOne({
    _id: req.params.id,
    farm: farmId,
  });

  if (!record) {
    res.status(404);
    throw new Error("Production record not found.");
  }

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Production record deleted successfully.",
  });
});

module.exports = {
  getProductionRecords,
  createProductionRecord,
  updateProductionRecord,
  deleteProductionRecord,
};