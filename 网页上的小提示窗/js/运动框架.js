function getStyle(obj, attr) {
    if (obj.currentStyle) {
        return obj.currentStyle[attr];
    } else {
        return getComputedStyle(obj, false)[attr];
    }
}

//参数为：元素，属性名，目标值，回调函数（当一个动画完成时紧接着执行第二个动画）
function startMove(obj, attr, iTarget, fn) {
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        //1. 取当前的值
        var icur = 0;
        if (attr == 'opacity') { //需要动画效果的属性为“透明度”时
            icur = Math.round(parseFloat(getStyle(obj, attr)) * 100);
        } else {
            icur = parseInt(getStyle(obj, attr));
        }
        //2. 算速度
        var speed = (iTarget - icur) / 8;
        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
        //3. 检测停止
        if (icur == iTarget) {
            clearInterval(obj.timer);
            if (fn) { //当回调函数不为空
                fn();
            }
        } else {
            if (attr == 'opacity') { //需要动画效果的属性为“透明度”时
                obj.style.filter = 'alpha(opacity:' + (icur + speed) + ')'; //IE浏览器 整数
                obj.style.opacity = (icur + speed) / 100; //火狐or谷歌 小数
            } else {
                obj.style[attr] = icur + speed + 'px';
            }
        }
    }, 30);
}