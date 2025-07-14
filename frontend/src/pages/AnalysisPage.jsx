import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
            // setPgn(game.pgn().replace(/^\[.*\]\s*$/gm, '').trim());
            setFen(game.fen());
            const moves = [...gameData.Moves, move.from + move.to];
            setGameData({ Moves: moves });
            // setMoveHistory(game.history({ verbose: true }));
            // setCurrentMoveIndex(game.history().length - 1);
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
            <div
                style={{
                    width: "32px",
                    height: "100%",
                    background: "lightgray",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        bottom: `${evaluationHeight}%`,
                        height: `${100 - evaluationHeight}%`,
                        width: "100%",
                        background: "#000000",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: `0%`,
                        height: `${evaluationHeight}%`,
                        width: "100%",
                        background: "#bbbbbb",
                        fontSize: '12px',
                        textAlign: 'center',
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
                <div
                    style={{
                        display: 'flex',
                        width: "600px",
                        justifyContent: 'space-between',
                    }}
                >
                    <div><strong>White: </strong>{gameData.White}</div><div><strong>Black: </strong>{gameData.Black}</div>
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
        <div
            style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: 'center',
                gap: "10px",
            }}
        >
            {renderGameDetails()}
            < div
                style={{
                    display: "flex",
                    width: "600px",
                    gap: "10px",
                }}
            >
                <Chessboard
                    options={Options}
                />
                <div>
                    {renderEvaluationBar()}
                </div>
            </div >
            <div
                style={{
                    display: 'flex',
                    width: "600px",
                    justifyContent: 'space-between',
                }}
            >
                <button
                    onClick={goToPreviousMove}
                    disabled={game.history().length - 1 < 0}
                    style={{
                        padding: "5px 15px",
                        cursor: "pointer",
                    }}
                >
                    Prev
                </button>
                <div>
                    <strong>Move:</strong>{game.history().length - 1 >= 0
                        ? ` ${(game.history().length - 1) % 2 ? (game.history().length) / 2 : (game.history().length + 1) / 2}. ${game.history({ verbose: true })[game.history().length - 1].san}`
                        : " Start"}
                </div>
                <button
                    onClick={goToNextMove}
                    disabled={game.history().length >= gameData.Moves.length}
                    style={{
                        padding: "5px 15px",
                        cursor: "pointer",
                    }}
                >
                    Next
                </button>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: 'center',
                    gap: "10px",
                }}
            >
                <div
                    style={{
                        padding: "5px",
                        border: "1px solid #888888",
                        overflowX: "auto",
                        width: "400px",
                        height: "200px",
                    }}
                >
                    <strong>PGN of Current Game</strong>
                    <pre
                        style={{
                            whiteSpace: "pre-wrap",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            fontSize: "14px",
                        }}
                    >
                        {game.pgn().replace(/^\[.*\]\s*$/gm, '').trim() || "No moves yet"}
                    </pre>
                </div>
                <div
                    style={{
                        padding: "5px",
                        border: "1px solid #888888",
                        overflowX: "auto",
                        width: "400px",
                        height: "200px",
                    }}
                >
                    <strong>Engine Lines</strong>
                    <pre
                        style={{
                            whiteSpace: "pre-wrap",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            fontSize: "14px",
                        }}
                    >
                        <p>[{s?.lines?.[0]?.score / 100}] {s?.lines?.[0]?.pvSan}</p>
                        <p>[{s?.lines?.[1]?.score / 100}] {s?.lines?.[1]?.pvSan}</p>
                        <p>[{s?.lines?.[2]?.score / 100}] {s?.lines?.[2]?.pvSan}</p>
                    </pre>
                </div>
            </div>
        </div >
    );
};

export default Analysis;
