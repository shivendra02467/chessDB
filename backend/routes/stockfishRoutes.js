const express = require("express");
const { startStockfish, stopStockfish, useStockfish } = require("../controllers/stockfishController");
const { authMiddleware } = require("./auth");

const router = express.Router();

router.post("/analyze", authMiddleware, useStockfish);

module.exports = router;

