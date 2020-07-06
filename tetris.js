// TODO:
// precompute piece rotations
// precompute piece "profiles" Leon's height things

// NOTE:
// this is not classic tetris
// two of the biggest differences between this game and tetris are
// 1) rows never clear
// 2) you can't put stuff in overhangs
// 3) you can break tiles if you feel like it

// conventions:
// pieces can be fit in a 3by3 grid, or at least some square grid

// algorithm-y stuff
const w = 10; // width of tetris thing
const h = 16;
const piece_dim = 3;  // all pieces fit in a dim by dim square

const PIECES = [
  [[0,1,0],[0,1,0],[0,1,0]],
  [[0,0,0],[0,1,1],[0,1,1]],
  [[1,1,0],[0,1,0],[1,1,0]]
];

// 0 1 0 ==> 0 0 0
// 0 1 0 ==> 1 1 1
// 0 1 0 ==> 0 0 0
function rotatePiece90(piece){
  let newpiece = [];
  for (var i = 0; i < piece_dim; i++) {
    newpiece.push(piece[i].slice());
  }
  const x = Math.floor(piece_dim/2);
  const y = piece_dim - 1;
  for (let i = 0; i < x; i++) {
     for (let j = i; j < y - i; j++) {
        k = newpiece[i][j];
        newpiece[i][j] = newpiece[y - j][i];
        newpiece[y - j][i] = newpiece[y - i][y - j];
        newpiece[y - i][y - j] = newpiece[j][y - i]
        newpiece[j][y - i] = k
     }
  }

  return newpiece;
}

// angle = 0,1,2,3 corresponding to 0*90, 1*90, 2*90, 3*90
function rotatePiece(piece, angle){
  for (var i = 0; i < angle; i++) {
    piece = rotatePiece90(piece);
  }
  return piece;
}

var skyline = [];
for (var i = 0; i < w; i++) {
  skyline.push(0);
}

let piece_sequence = [PIECES[0], PIECES[0], PIECES[1], PIECES[1], PIECES[1], PIECES[1]];
let n = piece_sequence.length;

// dp_table stores the largest number of pieces that you can fit if you started with specified skyline from piece i
let dp_table = {}; // dp[i, skyline] = max( dp[i+1, new_skyline] if you place piece_sequence[i] to make the skyline into skyline')

function hash(skyline, index){
  return JSON.stringify(skyline)+"_index:"+index;
}

// goal: fit as many pieces as possible before you can't fit a piece
function dp(index, skyline) {
  // number of movies is 4 * w;

  if(index == n){
    return {"val": 0, "strategy": []};
  }

  let piece = piece_sequence[index];

  let best_option = {"angle": -1, "pos": -1};
  let best_next_strategy = [];
  let max_val = -1;
  let isPossible = false;

  for (let angle = 0; angle < 4; angle++){
    for (let pos = 0; pos < w; pos++){
      let new_skyline = updateSkyline(skyline, piece, angle, pos);
      if(new_skyline != false){
        isPossible = true;
        let opt_soln;
        if (dp_table[hash(new_skyline, index)]) {
          opt_soln = dp_table[hash(new_skyline, index)];
        }
        else { // recurse, and store it
          opt_soln = dp(index+1, new_skyline);
          dp_table[hash(new_skyline, index)] = {"val": opt_soln.val, "strategy": opt_soln.strategy};
        }
        let new_val = opt_soln.val;
        let next_strategy = opt_soln.strategy;
        if(new_val > max_val){
          max_val = new_val;
          best_option["angle"] = angle;
          best_option["pos"] = pos;
          best_next_strategy = next_strategy;
        }
      }
    }
  }

  if(!isPossible){
    return {"val": 0, "strategy": []};
  }
  else{
    return {"val": max_val + 1, "strategy": [best_option, ...best_next_strategy]};
  }
}

// returns the new skyline array, or false if it is impossible to place the piece
function updateSkyline(old_skyline, piece, angle, pos) {
  let oriented_piece = rotatePiece(piece, angle);
  let new_skyline = old_skyline.slice();

  let heights = [];
  for (var i = 0; i < piece_dim; i++) {
    heights.push(0);
  }

  for(var x = 0; x < piece_dim; x++) {
    for(var y = 0; y < piece_dim; y++) {
      if(oriented_piece[y][x] == 1) {
        heights[x] += (piece_dim - y);
        break;
      }
    }
  }

  for(var i = 0; i< heights.length; i++) {
    if(i+pos >= w){
      if(heights[i] != 0)
        return false;
    }
    else{
      new_skyline[i+pos] += heights[i];
      if(new_skyline[i + pos] > h)
        return false;
    }
  }

  return new_skyline;
}

let solution = dp(0, skyline);
console.log("YAY IM DONE");
console.log(solution);

function setup(){
  createCanvas(500,500);
}

function draw(){
    background(0);
}
