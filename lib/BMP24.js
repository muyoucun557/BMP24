var fonts = require("./font.js");

//开始封装
//1.构造函数
function BMP24( w, h ){
    /*********1.1计算位图数据的大小和整个文件的大小*************/
    var wB = Math.ceil(w*3/4) *4;    //windows读取时，是4个字节一读，每一行中读取到最后时不足4个字节的用0填充。（24位的位图，每个像素点占3个字节）
    var datalen = wB * h;            //位图数据的大小
    var filelen = datalen + 54;     //整个文件的大小。文件头大小+位图头大小=54字节（固定的）。这里采用的是24位的位图，因此没有调色板，所以在计算整个文件大小时，不计算调色板的大小
    /*************************/
    this.w = w;
    this.h = h;
    this.datalen = datalen;
    this.filelen = filelen;
    this.data = new Buffer(filelen).fill(0);
    makeFileHeader(this);
}
function makeFileHeader(bmp24){
    var buf = bmp24.data;
    var datalen = bmp24.datalen;
    var filelen = bmp24.filelen;
    var w = bmp24.w;
    var h = bmp24.h;

    buf.write("BM");
    buf.writeInt32LE(filelen,2);  //写入文件大小      -----占4个字节
    buf.writeInt32LE(0,6);         //写入2个保留字      -----占4个字节
    buf.writeInt32LE(54,10);        //写入偏移量         -----占4个字节

    
    buf.writeInt32LE(40,14);   //写文件信息头结构所需要的字数    ------占4字节
    buf.writeInt32LE(w,18);  //写图片的宽度(单位是像素)                    -------占4个字节
    buf.writeInt32LE(h,22);   //写图片的高度。(单位是像素)（正值表示倒向的位图）----占4个字节
    buf.writeInt16LE(1,26);   //写颜色平面数                    ------- 占2个字节
    buf.writeInt16LE(24,28);   //写bit数                         -------占2个字节
    buf.writeInt32LE(0,30);   //写压缩类型（0-不压缩）          -------占4个字节
    buf.writeInt32LE(datalen,34);   //写图像的大小                 -------占4个字节
    
    buf.writeInt32LE(0,38);
    buf.writeInt32LE(0,42);
    buf.writeInt32LE(0,46);
    buf.writeInt32LE(0,50);
}
//2.画点方法
/**
 * [drawPoint description]
 * @param  {[type]} x   [x坐标]
 * @param  {[type]} y   [y坐标]
 * @param  {[type]} rgb [颜色值]
 * @return {[type]}     [description]
 */
BMP24.prototype.drawPoint = function( x, y, rgb){
    //2.1计算(x,y)点对应的数据在this.data中的偏移量
    var h = this.h;
    var w = this.w;
    var offset = 54 + (h-y-1)*(Math.ceil(w*3/4)*4) + (3*x); //  通过坐标点计算offset的公式
    // var color = (R<<16) + (G<<8) + B;
    var color = rgb;
    if( offset>=54 && offset<this.filelen-1){
        this.data.writeUIntLE(color,offset,3);
    }
}
//3.画线方法
/**
 * [drawLine description]
 * @param  {[type]} startX [description]
 * @param  {[type]} startY [description]
 * @param  {[type]} endX   [description]
 * @param  {[type]} endY   [description]
 * @param  {[type]} rgb    [description]
 * @return {[type]}        [description]
 */
BMP24.prototype.drawLine = function(startX,startY,endX,endY,rgb){
    var w = this.w;
    var h = this.h;
    var buf = this.data;
    //1.如果是横线
    if( startY == endY ){
        var y = startY;     //y不变
        var d = startX<endX?1:-1;
        for( var x=startX; x!=endX; x+=d ){
            this.drawPoint(x,y,rgb);
        }
        return;
    }
    //2.如果是竖线
    if( startX == endX ){
        var x = startX;     //x不变
        var d = startY<endY?1:-1;
        for( var y=startY; y!=endY; y+=d ){
            this.drawPoint(x,y,rgb);
        }
        return;
    }
    //3.如果是斜线
    //y = kx + b;
    //画斜线算法：遍历x，求出y的值。y整数时，直接取y；y为小数时，取y最近的整数。
    //---3.1计算k和b
    var k = (endY-startY)/(endX-startX);
    var b = endY-k*endX;
    var d= startX<endX?1:-1;
    for( var x=startX; x!=endX; x+=d ){
        var y = k*x + b;
        y = (y>=(Math.ceil(y)+Math.floor(y)))/2?Math.ceil(y):Math.floor(y); 
        this.drawPoint(x,y,rgb);
    }
};
//4.画矩形方法
/**
 * [drawRect description]
 * @param  {[type]} x   [description]
 * @param  {[type]} y   [description]
 * @param  {[type]} w   [description]
 * @param  {[type]} h   [description]
 * @param  {[type]} rgb [description]
 * @return {[type]}     [description]
 */
BMP24.prototype.drawRect = function(x,y,w,h,rgb){
    //按照顺时针画出矩形
    //--1画出上横线
        // 起点(x,y) 终点(x+w,y)
    this.drawLine(x,y,x+w,y,rgb);
    //--2画出右竖线
        //起点(x+w,y) 终点(x+w,y+h)
    this.drawLine(x+w,y,x+w,y+h,rgb);
    //--3画出下横线
        //起点(x+w,y+h) 终点(x,y+h)
    this.drawLine(x+w,y+h,x,y+h,rgb);
    //--4画出左竖线
        //起点(x,y+h) 终点(x,y)
    this.drawLine(x,y+h,x,y,rgb);
};
//5.画圆方法
BMP24.prototype.drawCircle = function(x,y,r,rgb){
    //画圆算法：遍历x，求出y，然后取y最近的整数。
    //x的范围为[left,right]  left=max(0,x-r) right=min(w,x+r)
    var w = this.w;
    var left = 0>=x-r?0:x-r;
    var right = w<=x+r?w:x+r;
    var s = r*r;
    for( var i=left; i<=right; i++){
        var j1 = Math.sqrt(s-(i-x)*(i-x))+y;    //上面的点
        j1 = (j1>=(Math.ceil(j1)+Math.floor(j1)))/2?Math.ceil(j1):Math.floor(j1); 
        this.drawPoint(i,j1,rgb);
        var j2 = -Math.sqrt(s-(i-x)*(i-x))+y;   //下面的点
        j2 = (j2>=(Math.ceil(j2)+Math.floor(j2)))/2?Math.ceil(j2):Math.floor(j2); 
        this.drawPoint(i,j2,rgb);
    }
}
//画字符方法（仅支持画数字（8X16的数字））
/**
 * [drawChar description]
 * @param  {[type]} char [description]
 * @param  {[type]} x    [description]
 * @param  {[type]} y    [description]
 * @param  {[type]} rgb  [description]
 * @return {[type]}      [description]
 */
BMP24.prototype.drawChar = function(char,x,y,rgb){
    var font = fonts[char];
    var len = font.length;
    var b;
    //遍历外层
    for(var i=0; i<len; i++){
        var data = font[i];
        //遍历内层(也就是遍历出data中的每一位)
        b = 0x80;   //从高位遍历data时，b的值取0x80;从低位开始遍历时，b的值取0x01
        for( var j = 0; j<8; j++, b>>=1){
            if( (data&b) != 0 ){ //不为0则表示需要被画
                //计算坐标
                var pos_x = x+j;
                var pos_y = y+i;
                this.drawPoint(pos_x,pos_y,rgb);
            }
        } 
    }
}
/**
 * [drawStr description]
 * @param  {[type]} x   [description]
 * @param  {[type]} y   [description]
 * @param  {[type]} str [description]
 * @param  {[type]} distance [字符间的距离]
 * @param  {[type]} rgb [description]
 * @return {[type]}     [description]
 */
BMP24.prototype.drawStr = function(str,x,y,rgb,distance){
    for(var n=0; n<str.length; n++){
        var char = str[n];
        this.drawChar(char,x,y,rgb);
        x += (8+distance);   //x会变化，y不会变化
    }
}
module.exports = BMP24;