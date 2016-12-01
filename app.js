'use strict'
const nums = [0,1,2,3,4,5,6,7,8,9];
const BMP24 = require("./lib/BMP24.js");
const http = require("http");

var server = http.createServer(function(req,res){
    var bmp = new BMP24(100,40);
    var str = createCode();
    bmp.drawStr(str,10,12,(255<<16),10);
    res.setHeader("Content-Type","image/bmp");
    res.end(bmp.data);
});
server.listen(8080);

//生成4位的随机验证码
function createCode(){
	var arrs = [];
	for(var i=0; i<4; i++){
		var index = Math.floor(Math.random()*10);
		var num = nums[index];
		arrs.push(num);
	}
	return arrs.join("");
}