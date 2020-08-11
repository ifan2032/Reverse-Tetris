// AUTHORS: Alek and Leon

// NOTE:
// this is not classic tetris
// two of the biggest differences between this game and tetris are
// 1) rows never clear
// 2) you can't put stuff in overhangs, because the tile things aren't really connected to themselves and can kinda split up
// 3) you can break tiles if you feel like it see above

// conventions:
// pieces can be fit in a 3 by 3 grid, or at least some square grid

// general functions
function zeroVec(dim){
  let vec = [];
  for(var i = 0; i < dim; i++){
    vec.push(0);
  }
  return vec;
}

function copyMatrix(matrix){
  let newmatrix = [];
  for (var i = 0; i < matrix.length; i++) {
    newmatrix.push(matrix[i].slice());
  }
  return newmatrix;
}

// TODO: put a check to make sure that the pieces are all left justified

// 0 1 0 ==> 0 0 0
// 0 1 0 ==> 1 1 1
// 0 1 0 ==> 0 0 0
function rotatePiece90(piece){
  let newpiece = copyMatrix(piece);
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
  let newpiece = copyMatrix(piece);
  for (var i = 0; i < angle; i++) {
    newpiece = rotatePiece90(newpiece);
  }
  return newpiece;
}


const urlParams = new URLSearchParams(window.location.search);
const string_piece_sequence = urlParams.get("seq"); // "1111"
const level = urlParams.get("level");
let piece_sequence = [];
for (let i = 0; i < string_piece_sequence.length; i++){
  piece_sequence.push(parseInt(string_piece_sequence[i]));
}


let LEVEL_HEIGHT = {
  "1" : 4,
  "2" : 4,
  "3" : 5,
  "4" : 5, 
  "5" : 6,
}
// algorithm-y stuff
const w = 4; // width of tetris thing
const h = LEVEL_HEIGHT[level];
const piece_dim = 3;
const ANIMATION_WAIT_TIME = 1000;


// NOTE: THESE MUST BE JUSTIFIED
const PIECES = [
  [[1,0,0],[1,0,0],[1,0,0]],
  [[0,0,0],[1,1,0],[1,1,0]],
  [[1,1,0],[0,1,0],[1,1,0]],
  [[0,1,0],[1,1,1],[0,1,0]]
];

const COLORS = [
  "#ff00ff03",
  "#ff000003",
  "#ffffff03",
  "#ffff0003"
];

let n = piece_sequence.length;
var skyline = zeroVec(w);
// dp_table stores the largest number of pieces that you can fit if you started with specified skyline from piece i
let dp_table = {}; // dp[i, skyline] = max( dp[i+1, new_skyline] if you place piece_sequence[i] to make the skyline into skyline')

let PIECE_HEIGHT_PROFILES = [];
for (var i = 0; i < PIECES.length; i++) {
  PIECE_HEIGHT_PROFILES.push(zeroVec(piece_dim));
  for (var x = 0; x < piece_dim; x++) {
    for(var y = 0; y < piece_dim; y++) {
      if(PIECES[i][y][x] == 1) {
        PIECE_HEIGHT_PROFILES[i][x]++;
      }
    }
  }
}

let ORIENTED_PIECES = [];
for(var i = 0; i < PIECES.length; i++) {
  ORIENTED_PIECES.push([]);
  for(var angle = 0; angle < 4; angle++) {
    ORIENTED_PIECES[i].push(rotatePiece(PIECES[i], angle));
  }
}

function hash(skyline, index){
  return JSON.stringify(skyline)+"_index:"+index;
}

// goal: fit as many pieces as possible before you can't fit a piece
function dp(index, skyline) {
  // number of movies is 4 * w;

  //base case scenario, already exceed our stuff
  if(index == n){
    return {"val": 0, "strategy": []};
  }

  let best_option = {"angle": -1, "pos": -1}; //set best_option to some random stuff
  let best_next_strategy = []; //don't know what the best strat is
  let max_val = -1; //don't know what the max val is
  let isPossible = false; //don't know if it is possible yet

  //go through all possible angles/placements to figure out the best one
  for (let angle = 0; angle < 4; angle++){
    for (let pos = 0; pos < w; pos++){
      let new_skyline = updateSkyline(skyline, piece_sequence[index], angle, pos); //what the skyline will look like if we put the piece in this orientation
      if(new_skyline != false){ //make sure this configuration is POSSIBLE
        isPossible = true; //we have at least ONE solution
        let opt_soln;
        if (dp_table[hash(new_skyline, index)]) {
          opt_soln = dp_table[hash(new_skyline, index)]; //we already stored the best way to go from here
        }
        else { // recurse, and store it
          opt_soln = dp(index+1, new_skyline); //recursive step
          dp_table[hash(new_skyline, index)] = {"val": opt_soln.val, "strategy": opt_soln.strategy}; //best solution
        }
        let new_val = opt_soln.val; //what is the value of the solution? is it any good?
        let next_strategy = opt_soln.strategy; //what is the strategy?
        if(new_val > max_val){ //is this strategy better, if yes, replace
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
function updateSkyline(old_skyline, piece_type_index, angle, pos) {
  let oriented_piece = ORIENTED_PIECES[piece_type_index][angle];
  let new_skyline = old_skyline.slice();

  for(var i = 0; i< PIECE_HEIGHT_PROFILES[piece_type_index].length; i++) {
    if(i+pos >= w){  // if it's overhanging
      if(PIECE_HEIGHT_PROFILES[piece_type_index][i] != 0) // it better not be putting anything there
        return false;
    }
    else{
      new_skyline[i+pos] += PIECE_HEIGHT_PROFILES[piece_type_index][i];
      if(new_skyline[i + pos] > h)
        return false;
    }
  }

  return new_skyline;
}

// grid is a 2d array with grid[i][j] = index of piece that is occupying that square
function updateGrid(old_grid, old_skyline, piece_type_index, angle, pos){
  let oriented_piece = ORIENTED_PIECES[piece_type_index][angle];
  let new_grid = copyMatrix(old_grid);

  for(var i = 0; i< PIECE_HEIGHT_PROFILES[piece_type_index].length; i++) {
    if(i+pos < w){
      for(var j = 0; j<PIECE_HEIGHT_PROFILES[piece_type_index][i]; j++) {
        new_grid[old_skyline[i+pos]+j][i+pos] = piece_type_index;
      }
    }
  }
return new_grid;
}

// RUNNING STUFF GAME PART

let solution = null;
solution = dp(0, skyline);
console.log("YAY IM DONE");
console.log(solution);

let animation_ct = 0;
let animation_skyline = zeroVec(w);
let animation_grid = [];
for(var y = 0; y < h; y++){
  animation_grid.push([]);
  for(var x = 0; x < w; x++){
    animation_grid[y].push(-1); // -1 means "no piece stored here yet"
  }
}

function setup(){
  let canvas = createCanvas(500,500);
  canvas.parent("canvas-div");
  setTimeout(drawNextPiece, ANIMATION_WAIT_TIME);
  frameRate(20);
  background(200,200,200,100);
}

//draw is the function that runs over and over
function draw(){
  fill(255,255,255);
  stroke(0,0,0); //color of the border
  strokeWeight(5); //borders
  for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
      if(animation_grid[y][x] != -1){
        fill(COLORS[animation_grid[y][x]]);
        rect(x*width/w, height*(1-(y+1)/h), width/w, height/h);
      }
    }
  }
}

function drawNextPiece(){
  if(solution){ //if we have a solution
    animation_grid = updateGrid(animation_grid, animation_skyline, piece_sequence[animation_ct], solution.strategy[animation_ct].angle, solution.strategy[animation_ct].pos);
    animation_skyline = updateSkyline(animation_skyline, piece_sequence[animation_ct], solution.strategy[animation_ct].angle, solution.strategy[animation_ct].pos);

    if (animation_ct < solution.strategy.length-1) {
        animation_ct += 1;
        setTimeout(drawNextPiece, ANIMATION_WAIT_TIME); //wait a certain time before attepmting next skyline
    }
  }
  else{
      setTimeout(drawNextPiece, ANIMATION_WAIT_TIME);
  }
}

function submit_form(){
  //try this
  if(level == 5) {
    window.location.href = "end.html";
  } else{
    window.location.href = "player.html?level="+(parseInt(level)+1);
  }
}
