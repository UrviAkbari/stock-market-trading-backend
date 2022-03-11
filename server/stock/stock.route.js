const express = require("express");
const router = express.Router();

const StockController = require("./stock.controller");

const checkAccessKey = require("../../checkAccess");

//get stock detail
router.get("/", checkAccessKey(), StockController.index);

//store stock
router.post("/", checkAccessKey(), StockController.store);

module.exports = router;
