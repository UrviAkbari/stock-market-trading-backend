const express = require("express");
const router = express.Router();

const TransactionController = require("./transaction.controller");

const checkAccessKey = require("../../checkAccess");

//get stock detail
router.post("/", checkAccessKey(), TransactionController.transaction);

//get user transaction history
router.get("/", checkAccessKey(), TransactionController.getHistory);

module.exports = router;
