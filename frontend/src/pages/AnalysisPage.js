import React, { useState, useEffect, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { analyzeGame } from "../services/stockfishService";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Analysis = () => {
    const location = useLocation();
    const { gameData } = location.state || {};
    const [game] = useState(new Chess());
    const [fen, setFen] = useState("start");
    const [pgn, setPgn] = useState("");
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [evalLine, setEvalLine] = useState("");
    const [evaluation, setEvaluation] = useState(0);
    const [evaluating, setEvaluating] = useState(false);
    const [gameDataLoaded, setGameDataLoaded] = useState(false);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userId = decoded.id;
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Analysis';
    }, []);

    const getActiveColor = (fen) => {
        const parts = fen.split(' ');
        const color = parts[1] === "w" ? 1 : -1;
        return color;
    };

    const parseUciLine = useCallback((uciLine) => {
        const tempGame = new Chess(game.fen());
        const moves = uciLine.split(" ");
        const notationMoves = [];
        moves.forEach((move) => {
            const moveObj = tempGame.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move.slice(4) || "q" });
            if (moveObj) {
                notationMoves.push(moveObj.san);
            }
        });
        return notationMoves.join(" ");
    }, [game]);

    const fetchEvaluation = useCallback(async (fen) => {
        setEvaluating(true);
        try {
            const { evalString } = await analyzeGame(userId, fen);
            const evalMatch = evalString.match(/info depth 20 .*? score (cp|mate) (-?\d+)/);
            const uciLine = evalString.match(/info depth 20 .*? pv ((?:[a-h][1-8][a-h][1-8]\s?)+)/);
            const scoreType = evalMatch[1];
            const scoreValue = parseInt(evalMatch[2], 10);
            var score = 0;
            if (scoreType === "cp") {
                score = getActiveColor(fen) * scoreValue / 100;
            } else if (scoreType === "mate") {
                score = getActiveColor(fen) * scoreValue > 0 ? 100 : -100;
            }
            setEvalLine(parseUciLine(uciLine[1]));
            setEvaluation(score);
        } catch (error) {
            console.error("Error fetching evaluation:", error);
            setEvaluation(0);
        }
        setEvaluating(false);
    }, [parseUciLine, userId]);

    const onDrop = (sourceSquare, targetSquare) => {
        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
            });

            if (move) {
                setPgn(game.pgn());
                setFen(game.fen());
                setMoveHistory(game.history({ verbose: true }));
                setCurrentMoveIndex(game.history().length - 1);
            } else {
                alert("Invalid move!");
            }
        } catch (error) {
            alert("Invalid move!");
        }
    };

    const goToPreviousMove = () => {
        if (currentMoveIndex >= 0 && !evaluating) {
            game.undo();
            setCurrentMoveIndex((prev) => prev - 1);
            setFen(game.fen());
        }
    };

    const goToNextMove = () => {
        if (currentMoveIndex < moveHistory.length - 1 && !evaluating) {
            const nextMove = moveHistory[currentMoveIndex + 1];
            if (nextMove) {
                game.move(nextMove);
                setCurrentMoveIndex((prev) => prev + 1);
                setFen(game.fen());
            }
        }
    };

    useEffect(() => {
        if (fen !== "start") {
            fetchEvaluation(fen);
        }
    }, [fen, fetchEvaluation]);

    useEffect(() => {
        if (location.state && location.state.gameData) {
            const newGame = new Chess();
            for (const move of gameData.Moves) {
                const result = newGame.move({ from: move.slice(0, 2), to: move.slice(2, 4) });
                if (!result) {
                    console.error("Invalid move:", move);
                    break;
                }
            }
            setPgn(newGame.pgn());
            setMoveHistory(newGame.history({ verbose: true }));
            while (newGame.undo() !== null) {
                newGame.undo();
            }
            setFen("start");
            setCurrentMoveIndex(-1);
            setGameDataLoaded(true);
        }
    }, [location.state]);

    useEffect(() => {
        const startStockfish = async () => {
            try {
                const response = await fetch("/api/stockfish/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    navigate(-1);
                    throw new Error(errorData.error || "Failed to start Stockfish session.");
                }
            } catch (error) {
                alert(error);
            }
        };

        const stopStockfish = async () => {
            try {
                await fetch("/api/stockfish/stop", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
            } catch (error) {
                console.error("Error stopping Stockfish:", error);
            }
        };

        startStockfish();

        return () => {
            stopStockfish();
        };
    }, [location.pathname, userId, navigate]);

    const renderEvaluationBar = () => {
        const evaluationHeight = Math.max(0, Math.min(100, 50 + evaluation * 10));
        return (
            <div
                style={{
                    width: "20px",
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
                    }}
                />
            </div>
        );
    };

    const renderGameDetails = () => {
        if (gameDataLoaded) {
            return (
                <div>
                    <h3>Game Details</h3>
                    <p><strong>Event:</strong> {gameData.Event}</p>
                    <p><strong>Black Player:</strong> {gameData.Black}</p>
                    <p><strong>White Player:</strong> {gameData.White}</p>
                    <p><strong>Result:</strong> {gameData.Result}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            style={{
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                width: "1000px",
                gap: "20px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "800px",
                        gap: "10px",
                    }}
                >
                    <Chessboard
                        position={game.fen()}
                        onPieceDrop={gameDataLoaded ? {} : onDrop}
                        rePiecesDraggable={!evaluating}
                    />
                    <div
                        style={{
                            width: "20px",
                            marginLeft: "10px",
                        }}
                    >
                        {renderEvaluationBar()}
                        <p style={{ textAlign: "center" }}>
                            {evaluating ? "Evaluating..." : evaluation.toFixed(2)}
                        </p>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    <div
                        style={{
                            padding: "5px",
                            border: "1px solid #ccc",
                            width: "400px",
                            height: "200px",
                        }}
                    >
                        <h4>PGN of Current Game</h4>
                        <pre
                            style={{
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                fontSize: "14px",
                            }}
                        >
                            {pgn || "No moves yet"}
                        </pre>
                    </div>
                    <div
                        style={{
                            padding: "5px",
                            border: "1px solid #ccc",
                            width: "400px",
                            height: "200px",
                        }}
                    >
                        <h4>Engine Line</h4>
                        <pre
                            style={{
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                fontSize: "14px",
                            }}
                        >
                            {evalLine || "No analysis available"}
                        </pre>
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "20px",
                }}
            >
                <div>
                    <button onClick={goToPreviousMove} disabled={currentMoveIndex < 0}>
                        Previous
                    </button>
                    <button onClick={goToNextMove} disabled={currentMoveIndex >= moveHistory.length - 1}>
                        Next
                    </button>
                    <div style={{ marginTop: "10px" }}>
                        <h3>Current Move</h3>
                        <p>
                            {currentMoveIndex >= 0
                                ? `Move ${currentMoveIndex % 2 ? (currentMoveIndex + 1) / 2 : (currentMoveIndex + 2) / 2}: ${moveHistory[currentMoveIndex].san}`
                                : "Game Start"}
                        </p>
                    </div>
                </div>
                {renderGameDetails()}
            </div>
        </div>
    );
};

export default Analysis;
