import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from "../services/socket";

const Play = () => {
    const [challenges, setChallenges] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        document.title = "Play";
        fetch('/api/challenges', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setChallenges(data));

        socket.on('start-game', ({ challengeId }) => {
            navigate(`/game/${challengeId}`);
        });

        socket.emit('join-lobby');

        const handleAdded = (challenge) => {
            setChallenges((prev) => [...prev, challenge]);
        };

        const handleRemoved = (id) => {
            setChallenges((prev) => prev.filter(c => c._id !== id));
        };

        socket.on('challenge-added', handleAdded);
        socket.on('challenge-removed', handleRemoved);

        return () => {
            socket.off('start-game');
            socket.off('challenge-added', handleAdded);
            socket.off('challenge-removed', handleRemoved);
        };
    }, []);

    const createChallenge = async () => {
        const res = await fetch('/api/challenges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const challenge = await res.json();
        socket.emit('join-challenge', challenge._id);
    };

    const acceptChallenge = async (id) => {
        socket.emit('join-challenge', id);
        await fetch(`/api/challenges/${id}/accept`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col items-center py-10 px-4 sm:px-6">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center gap-2 mb-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Lobby
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    Find a Challenger
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                    Join an open game or create your own to start playing instantly.
                </p>
            </div>

            <div className="w-full max-w-4xl flex justify-center mb-12">
                <button
                    onClick={createChallenge}
                    className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span className="text-lg font-bold">Create New Challenge</span>
                </button>
            </div>

            <div className="w-full max-w-5xl">
                {challenges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No open challenges</p>
                        <p className="text-gray-500 dark:text-gray-400">Be the first to create one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.map((challenge) => (
                            <div
                                key={challenge._id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                            >
                                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Open Game
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Waiting</span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md mb-4 border-2 border-white dark:border-gray-600">
                                        {challenge.White?.charAt(0).toUpperCase()}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                        {challenge.White}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        is looking for an opponent
                                    </p>

                                    <button
                                        onClick={() => acceptChallenge(challenge._id)}
                                        className="w-full py-2.5 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        <span>Accept Challenge</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Play;
