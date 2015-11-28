var _ = require('lodash');

function Room(name, id, owner) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.users = [];
  this.usersLimit = 4;
  this.status = 'available';
  this.private = false;
};

Room.prototype.addUser = function (userId) {
  if (this.status === 'available') {
    this.users.push(userId);
  }
};

Room.prototype.removeUser = function (userId) {
  // TODO lodash find and remove or object oriented
  var userIndex = _.find(this.users, function (user) {
    return user.id = userId;
  });
  this.people.remove(userIndex);
};

Room.prototype.getUser = function (userId) {
  return _.find(this.users, function (user) {
    return user.id === userId;
  });
};

Room.prototype.isAvailable = function () {
  return this.available === 'available';
};

Room.prototype.isPrivate = function () {
  return this.private;
};

module.exports = Room;
