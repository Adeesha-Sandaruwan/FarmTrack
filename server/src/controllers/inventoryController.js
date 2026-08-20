const InventoryItem = require("../models/InventoryItem");
const StockTransaction = require("../models/StockTransaction");
const asyncHandler = require("../utils/asyncHandler");

const getFarmId = (req, res) => {
  if (!req.user.farm) {
    res.status(404);
    throw new Error("No farm is assigned to this account.");
  }

  return req.user.farm;
};

const findItemForFarm = (itemId, farmId) => {
  return InventoryItem.findOne({
    _id: itemId,
    farm: farmId,
  });
};

// GET /api/inventory
const getInventoryItems = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const query = {
    farm: farmId,
    status: req.query.status || "active",
  };

  if (req.query.category) {
    query.category = req.query.category;
  }

  const items = await InventoryItem.find(query)
    .sort({ category: 1, name: 1 })
    .populate("createdBy", "name");

  res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
});

// GET /api/inventory/:id
const getInventoryItemById = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const item = await findItemForFarm(req.params.id, farmId);

  if (!item) {
    res.status(404);
    throw new Error("Inventory item not found.");
  }

  res.status(200).json({
    success: true,
    item,
  });
});

// POST /api/inventory
const createInventoryItem = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const openingStock = Number(req.body.openingStock || 0);

  const item = await InventoryItem.create({
    farm: farmId,
    name: req.body.name,
    category: req.body.category,
    unit: req.body.unit,
    currentStock: openingStock,
    reorderLevel: Number(req.body.reorderLevel || 0),
    unitCost: Number(req.body.unitCost || 0),
    supplier: req.body.supplier || "",
    expiryDate: req.body.expiryDate || null,
    notes: req.body.notes || "",
    createdBy: req.user._id,
  });

  if (openingStock > 0) {
    await StockTransaction.create({
      farm: farmId,
      item: item._id,
      transactionType: "stock-in",
      direction: "increase",
      quantity: openingStock,
      unitCost: item.unitCost,
      date: new Date(),
      reference: "Opening balance",
      notes: "Initial stock when item was created.",
      recordedBy: req.user._id,
    });
  }

  res.status(201).json({
    success: true,
    message: "Inventory item created successfully.",
    item,
  });
});

// PATCH /api/inventory/:id
const updateInventoryItem = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const item = await findItemForFarm(req.params.id, farmId);

  if (!item) {
    res.status(404);
    throw new Error("Inventory item not found.");
  }

  const allowedFields = [
    "name",
    "category",
    "unit",
    "reorderLevel",
    "unitCost",
    "supplier",
    "expiryDate",
    "status",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      item[field] = req.body[field];
    }
  });

  await item.save();

  res.status(200).json({
    success: true,
    message: "Inventory item updated successfully.",
    item,
  });
});

// DELETE /api/inventory/:id
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const item = await findItemForFarm(req.params.id, farmId);

  if (!item) {
    res.status(404);
    throw new Error("Inventory item not found.");
  }

  await StockTransaction.deleteMany({ item: item._id });
  await item.deleteOne();

  res.status(200).json({
    success: true,
    message: "Inventory item and transaction history deleted successfully.",
  });
});

// GET /api/inventory/:id/transactions
const getStockTransactions = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const item = await findItemForFarm(req.params.id, farmId);

  if (!item) {
    res.status(404);
    throw new Error("Inventory item not found.");
  }

  const transactions = await StockTransaction.find({ item: item._id })
    .sort({ date: -1, createdAt: -1 })
    .populate("recordedBy", "name");

  res.status(200).json({
    success: true,
    count: transactions.length,
    transactions,
  });
});

// POST /api/inventory/:id/transactions
const createStockTransaction = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const item = await findItemForFarm(req.params.id, farmId);

  if (!item) {
    res.status(404);
    throw new Error("Inventory item not found.");
  }

  if (item.status !== "active") {
    res.status(400);
    throw new Error("Stock transactions can only be recorded for active items.");
  }

  const quantity = Number(req.body.quantity);
  const stockChange =
    req.body.direction === "increase" ? quantity : -quantity;

  const newStock = item.currentStock + stockChange;

  if (newStock < 0) {
    res.status(400);
    throw new Error("This transaction would make stock negative.");
  }

  const transaction = await StockTransaction.create({
    farm: farmId,
    item: item._id,
    transactionType: req.body.transactionType,
    direction: req.body.direction,
    quantity,
    unitCost: Number(req.body.unitCost || 0),
    date: req.body.date,
    reference: req.body.reference || "",
    notes: req.body.notes || "",
    recordedBy: req.user._id,
  });

  item.currentStock = newStock;

  if (req.body.unitCost) {
    item.unitCost = Number(req.body.unitCost);
  }

  await item.save();

  res.status(201).json({
    success: true,
    message: "Stock transaction recorded successfully.",
    transaction,
    currentStock: item.currentStock,
  });
});

module.exports = {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getStockTransactions,
  createStockTransaction,
};