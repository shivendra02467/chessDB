const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const gamesRoutes = require("./routes/gamesRoutes");
const stockfishRoutes = require("./routes/stockfishRoutes");

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api", gamesRoutes)
app.use("/api/users", userRoutes);
app.use("/api", stockfishRoutes);

connectDB();
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));