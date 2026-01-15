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
            <div className="flex w-full max-w-[600px] justify-between text-gray-800 dark:text-gray-200 mb-4 px-1">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-white border border-gray-400 rounded-full shadow-sm"></span>
                    <strong className="text-sm md:text-base font-semibold">{gameData.White}</strong>
                </div>
                <div className="flex items-center gap-2">
                    <strong className="text-sm md:text-base font-semibold">{gameData.Black}</strong>
                    <span className="w-3 h-3 bg-gray-900 border border-gray-600 dark:border-gray-400 rounded-full shadow-sm"></span>
                </div>
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
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col items-center py-8 px-4 font-sans text-gray-900 dark:text-gray-100">
            {renderGameDetails()}
            <div className="flex w-full max-w-[600px] aspect-square shadow-xl rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <Chessboard options={Options} />
            </div>

            <div className="mt-6 mb-8 px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200">
                <strong>Move:</strong>
                {game.history().length - 1 >= 0
                    ? ` ${(game.history().length - 1) % 2 ? (game.history().length) / 2 : (game.history().length + 1) / 2}. ${game.history({ verbose: true })[game.history().length - 1].san}`
                    : " Start"}
            </div>

            <div className="w-full max-w-[600px] h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 flex flex-col transition-colors duration-200">
                <strong className="text-gray-700 dark:text-gray-200 text-sm mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 block">
                    PGN of Current Game
                </strong>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <pre className="whitespace-pre-wrap break-words text-xs text-gray-600 dark:text-gray-400 font-mono leading-relaxed">
                        {game.pgn().replace(/^\[.*\]\s*$/gm, '').trim() || "No moves yet"}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default Game;
