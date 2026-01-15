import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useHotkeys } from 'react-hotkeys-hook';
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { reset, getState, commitLine, subscribe } from "../services/stockfishStore";
import { initEnginePool, getNextEngine, cleanupEngines } from "../services/stockfishWorker";

const Analysis = () => {
    const location = useLocation();
    const [gameData, setGameData] = useState(location.state?.gameData || {
        Moves: []
    });
    const [gameDataLoaded, setGameDataLoaded] = useState(false);
    const [s, setS] = useState({});
    const [moveFrom, setMoveFrom] = useState("");
    const [optionSquares, setOptionSquares] = useState({});
    const gameRef = useRef(new Chess());
    const game = gameRef.current;
    const [isMobile, setIsMobile] = useState(false);
    const [fen, setFen] = useState(game.fen());

    useEffect(() => {
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        setIsMobile(isTouch);
    }, []);

    useEffect(() => {
        document.title = 'Analysis';

        const sync = () => setS(getState());
        sync();
        const unsubscribe = subscribe(sync);

        initEnginePool();

        return () => {
            cleanupEngines();
            unsubscribe();
        };
    }, []);

    const parseInfo = (line, fen) => {
        if (!line.startsWith('info depth')) return null;

        const t = line.trim().split(/\s+/);
        const get = (key, offset = 1) => {
            const i = t.indexOf(key);
            return i === -1 ? null : t[i + offset];
        };

        const depth = +get('depth');
        const k = +get('multipv');
        const scoreT = get('score');
        const scoreV = +get('score', 2);
        const pvIdx = t.indexOf('pv');
        const pvUci = pvIdx === -1 ? '' : t.slice(pvIdx + 1).join(' ');

        if (!k || !pvUci) return null;
        const color = fen.split(' ')[1] === "w" ? 1 : -1;
        const score = scoreT === 'cp'
            ? color * scoreV
            : color * scoreV > 0 ? 32000 - color * scoreV : -32000 - color * scoreV;

        const tempGame = new Chess(fen);
        const moves = pvUci.split(" ");
        const pvSanArray = [];
        moves.forEach((move) => {
            const moveObj = tempGame.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move.slice(4) || "q" });
            if (moveObj) {
                pvSanArray.push(moveObj.san);
            }
        });
        const pvSan = pvSanArray.join(" ");
        return { depth, k, score, pvUci, pvSan };
    };

    const startAnalysis = (sfWorker, fen) => {
        reset(fen);

        sfWorker.postMessage('stop');
        sfWorker.postMessage(`position fen ${fen}`);
        sfWorker.postMessage('go depth 30');

        sfWorker.onmessage = ({ data }) => {
            const parsed = parseInfo(data, fen);
            if (parsed) commitLine(parsed);
        };
    };

    const getMoveOptions = (square) => {
        const moves = game.moves({
            square,
            verbose: true
        });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }
        const newSquares = {};
        for (const move of moves) {
            newSquares[move.to] = {
                background: game.get(move.to) && game.get(move.to)?.color !== game.get(square)?.color ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' // larger circle for capturing
                    : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%'
            };
        }
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)'
        };
        setOptionSquares(newSquares);
        return true;
    };

    const onSquareClick = ({
        square,
        piece
    }) => {
        if (!moveFrom && piece) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) {
                setMoveFrom(square);
            }
            return;
        }
        const moves = game.moves({
            square: moveFrom,
            verbose: true
        });
        const foundMove = moves.find(m => m.from === moveFrom && m.to === square);
        if (!foundMove) {
            const hasMoveOptions = getMoveOptions(square);
            setMoveFrom(hasMoveOptions ? square : '');
            return;
        }
        try {
            const move = game.move({
                from: moveFrom,
                to: square,
                promotion: 'q'
            });
            setFen(game.fen());
            const moves = [...gameData.Moves, move.from + move.to];
            setGameData({ Moves: moves });
            setMoveFrom('');
            setOptionSquares({});
        } catch {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) {
                setMoveFrom(square);
            }
            return;
        }

    };

    const onPieceDrop = ({
        sourceSquare,
        targetSquare
    }) => {
        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
            });
            setFen(game.fen());
            const moves = [...gameData.Moves, move.from + move.to];
            setGameData({ Moves: moves });
            setMoveFrom('');
            setOptionSquares({});
            return true;
        } catch {
            return false;
        }
    };

    const goToPreviousMove = () => {
        if (game.history().length - 1 >= 0) {
            game.undo();
            setFen(game.fen());
        }
    };

    const goToNextMove = () => {
        if (game.history().length - 1 < gameData.Moves.length) {
            const nextMove = gameData.Moves[game.history().length];
            if (nextMove) {
                game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2, 4) });
                setFen(game.fen());
            }
        }
    };

    useHotkeys('right, space', goToNextMove);
    useHotkeys('left, backspace', goToPreviousMove);

    useEffect(() => {
        const sf = getNextEngine();
        startAnalysis(sf, fen);
        return () => {
            sf.postMessage('stop');
            sf.onmessage = null;
        };
    }, [fen]);

    useEffect(() => {
        if (location.state) {
            setGameDataLoaded(true);
        }
    }, []);

    const renderEvaluationBar = () => {
        const evaluation = s?.lines?.[0]?.score || 0;
        const evaluationHeight = Math.abs(evaluation) >= 31900 ? (evaluation > 0 ? 100 : 0) : (50 * (1 + (2 / Math.PI) * Math.atan(evaluation / 384)));
        return (
            <div className="w-8 h-full relative bg-gray-700 rounded-r-md overflow-hidden shadow-md border-l border-gray-600 dark:border-gray-800">
                <div
                    className="absolute w-full bg-gray-800 transition-all duration-300 ease-out"
                    style={{
                        bottom: `${evaluationHeight}%`,
                        height: `${100 - evaluationHeight}%`,
                    }}
                />
                <div
                    className="absolute bottom-0 w-full bg-gray-200 flex items-end justify-center pb-1 text-[10px] font-bold text-gray-800 z-10 transition-all duration-300 ease-out"
                    style={{
                        height: `${evaluationHeight}%`,
                    }}
                >
                    {(evaluation / 100).toFixed(2)}
                </div>
            </div>
        );
    };

    const renderGameDetails = () => {
        if (gameDataLoaded) {
            return (
                <div className="flex w-full max-w-[600px] justify-between text-gray-800 dark:text-gray-200 mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-white border border-gray-400 rounded-full"></span>
                        <strong className="text-sm md:text-base font-semibold">{gameData.White}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                        <strong className="text-sm md:text-base font-semibold">{gameData.Black}</strong>
                        <span className="w-3 h-3 bg-black rounded-full border border-gray-600"></span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const Options = {
        onPieceDrop: gameDataLoaded ? {} : onPieceDrop,
        onSquareClick: gameDataLoaded ? {} : onSquareClick,
        allowDragging: !gameDataLoaded && !isMobile,
        position: fen,
        squareStyles: optionSquares,
        arrows: s.bestMove ? [{
            startSquare: s.bestMove.substring(0, 2),
            endSquare: s.bestMove.substring(2, 4),
            color: 'rgb(0,128,0)'
        }] : []
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-8 px-4 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {renderGameDetails()}
            <div className="flex w-full max-w-[600px] h-auto shadow-xl rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-200">
                <div className="flex-grow aspect-square">
                    <Chessboard options={Options} />
                </div>
                <div className="h-auto">
                    {renderEvaluationBar()}
                </div>
            </div>
            <div className="flex w-full max-w-[600px] justify-between items-center mt-6 mb-8">
                <button
                    onClick={goToPreviousMove}
                    disabled={game.history().length - 1 < 0}
                    className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Prev
                </button>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full border border-transparent dark:border-gray-700">
                    <strong>Move:</strong>
                    {game.history().length - 1 >= 0
                        ? ` ${(game.history().length - 1) % 2 ? (game.history().length) / 2 : (game.history().length + 1) / 2}. ${game.history({ verbose: true })[game.history().length - 1].san}`
                        : " Start"}
                </div>

                <button
                    onClick={goToNextMove}
                    disabled={game.history().length >= gameData?.Moves?.length}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[800px]">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-40 transition-colors duration-200">
                    <strong className="text-gray-700 dark:text-gray-200 text-sm mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 block">PGN of Current Game</strong>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <pre className="whitespace-pre-wrap break-words text-xs text-gray-600 dark:text-gray-400 font-mono leading-relaxed">
                            {game.pgn().replace(/^\[.*\]\s*$/gm, '').trim() || "No moves yet"}
                        </pre>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-40 transition-colors duration-200">
                    <strong className="text-gray-700 dark:text-gray-200 text-sm mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 block">Engine Lines</strong>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="text-xs font-mono space-y-2">
                            {[0, 1, 2].map((i) => (
                                s?.lines?.[i] && (
                                    <div key={i} className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <span className={`font-bold ${s.lines[i].score > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                            [{(s.lines[i].score / 100).toFixed(2)}]
                                        </span>
                                        <span className="text-gray-700 dark:text-gray-300 break-all">
                                            {s.lines[i].pvSan}
                                        </span>
                                    </div>
                                )
                            ))}
                            {!s?.lines?.[0] && <span className="text-gray-400 dark:text-gray-500 italic">Calculating...</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;