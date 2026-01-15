import React, { useEffect } from "react";

const About = () => {
    useEffect(() => {
        document.title = 'About';
    }, []);
    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        About <span className="text-blue-600 dark:text-blue-400">chessDB</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        A modern platform designed to bridge the gap between historical game study and state-of-the-art engine analysis.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-10 space-y-8">
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">The Database</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Our database contains a curated collection of classical games from history's strongest players.
                                We provide the tools to search, replay, and study the patterns that defined the modern era of chess.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-gray-700"></div>

                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Powered by Stockfish 17</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Analyze any position directly in your browser. We utilize WebAssembly (WASM) to run
                                <span className="font-semibold text-gray-900 dark:text-gray-100"> Stockfish 17 </span>
                                locally on your device, ensuring zero-latency evaluations without needing a powerful server.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
                        Built with modern technologies
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-70">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <svg
                                className="w-5 h-5 text-blue-500 animate-[spin_10s_linear_infinite]"
                                viewBox="-11.5 -10.23174 23 20.46348"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                            >
                                <circle cx="0" cy="0" r="2.05" fill="currentColor" stroke="none" />
                                <g stroke="currentColor">
                                    <ellipse rx="11" ry="4.2" />
                                    <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                                    <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                                </g>
                            </svg>
                            <span className="text-blue-500 font-bold">React</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <svg
                                className="w-5 h-5 text-cyan-500"
                                viewBox="0 0 54 33"
                                fill="currentColor"
                            >
                                <path d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" />
                            </svg>
                            <span className="text-cyan-500 font-bold">Tailwind</span>
                        </div>
                        < div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <svg
                                className="w-5 h-5 text-green-500"
                                viewBox="0 0 71 80"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g fill="currentColor">
                                    <path d="M35.625 79.5c-1.081 0-2.09-.288-3.028-.792l-9.59-5.686c-1.442-.792-.721-1.08-.289-1.224 1.947-.648 2.308-.792 4.327-1.944.216-.144.504-.072.72.072l7.356 4.391c.288.144.649.144.865 0l28.77-16.628c.289-.144.433-.431.433-.791V23.714c0-.36-.144-.648-.432-.792L35.986 6.366c-.288-.144-.65-.144-.865 0L6.35 22.922c-.29.144-.434.504-.434.792v33.184c0 .287.145.647.433.791l7.86 4.535c4.254 2.16 6.922-.36 6.922-2.879V26.593c0-.432.36-.864.865-.864h3.678c.432 0 .865.36.865.864v32.752c0 5.687-3.1 8.998-8.509 8.998-1.658 0-2.956 0-6.633-1.8l-7.572-4.319A6.073 6.073 0 0 1 .798 56.97V23.786a6.073 6.073 0 0 1 3.028-5.255l28.77-16.628c1.804-1.008 4.255-1.008 6.058 0l28.77 16.628a6.073 6.073 0 0 1 3.029 5.255V56.97a6.073 6.073 0 0 1-3.029 5.254l-28.77 16.628c-.865.36-1.947.648-3.029.648Z" />
                                    <path d="M44.567 56.682c-12.62 0-15.215-5.759-15.215-10.654 0-.432.36-.864.865-.864h3.75c.433 0 .793.288.793.72.577 3.815 2.235 5.687 9.879 5.687 6.057 0 8.652-1.368 8.652-4.607 0-1.871-.72-3.24-10.167-4.175-7.86-.792-12.762-2.52-12.762-8.782 0-5.83 4.903-9.285 13.123-9.285 9.23 0 13.772 3.167 14.35 10.077 0 .216-.073.432-.217.648-.144.144-.36.288-.577.288h-3.822a.844.844 0 0 1-.793-.648c-.865-3.96-3.1-5.255-9.013-5.255-6.634 0-7.427 2.304-7.427 4.031 0 2.088.937 2.736 9.879 3.887 8.869 1.152 13.05 2.808 13.05 8.998 0 6.335-5.263 9.934-14.348 9.934Z" />
                                </g>
                            </svg>
                            <span className="text-green-500 font-bold">Node.js</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default About;