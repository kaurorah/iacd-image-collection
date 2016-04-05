
var http = require('http');
var url = require('url');
var path = require('path');
var phantom=require('node-phantom');
var fs = require('fs');

var storageArr = [];

var server = http.createServer(handleRequest);
server.listen(8080);

console.log('Server started on port 8080');
var urlArray;

var image = 'http://i.imgur.com/oLmwq.png';
var searchurl = 'https://www.bing.com/images?FORM=Z9LH';

var Nightmare = require('nightmare');
var google = new Nightmare({
  waitTimeout: 8000 // in ms
})


var globalURL; 

function searchForNewImage(query){
  console.log("search beginning");
  console.log("query:"+query);

  google.goto("https://www.bing.com/images/search?q="+query+"+texture&view=detailv2")
    .scrollTo(500,0)
    // .wait("li:nth-child(1) > a > div > img") //wait for 'view image source' to load
    .screenshot("1.png")
    .wait("li:nth-child(1) > a > div") //wait for the related images to load
    .screenshot("2.png")

  .evaluate(function () {
    // var a = document.querySelector("#action_visible > a.view_image").getAttribute("href"); //get the url for the image
var array = [];
for(var i=1; i<=5; i++){
  var a = document.querySelector("li:nth-child("+i+") > a > div > img").getAttribute("src"); //get the url for the image
      array.push(a);
  }
    return array;
  }) 
  .run(function (err, nightmare) {
      if (err) return console.log(err);
      urlArray = nightmare;

      console.log("array= "+urlArray);

      console.log('Done!');
    });

return urlArray; 
}

function searchForMoreImages(){
  console.log("searching for followup images");
  google.click("li:nth-child(5) > a > div > img")
    .scrollTo(500,0)
    .wait("li:nth-child(1) > a > div") //wait for the related images to load
    .evaluate(function () {
      var array = [];
      for(var i=1; i<=5; i++){
        var a = document.querySelector("li:nth-child("+i+") > a > div > img").getAttribute("src"); //get the url for the image
        array.push(a);
      }
      return array;
      }) 
    .run(function (err, nightmare) {
      if (err) return console.log(err);
      // console.log("nightmare= "+nightmare);
      urlArray = nightmare;

      console.log("array= "+urlArray);
      console.log('Done!');
    });
  return urlArray; 
}


function searchForRelatedImages(){
  console.log("searching for related images");
  google.click("div > a.iol_fst.iol_fsst")
    .scrollTo(500,0)
    .wait("li:nth-child(1) > a > div") //wait for the related images to load
    .evaluate(function () {
      var array = [];
      for(var i=1; i<=5; i++){
        var a = document.querySelector("li:nth-child("+i+") > a > div > img").getAttribute("src"); //get the url for the image
        array.push(a);
      }
      return array;
      }) 
    .run(function (err, nightmare) {
      if (err) return console.log(err);
      // console.log("nightmare= "+nightmare);
      urlArray = nightmare;

      console.log("array= "+urlArray);
      console.log('Done!');
    });
  return urlArray; 
}

function handleRequest(req, res) {
  var pathname = req.url;
    if (pathname == '/') {
    pathname = '/index.html';
  }
    var ext = path.extname(pathname);

  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  var contentType = typeExt[ext] || 'text/plain';

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}


var io = require('socket.io').listen(server);

io.sockets.on('connection',
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
      socket.on('mouse',
      function(data) {
        var newImage = [];


        if(data.related ==true){
          newImage = searchForMoreImages();
        }

        if(data.newSearch ==true)
        newImage = searchForNewImage(data.keyword);

        if(data.newSearch == false)
        newImage = searchForMoreImages();

        io.sockets.emit('mouse', newImage);
      }
    );
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);