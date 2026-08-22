const Flock = require("../models/Flock");
const HealthRecord = require("../models/HealthRecord");
const asyncHandler = require("../utils/asyncHandler");

const getFarmId = (req, res) => {
  if (!req.user.farm) {
    res.status(404);
    throw new Error("No farm is assigned to this account.");
  }

  return req.user.farm;
};

const findFlock = (flockId, farmId) =>
  Flock.findOne({ _id: flockId, farm: farmId });

// GET /api/health-records
const getHealthRecords = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);
  const query = { farm: farmId };

  if (req.query.flock) {
    query.flock = req.query.flock;
  }

  if (req.query.type) {
    query.recordType = req.query.type;
  }

  const records = await HealthRecord.find(query)
    .sort({ date: -1, createdAt: -1 })
    .populate("flock", "batchCode breed")
    .populate("recordedBy", "name");

  res.status(200).json({
    success: true,
    count: records.length,
    records,
  });
});

// POST /api/health-records
const createHealthRecord = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);
  const flock = await findFlock(req.body.flock, farmId);

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  const record = await HealthRecord.create({
    farm: farmId,
    flock: flock._id,
    recordType: req.body.recordType,
    title: req.body.title,
    date: req.body.date,
    description: req.body.description || "",
    medicineOrVaccine: req.body.medicineOrVaccine || "",
    dosage: req.body.dosage || "",
    quantity: req.body.quantity || null,
    severity: req.body.severity || "low",
    nextDueDate: req.body.nextDueDate || null,
    recordedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Health record saved successfully.",
    record,
  });
});

// PATCH /api/health-records/:id
const updateHealthRecord = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const record = await HealthRecord.findOne({
    _id: req.params.id,
    farm: farmId,
  });

  if (!record) {
    res.status(404);
    throw new Error("Health record not found.");
  }

  const fields = [
    "recordType",
    "title",
    "date",
    "description",
    "medicineOrVaccine",
    "dosage",
    "quantity",
    "severity",
    "nextDueDate",
  ];

  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      record[field] = req.body[field];
    }
  });

  await record.save();

  res.status(200).json({
    success: true,
    message: "Health record updated successfully.",
    record,
  });
});

// DELETE /api/health-records/:id
const deleteHealthRecord = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const record = await HealthRecord.findOne({
    _id: req.params.id,
    farm: farmId,
  });

  if (!record) {
    res.status(404);
    throw new Error("Health record not found.");
  }

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Health record deleted successfully.",
  });
});

module.exports = {
  getHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
};