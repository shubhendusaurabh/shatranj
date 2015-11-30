"use strict";

var game = new Chess();
var boardEl = $('#board');
var squareToHighlight;
var socket = io.connect(location.href);
var orientation;
var gameStatus = 'stopped';

$(window).on('resize', _.debounce(function () {
  board.resize();
}, 100));

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

var onDragStart = function (source, piece, position) {
  console.log(game.game_over());
  if (gameStatus == 'stopped' || game.turn() != orientation) {
    return false;
  }
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
  socket.emit('move', {from: source, to: target, promotion: 'q'});
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
  // engine.prepareMove();
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
var board;

var intialConfig = {
  showNotation: true,
  position: 'start',
  draggable: false,
  pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png',
  showErrors: 'console'
};

board = ChessBoard('board', intialConfig);

var playingConfig = {
  showNotation: true,
  position: 'start',
  draggable: true,
  pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onMoveEnd: onMoveEnd,
  showErrors: true,
  moveSpeed: 'slow',
  appearSpeed: 'slow',
  snapbackSpeed: 'slow',
  snapSpeed: 'slow',
  thrashSpeed: 'slow'
};


function engineGame(options) {
  options = options || {};
  var engine = new Worker('/public/js/stockfish.js');
  var evaler = new Worker('/public/js/stockfish.js');
  var engineStatus = {};
  var displayScore = false;
  var time = { wtime: 30000, btime: 30000, winc: 2000, binc: 2000 };
  var playerColor = 'white';
  var clockTimeoutID = null;
  var isEngineRunning = false;
  var evaluation = $('#evaluation');

  // TODO:: on game.game_over()

  function uciCmd(cmd, which) {
    console.log('UCI: ', cmd);
    (which || engine).postMessage(cmd);
  }
  uciCmd('uci');

  function displayStatus() {
    var status = 'Engine: ';
    if (!engineStatus.engineLoaded) {
      status += 'loading...';
    } else if (!engineStatus.engineReady) {
      status += 'loaded...';
    } else {
      status += 'ready';
    }

    if (engineStatus.search) {
      status += '<br/>' + engineStatus.search;
      if (engineStatus.score && displayScore) {
        status += (engineStatus.score.substr(0, 4) === 'Mate' ? ' ' : 'Score: ') + engineStatus.score;
      }
    }
    $('#engineStatus').html(status);
  }

  function displayClock(color, t) {
    var isRunning = false;
    if (time.startTime > 0 && color == time.clockColor) {
      t = Math.max(0, t + time.startTime - Date.now());
      isRunning = true;
    }
    var id = color == playerColor ? '#time2' : '#time1';
    var sec = Math.ceil(t/1000);
    var min = Math.floor(sec/60);
    sec -= min * 60;
    var hours = Math.floor(min/60);
    min -= hours * 60;
    var display = hours + ':' + ('0'+min).slice(-2) + ('0' + sec).slice(-2);
    if (isRunning) {
      display += sec & 1 ? ' <--' : '<-';
    }
    $(id).text(display);
  }

  function updateClock() {
    displayClock('white', time.wtime);
    displayClock('black', time.btime);
  }

  function clockTick() {
    updateClock();
    let t = (time.clockTick == 'white' ? time.wtime : time.btime) + time.startTime - Date.now();
    let timeToNextSecond = (t % 1000) + 1;
    clockTimeoutID = setTimeout(clockTick, timeToNextSecond);
  }

  function stopClock() {
    if (clockTimeoutID != null) {
      clearTimeout(clockTimeoutID);
      clockTimeoutID = null;
    }
    if (time.startTime > 0) {
      let elapsed = Date.now() - time.startTime;
      time.startTime = null;
      if (time.clockColor == 'white') {
        time.wtime = Math.max(0, time.wtime - elapsed);
      } else {
        time.btime = Math.max(0, time.btime - elapsed);
      }
    }
  }

  function startClock() {
    if (game.turn() == 'w') {
      time.wtime += time.winc;
      time.clockColor = 'white';
    } else {
      time.btime += time.binc;
      time.clockColor = 'black';
    }
    time.startTime = Date.now();
    clockTick();
  }

  function get_moves() {
    let moves = '';
    let history = game.history({verbose: true});
    history.forEach(function (move) {
      moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
    });
    return moves;
  }

  function prepareMove() {
    console.log('preparing move');
    stopClock();
    $('#pgn').text(game.pgn());
    board.position(game.fen());
    updateClock();
    var turn = game.turn() == 'w' ? 'white' : 'black';
    console.log(turn, playerColor, !game.game_over());
    if(!game.game_over()) {
      console.log('turn', turn);
      if (turn != playerColor) {
        uciCmd('position startpos moves' + get_moves());
        uciCmd('position startpos moves' + get_moves() ,evaler);

        uciCmd('eval', evaler);

        if (time && time.wtime) {
          uciCmd('go ' + (time.depth ? 'depth ' + time.depth : '') + ' wtime ' + time.wtime + ' winc ' + time.winc + ' btime ' + time.btime + ' binc ' + time.binc);
        } else {
          uciCmd('go ' + (time.depth ? 'depth ' + time.depth : ''));
        }
        isEngineRunning = true;
      }
      if (game.history().length >= 2 && !time.depth && !time.nodes) {
        startClock();
      }
    }
  }

  evaler.onmessage = function (event) {
    let line;
    if (event && typeof event === 'object') {
      line = event.data;
    } else {
      line = event;
    }

    console.log('evaler:' + line);

    if (line === 'uciok' || line === 'readyok' || line.substr(0, 11) === 'option name') {
      return false;
    }

    // TODO:: evaluation.textContent = line;
  }

  engine.onmessage = function (event) {
    let line;
    if (event && typeof event === 'object') {
      line = event.data;
    } else {
      line = event;
    }
    console.log('reply: ', line);
    if (line === 'uciok') {
      engineStatus.engineLoaded = true;
    } else if (line === 'readyok') {
      engineStatus.engineReady = true;
    } else {
      let match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
      if (match) {
        console.log('match', match, match[1]);
        isEngineRunning = false;
        game.move({from: match[1], to: match[2], promotion: match[3]});
        prepareMove();
        uciCmd('eval', evaler);
        evaluation.text('');
      } else if (match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
        engineStatus.search = 'Depth: ' + match[1] + ' Nps: ' + match[2];
      }

      if (match = line.match('/^info .*\bscore (\w+) (-?\d+)/')) {
        let score = parseInt(match[2]) * (game.turn() == 'w' ? 1 : -1);

        if (match[1] == 'cp') {
          engineStatus.score = (score / 100.0).toFixed(2)
        } else if (match[1] === 'mate') {
          engineStatus.score = "Mate in " + Math.abs(score);
        }

        if (match = line.match(/\b(upper|lower)boudn\b/)) {
          engineStatus.score = ((match[1] === 'upper') == (game.turn() == 'w') ? '<= ' : '>= ') + engineStatus.score;
        }
      }
    }
    displayStatus();
  };

  return {
    reset: function () {
      game.reset();
      uciCmd('setoption name Contempt value 0');
      this.setSkillLevel(0);
      uciCmd('setoption name King Safety value 0');
    },
    loadPgn: function (pgn) {
      game.load_pgn();
    },
    setPlayerColor: function (color) {
      playerColor = color;
      board.orientation(playerColor);
    },
    setSkillLevel: function (skill) {
      var max_err, err_prob, difficulty_slider;
      if (skill < 0) {
        skill = 0;
      } else if (skill > 20) {
        skill = 20;
      }

      time.level = skill;

      if (skill < 5) {
        time.depth = 1;
      } else if (skill < 10) {
        time.depth = 2;
      } else if (skill < 15) {
        time.depth = 3;
      } else {
        time.depth = '';
      }

      uciCmd('setoption name Skill Level value ' + skill);

      err_prob = Math.round((skill * 6.35) + 1);
      max_err = Math.round((skill * -0.5) + 10);

      uciCmd('setoption name Skill Level Maximum Error value ' + max_err);
      uciCmd('setoption name Skill Level Probability value ' + err_prob);
    },
    setTime: function (baseTime, inc) {
      time = {wtime: baseTime * 1000, btime: baseTime * 1000, winc: inc * 1000, binc: inc * 1000};
    },
    setDepth: function (depth) {
      time = {depth: depth};
    },
    setNodes: function (nodes) {
      time = { nodes: nodes}
    },
    setContempt: function (contempt) {
      uciCmd('setoption name Contempt value ' + contempt);
    },
    setAggressiveness: function (value) {
      uciCmd('setoption name Aggressiveness value ' + value);
    },
    setDisplayScore: function (flag) {
      displayScore = flag;
      displayStatus();
    },
    start: function () {
      uciCmd('ucinewgame');
      uciCmd('isready');
      engineStatus.engineReady = false;
      engineStatus.search = null;
      displayStatus();
      prepareMove();
      // announced_game_over = false;
    },
    undo: function () {
      if (isEngineRunning) {
        return false;
      }
      game.undo();
      game.undo();
      engineStatus.search = null;
      displayStatus();
      prepareMove();
      return true;
    },
    prepareMove: function () {
      prepareMove()
    }
  };
};

// var engine = engineGame({skill: 20});
// engine.reset();
// engine.setSkillLevel(20);
// engine.setPlayerColor('white');
// engine.start();
