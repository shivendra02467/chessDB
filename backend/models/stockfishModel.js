const { spawn } = require("child_process");

class StockfishModel {
    constructor() {
        this.sessions = new Map();
    }

    startSession(userId) {
        if (this.sessions.has(userId)) {
            throw new Error("You already have an active analysis session.");
        }
        console.log(`Starting Stockfish for user ${userId}`);
        const stockfish = spawn("/home/kush/chessDB/backend/models/stockfish-17-x86-64-avx2");
        stockfish.stdout.on("data", (data) => {
            console.log(`Stockfish [${userId}]: ${data}`);
        });
        stockfish.stderr.on("data", (data) => {
            console.error(`Stockfish Error [${userId}]: ${data}`);
        });
        stockfish.stdin.write(`uci\nucinewgame\n`);
        this.sessions.set(userId, stockfish);
    }

    stopSession(userId) {
        if (this.sessions.has(userId)) {
            console.log(`Stopping Stockfish for user ${userId}`);
            const stockfish = this.sessions.get(userId);
            stockfish.kill();
            this.sessions.delete(userId);
        }
    }

    sendCommand(userId, command) {
        return new Promise((resolve, reject) => {
            const stockfish = this.sessions.get(userId);
            if (stockfish) {
                let output = "";
                stockfish.stdin.write(`${command}\n`);
                const onData = (data) => {
                    output += data.toString();
                    if (output.includes("bestmove")) {
                        stockfish.stdout.removeListener("data", onData);
                        resolve(output);
                    }
                };
                stockfish.stdout.on("data", onData);
                stockfish.stderr.on("data", (err) => {
                    stockfish.stdout.removeListener("data", onData);
                    reject(err.toString());
                });
            } else {
                console.error(`Stockfish session for user ${userId} not found.`);
            }
        });
    }

    async analyzePosition(userId, fen) {
        try {
            const stockfish = this.sessions.get(userId);
            stockfish.stdin.write(`position fen ${fen}\n`);
            const evalString = await this.sendCommand(userId, `go depth 20`);
            return { evalString };
        } catch (error) {
            console.error("Error analyzing position:", error);
            throw new Error("Failed to analyze position");
        }
    }
}

module.exports = new StockfishModel();
