const Expense = require("../models/Expense");


// Create expense
const createExpense = async (req, res, next) => {

    try {

        const expense = await Expense.create({

            ...req.body,

            createdBy: req.user?._id

        });


        res.status(201).json({

            success:true,

            message:"Expense created successfully",

            data:expense

        });


    } catch(error){

        next(error);

    }

};



// Get all expenses
const getExpenses = async(req,res,next)=>{

    try{

        const expenses = await Expense.find()

            .populate("farm","name")

            .populate("flock","batchCode")

            .sort("-createdAt");


        res.status(200).json({

            success:true,

            count:expenses.length,

            data:expenses

        });


    }catch(error){

        next(error);

    }

};



// Get single expense
const getExpenseById = async(req,res,next)=>{

    try{

        const expense = await Expense.findById(req.params.id);


        if(!expense){

            return res.status(404).json({

                message:"Expense not found"

            });

        }


        res.json({

            success:true,

            data:expense

        });


    }catch(error){

        next(error);

    }

};



// Update expense
const updateExpense = async(req,res,next)=>{

    try{

        const expense = await Expense.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new:true,
                runValidators:true
            }

        );


        res.json({

            success:true,

            data:expense

        });


    }catch(error){

        next(error);

    }

};



// Delete expense
const deleteExpense = async(req,res,next)=>{

    try{

        await Expense.findByIdAndDelete(req.params.id);


        res.json({

            success:true,

            message:"Expense deleted"

        });


    }catch(error){

        next(error);

    }

};



module.exports = {

    createExpense,

    getExpenses,

    getExpenseById,

    updateExpense,

    deleteExpense

};