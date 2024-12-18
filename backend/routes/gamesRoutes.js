const express = require("express");
const { getGamesByKeywords } = require("../controllers/gamesController");

const router = express.Router();

router.post("/games", getGamesByKeywords);

module.exports = router;
