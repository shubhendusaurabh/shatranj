(function(shatranj) {
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

    this.engine = new shatranj.Engine({
      color: 'b',
      name: 'AI',
      stockfishUrl: '/public/js/stockfish.js',
      skillLevel: this.skillLevel,
      onReady: this.onPlayerReady.bind(this),
      onInfo: this.onPlayerInfo.bind(this),
      onMove: this.onPlayerMove.bind(this)
    });
    this.engine.startNewGame();

    // this.setTimePerTurn(200, true);
    this.engine.setSkillLevel(20);
    this.engine.setContempt(0);
  }

  Match.prototype.onPlayerReady = function () {
    if (this.engine.engineReady == true) {
      this.gameReady = true;
    }
  };

  Match.prototype.onPlayerInfo = function (info) {
    $('.engine-info').html(info);
  };

  Match.prototype.onPlayerMove = function (move) {
    var result = this.game.move(move);
    //on game over
    //else start next turn
    console.log(result);
  };

  shatranj.Match = Match;
}(shatranj));
