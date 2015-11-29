var _ = require('lodash');

function Room(id) {
  this.id = id;
  this.players = [];
  this.playersLimit = 2;
  this.status = 'available';
};

Room.prototype.addPlayer = function (playerId) {
  if (this.getStatus() === 'available') {
    this.players.push(playerId);
  }
  this.setStatus();
};

Room.prototype.removePlayer = function (playerId) {
  _.remove(this.players, function (player) {
    player.id == playerId;
  });
};

Room.prototype.getPlayer = function (playerId) {
  return _.find(this.players, function (player) {
    return player.id === playerId;
  });
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
