export const analyzeGame = async (userId, fen) => {
    const response = await fetch("/api/stockfish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, fen }),
    });
    return response.json();
};

