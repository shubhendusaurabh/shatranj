var game = new Chess();
var boardEl = $('#board');
var squareToHighlight;

var stockfish = new Worker('/public/js/stockfish.js');

var removeHighlights = function (color) {
  boardEl.find('.square-55d63').removeClass('highlight-' + color);
};

var unHighlightMoves = function () {
  $('#board .square-55d63').css('background', '');
};

var highlightMoves = function (square) {
  var squareEl = $('#board .square-' + square);

  var background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d')) {
    background = '#696969';
  }
  squareEl.css('background', background);
};

var onDragStart = function (source, piece, position, orientation) {
  if (game.game_over() == true || (game.turn() == 'w' && piece.search('/^b/') !== -1) || game.turn() === 'b' && piece.search('/^w/') !== -1) {
    return false;
  }
};

var onDrop = function(source, target) {
  unHighlightMoves();
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' //promoting queen as default
  });

  if (move === null) {
    return 'snapback';
  }

  // remove black highlights
  removeHighlights('black');
  boardEl.find('.square-' + move.from).addClass('highlight-black');
  squareToHighlight = move.to;

  // remove white highlights
  // highlight white's move
  removeHighlights('white');
  boardEl.find('.square-' + source).addClass('highlight-white');
  boardEl.find('.square-' + target).addClass('highlight-white');

  updateStatus();
};

var onSnapEnd = function () {
  board.position(game.fen());
}

var onMouseoverSquare = function (square, piece) {
  var moves = game.moves({
    square: square,
    verbose: true
  });

  if (moves.length === 0) {
    return false;
  }

  highlightMoves(square);

  moves.forEach(function(move) {
    highlightMoves(move.to);
  });
};

var onMouseoutSquare = function (square, piece) {
  unHighlightMoves();
}

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  } else if (game.in_draw() === true){
    status = 'Game over, drawn position';
  } else {
    status = moveColor + ' to move';
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  $('#status').html(status);
}

var onMoveEnd = function() {
  boardEl.find('.square-' + squareToHighlight).addClass('highlight-black');
};

var config = {
  showNotation: false,
  position: 'start',
  draggable: true,
  pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onMoveEnd: onMoveEnd
};

var board = ChessBoard('board', config);
