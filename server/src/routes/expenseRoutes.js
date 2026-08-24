const express = require("express");

const router = express.Router();

const {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense
} = require("../controllers/expenseController");


// /api/expenses

router.route("/")
    .post(createExpense)
    .get(getExpenses);


router.route("/:id")
    .get(getExpenseById)
    .put(updateExpense)
    .delete(deleteExpense);


module.exports = router;