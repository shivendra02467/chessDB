import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyGames = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [games, setGames] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));

    useEffect(() => {
        document.title = "My Games - chessDB";
        fetchGames(1);
    }, []);

    const fetchGames = async (pageToFetch) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/challenges/me`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ page: pageToFetch }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message);
            } else {
                setGames(data.games);
            }
        } catch (error) {
            console.error("Error fetching games:", error);
            setError("Failed to fetch games history.");
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
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    My Games
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    A history of your recent battles.
                </p>
            </div>

            <div className="w-full max-w-7xl">
                {loading && games.length === 0 && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading your history...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center text-red-600 dark:text-red-400 mb-8 max-w-2xl mx-auto">
                        {error}
                    </div>
                )}

                {!loading && !error && games.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 max-w-2xl mx-auto">
                        <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">You haven't played any games yet.</p>
                        <a href="/play" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Start a Match
                        </a>
                    </div>
                )}

                {games.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                            {games.map((game, index) => (
                                <div
                                    key={index}
                                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 bg-gray-100 dark:bg-gray-700 rounded-bl-xl px-3 py-1 text-xs font-bold text-gray-500 dark:text-gray-400 border-l border-b border-gray-200 dark:border-gray-600">
                                        MATCH
                                    </div>
                                    <div className="p-6 flex-grow space-y-5 mt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center shadow-sm">
                                                    <svg viewBox="0 0 45 45" className="w-6 h-6">
                                                        <g fill="none" fillRule="evenodd" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                                            <path strokeLinejoin="miter" d="M22.5 11.63V6M20 8h5" />
                                                            <path fill="#fff" strokeLinecap="butt" strokeLinejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
                                                            <path fill="#fff" d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z" />
                                                            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
                                                        </g>
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">White</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px]" title={game.White}>
                                                        {game.White || "Anonymous"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="h-px bg-gray-100 dark:bg-gray-700 flex-grow"></div>
                                            <span className="text-xs text-gray-400 font-medium">VS</span>
                                            <div className="h-px bg-gray-100 dark:bg-gray-700 flex-grow"></div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center shadow-sm">
                                                    <svg viewBox="0 0 45 45" className="w-6 h-6">
                                                        <g fill="none" fillRule="evenodd" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                                            <path strokeLinejoin="miter" d="M22.5 11.6V6" />
                                                            <path fill="#000" strokeLinecap="butt" strokeLinejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
                                                            <path fill="#000" d="M11.5 37a22.3 22.3 0 0 0 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z" />
                                                            <path strokeLinejoin="miter" d="M20 8h5" />
                                                            <path stroke="#ececec" d="M32 29.5s8.5-4 6-9.7C34.1 14 25 18 22.5 24.6v2.1-2.1C20 18 9.9 14 7 19.9c-2.5 5.6 4.8 9 4.8 9" />
                                                            <path stroke="#ececec" d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
                                                        </g>
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Black</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px]" title={game.Black}>
                                                        {game.Black || "Anonymous"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 pt-0">
                                        <button
                                            onClick={() => handleViewGame(game)}
                                            className="w-full py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 group-hover:border-blue-200 dark:group-hover:border-blue-900"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            Review Game
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center pb-10">
                            <button
                                onClick={loadNextPage}
                                disabled={loading}
                                className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </>
                                ) : (
                                    "Load More Games"
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyGames;
