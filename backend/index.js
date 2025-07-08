const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const gamesRoutes = require("./routes/gamesRoutes");
const stockfishRoutes = require("./routes/stockfishRoutes");
const distDir = path.resolve(__dirname, '../frontend/dist');
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static(distDir, {
    inndex: false,
    setHeaders: res => {
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
        res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    }
}));

app.use("/api", gamesRoutes)
app.use("/api/users", userRoutes);
app.use("/api", stockfishRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

connectDB();
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));