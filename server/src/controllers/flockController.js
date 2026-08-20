const Flock = require("../models/Flock");
const MortalityRecord = require("../models/MortalityRecord");
const PopulationChange = require("../models/PopulationChange");
const asyncHandler = require("../utils/asyncHandler");

const getFarmId = (req, res) => {
  if (!req.user.farm) {
    res.status(404);
    throw new Error(
      "No farm is assigned to this account. Please create or assign a farm first."
    );
  }

  return req.user.farm;
};

const findFlockForFarm = (flockId, farmId) => {
  return Flock.findOne({
    _id: flockId,
    farm: farmId,
  });
};

// GET /api/flocks
const getFlocks = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const query = { farm: farmId };

  if (req.query.status) {
    query.status = req.query.status;
  }

  const flocks = await Flock.find(query)
    .sort({ placementDate: -1 })
    .populate("createdBy", "name email");

  res.status(200).json({
    success: true,
    count: flocks.length,
    flocks,
  });
});

// GET /api/flocks/:id
const getFlockById = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const flock = await findFlockForFarm(req.params.id, farmId);

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  res.status(200).json({
    success: true,
    flock,
  });
});

// POST /api/flocks
const createFlock = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const {
    batchCode,
    breed,
    flockType,
    source,
    placementDate,
    initialPopulation,
    notes,
  } = req.body;

  const flock = await Flock.create({
    farm: farmId,
    batchCode,
    breed,
    flockType,
    source,
    placementDate,
    initialPopulation: Number(initialPopulation),
    currentPopulation: Number(initialPopulation),
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Flock created successfully.",
    flock,
  });
});

// PATCH /api/flocks/:id
const updateFlock = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const flock = await findFlockForFarm(req.params.id, farmId);

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  const allowedFields = [
    "batchCode",
    "breed",
    "flockType",
    "source",
    "placementDate",
    "status",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      flock[field] = req.body[field];
    }
  });

  await flock.save();

  res.status(200).json({
    success: true,
    message: "Flock updated successfully.",
    flock,
  });
});

// DELETE /api/flocks/:id
const deleteFlock = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const flock = await findFlockForFarm(req.params.id, farmId);

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  await MortalityRecord.deleteMany({ flock: flock._id });
  await PopulationChange.deleteMany({ flock: flock._id });
  await flock.deleteOne();

  res.status(200).json({
    success: true,
    message: "Flock and related records deleted successfully.",
  });
});

// GET /api/flocks/:id/mortality
const getMortalityRecords = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const flock = await findFlockForFarm(req.params.id, farmId);

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  const records = await MortalityRecord.find({ flock: flock._id })
    .sort({ date: -1, createdAt: -1 })
    .populate("recordedBy", "name");

  res.status(200).json({
    success: true,
    count: records.length,
    records,
  });
});

// POST /api/flocks/:id/mortality
const createMortalityRecord = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const flock = await findFlockForFarm(req.params.id, farmId);

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  if (flock.status !== "active") {
    res.status(400);
    throw new Error("Mortality can only be recorded for an active flock.");
  }

  const mortalityCount = Number(req.body.count);

  if (mortalityCount > flock.currentPopulation) {
    res.status(400);
    throw new Error("Mortality count cannot exceed the current population.");
  }

  const record = await MortalityRecord.create({
    farm: farmId,
    flock: flock._id,
    date: req.body.date,
    count: mortalityCount,
    cause: req.body.cause || "Unknown",
    notes: req.body.notes || "",
    recordedBy: req.user._id,
  });

  flock.currentPopulation -= mortalityCount;
  await flock.save();

  res.status(201).json({
    success: true,
    message: "Mortality record added and population updated.",
    record,
    currentPopulation: flock.currentPopulation,
  });
});

// GET /api/flocks/:id/population-changes
const getPopulationChanges = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const flock = await findFlockForFarm(req.params.id, farmId);

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  const changes = await PopulationChange.find({ flock: flock._id })
    .sort({ date: -1, createdAt: -1 })
    .populate("recordedBy", "name");

  res.status(200).json({
    success: true,
    count: changes.length,
    changes,
  });
});

// POST /api/flocks/:id/population-changes
const createPopulationChange = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const flock = await findFlockForFarm(req.params.id, farmId);

  if (!flock) {
    res.status(404);
    throw new Error("Flock not found.");
  }

  if (flock.status !== "active") {
    res.status(400);
    throw new Error(
      "Population changes can only be recorded for an active flock."
    );
  }

  const quantity = Number(req.body.quantity);
  const populationDifference =
    req.body.direction === "increase" ? quantity : -quantity;

  const newPopulation = flock.currentPopulation + populationDifference;

  if (newPopulation < 0) {
    res.status(400);
    throw new Error("This change would make the population negative.");
  }

  const change = await PopulationChange.create({
    farm: farmId,
    flock: flock._id,
    changeType: req.body.changeType,
    quantity,
    direction: req.body.direction,
    reason: req.body.reason,
    date: req.body.date,
    recordedBy: req.user._id,
  });

  flock.currentPopulation = newPopulation;
  await flock.save();

  res.status(201).json({
    success: true,
    message: "Population change recorded successfully.",
    change,
    currentPopulation: flock.currentPopulation,
  });
});

module.exports = {
  getFlocks,
  getFlockById,
  createFlock,
  updateFlock,
  deleteFlock,
  getMortalityRecords,
  createMortalityRecord,
  getPopulationChanges,
  createPopulationChange,
};