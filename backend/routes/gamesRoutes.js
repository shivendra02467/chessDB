const express = require("express");
const { getGamesByKeywords } = require("../controllers/gamesController");
const { authMiddleware } = require("./auth.js");

const router = express.Router();

router.post("/", authMiddleware, getGamesByKeywords);

module.exports = router;
