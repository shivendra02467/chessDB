import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DatabasePage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [games, setGames] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [token,] = useState(() => localStorage.getItem('token'));

    useEffect(() => {
        document.title = 'Database';
    }, []);

    const fetchGames = async (page) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/games`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ searchQuery, page }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message);
            } else {
                setGames(data.games)
            }
        } catch (error) {
            console.error("Error fetching games:", error);
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: "20px",
            gap: '10px',

        }}>
            <h1>Game Database</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter keywords to search games"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { fetchGames(1) } }}
                    style={{
                        width: "300px",
                        padding: "5px",
                    }}
                />
                <button
                    onClick={() => fetchGames(1)}
                    style={{
                        padding: "5px 15px",
                        cursor: "pointer",
                    }}
                >
                    Search
                </button>
            </div>
            <div>
                {games.length > 0 && (
                    <button onClick={loadNextPage} disabled={loading}>
                        {loading ? "Loading..." : "Load Next Page"}
                    </button>
                )}
                {searchQuery && games.length == 0 && <p>No games found</p>}
                {loading && <p>Loading games...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: 'center' }}>
                {
                    games.map((game, index) => (
                        <div
                            key={index}
                            style={{
                                border: "2px solid #888888",
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
                                    padding: "8px 12px",
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
