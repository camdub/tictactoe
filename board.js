app.service('board', function(Marker) {
  // this.Xsquares = [[1,0,0],[0,0,0],[0,1,0]];
  // this.Osquares = [[0,0,1],[1,0,0],[1,0,0]];
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
  this.grid = 3;

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

  this.isTerminal = function() {
    return this.isDraw() || this.checkWinner() !== 0;
  };

  this.getLegalMoves = function(xMarks, oMarks) {
    var moves = [];
    xMarks = xMarks || this.Xsquares;
    oMarks = oMarks || this.Osquares;

    for(var i = 0; i < this.grid; i++) {
      for(var j = 0; j < this.grid; j++) {
        if(xMarks[i][j] === 0 && oMarks[i][j] === 0) {
          moves.push({row: i, col: j});
        }
      }
    }
    return moves;
  };

  /*
    To avoid lots of loops here, we convert the winning board configurations
    to binary and do a bitwise comparison--this is only 8 iterations.
  */
  this.checkWinner = function(xMarks, oMarks) {
    xMarks = xMarks || this.Xsquares;
    oMarks = oMarks || this.Osquares;

    var xBin = [].concat.apply([], xMarks).join('');
    var oBin = [].concat.apply([], oMarks).join(''); // array into "11000"

    for(var i = 0; i < this.winCases.length; i++) {
      var winBin = [].concat.apply([], this.winCases[i]).join('');
      var winIntVal = parseInt(winBin, 2);


      if((winIntVal & parseInt(xBin, 2)) == winIntVal) {
        return Marker.X;
      }
      else if((winIntVal & parseInt(oBin, 2)) == winIntVal) {
        return Marker.O;
      }
    }
    return 0;
  };

  this.reset = function() {
    this.Xsquares = [[0,0,0],[0,0,0],[0,0,0]];
    this.Osquares = [[0,0,0],[0,0,0],[0,0,0]];
  };
});
