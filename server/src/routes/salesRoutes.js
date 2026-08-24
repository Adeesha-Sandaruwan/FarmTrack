const express = require("express");


const router = express.Router();


const {


createSale,

getSales,

getSaleById,

updateSale,

deleteSale


}=require("../controllers/salesController");



// /api/sales

router.route("/")

.post(createSale)

.get(getSales);



router.route("/:id")

.get(getSaleById)

.put(updateSale)

.delete(deleteSale);



module.exports = router;