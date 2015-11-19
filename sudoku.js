/*********************************************************************
SudokuSolver - a light web application to solve sudokus
Copyright (c) 2015 - Philippe SWARTVAGHER

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
***********************************************************************/

$(function() {
	function sudokuValid(sudoku) {
	    for (var l = 0; l < 9; l++) {
	        for (var c = 0; c<9; c++) {
	            if (sudoku[l][c]==0) {
	                return false;
	            } else {
	                if (!checkPossibility(sudoku, sudoku[l][c], l, c, true)) {
	                    return false;
	                }
        		}
	    	}
	    }
	    return true;
	}

	function checkPossibility(sudoku, n, line, column, excluded) {
	    if (typeof excluded === "undefined") {
	        excluded = false;
	    }

	    if (n==0) {
	        return false;
	    }

	    // Line:
	    for (var c=0; c<9; c++) {
	        if (!(excluded && c==column)) {
	            if (sudoku[line][c]==n) {
	                return false;
	            }
	        }
	    }

	    // Column:
	    for (var l=0; l<9; l++) {
	        if (!(excluded && l==line)) {
	            if (sudoku[l][column]==n) {
	                return false;
	            }
	        }
	    }

	    // Big case:
	    for (var l = line-(line%3); l < line-(line%3)+3; l++) {
	        for (var c = column-(column%3); c < column-(column%3)+3; c++) {
	            if (!(excluded && l==line && c==column)) {
	                if (sudoku[l][c]==n) {
	                    return false;
	                }
	            }
	        }
	    }

	    // Else:
	    return true;
	}

	// To debug !
	function showSudoku(sudoku) {
	    for (var o = 0; o < 9; o++) {
	        console.log(sudoku[o]);
	    }
	}


	function rewind(l, c) {
	    if (c != 0) {
	        return {line: l, column: c-1};
	    } else {
	        if (l != 0) {
	            return {line: l-1, column: 8};
	        } else {
	            return {line: 10, column: 10};
	        }
	    }
	}

	function solve(sudoku) {

	    var values = getOriginalValues(sudoku);
	    var originalValues = getOriginalValues(sudoku);

	    var actions = Array()

	    var l = 0;
	    while (l < 9) {
	        var c = 0;
	        while (c < 9) {
	            if (originalValues[l][c]=="") { // Empty case, free value
	                var n = values[l][c];

	                while (checkPossibility(values, n, l, c)!=true && n<10) {
	                    n++;
	                }

	                if (n < 10) {
	                	values[l][c] = n;
	                	actions.push({l: l, c: c, value: n})
	                    //sudoku[l][c].val(n);

	                    c++;
	                } else {
	                    values[l][c] = 0;
	                    actions.push({l: l, c: c, value: ""})
	                    //sudoku[l][c].value = "";

	                    var coordRewind = rewind(l, c);
	                    l = coordRewind.line;
	                    c = coordRewind.column;
	                    while (originalValues[l][c]!=0) {
	                        coordRewind = rewind(l, c);
	                        l = coordRewind.line;
	                        c = coordRewind.column;
	                    }
                    }
	            } else {
	                c++;
	            }
	        }
	        l++;
	    }

	    return actions;
	}

	function boundSudoku() {
		sudoku = [];

		for (var i=0; i<9; i++) {
			line = [];
			for (var j=0; j<9; j++) {
				line.push($("#"+i+""+j));
			}
			sudoku.push(line);
		}

		return sudoku;
	}

	function getOriginalValues(sudoku) {
		originalValues = [];

		for (var i=0; i<9; i++) {
			line = [];
			for (var j=0; j<9; j++) {
				if (sudoku[i][j].val()=="") {
					line.push(0);
				} else {
					sudoku[i][j].css("color", "red");
					line.push(parseInt(sudoku[i][j].val()));
				}
			}
			originalValues.push(line);
		}

		return originalValues;
	}

	function checkContentBeforeSolve(sudoku) {
		for (var i=0; i<9; i++) {
			for (var j=0; j<9; j++) {
				value = sudoku[i][j].val();
				if (!/^[1-9]?$/.test(value)) {
					return false;
				} else {
					if (!checkPossibility(getOriginalValues(sudoku), parseInt(value), i, j, true)) {
						return false;
					}
				}
			}
		}

		return true;
	}

	function updateCase(sudoku, actions, k) {
		sudoku[actions[k].l][actions[k].c].val(actions[k].value)
		$('#msg_success').text(String(k) + " operations")

		k++;
		if (k<actions.length) {
			setTimeout(function() {
				updateCase(sudoku, actions, k);
			}, 50);
		} else {
			$('#msg_success').html($('#msg_success').text() + "<br />The sudoku was solved with success")
		}
	}

	$('#btn_solve').click(function() {
		sudoku = boundSudoku();

		if (checkContentBeforeSolve(sudoku)) {
			actions = solve(sudoku);
			updateCase(sudoku, actions, 0)
			//showSudoku(sudoku);
			if (sudokuValid(sudoku)) {
				$('#msg_success').removeClass('hidden');
			}
		} else {
			$('#msg_error').removeClass("hidden");
		}
	});

	$('#btn_clear').click(function() {
		for (var i=0; i<9; i++) {
			for (var j=0; j<9; j++) {
				$("#"+i+""+j).val("").css("color", "black");
			}
		}
		$('#msg_error').addClass("hidden");
		$('#msg_success').addClass("hidden");
	})
});