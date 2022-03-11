const express = require("express");
const router = express.Router();

const DashboardController = require("./dashboard.controller");

const checkAccessKey = require("../../checkAccess");

//get stock detail
router.get("/", checkAccessKey(), DashboardController.dashboard);

module.exports = router;
