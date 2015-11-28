"use strict";

module.exports = function (server) {
  var _ = require('lodash');
  var io = require('socket.io').listen(server);

  var players = [];
  var rooms = ['shu', 'bhu'];

  io.on('connection', function (socket) {
    socket.emit('connected', {msg: 'welcome to Shatranj', id: socket.id});
    socket.on('start', function (data) {
      var room = _.sample(_.filter(rooms, function (room) {
        room.length
      }), 1);
      player.room = _.sample(rooms, 1);
      socket.join(player.room);
      console.log(data);
      if (players.length > 1) {
        var currentPlayer = _.find(players, function (player) {
          return player.socket.id === socket.id;
        });
        players = _.filter(players, function (player) {
          player.socket.id != currentPlayer.socket.id;
        });
      }
    });

    socket.on('move', function (data) {
      console.log(data);
    });
  });
}
