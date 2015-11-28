(function() {
  'use strict';

  function Match() {
    this.game = new Chess();
    this.gameReady = false;
    this.skillLevel = 20;

    this.board = ChessBoard('board', {
      showNotation: false,
      position: 'start',
      draggable: true,
      pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      onMouseoutSquare: onMouseoutSquare,
      onMouseoverSquare: onMouseoverSquare,
      onMoveEnd: onMoveEnd,
      showErrors: true
    });

    this.player1 = new Player({
      color: 'b',
      name: 'Player1',
      stockfishUrl: '/stockfish/src/stockfish.js',
      skillLevel: this.skillLevel,
      onReady: this.onPlayerReady.bind(this),
      onInfo: this.onPlayerInfo.bind(this),
      onMove: this.onPlayerMove.bind(this)
    });
    this.player1.startNewGame();

    this.setTimePerTurn(200, true);
    this.setSkillLevel(20, true);
    this.setContempt(0, true);
  }
}());
