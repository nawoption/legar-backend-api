const express = require("express");
const { getWarningTitles } = require("../controllers/warningController");

const router = express.Router();

router.get("/", getWarningTitles);

module.exports = router;
