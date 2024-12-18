const { fetchGamesByKeywords } = require("../models/gamesModel");

async function getGamesByKeywords(req, res) {
    try {
        const { searchQuery, page } = req.body;
        if (!searchQuery || typeof searchQuery !== "string") {
            return res.status(400).json({ message: "Invalid or missing keywords in request body" });
        }
        const games = await fetchGamesByKeywords(searchQuery, page);
        res.status(200).json({ games });
    } catch (error) {
        console.error("Error in getGamesByKeywords controller:", error);
        res.status(500).json({ message: "Failed to fetch games" });
    }
}

module.exports = { getGamesByKeywords };
