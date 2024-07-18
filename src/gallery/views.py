from django.shortcuts import render
import chess.pgn
from os import read
from io import StringIO


database = open("games_data.pgn")
content_list = database.readlines()
list_games = []
game = ""
j = 0
for i in content_list:
    if i == "\n":
        j += 1
    if j == 2:
        j = 0
        list_games.append(game)
        game = ""
    game += i
if game == False:
    list_games.append(game)


def gallery_view(request):
    player1 = request.GET.get("player1")
    player2 = request.GET.get("player2")
    games = "["
    for i in list_games:
        pgn = StringIO(i)
        game_header = chess.pgn.read_headers(pgn)
        if (player1 in game_header["White"] and player2 in game_header["Black"]) or (
            player2 in game_header["White"] and player1 in game_header["Black"]
        ):
            i = i[i.find("]\n\n") + len("]\n\n") :]
            i = i.replace("\n", " ")
            i = i.replace(" ", "_")
            if len(games) > 1:
                games = games + ","
            games = (
                games
                + '{"white_player":"'
                + game_header["White"]
                + '","black_player":"'
                + game_header["Black"]
                + '","event":"'
                + game_header["Event"]
                + '","date_played":"'
                + game_header["Date"]
                + '","result":"'
                + game_header["Result"]
                + '","PGN":"'
                + i
                + '"}'
            )
    games = games + "]"
    return render(request, "gallery/gallery.html", {"games": games})
