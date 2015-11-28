(function() {
  'use strict';

  function Engine(options) {
    this.engine = new Worker(options.stockfishUrl);
    this.engine.onmessage = this.onEngineMessage.bind(this);
    this.engineLoaded = false;
    this.engineReady = false;
    this.skillLevel = options.skillLevel || 0;
    this.color = options.color;
    this.name = options.name || 'Stockfish';
    this.onReady = options.onReady;
    this.onInfo = options.onInfo;
    this.onMove = options.onMove;
    this.uciCmd('uci');
  }

  Engine.prototype.uciCmd = function (cmd) {
    this.engine.postMessage(cmd);
  };

  Engine.prototype.startNewGame = function () {
    this.uciCmd('ucinewgame');
    this.uciCmd('isready');
    this.engineReady = false;
  };

  Engine.prototype.onEngineMessage = function (event) {
    var line;
    if (event && typeof event === 'object') {
      line = event.data;
    } else {
      line = event;
    }

    if (line === 'uciok') {
      this.engineLoaded = true;
    } else if (line === 'readyok') {
      this.engineReady = true;
      this.setSkillLevel(this.skillLevel);
      if (this.onReady) {
        this.onReady(); //TODO::
      }
    } else {
      var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])(qrbk)?/);
      if (match) {
        if (this.onMove) {
          this.onMove({
            from: match[1],
            to: match[2],
            promotion: match[3]
          });
        }
      } else {
        // example feedback
        match = line.match(/^info .*\bdepth (\d+) .*\bscore cp (-?\d+) .*\bnodes (\d+) .*\btime (\d+)/);
        if (match) {
          this.onInfo({
            depth: parseInt(match[1], 10) || 0,
            score: parseInt(match[2], 10) || 0,
            nodes: parseInt(match[3], 10) || 0,
            time: parseInt(match[4], 10) || 0
          });
        }
      }
    }
  };

  Engine.prototype.startTurn = function (gameMoves, moveTime) {
    this.uciCmd('position startpos moves' + (gameMoves || ''));
    this.uciCmd('go movetime ' + (moveTime || 500));
  };

  Engine.prototype.setSkillLevel = function (skill) {
    var clampedSkill = Math.max(0, Math.min(skill, 20));
    this.uciCmd('setoption name Skill Level value ' + clampedSkill);

    var errorProbability = Math.round((clampedSkill * 6.35) + 1);
    var maxError = Math.round((clampedSkill * -0.5) + 10);

    this.uciCmd('setoption name Skill Level Maximum Error value ' + maxError);
    this.uciCmd('setoption name Skill Level Probability value ' + errorProbability);
  };

  Engine.prototype.reset = function () {
    this.uciCmd('setoption name Contempt value 0');
    this.setSkillLevel(0);
    this.uciCmd('setoption name King Safety value 0'); // Aggressiveness 100
  };

  Engine.prototype.setContempt = function (contempt) {
    this.uciCmd('setoption name Contempt value ' + contempt);
  };

  Engine.prototype.setAggressiveness = function (value) {
    this.uciCmd('setoption name Aggressiveness value ' + value);
  };

}());
