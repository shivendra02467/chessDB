const { getDB } = require("../config/db");

async function fetchGamesByKeywords(searchQuery, page) {
    try {
        const db = getDB();
        const collection = db.collection("games");
        const keywords = searchQuery.split(" ").map((keyword) => keyword.trim()).filter(Boolean);

        const searchConditions = keywords.map((keyword) => ({
            $or: [
                { White: { $regex: keyword, $options: "i" } },
                { Black: { $regex: keyword, $options: "i" } },
            ],
        }));

        const query = searchConditions.length > 0 ? { $and: searchConditions } : {};
        const pageNumber = parseInt(page) || 1
        const games = await collection.find(query).sort({ Date: -1 }).skip((pageNumber - 1) * 20).limit(20).toArray();

        return games;
    } catch (error) {
        console.error("Error fetching games:", error);
        throw error;
    }
}

module.exports = { fetchGamesByKeywords };
