import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DatabasePage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [games, setGames] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));

    useEffect(() => {
        document.title = 'Database';
    }, []);

    const fetchGames = async (pageToFetch) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/games`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ searchQuery, page: pageToFetch }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message);
            } else {
                setGames(data.games);
            }
        } catch (error) {
            console.error("Error fetching games:", error);
            setError("Failed to connect to the server.");
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
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col items-center py-10 px-4 sm:px-6">

            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Game Database
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Search through thousands of historical matches.
                </p>
            </div>

            <div className="w-full max-w-2xl mb-10">
                <div className="flex gap-2 relative">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by player, event, or year..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchGames(1)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => fetchGames(1)}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="w-full max-w-7xl">
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Fetching games...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center text-red-600 dark:text-red-400 mb-8">
                        {error}
                    </div>
                )}

                {!loading && !error && games.length === 0 && searchQuery && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 dashed border-2">
                        <p className="text-lg">No games found matching "{searchQuery}"</p>
                    </div>
                )}

                {!loading && games.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                            {games.map((game, index) => (
                                <div
                                    key={index}
                                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                                >
                                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                                        <span className="truncate max-w-[70%]" title={game.Event}>{game.Event || "Unknown Event"}</span>
                                        <span>{game.Date || "N/A"}</span>
                                    </div>

                                    <div className="p-5 flex-grow space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-full bg-white border border-gray-300 shadow-sm"></span>
                                                <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px]" title={game.White}>
                                                    {game.White || "Unknown"}
                                                </span>
                                            </div>
                                            {game.Result === "1-0" && (
                                                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">Win</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-full bg-gray-900 border border-gray-700 shadow-sm"></span>
                                                <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px]" title={game.Black}>
                                                    {game.Black || "Unknown"}
                                                </span>
                                            </div>
                                            {game.Result === "0-1" && (
                                                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">Win</span>
                                            )}
                                        </div>

                                        {game.Result === "1/2-1/2" && (
                                            <div className="text-center">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Draw</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 pt-0">
                                        <button
                                            onClick={() => handleViewGame(game)}
                                            className="w-full py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            Analyze Game
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={loadNextPage}
                                disabled={loading}
                                className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Loading..." : "Load Next Page"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DatabasePage;
