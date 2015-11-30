"use strict";

socket.on('connected', function (data) {
  console.log(data);
  socket.emit('move', {msg: 'hello'});
});
socket.on('roomFull', function (data) {
  board.destroy();
  board = ChessBoard('board', playingConfig);
  data.users.forEach(function (user) {
    if (user.id == socket.id) {
      orientation = user.orientation;
    }
  });
  // change orientation if black as white is default
  if (orientation == 'b') {
    board.orientation('black');
  }
  console.log('Room is full, Starting game', data, orientation);
  gameStatus = data.gameStatus;
});

// on start give option to select side b/w/random if starting
// else assign empty room orientation

$('.startGame').on('click', function (e) {
  console.log('starting game');
  orientation = $('input[name="orientation"]:checked').val();
  if (!orientation) {
    alert('please select side first');
    return false;
  }
  socket.emit('start', {orientation: orientation});
  $('input[name="orientation"]:radio').attr('disabled', true);
  return false;
});

$('.stopGame').on('click', function (e) {
  console.log('stopping game');
  socket.emit('stop', {stop: true});
});

socket.on('stop', function (data) {
  gameStatus = data.gameStatus;
  console.log(data);
});

socket.on('move', function (data) {
  console.log(data);
  let move = game.move(data);
  console.log(move);
  board.position(game.fen());
  updateStatus(move);
});

socket.on('alert', function (data) {
  alert(data.reason);
  console.log('alert', data);
});
