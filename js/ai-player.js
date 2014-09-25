app.service('aiPlayer', function(Marker, board) {
  this.firstMove = true;

  this.reset = function() {
    this.firstMove = true;
  };

  this.getMove = function(player) {
    var bestScore = -100, bestMove = {};
    var legalMoves = board.getLegalMoves();
    var xMarks, oMarks;

    if(this.firstMove) {
      this.firstMove = false;
      return this.getFirstMove([].concat.apply([], board.Xsquares).join(''));
    }

    legalMoves.forEach(function(move) {
      xMarks = angular.copy(board.Xsquares);
      oMarks = angular.copy(board.Osquares);

      var score = this.getScore(move, xMarks, oMarks, false, 0, player);
      if(score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

    }, this);
    return bestMove;
  };

  /*
    There is a 3s delay finding the first move. This might be an issue
    with Angualar? Caching optimal first moves to remove this delay
  */
  this.getFirstMove = function(opponent) {
    if(opponent === "100000000" || opponent === "001000000"
      || opponent === "000000100" || opponent === "000000001") {

      return { row: 1, col: 1 };
    }
    else if(opponent === "010000000" || opponent === "000100000"
      || opponent === "000010000") {

      return { row: 0, col: 0};
    }
    else if(opponent === "000001000") {
      return { row: 0, col: 2 };
    }
    else if (opponent === "000000010") {
      return { row: 0, col: 1 };
    }
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
