import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DatabasePage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [games, setGames] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchGames = async (page) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/games`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ searchQuery, page }),
            });
            if (!response.ok) {
                throw new Error("Failed to fetch games");
            }
            const data = await response.json();
            setGames(data.games)
        } catch (err) {
            console.error("Error fetching games:", err);
            setError("Failed to load games. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const loadNextPage = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchGames(nextPage);
    };

    const handleViewGame = (gameData) => {
        navigate("/analysis", { state: { gameData } });
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Game Database</h1>
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Enter keywords to search games"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: "300px",
                        padding: "10px",
                        marginRight: "10px",
                    }}
                />
                <button
                    onClick={() => fetchGames(1)}
                    style={{
                        padding: "10px 15px",
                        cursor: "pointer",
                    }}
                >
                    Search
                </button>
            </div>
            {games.length > 0 && (
                <button onClick={loadNextPage} disabled={loading}>
                    {loading ? "Loading..." : "Load Next Page"}
                </button>
            )}
            <p></p>
            {loading && <p>Loading games...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {
                    games.map((game, index) => (
                        <div
                            key={index}
                            style={{
                                border: "2px solid #ddd",
                                padding: "15px",
                                width: "250px",
                                textAlign: "center",
                            }}
                        >
                            <p><strong>Date:</strong> {game.Date || "N/A"}</p>
                            <p><strong>Event:</strong> {game.Event || "N/A"}</p>
                            <p><strong>White:</strong> {game.White || "N/A"}</p>
                            <p><strong>Black:</strong> {game.Black || "N/A"}</p>
                            <p><strong>Result:</strong> {game.Result || "N/A"}</p>
                            <button
                                onClick={() => handleViewGame(game)}
                                style={{
                                    marginTop: "10px",
                                    padding: "8px 12px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                }}
                            >
                                View Game
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default DatabasePage;
