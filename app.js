'use strict';

var app = angular.module('TTTApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  /*
    Provide a state for each setup step to allow them to be added to history
    and accessed via the back button
  */
  $urlRouterProvider.otherwise("/setup/1");
  $stateProvider.
    state('choosePlayers', {
      url: '/setup/1',
      templateUrl: '/partials/setup.html',
      controller: function($scope, $rootScope, $state) {
        $scope.title = 'Who Plays?';
        $rootScope.ai = false;

        $scope.choosePlayers = function(num) {
          if(num === 2) {
            $state.go('startGame');
          }
          else {
            $rootScope.ai = true;
            $state.go('firstPlayer');
          }
        };
      }
    }).
    state('firstPlayer', {
      url: '/setup/2',
      templateUrl: '/partials/setup.html',
      controller: function($scope, $rootScope, $state) {
        $scope.title = 'Who is first?';

        $scope.playerFirst = function(player) {
          $rootScope.playerFirst = player;
          $state.go('startGame');
        }
      },
      onEnter: function($state, $rootScope) {
        // don't allow this route unless step one has happened
        if($rootScope.ai === undefined) {
          $state.go('choosePlayers');
        }
      }
    }).
    state('startGame', {
      url: '/game',
      templateUrl: 'partials/game.html',
      controller: 'GameCtrl',
      onEnter: function($state, $rootScope) {
        // don't allow this route unless step one has happened
        // if($rootScope.ai === undefined) {
        //   $state.go('choosePlayers');
        // }
        $rootScope.ai = true;
        $rootScope.playerFirst = false;
      }
    });
});

app.constant('Marker', { X: 1, O: 2});

app.controller('GameCtrl', function($scope, $state, aiPlayer, board, Marker, $rootScope) {
  $scope.gameOver = false;

  this.currentPlayer = Marker.X;
  var _this = this;

  $scope.reset = function(hard) {
    board.reset();
    _this.currentPlayer = Marker.X;
    $scope.gameOver = false;
    $scope.message = "";

    if(hard) {
      $state.go('choosePlayers');
    }
  };

  $scope.getSquareMarker = function(row, col) {
    var space = board.checkSpace(row, col);
    switch(space) {
      case Marker.X:
        return "fa fa-times";
      case Marker.O:
        return "fa fa-circle-o";
      case 0:
        return "";
    }
  };

  $scope.makeMove = function(row, col) {
    if(board.checkSpace(row, col) === 0 && !$scope.gameOver) {
      board.markSquare(row, col, _this.currentPlayer);
      _this.togglePlayer();

      var winner = board.checkWinner();

      if(!board.isTerminal() && $rootScope.ai) {
        var move = aiPlayer.getMove();
        board.markSquare(move.row, move.col, _this.currentPlayer);
        _this.togglePlayer();
        winner = board.checkWinner();
      }

      if(board.isDraw()) {
        $scope.gameOver = true;
        $scope.message = "Draw!";
      }
      if(winner !== 0) {
        $scope.gameOver = true;
        if(winner === Marker.X) {
          $scope.message = "X wins!";
        }
        else {
          $scope.message = "O wins!";
        }
      }
    }
  };

  this.togglePlayer = function() {
    this.currentPlayer = (this.currentPlayer === Marker.X) ? Marker.O : Marker.X;
  };

});
