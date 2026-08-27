const Expense = require("../models/Expense");
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

// GET /api/expenses
const getExpenses = asyncHandler(async (req, res) => {
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

  const expenses = await Expense.find(query)
    .populate("farm", "name")
    .populate("flock", "batchCode breed flockType")
    .populate("createdBy", "name email")
    .sort({ date: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: expenses.length,
    expenses,
  });
});

// GET /api/expenses/:id
const getExpenseById = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const expense = await Expense.findOne({
    _id: req.params.id,
    farm: farmId,
  })
    .populate("farm", "name")
    .populate("flock", "batchCode breed flockType")
    .populate("createdBy", "name email");

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found.");
  }

  res.status(200).json({
    success: true,
    expense,
  });
});

// POST /api/expenses
const createExpense = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const {
    flock,
    category,
    amount,
    date,
    description,
  } = req.body;

  const expense = await Expense.create({
    farm: farmId,
    flock: flock || null,
    category,
    amount: Number(amount),
    date: date || new Date(),
    description: description || "",
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Expense recorded successfully.",
    expense,
  });
});

// PATCH /api/expenses/:id
const updateExpense = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const expense = await Expense.findOne({
    _id: req.params.id,
    farm: farmId,
  });

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found.");
  }

  const allowedFields = [
    "flock",
    "category",
    "amount",
    "date",
    "description",
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      expense[field] = req.body[field];
    }
  });

  await expense.save();

  res.status(200).json({
    success: true,
    message: "Expense updated successfully.",
    expense,
  });
});

// DELETE /api/expenses/:id
const deleteExpense = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const expense = await Expense.findOne({
    _id: req.params.id,
    farm: farmId,
  });

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found.");
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    message: "Expense deleted successfully.",
  });
});

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};