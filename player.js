const NUM_PIECES = 4;


const urlParams = new URLSearchParams(window.location.search);
const score = parseInt(urlParams.get("score"));

setTimeout(()=>{$("#display-score").text("YOUR SCORE:" + score);}, 500);

const level = urlParams.get('level') || "1";

const LEVEL_PIECE_QUANTITIES = {
  "1": [2,2,1,2],
  "2": [1,1,2,3],
  "3": [2,2,2,1],
  "4": [3,3,3,3],
  "5": [4,4,4,4]
}

const LEVEL_LENGTH_SEQUENCE = {
  "1" : 3,
  "2" : 4, 
  "3" : 5,
  "4" : 6,
  "5" : 7
}

if (!LEVEL_PIECE_QUANTITIES[level]){
  level = "1"
}

let piece_quantities = LEVEL_PIECE_QUANTITIES[level];
const LENGTH_SEQUENCE = LEVEL_LENGTH_SEQUENCE[level];
let sequence = [];
for(let i = 0; i < LENGTH_SEQUENCE; i++)
  sequence.push("-1");

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  if (!data)
    return;
  const slot_index = parseInt(ev.target.id.replace("slot", ""));
  const str_piece_index = data.replace("piece", "");
  const piece_index = parseInt(str_piece_index);
  if(sequence[slot_index] != "-1"){
    alert("you already put a piece there!")
    return;
  }
  if(piece_quantities[piece_index] == 0){
    alert("hey, that piece is all used up whatre you doing?")
    return;
  }
  sequence[slot_index] = str_piece_index;
  piece_quantities[piece_index] -= 1;
  $("#quantity"+str_piece_index).text("quantity: " + piece_quantities[piece_index]);

  let copyimg = $("<img />");
  copyimg.attr("src", $("#"+data).attr("src"));
  ev.target.appendChild(copyimg[0]);
}

for(var j = 0; j < NUM_PIECES; j++) {
  let imgTag = $("<img draggable='true' ondragstart='drag(event)'/>");
  let quantityTag = $("<h3></h3>");
  quantityTag.attr("id", "quantity"+j);
  quantityTag.text(piece_quantities[j]);
  imgTag.attr("id", "piece"+j);
  imgTag.attr("src", "piece_pics/piece" + j + ".png");
  imgTag.attr("width", 100/NUM_PIECES + "%");
  $("#piece_bank"+j).append(imgTag);
  $("#piece_bank"+j).append(quantityTag);
}

for (var i = 0; i < LENGTH_SEQUENCE; i++) {
  let slotTag = $("<div ondrop='drop(event)' ondragover='allowDrop(event)'></div>");
  slotTag.attr("id", "slot"+i);
  slotTag.attr("class", "draggydiv");
  slotTag.width(100/LENGTH_SEQUENCE + "%");
  $("#piece_sequence").append(slotTag);
}

function submit_form(){
  if (sequence.includes("-1")){
    alert("no way dude, make the sequence ");
    return;
  }

  //try this
  let tmp = Number(sequence.join(""));
  window.location.href = "computer.html?seq="+tmp.toString() + "&level=" + level + "&score=" + score;
}
