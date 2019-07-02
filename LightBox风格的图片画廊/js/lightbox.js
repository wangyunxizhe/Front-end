; //以下所有方法的第一行都有var self = this;这是为了当在方法中方法里使用到this变量时，可以防止变量漂移
(function ($) {
    var LightBox = function () {
        var self = this;

        //创建遮罩和弹出框的HTML
        this.popupMask = $('<div id="G-lightbox-mask">');
        this.popupWin = $('<div id="G-lightbox-popup">');

        //放入到body
        this.bodyNode = $(document.body);

        //渲染剩余的DOM，并插入到body
        this.renderDOM();

        this.picViewArea = this.popupWin.find('div.lightbox-pic-view'); //获取图片预览区域
        this.popupPic = this.popupWin.find('img.lightbox-image'); //获取图片
        this.picCaptionArea = this.popupWin.find('div.lightbox-pic-caption'); //获取图片描述区域
        this.nextBtn = this.popupWin.find('span.lightbox-next-btn');
        this.prevBtn = this.popupWin.find('span.lightbox-prev-btn');
        this.captionText = this.popupWin.find('p.lightbox-pic-desc');
        this.currentIndex = this.popupWin.find('span.lightbox-of-index');
        this.closeBtn = this.popupWin.find('span.lightbox-close-btn');

        //获取图片组数据
        this.groupName = null;
        this.groupData = [];
        this.bodyNode.delegate('.js-lightbox,*[data-role=lightbox]', 'click', function (e) {
            //阻止事件冒泡
            e.stopPropagation();
            var currentGroupName = $(this).attr('data-group');
            //当点击的图片跟上次点击的图片不属于相同组时，避免点击同一组图片重复的去获取该组的数据
            if (currentGroupName != self.groupName) {
                self.groupName = currentGroupName;
                //根据当前组名获取同一组数据
                self.getGroup();
            }
            //初始化弹出 
            self.initPopup($(this));
        });

        //关闭弹出
        this.popupMask.click(function () {
            $(this).fadeOut();
            self.popupWin.fadeOut();
            this.clear = false;
        });
        this.closeBtn.click(function () {
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            this.clear = false;
        });

        //绑定上下切换按钮事件
        this.flag = true; //切换完成的标识：为了防止多次快速点击切换按钮，而发生index错乱
        this.nextBtn.hover(function () { //移入
            if (!$(this).hasClass('off-flag') && self.groupData.length > 1) { //该按钮不存在禁用标识，并且该组图片不止1张
                $(this).addClass('lightbox-next-btn-show');
            }
        }, function () { //移出
            if (!$(this).hasClass('off-flag') && self.groupData.length > 1) {
                $(this).removeClass('lightbox-next-btn-show');
            }
        }).click(function (e) {
            if (!$(this).hasClass('off-flag') && self.flag) { //该按钮不存在禁用标识
                self.flag = false;
                //阻止事件冒泡
                e.stopPropagation();
                self.goto('next');
            }
        });
        this.prevBtn.hover(function () { //移入
            if (!$(this).hasClass('off-flag') && self.groupData.length > 1) { //该按钮不存在禁用标识，并且该组图片不止1张
                $(this).addClass('lightbox-prev-btn-show');
            }
        }, function () { //移出
            if (!$(this).hasClass('off-flag') && self.groupData.length > 1) {
                $(this).removeClass('lightbox-prev-btn-show');
            }
        }).click(function (e) {
            if (!$(this).hasClass('off-flag') && self.flag) { //该按钮不存在禁用标识
                self.flag = false;
                //阻止事件冒泡
                e.stopPropagation();
                self.goto('prev');
            }
        });

        //绑定窗口调整事件
        var timer = null;
        this.clear = false;
        $(window).resize(function () {
            if (self.clear) {
                window.clearTimeout(timer);
                timer = setTimeout(function () {
                    self.loadPicSize(self.groupData[self.index].src);
                }, 500);
            }
        });
    };

    LightBox.prototype = {
        //图片切换按钮方法
        goto: function (where) {
            if (where === 'next') {
                this.index++;
                if (this.index >= this.groupData.length - 1) { //到达最后一张的时候
                    this.nextBtn.addClass('off-flag').removeClass('lightbox-next-btn-show');
                }
                if (this.index != 0) {
                    this.prevBtn.removeClass('off-flag');
                }
                var src = this.groupData[this.index].src;
                this.loadPicSize(src);
            } else if (where === 'prev') {
                this.index--;
                if (this.index <= 0) {
                    this.prevBtn.addClass('off-flag').removeClass('lightbox-prev-btn-show');
                }
                if (this.index != this.groupData.length - 1) {
                    this.nextBtn.removeClass('off-flag');
                }
                var src = this.groupData[this.index].src;
                this.loadPicSize(src);
            }
        },
        loadPicSize: function (sourceSrc) {
            var self = this;
            //设置图片大小前，先清空，避免被上一张图片设置的大小影响
            self.popupPic.css({
                width: 'auto',
                height: 'auto'
            }).hide();

            self.picCaptionArea.hide();

            this.preLoadImg(sourceSrc, function () {
                self.popupPic.attr('src', sourceSrc);
                var picWidth = self.popupPic.width(),
                    picHeight = self.popupPic.height();
                self.changePic(picWidth, picHeight);
            });
        },
        //展示图片的切换
        changePic: function (width, height) {
            var self = this,
                winWidth = $(window).width(),
                winHeight = $(window).height();
            //处理图片的宽高超过了浏览器窗口的宽高
            var scale = Math.min(winWidth / (width + 6), winHeight / (height + 6), 1); //宽高比
            width = width * scale;
            height = height * scale;
            //处理完毕后设置，装图片的div宽高，弹窗宽高以及图片自身宽高。并设置缓慢加载效果
            this.picViewArea.animate({
                width: width - 6,
                height: height - 6
            });
            this.popupWin.animate({
                width: width,
                height: height,
                marginLeft: -(width / 2),
                top: (winHeight - height) / 2
            }, function () {
                self.popupPic.css({
                    width: width - 6,
                    height: height - 6
                }).fadeIn();
                self.picCaptionArea.fadeIn();
                self.flag = true; //所有切换动画完毕，将标识改为true
                self.clear = true;
            });
            //处理当前索引以及描述文字
            this.captionText.text(this.groupData[this.index].caption); //根据当前点击图片的索引，获取groupData数组中对应位置的caption
            this.currentIndex.text('当前索引：' + (this.index + 1) + ' of ' + this.groupData.length);
        },
        //监控图片是否加载完成
        preLoadImg: function (sourceSrc, callback) {
            var img = new Image();
            if (!!window.ActiveXObject) { //ie浏览器
                img.onreadystatechange = function () {
                    if (this.readyState == 'complete') { //加载完成
                        callback();
                    }
                }
            } else {
                img.onload = function () {
                    callback();
                };
            }
            img.src = sourceSrc;
        },
        //展示遮罩和弹出层
        showMaskAndPopup: function (sourceSrc, currentId) {
            var self = this;
            this.popupPic.hide();
            this.picCaptionArea.hide();
            this.popupMask.fadeIn();

            var winWidth = $(window).width(),
                winHeight = $(window).height();

            this.picViewArea.css({
                width: winWidth / 2,
                height: winHeight / 2
            });

            this.popupWin.fadeIn();
            var viewHeight = winHeight / 2 + 6;
            //给弹出层设置位置，出场动画
            this.popupWin.css({
                width: winWidth / 2 + 6,
                height: winHeight / 2 + 6,
                marginLeft: -(winWidth / 2 + 6) / 2,
                top: -viewHeight
            }).animate({
                top: (winHeight - viewHeight) / 2
            }, function () {
                //加载图片
                self.loadPicSize(sourceSrc);
            });
            //根据点击的img元素的id，获取在当前组别里面的索引
            this.index = this.getIndexOf(currentId);
            var groupDataLength = this.groupData.length; //获取组中总图片数量
            if (groupDataLength > 1) {
                if (this.index === 0) { //图片是组中第一张图片
                    this.prevBtn.addClass('off-flag'); //加个标识用的class，并无实际样式效果
                    this.nextBtn.removeClass('off-flag');
                } else if (this.index === groupDataLength - 1) { //最后一张
                    this.prevBtn.removeClass('off-flag');
                    this.nextBtn.addClass('off-flag');
                } else {
                    this.prevBtn.removeClass('off-flag');
                    this.nextBtn.removeClass('off-flag');
                }
            } else {
                this.prevBtn.addClass('off-flag');
                this.nextBtn.addClass('off-flag');
            }
        },
        //获取当前被点击图片的索引
        getIndexOf: function (currentId) {
            var index = 0;
            $(this.groupData).each(function (i) {
                index = i;
                if (this.id === currentId) {
                    return false; //相当与break
                }
            });
            return index;
        },
        //初始化弹出
        initPopup: function (currentObj) {
            var self = this,
                sourceSrc = $(currentObj).attr('data-source'),
                currentId = $(currentObj).attr('data-id');
            this.showMaskAndPopup(sourceSrc, currentId);
        },
        //根据当前组名，获取该组的所有相关数据，并组装到groupData中
        getGroup: function () {
            var self = this;
            //根据当前的组别名称获取页面中所有相同组别的对象
            var groupList = this.bodyNode.find('*[data-group=' + self.groupName + ']');
            //先清空数据
            self.groupData.length = 0;
            //再获取数据
            groupList.each(function () {
                self.groupData.push({
                    src: $(this).attr('data-source'),
                    id: $(this).attr('data-id'),
                    caption: $(this).attr('data-caption')
                });
            });
        },
        //组装页面HTML
        renderDOM: function () {
            var strDom = '<div class="lightbox-pic-view">' +
                '<span class="lightbox-btn lightbox-prev-btn"></span>' +
                '<img class="lightbox-image" src="" />' +
                '<span class="lightbox-btn lightbox-next-btn"></span>' +
                '</div>' +
                '<div class="lightbox-pic-caption">' +
                '<div class="lightbox-caption-area">' +
                '<p class="lightbox-pic-desc"></p>' +
                '<span class="lightbox-of-index"></span>' +
                '</div>' +
                '<span class="lightbox-close-btn"></span>' +
                '</div>';
            //把strDom插入到弹出层中
            this.popupWin.html(strDom);
            //把遮罩和弹出框都插入到body中
            this.bodyNode.append(this.popupMask, this.popupWin);
        }
    };

    //将对象LightBox注册到全局对象上，属性名为LightBox
    window['LightBox'] = LightBox;
})(jQuery);