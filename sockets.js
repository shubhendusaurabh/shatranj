"use strict";

module.exports = function (server) {
  var _ = require('lodash');
  var io = require('socket.io').listen(server);

  var Room = require('./room');

  var users = [];
  var rooms = [];
  var roomNames = ['shu', 'bhu'];

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
        room = new Room(_.sample(roomNames));
        console.log(room);
        rooms.push(room);
      }
      room.addPlayer(user);
      socket.room = room;
      user.status = 'waiting';
      console.log(socket.room, room);
      socket.join(room.id);
      if (room.status == 'full') {
        users = room.getPlayers();
        // change users status to playing
        _.map(users, function (user) {
          user.status = 'playing';
        });
        console.log(room.name, room.id);
        // if already in room return false
        // give preference to 1st user to his preferred choice
        if (room.players[0].orientation == room.players[1].orientation) {
          if (room.players[0].orientation == 'w') {
            room.players[1].orientation = 'b';
          } else {
            room.players[1].orientation = 'w';
          }
        }
        io.to(room.id).emit('roomFull', {users: room.players});
        io.to(room.id).emit('begin', {});
      }
      console.log(data);
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
