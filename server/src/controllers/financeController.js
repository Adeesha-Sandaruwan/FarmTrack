const Sales = require("../models/Sales");
const Expense = require("../models/Expense");


// Get finance summary
const getFinanceSummary = async (req, res, next) => {

    try {

        const salesResult = await Sales.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount"
                    }
                }
            }
        ]);


        const expenseResult = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalExpenses: {
                        $sum: "$amount"
                    }
                }
            }
        ]);


        const totalRevenue =
            salesResult[0]?.totalRevenue || 0;


        const totalExpenses =
            expenseResult[0]?.totalExpenses || 0;


        const profit =
            totalRevenue - totalExpenses;



        res.status(200).json({

            success: true,

            data: {

                totalRevenue,

                totalExpenses,

                profit

            }

        });


    } catch(error){

        next(error);

    }

};



module.exports = {
    getFinanceSummary
};