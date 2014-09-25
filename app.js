'use strict';

var app = angular.module('TTTApp', ['ui.router']);
app.constant('Marker', { X: 1, O: 2});

app.config(function($stateProvider, $urlRouterProvider) {
  /*
    Provide a state for setup step to allow it to be ccessed via the back button
  */
  $urlRouterProvider.otherwise("/setup");
  $stateProvider.
    state('choosePlayers', {
      url: '/setup',
      templateUrl: '/partials/setup.html',
      controller: function($scope, $rootScope, $state) {
        $scope.title = 'Who Plays?';

        $scope.choosePlayers = function(num) {
          if(num === 1) {
            $rootScope.ai = true;
          }
          $state.go('startGame');
        };
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
      }
    });
});

app.controller('GameCtrl', function($scope, $state, aiPlayer, board, Marker, $rootScope) {
  $scope.gameOver = false;

  this.currentPlayer = Marker.X;
  var _this = this;

  $scope.reset = function(hard) {
    board.reset();
    _this.currentPlayer = Marker.X;
    aiPlayer.reset();
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

  this.togglePlayer = function() {
    this.currentPlayer = (this.currentPlayer === Marker.X) ? Marker.O : Marker.X;
  };

  this.runTest = function() {
    for(var i = 0; i < 50; i++) {
      console.time('cpuTest');
      this.cpuTest();
      console.timeEnd('cpuTest');
      $scope.reset(false);
    }
  };

  this.cpuTest = function() {
    // simulate human move
    var moves = board.getLegalMoves();
    var rand = Math.floor(Math.random() * moves.length);
    var randMove = moves[rand];

    board.markSquare(randMove.row, randMove.col, _this.currentPlayer);
    _this.togglePlayer();

    // use minimax to choose ALL remaining moves
    while(board.getLegalMoves().length > 0) {
      var move = aiPlayer.getMove(_this.currentPlayer);
      board.markSquare(move.row, move.col, _this.currentPlayer);
      _this.togglePlayer();
    }
    if(board.checkWinner() === 0)
      console.log("Draw");
    else
      console.log("Winner: " + board.checkWinner());
  };
  this.runTest();

  $scope.makeMove = function(row, col) {
    if(board.checkSpace(row, col) === 0 && !$scope.gameOver
      && _this.currentPlayer === Marker.X) {

      board.markSquare(row, col, _this.currentPlayer);
      _this.togglePlayer();

      var isDraw = board.isDraw();
      var winner = board.checkWinner();

      if(!(isDraw || winner !== 0) && $rootScope.ai) {
        console.time('getMove');
        var move = aiPlayer.getMove(_this.currentPlayer);
        console.timeEnd('getMove');
        _this.firstMove = false;
        board.markSquare(move.row, move.col, _this.currentPlayer);
        _this.togglePlayer();
        isDraw = board.isDraw();
        winner = board.checkWinner();
      }

      if(isDraw) {
        $scope.gameOver = true;
        $scope.message = "Draw!";
      }
      else if(winner) {
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


});
