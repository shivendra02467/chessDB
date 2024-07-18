from django.shortcuts import render
from io import StringIO
import chess
import chess.pgn


def view_game(request):
    white_player = request.GET.get("White")
    black_player = request.GET.get("Black")
    PGN = request.GET.get("PGN")
    PGN = PGN.replace("_", " ")
    print(PGN)
    pgn = StringIO(PGN)
    game = chess.pgn.read_game(pgn)
    result = game.headers["Result"]
    name = white_player + " as white VS " + black_player + " as black "
    chessboard = chess.Board()
    fen = chessboard.fen()
    fen_list = "["
    fen_list = fen_list + '"' + fen + '"'
    for move in game.mainline_moves():
        chessboard.push(move)
        fen = chessboard.fen()
        fen_list = fen_list + ',"' + fen + '"'
    fen_list = fen_list + "]"
    return render(
        request,
        "view_game/view_game.html",
        {"fen_list": fen_list, "name": name, "result": result},
    )
