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
      controller: function($scope, $rootScope, game, Marker) {
        $scope.isGameOver = game.gameOver;
        $scope.getSquareMarker = function(row, col) {
          var space = game.checkSpace(row, col);
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
          $scope.message = game.makeMove(row, col);
        };
      },
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

app.service('game', function(board, Marker, $rootScope) {
  this.ai = $rootScope.ai;
  this.playerFirst = $rootScope.playerFirst;
  this.currentPlayer = Marker.X;
  this.gameOver = false;

  this.checkSpace = function(row, col) {
    return board.checkSpace(row, col);
  };

  this.makeMove = function(row, col) {
    if(board.checkSpace(row, col) === 0 && !this.gameOver) {
      board.markSquare(row, col, this.currentPlayer);
      this.togglePlayer();

      if(board.isDraw()) {
        this.gameOver = true;
        return "Draw!";
      }
      var winner = board.checkWinner();
      if(winner !== 0) {
        this.gameOver = true;
        if(winner === Marker.X) {
          return "X wins!";
        }
        else {
          return "O wins!";
        }
      }
    }
  };

  this.togglePlayer = function() {
    this.currentPlayer = (this.currentPlayer === Marker.X) ? Marker.O : Marker.X;
  };

});
