const gallery = document.getElementById("game-gallery");

gamesData.forEach((game) => {
  const gameItem = document.createElement("div");
  gameItem.classList.add("game-item");

  gameItem.innerHTML = `
    <h3>${game.event}</h3>
    <p>Date: ${game.date_played}</p>
    <p>White: ${game.white_player}</p>
    <p>Black: ${game.black_player}</p>
    <p>Result: ${game.result}</p>
    <form action="view_game/" method="get">
    <input type="hidden" value=${game.white_player} name="White">
    <input type="hidden" value=${game.black_player} name="Black">
    <input type="hidden" value=${game.PGN} name="PGN">
    <button style="width: 200px; height: 50px;" type="submit">View Game</button>
    </form>
  `;
  gallery.appendChild(gameItem);
});