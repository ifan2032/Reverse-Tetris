const urlParams = new URLSearchParams(window.location.search);
const score = parseInt(urlParams.get("score"));
setTimeout(()=>{$("#display-score").text("YOUR SCORE:" + score);}, 500);
