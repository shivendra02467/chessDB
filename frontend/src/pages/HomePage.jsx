import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext";

const Home = () => {
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        document.title = 'chessDB';
    }, []);

    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col items-center">
            <div className="w-full max-w-5xl px-6 py-16 md:py-24 text-center">
                <div className="inline-block mb-4 p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-4xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 45 45"
                      fill="currentColor"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.5"
                          d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
                        />
                    </svg>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                    Elevate Your <span className="text-blue-600 dark:text-blue-400">Chess Game</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The all-in-one platform to analyze your matches with Stockfish,
                    challenge friends in real-time, and build your personal game database.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!isLoggedIn ? (
                        <>
                            <Link
                                to="/register"
                                className="px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-3.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Login
                            </Link>
                        </>
                    ) : (
                        <Link
                            to="/play"
                            className="px-8 py-3.5 rounded-xl bg-green-600 text-white font-semibold text-lg hover:bg-green-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <span>Play a Match</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </Link>
                    )}
                </div>
            </div>

            <div className="w-full max-w-6xl px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        title="Deep Analysis"
                        description="Review your games with the latest Stockfish engine. Understand your mistakes and find the best moves in any position."
                        icon={
                            <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                    />

                    <FeatureCard
                        title="Real-time PvP"
                        description="Challenge other players via invite links. Experience seamless gameplay powered by low-latency WebSockets."
                        icon={
                            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />

                    <FeatureCard
                        title="Cloud Database"
                        description="Save your favorite games and access them from anywhere. Build your own repertoire and track your progress."
                        icon={
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ title, description, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl w-fit">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
        </p>
    </div>
);

export default Home;

