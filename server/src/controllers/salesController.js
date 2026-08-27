const Sales = require("../models/Sales");
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

// GET /api/sales
const getSales = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const query = {
    farm: farmId,
  };

  if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.flock) {
    query.flock = req.query.flock;
  }

  if (req.query.from || req.query.to) {
    query.date = {};

    if (req.query.from) {
      query.date.$gte = new Date(req.query.from);
    }

    if (req.query.to) {
      const toDate = new Date(req.query.to);
      toDate.setHours(23, 59, 59, 999);
      query.date.$lte = toDate;
    }
  }

  const sales = await Sales.find(query)
    .populate("farm", "name")
    .populate("flock", "batchCode breed flockType")
    .populate("createdBy", "name email")
    .sort({ date: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: sales.length,
    sales,
  });
});

// GET /api/sales/:id
const getSaleById = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const sale = await Sales.findOne({
    _id: req.params.id,
    farm: farmId,
  })
    .populate("farm", "name")
    .populate("flock", "batchCode breed flockType")
    .populate("createdBy", "name email");

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found.");
  }

  res.status(200).json({
    success: true,
    sale,
  });
});

// POST /api/sales
const createSale = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const {
    flock,
    category,
    quantity,
    unitPrice,
    date,
    description,
  } = req.body;

  const sale = await Sales.create({
    farm: farmId,
    flock: flock || null,
    category,
    quantity: Number(quantity),
    unitPrice: Number(unitPrice),
    date: date || new Date(),
    description: description || "",
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Sale recorded successfully.",
    sale,
  });
});

// PATCH /api/sales/:id
const updateSale = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const sale = await Sales.findOne({
    _id: req.params.id,
    farm: farmId,
  });

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found.");
  }

  const allowedFields = [
    "flock",
    "category",
    "quantity",
    "unitPrice",
    "date",
    "description",
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      sale[field] = req.body[field];
    }
  });

  await sale.save();

  res.status(200).json({
    success: true,
    message: "Sale updated successfully.",
    sale,
  });
});

// DELETE /api/sales/:id
const deleteSale = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const sale = await Sales.findOne({
    _id: req.params.id,
    farm: farmId,
  });

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found.");
  }

  await sale.deleteOne();

  res.status(200).json({
    success: true,
    message: "Sale deleted successfully.",
  });
});

module.exports = {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
};