var _ = require('lodash');

function Room(id) {
  this.id = id;
  this.players = [];
  this.playersLimit = 2;
  this.status = 'available';
  this.gameStatus = 'stopped';
};

Room.prototype.addPlayer = function (player) {
  if (this.getStatus() === 'available') {
    this.players.push(player);
  }
  this.setStatus();
};

Room.prototype.removePlayer = function (currPlayer) {
  _.remove(this.players, function (player) {
    player.id == currPlayer.id;
  });
};

Room.prototype.getPlayer = function (playerId) {
  return _.find(this.players, function (player) {
    return player.id === playerId;
  });
};

Room.prototype.getPlayers = function () {
  return this.players;
};

Room.prototype.setStatus = function () {
  if (this.players.length >= this.playersLimit) {
    this.status = 'full';
  }
};
Room.prototype.getStatus = function () {
  return this.status;
};

module.exports = Room;
