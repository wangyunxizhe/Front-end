var data = ['Phone5', 'Ipad', '三星笔记本', '佳能相机', '惠普打印机', '谢谢参与', '50元充值卡', '1000元超市购物券'],
   timer = null,
   flag = 0; //用于标识是否已经“开始”了

window.onload = function () {
   var play = document.getElementById('start'),
      stop = document.getElementById('stop');

   // 分别给“开始”，“结束”绑定click事件
   play.onclick = playFun;
   stop.onclick = stopFun;

   // 绑定键盘事件：敲击键盘也同样有“开始”，“结束”的效果
   document.onkeyup = function (event) {
      event = event || window.event;
      if (event.keyCode == 13) {//keyCode：键盘上的每一个按键都有一个自己的键码。回车是13
         if (flag == 0) {
            playFun();
            flag = 1;
         } else {
            stopFun();
            flag = 0;
         }
      }
   }
}

//开始
function playFun() {
   var title = document.getElementById('title');
   var play = document.getElementById('start');
   clearInterval(timer);//每次开始前先清除之前的定时器，避免一直叠加
   timer = setInterval(function () {
      var random = Math.floor(Math.random() * data.length); //随机取data数组中的一个下标
      title.innerHTML = data[random]; //将title中的文本显示为data数组中“random”下标的内容
   }, 50);
   play.style.background = '#999';
}

//结束
function stopFun() {
   clearInterval(timer);
   var play = document.getElementById('start');
   play.style.background = '#036';
}