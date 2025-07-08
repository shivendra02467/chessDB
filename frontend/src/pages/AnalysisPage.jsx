import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useLocation, useNavigate } from "react-router-dom";
import { useHotkeys } from 'react-hotkeys-hook';
import { jwtDecode } from "jwt-decode";

const Analysis = () => {
    const location = useLocation();
    const { gameData } = location.state || {};
    const [game] = useState(new Chess());
    const [fen, setFen] = useState("");
    const [pgn, setPgn] = useState("");
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [evalLine, setEvalLine] = useState("");
    const [evalu, setEvalu] = useState("");
    const [evaluation, setEvaluation] = useState(0);
    const [evaluating, setEvaluating] = useState(false);
    const [gameDataLoaded, setGameDataLoaded] = useState(false);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userId = decoded.id;
    const navigate = useNavigate();
    const sfRef = useRef(null);
    const [moveFrom, setMoveFrom] = useState("");
    const [bestMove, setBestMove] = useState("");
    const [optionSquares, setOptionSquares] = useState({});

    useEffect(() => {
        document.title = 'Analysis';
    }, []);

    useEffect(() => {
        const sf = new Worker('/stockfish-nnue-16.js');
        sf.onmessage = e => { console.log(e.data); setEvalu(e.data); }
        sf.postMessage('setoption name Use NNUE value true');
        sf.postMessage('uci');
        sf.postMessage(`position fen ${fen}`);
        sf.postMessage('go depth 20');
        sfRef.current = sf;
        return () => sf.terminate();
    }, []);


    function getMoveOptions(square) {
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
    }
    function onSquareClick(
        square,
        piece
    ) {
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
            game.move({
                from: moveFrom,
                to: square,
                promotion: 'q'
            });
        } catch {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) {
                setMoveFrom(square);
            }
            return;
        }

        sfRef.current.postMessage('stop');
        setPgn(game.pgn().replace(/^\[.*\]\s*$/gm, '').trim());
        setFen(game.fen());
        setMoveHistory(game.history({ verbose: true }));
        setCurrentMoveIndex(game.history().length - 1);

        setMoveFrom('');
        setOptionSquares({});
    }

    const parseUciLine = (uciLine) => {
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
    }

    // const fetchEvaluation = useCallback(async (fen) => {
    //     setEvaluating(true);
    //     try {
    //         const { evalString } = await analyzeGame(userId, fen);
    //         const evalMatch = evalString.match(/info depth 20 .*? score (cp|mate) (-?\d+)/);
    //         const uciLine = evalString.match(/info depth 20 .*? pv ((?:[a-h][1-8][a-h][1-8]\s?)+)/);
    //         const scoreType = evalMatch[1];
    //         const scoreValue = parseInt(evalMatch[2], 10);
    //         var score = 0;
    //         if (scoreType === "cp") {
    //             const parts = fen.split(' ');
    //             const color = parts[1] === "w" ? 1 : -1;
    //             score = color * scoreValue / 100;
    //         } else if (scoreType === "mate") {
    //             const parts = fen.split(' ');
    //             const color = parts[1] === "w" ? 1 : -1;
    //             score = color * scoreValue > 0 ? 100 : -100;
    //         }
    //         setEvalLine(parseUciLine(uciLine[1]));
    //         setEvaluation(score);
    //     } catch (error) {
    //         console.error("Error fetching evaluation:", error);
    //         setEvaluation(0);
    //     }
    //     setEvaluating(false);
    // }, [fen]);

    const onDrop = (sourceSquare, targetSquare) => {
        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
            });

            if (move) {
                sfRef.current.postMessage('stop');
                setPgn(game.pgn().replace(/^\[.*\]\s*$/gm, '').trim());
                setFen(game.fen());
                setMoveHistory(game.history({ verbose: true }));
                setCurrentMoveIndex(game.history().length - 1);
                setMoveFrom('');
                setOptionSquares({});
            } else {
                alert("Invalid move!");
            }
        } catch (error) {
            alert("Invalid move!");
        }
    };

    useEffect(() => {
        if (sfRef.current) {
            sfRef.current.postMessage(`position fen ${fen}`);
            sfRef.current.postMessage('go depth 20');
        }
    }, [fen]);
    const goToPreviousMove = () => {
        if (currentMoveIndex >= 0 && !evaluating) {
            sfRef.current.postMessage('stop');
            game.undo();
            setCurrentMoveIndex((prev) => prev - 1);
            setFen(game.fen());
        }
    };

    const goToNextMove = () => {
        if (currentMoveIndex < moveHistory.length - 1 && !evaluating) {
            const nextMove = moveHistory[currentMoveIndex + 1];
            if (nextMove) {
                sfRef.current.postMessage('stop');
                game.move(nextMove);
                setCurrentMoveIndex((prev) => prev + 1);
                setFen(game.fen());
            }
        }
    };

    useHotkeys('right, space', goToNextMove);
    useHotkeys('left, backspace', goToPreviousMove);

    useEffect(() => {
        const evalMatch = evalu.match(/info depth .*? score (cp|mate) (-?\d+)/);
        const uciLine = evalu.match(/info depth .*? pv ((?:[a-h][1-8][a-h][1-8]\s?)+)/);
        if (evalMatch) {
            const scoreType = evalMatch[1];
            const scoreValue = parseInt(evalMatch[2], 10);
            var score = 0;
            if (scoreType === "cp") {
                const parts = fen.split(' ');
                const color = parts[1] === "w" ? 1 : -1;
                score = color * scoreValue;
            } else if (scoreType === "mate") {
                const parts = fen.split(' ');
                const color = parts[1] === "w" ? 1 : -1;
                score = color * scoreValue > 0 ? 32000 - scoreValue : scoreValue - 32000;
            }
            setEvaluation(score);
        }
        if (uciLine) { setEvalLine(parseUciLine(uciLine[1])); setBestMove(uciLine[1].split(' ')[0]); }
    }, [evalu]);
    useEffect(() => {
        if (location.state) {
            const newGame = new Chess();
            for (const move of gameData.Moves) {
                const result = newGame.move({ from: move.slice(0, 2), to: move.slice(2, 4) });
                if (!result) {
                    console.error("Invalid move:", move);
                    break;
                }
            }
            setPgn(newGame.pgn().replace(/^\[.*\]\s*$/gm, '').trim());
            setMoveHistory(newGame.history({ verbose: true }));
            while (newGame.undo() !== null) {
                newGame.undo();
            }
            setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
            setCurrentMoveIndex(-1);
            setGameDataLoaded(true);
        }
    }, [location.state]);
    // useEffect(() => {
    //     const startStockfish = async () => {
    //         try {
    //             const response = await fetch("/api/stockfish/start", {
    //                 method: "POST",
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify({ userId }),
    //             });
    //             if (!response.ok) {
    //                 const errorData = await response.json();
    //                 navigate(-1);
    //                 throw new Error(errorData.error || "Failed to start Stockfish session.");
    //             }
    //         } catch (error) {
    //             alert(error);
    //         }
    //     };

    //     const stopStockfish = async () => {
    //         try {
    //             await fetch("/api/stockfish/stop", {
    //                 method: "POST",
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify({ userId }),
    //             });
    //         } catch (error) {
    //             console.error("Error stopping Stockfish:", error);
    //         }
    //     };

    //     startStockfish();
    //     fetchEvaluation(fen);

    //     return () => {
    //         stopStockfish();
    //     };
    // }, [userId, navigate]);

    const renderEvaluationBar = () => {
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
                    {evaluating ? "..." : (evaluation / 100).toFixed(2)}
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
            <div
                style={{
                    display: "flex",
                    width: "600px",
                    gap: "10px",
                }}
            >
                <Chessboard
                    onPieceDrop={gameDataLoaded ? {} : onDrop}
                    onSquareClick={gameDataLoaded ? {} : onSquareClick}
                    position={game.fen()}
                    customSquareStyles={optionSquares}
                    arePiecesDraggable={!evaluating}
                    customArrowColor="rgb(0,128,0)"
                    customArrows={
                        bestMove ? [[
                            bestMove.substring(0, 2),
                            bestMove.substring(2, 4),
                            'rgb(0,128,0)'
                        ]]
                            : []
                    }
                />
                <div>
                    {renderEvaluationBar()}
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    width: "600px",
                    justifyContent: 'space-between',
                }}
            >
                <button
                    onClick={goToPreviousMove}
                    disabled={currentMoveIndex < 0}
                    style={{
                        padding: "5px 15px",
                        cursor: "pointer",
                    }}
                >
                    Prev
                </button>
                <div>
                    <strong>Move:</strong>{currentMoveIndex >= 0
                        ? ` ${currentMoveIndex % 2 ? (currentMoveIndex + 1) / 2 : (currentMoveIndex + 2) / 2}. ${moveHistory[currentMoveIndex].san}`
                        : " Start"}
                </div>
                <button
                    onClick={goToNextMove}
                    disabled={currentMoveIndex >= moveHistory.length - 1}
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
                        {pgn || "No moves yet"}
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
                    <strong>Engine Line</strong>
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
    );
};

export default Analysis;
