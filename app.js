
var BMP24 = require("./lib/BMP24.js");
var http = require("http");
var fs = require("fs");

var server = http.createServer(function(req,res){
	var bmp = new BMP24(100,100);
    bmp.drawChar(5,0,0,(255<<16));
    res.setHeader("Content-Type","image/bmp");
    res.end(bmp.data);
});

server.listen(8080);