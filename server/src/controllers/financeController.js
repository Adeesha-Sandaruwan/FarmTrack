const Sales = require("../models/Sales");
const Expense = require("../models/Expense");
const Flock = require("../models/Flock");
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

const getDateMatch = (query) => {
  const match = {};

  if (query.from || query.to) {
    match.date = {};

    if (query.from) {
      match.date.$gte = new Date(query.from);
    }

    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      match.date.$lte = toDate;
    }
  }

  return match;
};

// GET /api/finance/summary
const getFinanceSummary = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const dateMatch = getDateMatch(req.query);

  const salesMatch = {
    farm: farmId,
    ...dateMatch,
  };

  const expenseMatch = {
    farm: farmId,
    ...dateMatch,
  };

  const [
    salesSummary,
    expenseSummary,
    revenueByCategory,
    expenseByCategory,
    monthlyTrend,
    flockProfitability,
    flockCount,
  ] = await Promise.all([
    Sales.aggregate([
      { $match: salesMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]),

    Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]),

    Sales.aggregate([
      { $match: salesMatch },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),

    Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),

    Sales.aggregate([
      { $match: salesMatch },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),

    Sales.aggregate([
      {
        $match: {
          ...salesMatch,
          flock: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$flock",
          revenue: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "expenses",
          let: { flockId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$flock", "$$flockId"] },
                    { $eq: ["$farm", farmId] },
                  ],
                },
              },
            },
          ],
          as: "expenses",
        },
      },
      {
        $addFields: {
          expenses: {
            $sum: "$expenses.amount",
          },
        },
      },
      {
        $addFields: {
          profit: {
            $subtract: ["$revenue", "$expenses"],
          },
        },
      },
      {
        $lookup: {
          from: "flocks",
          localField: "_id",
          foreignField: "_id",
          as: "flock",
        },
      },
      {
        $unwind: {
          path: "$flock",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          batchCode: "$flock.batchCode",
          revenue: 1,
          expenses: 1,
          profit: 1,
        },
      },
      {
        $sort: {
          profit: -1,
        },
      },
    ]),

    Flock.countDocuments({
      farm: farmId,
    }),
  ]);

  const totalRevenue = salesSummary[0]?.totalRevenue || 0;
  const totalExpenses = expenseSummary[0]?.totalExpenses || 0;
  const profit = totalRevenue - totalExpenses;

  const profitMargin =
    totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const formattedMonthlyTrend = monthlyTrend.map((item) => ({
    year: item._id.year,
    month: item._id.month,
    revenue: item.revenue,
  }));

  res.status(200).json({
    success: true,

    data: {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin: Number(profitMargin.toFixed(2)),

      salesTransactionCount:
        salesSummary[0]?.transactionCount || 0,

      expenseTransactionCount:
        expenseSummary[0]?.transactionCount || 0,

      flockCount,

      revenueByCategory: revenueByCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),

      expenseByCategory: expenseByCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),

      monthlyTrend: formattedMonthlyTrend,

      flockProfitability,
    },
  });
});

module.exports = {
  getFinanceSummary,
};