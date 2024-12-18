const stockfishModel = require("../models/stockfishModel");

const startStockfish = (req, res) => {
    const { userId } = req.body;
    try {
        stockfishModel.startSession(userId);
        res.json({ message: `Stockfish started for user ${userId}` });
    } catch (error) {
        res.status(500).json({ error: `${error}` });
    }
};

const stopStockfish = (req, res) => {
    const { userId } = req.body;
    stockfishModel.stopSession(userId);
    res.json({ message: `Stockfish stopped for user ${userId}` });
};

const useStockfish = async (req, res) => {
    const { userId, fen } = req.body;
    if (!fen) return res.status(400).json({ error: "FEN string is required" });
    try {
        const { evalString } = await stockfishModel.analyzePosition(userId, fen);
        res.json({ evalString });
    } catch (error) {
        res.status(500).json({ error: `Stockfish analysis failed: ${error}` });
    }
};

module.exports = { startStockfish, stopStockfish, useStockfish };