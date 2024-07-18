document.getElementById("Name").innerHTML=`${game_name}`;
document.getElementById("Result").innerHTML=`${result}`;
const Next = document.getElementById("Next");
const Prev = document.getElementById("Prev");
let moveNum = 0;
var position = fenToPosition(fen_list[moveNum]);

function fenToPosition(fen) {
  const position = {};
  const ranks = fen.split(' ')[0].split('/');

  for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
    let fileIndex = 0;
    for (const piece of ranks[rankIndex]) {
      if (isNaN(piece)) {
        const square = String.fromCharCode(97 + fileIndex) + (8 - rankIndex);
        position[square] = (piece.toLowerCase() === piece ? 'b' : 'w') + piece.toUpperCase();
        fileIndex++;
      } else {
        fileIndex += parseInt(piece);
      }
    }
  }

  return position;
}

function drawChessboard(position){
  const chessboard = document.getElementById("chessboard");

  chessboard.innerHTML=""

  for (let row = 0; row < 8; row++) {
    const tr = chessboard.insertRow();
    for (let col = 0; col < 8; col++) {
      const td = tr.insertCell();
      td.classList.add("square");
      td.classList.add((row + col) % 2 === 0 ? "white" : "black");

      const squareName = String.fromCharCode(97 + col) + (8 - row);
      const piece = position[squareName];

      if (piece) {
        const img = document.createElement("img");
        img.src = imageSRC +`/${piece}.png`;
        img.alt = piece;
        img.classList.add("piece-image");
        td.appendChild(img);
      }
    }
  }
}

drawChessboard(position);

Next.addEventListener("click", function() {
  if(moveNum<fen_list.length-1){
    moveNum++;
    position = fenToPosition(fen_list[moveNum]);
    drawChessboard(position);
  }
});

Prev.addEventListener("click", function() {
  if(moveNum>0){
    moveNum--;
    position = fenToPosition(fen_list[moveNum]);
    drawChessboard(position);
  }
});
