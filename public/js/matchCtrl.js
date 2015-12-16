(function() {
  'use strict';

  angular.module('shatranj')
    .controller('MatchController', [
      'gameService', '$mdSidenav', '$mdBottomSheet', MatchController
    ]);

  function MatchController(gameService, $mdSidenav, mdBottomSheet) {
    var self = this;
    self.selected = null;
    self.games = [];
    self.selectGame = selectGame;
    self.toggleList = toggleGamesList;
    self.play = play;

    gameService
      .getAllGames()
      .then(function (games) {
        self.games = [].concat(games);
        self.selected = games[0];
      });

    function selectGame(game) {
      self.selected = angular.isNumber(game) ? $scope.games[game] : game;
      self.toggleList();
    }

    function play($event) {
      var user = self.selected;

      $mdBottomSheet.show({
        parent: angular.element(document.getElementById('content')),
        templateUrl: './view/match/view/games.html',
        controller: ['$mdBottomSheet', GameSheetController],
        controllerAs: 'vm',
        bindToController: true,
        targetEvent: $event
      }).then(function (clickedItem) {
        console.log(clickedItem.name + ' clicked!');
      });

      function GameSheetController($mdBottomSheet) {
        this.game = game;
        this.items = [
          {name: 'shubeh'},
          {name: 'hello'}
        ];
        this.performAction = function(action) {
          $mdBottomSheet.hide(action);
        };
      }
    }
  }
}());
