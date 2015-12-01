"use strict";

module.exports = function (server) {
  var _ = require('lodash');
  var io = require('socket.io').listen(server);
  var uuid = require('node-uuid');
  var Room = require('./room');

  var users = [];
  var rooms = [];

  io.on('connection', function (socket) {
    users.push({id: socket.id, status: 'idle'});
    var user = _.find(users, function (user) {
      return user.id == socket.id;
    });
    socket.emit('connected', {msg: 'welcome to Shatranj', id: socket.id});
    socket.on('start', function (data) {
      user.orientation = data.orientation;
      // find empty room or create new
      var room = _(rooms).find({status: 'available'});
      console.log(room);
      if (!room) {
        //TODO unique room
        room = new Room(uuid.v1());
        console.log(room);
        rooms.push(room);
      }
      room.addPlayer(user);
      socket.room = room;
      user.status = 'waiting';
      socket.join(room.id);
      if (room.status == 'full') {
        users = room.getPlayers();
        // change users status to playing
        _.map(users, function (user) {
          user.status = 'playing';
        });
        room.gameStatus = 'inProgress';
        console.log(room.name, room.id, room.gameStatus);
        // if already in room return false
        // give preference to 1st user to his preferred choice
        if (room.players[0].orientation == room.players[1].orientation) {
          if (room.players[0].orientation == 'w') {
            room.players[1].orientation = 'b';
          } else {
            room.players[1].orientation = 'w';
          }
        }
        io.to(room.id).emit('roomFull', {users: room.players, gameStatus: room.gameStatus});
        io.to(room.id).emit('begin', {});
      }
      console.log(data);
    });

    socket.on('stop', function (data) {
      if (!socket.room) {
        return false;
      }
      console.log(socket.id, 'stopped game', data);
      socket.room.removePlayer(user);
      user.orientation = null;
      // change room users status to waiting
      _.map(socket.room.players, function (player) {
        player.status = 'waiting';
      });
      socket.room.gameStatus = 'stopped';
      socket.leave(socket.room.id);
      io.to(socket.room.id).emit('stop', {data: data, gameStatus: socket.room.gameStatus});
      io.to(socket.room.id).emit('alert', {reason: 'game stopped due to opponent resign.'});
      //TODO if both users leave close room
    });
    socket.on('move', function (data) {
      if (!socket.room) {
        return false;
      }
      io.to(socket.room.id).emit('move', data);
      console.log(data);
    });
  });
};
