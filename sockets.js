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
    socket.emit('connected', {msg: 'welcome to Shatranj', id: socket.id});
    socket.on('start', function (data) {
      console.log('start');
      // set user status to waiting
      var user = _.find(users, function (user) {
        return user.id == socket.id;
      });
      // find empty room or create new
      var room = _(rooms).find({status: 'available'});
      // var room = _.chain(rooms).sample(1).find(users, {status: 'available'});
      console.log(room);
      if (!room) {
        room = new Room(_.sample(roomNames));
        console.log(room);
        rooms.push(room);
      }
      room.addPlayer(user);
      user.status = 'waiting';
      socket.join(room.name);
      console.log(data);
    });

    socket.on('move', function (data) {
      console.log(data);
    });
    
  });
};
