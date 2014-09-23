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
      controller: function($scope, $rootScope, game) {
        $scope.title = 'hi';
        $scope.getSquareMarker = function(row, col) {
          var space = game.checkSpace(row, col);
          switch(space) {
            case 1:
              return "fa fa-times";
            case -1:
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
        if($rootScope.ai === undefined) {
          $state.go('choosePlayers');
        }
        // $rootScope.ai = true;
        // $rootScope.playerFirst = false;
      }
    });
});

app.service('board', function() {
  this.x = 1;
  this.o = -1;
  this.squares = [[0,0,0],[0,0,0],[0,0,0]];

  this.isDraw = function() {
    return this.squares.every(function(element) {
      return element.every(function(el) { return el !== 0; })
    });
  };

  this.checkWinner = function() {
    var across, down, diag1, diag2, col, row;
    across = down = col = row = 0;

    // check across and down posibilities
    for(row = 0; row < 3; row++) {
      for(col = 0; col < 3; col++) {
        var acrossVal = this.squares[row][col];
        across += acrossVal;
      }
      if(across === 3 || down === 3 || diag1 == 3 || diag2 === 3) return this.x;
      else if(across === -3 || down === -3 || diag1 === -3 || diag2 === -3) return this.o;
    }
    for(col = 0; col < 3; col++) {
      for(row = 0; row < 3; row++) {
        var downVal = this.squares[row][col];
        down += downVal;
      }
      if(across === 3 || down === 3 || diag1 == 3 || diag2 === 3) return this.x;
      else if(across === -3 || down === -3 || diag1 === -3 || diag2 === -3) return this.o;
    }

    // check diagonal
    diag1 = this.squares[0][0] + this.squares[1][1] + this.squares[2][2];
    diag2 = this.squares[0][2] + this.squares[1][1] + this.squares[2][0];

    if(across === 3 || down === 3 || diag1 == 3 || diag2 === 3) return this.x;
    else if(across === -3 || down === -3 || diag1 === -3 || diag2 === -3) return this.o;
    return 0; // no winner on board
  };
});

app.service('game', function(board, $rootScope) {
  this.ai = $rootScope.ai;
  this.playerFirst = $rootScope.playerFirst;
  this.current_player = 1;
  this.game_over = false;

  this.checkSpace = function(row, col) {
    return board.squares[row][col];
  };

  this.makeMove = function(row, col) {
    if(board.squares[row][col] === 0) {
      board.squares[row][col] = this.current_player;
      this.togglePlayer();
    }
    var winner = board.checkWinner();
    if(winner !== 0) {
      if(winner === 1) return 'X wins';
      if(winner === 0) return 'O wins';
    }
    else if(board.isDraw()) {
      return 'draw';
    }
    return "";
  };

  this.togglePlayer = function() {
    this.current_player = (this.current_player === 1) ? -1 : 1;
  };

});
