/* 闭包形式，开发全屏切换组件 */
(function ($) {
    /* 说明:获取浏览器前缀，以便于解决滑动动画的浏览器兼容问题。参数：dom元素。实现：判断某个元素的css样式中是否存在transition属性。返回值：boolean，有则返回浏览器样式前缀，否则返回false */
    var _prefix = (function (temp) {
        var aPrefix = ["webkit", "Moz", "o", "ms"],
            props = "";
        for (var i in aPrefix) {
            props = aPrefix[i] + "Transition";
            if (temp.style[props] !== undefined) {
                return "-" + aPrefix[i].toLowerCase() + "-";
            }
        }
        return false;
    })(document.createElement(PageSwitch));

    /* 创建一个自执行的匿名函数 */
    var PageSwitch = (function () {
        /* 定义一个跟变量自身同名的方法 */
        function PageSwitch(elem, options) {
            /* $.extend方法的作用：将用户自定义的插件参数与插件的默认参数加以合并 */
            this.settings = $.extend(true, $.fn.PageSwitch.defaults, options || {});
            this.elem = elem;
            this.init();
        }
        PageSwitch.prototype = {
            /* 初始化插件，有下划线的方法用来表示是私有方法，反之是公有方法 */
            /* 初始化dom结构，布局，分页以及绑定事件 */
            init: function () {
                var me = this;
                //将入参的属性值全部赋值给该对象实例
                me.selectors = me.settings.selectors;
                me.sections = me.elem.find(me.selectors.sections);
                me.section = me.sections.find(me.selectors.section);
                me.direction = me.settings.direction == "vertical" ? true : false;
                me.pagesCount = me.pagesCount();
                //校验设置的index值是否超过页面中实际section元素的数量
                me.index = (me.settings.index >= 0 && me.settings.index < me.pagesCount) ? me.settings.index : 0;

                me.canScroll = true; //防止快速切换造成的混乱

                if (!me.direction) { //如果是横屏滚动的情况
                    me._initLayout();
                }

                if (me.settings.pagination) { //需要分页
                    me._initPaging();
                }

                me._initEvent(); //最后-->绑定事件
            },
            /* 获取滑动页面数量 */
            pagesCount: function () {
                return this.section.length;
            },
            /* 获取滑动的宽度（当横屏滑动时），或高度（当竖屏滑动时） */
            switchLength: function () {
                return this.direction == 1 ? this.elem.height() : this.elem.width();
            },
            /* 向前滑动即上一页 */
            prve: function () {
                var me = this;
                if (me.index > 0) {
                    me.index--;
                } else if (me.settings.loop) {
                    me.index = me.pagesCount - 1;
                }
                me._scrollPage();
            },
            /* 向后滑动即下一页 */
            next: function () {
                var me = this;
                if (me.index < me.pagesCount) {
                    me.index++;
                } else if (me.settings.loop) {
                    me.index = 0;
                }
                me._scrollPage();
            },
            /* 针对横屏情况进行页面布局 */
            _initLayout: function () {
                var me = this;
                var width = (me.pagesCount * 100) + "%"; //总宽度，相当于div中的style="width:400%"
                var cellWidth = (100 / me.pagesCount).toFixed(2) + "%"; //每张图片的宽度，相当于.left中的width
                me.sections.width(width);
                me.section.width(cellWidth).css("float", "left");
            },
            /* 实现分页的dom结构及css样式 */
            _initPaging: function () {
                var me = this;
                var pagesClass = me.selectors.page.substring(1); //取到selectors.page的属性值“.page”，再进行substring，完成后就是page
                me.activeClass = me.selectors.active.substring(1); //跟上面同理
                var pageHtml = "<ul class='" + pagesClass + "'>";
                for (var i = 0; i < me.pagesCount; i++) {
                    pageHtml += "<li></li>";
                }
                pageHtml += "</ul>";
                me.elem.append(pageHtml);
                var pages = me.elem.find(me.selectors.page); //根据类名--》.page，找到page集合
                me.pageItem = pages.find("li");
                me.pageItem.eq(me.index).addClass(me.activeClass);

                if (me.direction) { //判断是横/竖屏切换，横屏切换样式图标在下方，竖屏切换样式图标在右方
                    pages.addClass("vertical"); //垂直
                } else {
                    pages.addClass("horizontal"); //水平
                }
            },
            /* 初始化插件的事件，本插件重点方法！！！ */
            _initEvent: function () {
                var me = this;
                me.elem.on("click", me.selectors.page + " li", function () { //绑定切换按钮点击事件
                    me.index = $(this).index();
                    me._scrollPage();
                });

                me.elem.on("mousewheel DOMMouseScroll", function (e) { //绑定鼠标滚轮事件，on的事件mousewheel DOMMouseScroll写法是为了解决火狐的兼容
                    if (me.canScroll) {
                        var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail; //解决火狐的兼容
                        if (delta > 0 && (me.index && !me.settings.loop || me.settings.loop)) { //上一张
                            me.prve();
                        } else if (delta < 0 && (me.index < (me.pagesCount - 1) && !me.settings.loop || me.settings.loop)) { //下一张
                            me.next();
                        }
                    }
                });

                if (me.settings.keyboard) { //绑定键盘方向键事件
                    $(window).keydown(function (e) {
                        var keyCode = e.keyCode;
                        if (keyCode == 37 || keyCode == 38) {
                            me.prve();
                        } else if (keyCode == 39 || keyCode == 40) {
                            me.next();
                        }
                    });
                }

                var resizeId; //为了不频繁调用resize的回调方法，做了延迟
                $(window).resize(function () { //绑定窗口改变事件
                    clearTimeout(resizeId);
                    resizeId = setTimeout(function () {
                        var currentLength = me.switchLength();
                        var offset = me.settings.direction ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left; //当前页面相对于文档的坐标值
                        if (Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount - 1)) {
                            me.index++;
                        }
                        if (me.index) {
                            me._scrollPage();
                        }
                    }, 500);
                });

                if (_prefix) { //支持CSS3动画的浏览器，绑定transitionend事件(即在动画结束后调用起回调函数)
                    me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function () {
                        me.canScroll = true;
                        if (me.settings.callback && $.type(me.settings.callback) === "function") {
                            me.settings.callback();
                        }
                    })
                }
            },
            /* 滑动动画 */
            _scrollPage: function (init) {
                var me = this;
                var dest = me.section.eq(me.index).position();
                if (!dest) return;
                me.canScroll = false;
                if (_prefix) {
                    var translate = me.direction ? "translateY(-" + dest.top + "px)" : "translateX(-" + dest.left + "px)";
                    me.sections.css(_prefix + "transition", "all " + me.settings.duration + "ms " + me.settings.easing);
                    me.sections.css(_prefix + "transform", translate);
                } else {
                    var animateCss = me.direction ? {
                        top: -dest.top
                    } : {
                        left: -dest.left
                    };
                    me.sections.animate(animateCss, me.settings.duration, function () {
                        me.canScroll = true;
                        if (me.settings.callback && $.type(me.settings.callback) == "function") {
                            me.settings.callback();
                        }
                    });
                }
                if (me.settings.pagination && !init) { //分页样式调整
                    me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
                }
            }
        };
        return PageSwitch;
    })();

    /* 将PageSwitch绑定到jQuery的原型链上 */
    $.fn.PageSwitch = function (options) {
        return this.each(function () {
            var me = $(this),
                instance = me.data("PageSwitch"); //创建PageSwitch对象实例
            if (!instance) { //对象为空（整个创建过程其实是个懒汉式的单例模式）
                instance = new PageSwitch(me, options);
                me.data("PageSwitch", instance);
            }
            if ($.type(options) === "string") {
                return instance[options]();
            }
        });
    }

    /* 创建PageSwitch自身的默认属性 */
    $.fn.PageSwitch.defaults = {
        /* 选中的类 */
        selectors: {
            sections: ".sections",
            section: ".section",
            page: ".pages", //页面的样式类
            active: ".active" //当前选中的页面样式类
        },
        index: 0, //对应页面的索引值
        easing: "ease", //动画
        duration: 500, //滑动动画需要执行的时间（毫秒）
        loop: true, //是否可以循环播放
        pagination: true, //是否进行分页
        keyboard: true, //是否触发键盘事件
        direction: "vertical", //滑动方向vertical（垂直），horizontal（水平）
        callback: "" //回调函数
    }

    $(function () {
        $('[data-PageSwitch]').PageSwitch();
    });
})(jQuery);