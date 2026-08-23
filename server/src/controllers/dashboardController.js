const Flock = require("../models/Flock");
const MortalityRecord = require("../models/MortalityRecord");
const InventoryItem = require("../models/InventoryItem");
const ProductionRecord = require("../models/ProductionRecord");
const HealthRecord = require("../models/HealthRecord");
const asyncHandler = require("../utils/asyncHandler");

const getFarmId = (req, res) => {
  if (!req.user.farm) {
    res.status(404);
    throw new Error("No farm is assigned to this account.");
  }

  return req.user.farm;
};

const getOverview = asyncHandler(async (req, res) => {
  const farmId = getFarmId(req, res);

  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const nextSevenDays = new Date(todayStart);
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);

  const [
    activeFlocks,
    allFlocks,
    lowStockItems,
    productionToday,
    productionThisWeek,
    mortalityThisWeek,
    healthAlerts,
    upcomingVaccinations,
    recentProduction,
    recentHealthRecords,
    recentMortality,
  ] = await Promise.all([
    Flock.find({ farm: farmId, status: "active" })
      .sort({ placementDate: -1 })
      .select("batchCode breed flockType currentPopulation initialPopulation status"),

    Flock.find({ farm: farmId }).select("currentPopulation initialPopulation"),

    InventoryItem.find({
      farm: farmId,
      status: "active",
      $expr: { $lte: ["$currentStock", "$reorderLevel"] },
    })
      .sort({ currentStock: 1 })
      .select("name category currentStock reorderLevel unit"),

    ProductionRecord.aggregate([
      {
        $match: {
          farm: farmId,
          date: {
            $gte: todayStart,
            $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalEggs: { $sum: "$eggCount" },
          damagedEggs: { $sum: "$damagedEggs" },
        },
      },
    ]),

    ProductionRecord.aggregate([
      {
        $match: {
          farm: farmId,
          date: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: null,
          totalEggs: { $sum: "$eggCount" },
          damagedEggs: { $sum: "$damagedEggs" },
        },
      },
    ]),

    MortalityRecord.aggregate([
      {
        $match: {
          farm: farmId,
          date: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: null,
          totalMortality: { $sum: "$count" },
        },
      },
    ]),

    HealthRecord.find({
      farm: farmId,
      severity: { $in: ["high", "critical"] },
    })
      .sort({ date: -1 })
      .limit(5)
      .populate("flock", "batchCode breed")
      .select("title recordType severity date flock"),

    HealthRecord.find({
      farm: farmId,
      nextDueDate: {
        $gte: todayStart,
        $lte: nextSevenDays,
      },
    })
      .sort({ nextDueDate: 1 })
      .limit(5)
      .populate("flock", "batchCode breed")
      .select("title recordType nextDueDate flock"),

    ProductionRecord.find({ farm: farmId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate("flock", "batchCode breed")
      .select("date eggCount damagedEggs flock"),

    HealthRecord.find({ farm: farmId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate("flock", "batchCode breed")
      .select("title recordType severity date flock"),

    MortalityRecord.find({ farm: farmId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate("flock", "batchCode breed")
      .select("date count cause flock"),
  ]);

  const currentPopulation = allFlocks.reduce(
    (total, flock) => total + flock.currentPopulation,
    0
  );

  const initialPopulation = allFlocks.reduce(
    (total, flock) => total + flock.initialPopulation,
    0
  );

  const today = productionToday[0] || {
    totalEggs: 0,
    damagedEggs: 0,
  };

  const week = productionThisWeek[0] || {
    totalEggs: 0,
    damagedEggs: 0,
  };

  const weeklyMortality = mortalityThisWeek[0]?.totalMortality || 0;

  const recentActivity = [
    ...recentProduction.map((record) => ({
      id: record._id,
      type: "production",
      title: `${record.eggCount} eggs recorded`,
      description: `${record.flock?.batchCode || "Unknown flock"} · ${
        record.damagedEggs
      } damaged eggs`,
      date: record.date,
    })),

    ...recentHealthRecords.map((record) => ({
      id: record._id,
      type: "health",
      title: record.title,
      description: `${record.flock?.batchCode || "Unknown flock"} · ${
        record.recordType
      }`,
      date: record.date,
      severity: record.severity,
    })),

    ...recentMortality.map((record) => ({
      id: record._id,
      type: "mortality",
      title: `${record.count} mortality record${
        record.count === 1 ? "" : "s"
      }`,
      description: `${record.flock?.batchCode || "Unknown flock"} · ${
        record.cause || "Unknown cause"
      }`,
      date: record.date,
    })),
  ]
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .slice(0, 8);

  res.status(200).json({
    success: true,
    overview: {
      generatedAt: now,

      kpis: {
        activeFlocks: activeFlocks.length,
        currentPopulation,
        initialPopulation,
        totalEggsToday: today.totalEggs,
        goodEggsToday: today.totalEggs - today.damagedEggs,
        totalEggsThisWeek: week.totalEggs,
        damagedEggsThisWeek: week.damagedEggs,
        mortalityThisWeek: weeklyMortality,
        mortalityRate:
          initialPopulation > 0
            ? Number(((weeklyMortality / initialPopulation) * 100).toFixed(2))
            : 0,
        lowStockCount: lowStockItems.length,
        healthAlertCount: healthAlerts.length,
        upcomingVaccinationCount: upcomingVaccinations.length,
      },

      activeFlocks,
      lowStockItems,
      healthAlerts,
      upcomingVaccinations,
      recentActivity,
    },
  });
});

module.exports = {
  getOverview,
};