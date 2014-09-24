app.service('aiPlayer', function(Marker, board) {
  this.getMove = function() {
    var bestScore = -100, bestMove = {};
    var legalMoves = board.getLegalMoves();
    var xMarks, oMarks;

    legalMoves.forEach(function(move) {
      xMarks = angular.copy(board.Xsquares);
      oMarks = angular.copy(board.Osquares);

      var score = this.getScore(move, xMarks, oMarks, false, 0, Marker.O);
      if(score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

    }, this);
    return bestMove;
  };

  this.getScore = function(move, xMarks, oMarks, isMax, depth, player) {
    if(player === Marker.X) {
      xMarks[move.row][move.col] = 1;
    }
    else {
      oMarks[move.row][move.col] = 1;
    }

    // is the game over?
    var winner = board.checkWinner(xMarks, oMarks);
    var legalMoves = board.getLegalMoves(xMarks, oMarks);
    if(legalMoves.length === 0 || winner !== 0) {
        if(winner !== 0) {
          return isMax ? depth - 100 : 100 - depth;
        }
        return 0;
    }
    else {
      player = player == Marker.X ? Marker.O : Marker.X;
      if(isMax) {
        var bestScore = -100, i;
        for(i = 0; i < legalMoves.length; i++) {
          bestScore = Math.max(bestScore, this.getScore(legalMoves[i], angular.copy(xMarks), angular.copy(oMarks), false, depth+1, player));
          if(bestScore == 100) break;
        }
        return bestScore;
      }
      else {
        var worstScore = 100;
        for(i = 0; i < legalMoves.length; i++) {
          worstScore = Math.min(worstScore, this.getScore(legalMoves[i], angular.copy(xMarks), angular.copy(oMarks), true, depth+1, player));
          if(worstScore == -100) break;
        }
        return worstScore;
      }
    }
  };
});
