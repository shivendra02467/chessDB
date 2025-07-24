const express = require("express");
const { registerUser, loginUser, verifyUser } = require("../controllers/userController");
const { authMiddleware } = require("./auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, verifyUser);

module.exports = router;