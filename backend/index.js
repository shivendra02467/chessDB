const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const gamesRoutes = require("./routes/gamesRoutes");
const stockfishRoutes = require("./routes/stockfishRoutes");
const challengeRoutes = require('./routes/challengeRoutes');
const { setIO, handleSocket } = require('./controllers/challengeController');

const distDir = path.resolve(__dirname, '../frontend/dist');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

setIO(io);
io.on('connection', handleSocket);

dotenv.config();

app.use(express.json());

app.use(express.static(distDir, {
    index: false,
    setHeaders: res => {
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
        res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    }
}));

app.use("/api/games", gamesRoutes)
app.use("/api/users", userRoutes);
app.use("/api/stockfish", stockfishRoutes);
app.use("/api/challenges", challengeRoutes);

app.get('*', (req, res) => {
    res.set('Cross-Origin-Opener-Policy', 'same-origin');
    res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    res.sendFile(path.join(distDir, 'index.html'));
});

connectDB();
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));