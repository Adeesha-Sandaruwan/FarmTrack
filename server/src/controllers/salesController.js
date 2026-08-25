const Sales = require("../models/Sales");

// Create sale
const createSale = async (req, res, next) => {
  try {
    const sale = await Sales.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// Get all sales
const getSales = async (req, res, next) => {
  try {
    const sales = await Sales.find()
      .populate("farm", "name")
      .populate("flock", "batchCode breed flockType")
      .populate("createdBy", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

// Get sale by ID
const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sales.findById(req.params.id)
      .populate("farm", "name")
      .populate("flock", "batchCode breed flockType")
      .populate("createdBy", "name email");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// Update sale
const updateSale = async (req, res, next) => {
  try {
    const sale = await Sales.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// Delete sale
const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sales.findByIdAndDelete(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
};