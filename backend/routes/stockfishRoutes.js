const express = require("express");
const { startStockfish, stopStockfish, useStockfish } = require("../controllers/stockfishController");

const router = express.Router();

router.post("/stockfish/start", startStockfish);
router.post("/stockfish/stop", stopStockfish);
router.post("/stockfish", useStockfish);

module.exports = router;

