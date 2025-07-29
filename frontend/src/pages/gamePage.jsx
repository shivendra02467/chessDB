import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import socket from "../services/socket"
import { jwtDecode } from "jwt-decode";

const Game = () => {
    const { id } = useParams();
    const challengeId = id;
    const [gameData, setGameData] = useState({
        White: "NA",
        Black: "NA",
        Moves: []
    });
    const [moveFrom, setMoveFrom] = useState("");
    const [optionSquares, setOptionSquares] = useState({});
    const gameRef = useRef(new Chess());
    const game = gameRef.current;
    const [isMobile, setIsMobile] = useState(false);
    const [fen, setFen] = useState(game.fen());
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userName = decoded.name;
    const [color, setColor] = useState("");

    useEffect(() => {
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        setIsMobile(isTouch);
        document.title = 'Game';
        fetch(`/api/challenges/${challengeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setGameData(prev => ({
                    ...prev, White: data.White, Black: data.Black
                }))
                setColor(userName === data.White ? 'white' : 'black');
            });
    }, []);

    useEffect(() => {
        if (!challengeId) return;

        const handleReceiveMove = ({ from, to }) => {
            try {
                const move = game.move({ from, to, promotion: 'q' });
                setFen(game.fen());
                setGameData(prev => ({
                    ...prev,
                    Moves: [...prev.Moves, move.from + move.to]
                }));
                setMoveFrom('');
                setOptionSquares({});
            } catch (err) {
                console.error("Invalid move received:", err);
            }
        };

        socket.on('receive-move', handleReceiveMove);

        return () => {
            socket.off('receive-move', handleReceiveMove);
        };
    }, [challengeId, game]);

    function canDragPiece({
        piece
    }) {
        return piece.pieceType[0] === color?.[0];
    }

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
            socket.emit('make-move', {
                challengeId,
                move: {
                    from: moveFrom,
                    to: square
                }
            });
            setFen(game.fen());
            setGameData(prev => ({
                ...prev,
                Moves: [...prev.Moves, move.from + move.to]
            }));
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
            socket.emit('make-move', {
                challengeId,
                move: {
                    from: sourceSquare,
                    to: targetSquare
                }
            });
            setFen(game.fen());
            setGameData(prev => ({
                ...prev,
                Moves: [...prev.Moves, move.from + move.to]
            }));
            setMoveFrom('');
            setOptionSquares({});
            return true;
        } catch {
            return false;
        }
    };

    const renderGameDetails = () => {
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
    };

    const Options = {
        boardOrientation: color,
        canDragPiece: canDragPiece,
        onPieceDrop: onPieceDrop,
        onSquareClick: (game.history().length % 2 === 0) ^ (color === 'black') ? onSquareClick : null,
        allowDragging: !isMobile,
        position: fen,
        squareStyles: optionSquares
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
            </div >
            <div
                style={{
                    display: 'flex',
                    width: "600px",
                    justifyContent: 'center',
                }}
            >
                <div>
                    <strong>Move:</strong>{game.history().length - 1 >= 0
                        ? ` ${(game.history().length - 1) % 2 ? (game.history().length) / 2 : (game.history().length + 1) / 2}. ${game.history({ verbose: true })[game.history().length - 1].san}`
                        : " Start"}
                </div>
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
            </div>
        </div >
    );
};

export default Game;
