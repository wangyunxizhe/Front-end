function getStyle(obj, attr) {
    if (obj.currentStyle) {
        return obj.currentStyle[attr];
    } else {
        return getComputedStyle(obj, false)[attr];
    }
}

//参数为：元素，json（{属性名1:目标值1,属性名2:目标值2}），回调函数（当一个动画完成时紧接着执行第二个动画）
function startMove(obj, json, fn) {
    var flag = true; //用于标识是否所有的运动效果都已完毕
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        for (var attr in json) {
            //1. 取当前的值
            var icur = 0;
            if (attr == 'opacity') { //需要动画效果的属性为“透明度”时
                icur = Math.round(parseFloat(getStyle(obj, attr)) * 100);
            } else {
                icur = parseInt(getStyle(obj, attr));
            }
            //2. 算速度
            var speed = (json[attr] - icur) / 8;
            speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
            //3. 检测停止
            if (icur != json[attr]) { //不是所有的运动都到达终点
                flag = false;
            } else {
                flag = true;
            }
            if (attr == 'opacity') { //需要动画效果的属性为“透明度”时
                obj.style.filter = 'alpha(opacity:' + (icur + speed) + ')'; //IE浏览器 整数
                obj.style.opacity = (icur + speed) / 100; //火狐or谷歌 小数
            } else {
                obj.style[attr] = icur + speed + 'px';
            }
        }
        if (flag) { //所有运动都已经到达终点
            clearInterval(obj.timer);
            if (fn) { //当回调函数不为空
                fn();
            }
        }
    }, 30);
}