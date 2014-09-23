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

app.service('board', function(Marker) {
  this.Xsquares = [[0,0,0],[0,0,0],[0,0,0]];
  this.Osquares = [[0,0,0],[0,0,0],[0,0,0]];
  this.winCases = [
    [[1,1,1],[0,0,0],[0,0,0]],
    [[0,0,0],[1,1,1],[0,0,0]],
    [[0,0,0],[0,0,0],[1,1,1]],
    [[1,0,0],[1,0,0],[1,0,0]],
    [[0,1,0],[0,1,0],[0,1,0]],
    [[0,0,1],[0,0,1],[0,0,1]],
    [[1,0,0],[0,1,0],[0,0,1]],
    [[0,0,1],[0,1,0],[1,0,0]]
  ];

  this.isDraw = function() {
    var flattenX = [].concat.apply([], this.Xsquares);
    var flattenO = [].concat.apply([], this.Osquares);

    var draw = true;
    for(var i = 0; i < flattenX.length; i++) {
      draw = draw && (flattenX[i] === 1 || flattenO[i] === 1);
    }
    return draw;
  };

  this.checkSpace = function(row, col) {
    var x = this.Xsquares[row][col];
    var o = this.Osquares[row][col];

    if(x === 1)
      return Marker.X;
    else if(o === 1)
      return Marker.O;
    else
      return 0;
  };

  this.markSquare = function(row, col, player) {
    if(player === Marker.X) {
      this.Xsquares[row][col] = 1;
    }
    else {
      this.Osquares[row][col] = 1;
    }
  };

  this.checkWinner = function() {
    for(var i = 0; i < this.winCases.length; i++) {
      if(this.winCases[i].toString() === this.Xsquares.toString()) {
        return Marker.X;
      }
      else if(this.winCases[i].toString() === this.Osquares.toString()) {
        return Marker.O;
      }
    }
    return 0;
  };
});

app.controller('GameCtrl', function($scope, board, Marker, $rootScope) {
  $scope.gameOver = false;

  this.currentPlayer = Marker.X;
  var _this = this;

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

      if(board.isDraw()) {
        $scope.gameOver = true;
        return "Draw!";
      }
      var winner = board.checkWinner();
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
