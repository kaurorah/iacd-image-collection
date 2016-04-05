
var socket;
var img; 
var imgX, imgY;
var currentImgURL = 'http://www.allderglass.co.uk/_images/content/rooflights/skyglass-coxdome-galaxy-system.jpg'; 
var up = false;
var down = false;
var arr = [];

var imgLoaded = false; 
var counter = 0; 
var queryCounter = 0; 
var queries = [

"Skin","Sleek","Slick","Slight","Slimy","Slippery","Slovenly","Smooth","Smoothed","Smudged","Snarling",
"Snug","Soaked","Soaking","Soapy","Sodden","Soft","Soggy"];



var imageMask;  

var related;
var rCounter;

function setup() {

  createCanvas(2000, 2000);
  imgX = 100;
  imgY = 100; 
  background(255);
  imageMask = loadImage("hex.png");
  rCounter = 0; 

  socket = io.connect('http://localhost:8080');
  img = loadImage(currentImgURL);  
  image(img, imgX, imgY, img.width/2, img.height/2);

  socket.on('mouse',
    function(data) {
      console.log("data received from server:"+data);
    
        if(data){

            arr = data; 
            img = loadImage(arr[counter]); 
            imgLoaded = true; 
            counter++;


        }
 

    });
  sendmouse(queries[queryCounter], true);
  queryChecker();

}

function draw() {
}


function keyPressed(){
console.log(keyCode);
if(keyCode ==85) { //U - up
    imgY -= imageMask.width/2-17;
    drawImage();
} 
if(keyCode == 74){ //J - down
  imgY += imageMask.width/2-17;
  drawImage();
}
if(keyCode == 73){ //I - up/right
 
  imgX+= imageMask.width/2-33;
  imgY-= imageMask.height/4;

  drawImage();
}
if(keyCode == 89){ //Y - up/left
 
  imgX-= imageMask.width/2-33;
  imgY-= imageMask.height/4;

  drawImage();
}
if(keyCode == 72){ //H - bottom/left
 
  imgX-= imageMask.width/2-33;
  imgY+= imageMask.height/4;

  drawImage();
}if(keyCode == 75){ //K - bottom/right
 
  imgX+= imageMask.width/2-33;
  imgY+= imageMask.height/4;

  drawImage();
}
}

function drawImage(){
  if (imgLoaded == true) {
    console.log("image is loaded");
    img.mask(imageMask);
    image(img, imgX, imgY, imageMask.width/2, imageMask.height/2);
    imgLoaded = false; 
      if (counter<arr.length && imgLoaded ==false){ //load a new image if there is still one in the array
        img = loadImage(arr[counter]);
        console.log("new url:"+arr[counter]);
        console.log("counter:"+counter);
        imgLoaded = true; 
        counter++;
      } 
      else{ //ask bing for a new query 
        counter = 0;
        rCounter++;
        imgLoaded = false; 
        if (rCounter%2 ==0){
          sendmouse(queries[queryCounter], true, false);
          queryChecker();
        } else sendmouse(queries[queryCounter], false, false);
      }  
  }

}

function queryChecker(){
  if(queryCounter<queries.length){
    queryCounter++;
  } else queryCounter = 0;
}

function sendmouse(keyword, newSearch, related) {
  
  var data = {
    keyword: keyword,
    newSearch: newSearch,
    related:related
  };

  socket.emit('mouse',data);
}