const NUM_PIECES = 4;
const LENGTH_SEQUENCE = 5;

let piece_quantities = [2,2,2,1];
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
  $("#piece_bank").append(imgTag);
  $("#piece_bank").append(quantityTag);
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
  window.location.href = "computer.html?seq="+sequence.join("");
}
