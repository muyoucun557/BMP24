#这个小程序的功能是生成4位的随机验证码。里面包含一个生成24位的bmp图片模块
###引入模块require("./lib/BMP24")
###构造函数
  BMP24(w,h)

  w是宽、h是高，单位是像素
  
###在图片上画点

  BMP24.prototype.drawPoint(x,y,rgb)

  (x,y)是点坐标，起始坐标是左上角的点(0,0)

  rgb是三基色值，每个值得范围在0-255之间

###在图片上画直线

  BMP24.prototype.drawLine(startX,startY,endX,endY,rgb)

  (startX,startY)是直线起点坐标

  (endX,endY)是直线终点坐标

  rgb是三基色值，每个值得范围在0-255之间

###在图片上画矩形

  BMP24.prototype.drawRect(x,y,w,h,rgb)

  (x,y)是矩形左上角点的坐标。
  (w,h)分表表示矩形的宽和高。
  rgb是三基色值，每个值得范围在0-255之间。
###在图片上画圆
  BMP24.prototype.drawCircle(x,y,r,rgb)
  (x,y)是圆心坐标。
  r是圆的半径。
  rgb是三基色值，每个值得范围在0-255之间。
###在图片上画数字符（目前仅支持8X16的数字）
  BMP24.prototype.drawChar(char,x,y,rgb)
  char表示在图片上要画的字符。
  (x,y)表示该字符左上角的坐标。
  rgb是三基色值，每个值得范围在0-255之间。
###在图片上画字符串
  BMP24.prototype.drawStr(str,x,y,rgb,distance)
  str是在图片上要画的字符串
  (x,y)是字符串第一个字符左上角在图片中的坐标。
  rgb是三基色值，每个值得范围在0-255之间。
  distance是各个字符间的间距，单位是像素