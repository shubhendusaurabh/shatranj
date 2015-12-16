(function() {
  'use strict';

  angular.module('shatranj')
    .service('gameService', ['$q', GameService]);


  function GameService($q) {
    var games = [
      {
        name: 'Chess',
        description: 'Classic board game with origins in India'
      },
      {
        name: 'Checkers',
        description: 'Also known as Draughts'
      }
    ];

    return {
      getAllGames: function () {
        return $q.when(games);
      }
    };
  }

}());
