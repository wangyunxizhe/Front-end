//最前面加;是为了再实际开发中，如果在该js文件前面引入的js文件结尾没有加;的话，这样做可以避免错误
;
(function ($) {

	var Carousel = function (poster) {
		var self = this;//防止this漂移，先赋值给self，然后再后续内部方法中使用self
		//保存单个旋转木马对象
		this.poster = poster;
		this.posterItemMain = poster.find("ul.poster-list");
		this.nextBtn = poster.find("div.poster-next-btn");
		this.prevBtn = poster.find("div.poster-prev-btn");
		this.posterItems = poster.find("li.poster-item");
		//校验html上的轮播图片是否是偶数张，如果是偶数张就将第一张图片复制一份，强行变成奇数张。注意：因为该js组件对奇数张效果更好
		if (this.posterItems.size() % 2 == 0) {
			this.posterItemMain.append(this.posterItems.eq(0).clone());
			this.posterItems = this.posterItemMain.children();
		};
		this.posterFirstItem = this.posterItems.first(); //第一帧图片
		this.posterLastItem = this.posterItems.last(); //最后一帧图片
		this.rotateFlag = true;//旋转标识：标识一次切换动作是否完毕，避免多次快速点击后造成错乱的bug
		//默认配置参数。html上如果设置了，html上的设置优先
		this.setting = {
			"width": 1000, //幻灯片的宽度
			"height": 270, //幻灯片的高度
			"posterWidth": 640, //幻灯片第一帧的宽度
			"posterHeight": 270, //幻灯片第一帧的高度
			"scale": 0.9, //左右区域显示大小比例关系
			"speed": 500, //切换速度
			"autoPlay": false,//是否自动切换
			"delay": 5000,//播放间隔
			"verticalAlign": "middle" //top bottom：决定左右区域的图片是按顶/居中/下对齐的方式排列
		};
		$.extend(this.setting, this.getSetting());
		//设置配置参数值
		this.setSettingValue();
		this.setPosterPos();
		//左旋转按钮
		this.nextBtn.click(function () {
			if (self.rotateFlag) {
				self.rotateFlag = false;
				self.carouseRotate("left");
			};
		});
		//右旋转按钮
		this.prevBtn.click(function () {
			if (self.rotateFlag) {
				self.rotateFlag = false;
				self.carouseRotate("right");
			};
		});
		//是否开启自动播放
		if (this.setting.autoPlay) {
			this.autoPlay();
			this.poster.hover(function () {//鼠标移上时停止自动播放
				window.clearInterval(self.timer);
			}, function () {//鼠标移开时继续自动播放
				self.autoPlay();
			});

		};
	};

	//利用原型链，来初始化Carousel的各项属性
	Carousel.prototype = {
		//自动播放
		autoPlay: function () {
			var self = this;
			this.timer = window.setInterval(function () {
				self.nextBtn.click();
			}, this.setting.delay);
		},
		//旋转
		carouseRotate: function (dir) {
			var _this_ = this;
			var zIndexArr = [];
			//左旋转
			if (dir === "left") {
				this.posterItems.each(function () {
					var self = $(this),
						prev = self.prev().get(0) ? self.prev() : _this_.posterLastItem,
						width = prev.width(),
						height = prev.height(),
						zIndex = prev.css("zIndex"),
						opacity = prev.css("opacity"),
						left = prev.css("left"),
						top = prev.css("top");
					zIndexArr.push(zIndex);//拉到animate代码块外面设置，让图片覆盖切换更加平滑
					self.animate({
						width: width,
						height: height,
						//zIndex:zIndex,
						opacity: opacity,
						left: left,
						top: top
					}, _this_.setting.speed, function () {
						_this_.rotateFlag = true;
					});
				});
				//zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
				this.posterItems.each(function (i) {
					$(this).css("zIndex", zIndexArr[i]);
				});
			} else if (dir === "right") { //右旋转
				this.posterItems.each(function () {
					var self = $(this),
						next = self.next().get(0) ? self.next() : _this_.posterFirstItem,
						width = next.width(),
						height = next.height(),
						zIndex = next.css("zIndex"),
						opacity = next.css("opacity"),
						left = next.css("left"),
						top = next.css("top");
					zIndexArr.push(zIndex);
					self.animate({
						width: width,
						height: height,
						//zIndex:zIndex,
						opacity: opacity,
						left: left,
						top: top
					}, _this_.setting.speed, function () {
						_this_.rotateFlag = true;
					});
				});
				//zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
				this.posterItems.each(function (i) {
					$(this).css("zIndex", zIndexArr[i]);
				});
			};
		},
		//设置剩余的帧的位置关系
		setPosterPos: function () {
			var self = this;
			var sliceItems = this.posterItems.slice(1), //除去第一帧图片的剩余所有图片
				sliceSize = sliceItems.size() / 2,
				rightSlice = sliceItems.slice(0, sliceSize), //右边区域的所有图片
				level = Math.floor(this.posterItems.size() / 2),
				leftSlice = sliceItems.slice(sliceSize);
			//设置右边帧的位置关系和宽度高度top
			var rw = this.setting.posterWidth, //右侧区域第一帧图片的宽度
				rh = this.setting.posterHeight, //右侧区域第一帧图片的高度
				gap = ((this.setting.width - this.setting.posterWidth) / 2) / level; //每张图片的露出的残影宽度
			var firstLeft = (this.setting.width - this.setting.posterWidth) / 2;
			var fixOffsetLeft = firstLeft + rw;
			//设置右边区域的位置关系
			rightSlice.each(function (i) {
				level--;
				rw = rw * self.setting.scale;
				rh = rh * self.setting.scale
				var j = i; //因为在下面的css代码块中，为了防止i被使用两次，创建变量j值和i相同，可以避免i在使用第二次时值会+1
				$(this).css({
					zIndex: level,
					width: rw,
					height: rh,
					opacity: 1 / (++j),
					left: fixOffsetLeft + (++i) * gap - rw,
					top: self.setVerticalAlign(rh)
				});
			});
			//设置左边区域的位置关系
			var lw = rightSlice.last().width(), //左侧区域第一帧图片的宽度（最左边是第一帧）
				lh = rightSlice.last().height(), //左侧区域第一帧图片的高度
				oloop = Math.floor(this.posterItems.size() / 2); //跟设置右侧的变量level是同效果的，因为levle的值在上面被改变过了，所以这里创建一个新变量
			leftSlice.each(function (i) {
				$(this).css({
					zIndex: i,
					width: lw,
					height: lh,
					opacity: 1 / oloop,
					left: i * gap,
					top: self.setVerticalAlign(lh)
				});
				lw = lw / self.setting.scale;
				lh = lh / self.setting.scale;
				oloop--;
			});
		},
		//设置垂直排列对齐
		setVerticalAlign: function (height) {
			var verticalType = this.setting.verticalAlign,
				top = 0;
			if (verticalType === "middle") { //居中
				top = (this.setting.height - height) / 2;
			} else if (verticalType === "top") { //顶部对齐
				top = 0;
			} else if (verticalType === "bottom") { //底部对齐
				top = this.setting.height - height;
			} else {
				top = (this.setting.height - height) / 2;
			};
			return top;
		},
		//设置配置参数值去控制基本的宽度高度。。。
		setSettingValue: function () {
			this.poster.css({
				width: this.setting.width,
				height: this.setting.height
			});
			this.posterItemMain.css({
				width: this.setting.width,
				height: this.setting.height
			});
			//计算上下切换按钮的宽度
			var w = (this.setting.width - this.setting.posterWidth) / 2;
			//设置切换按钮，以及第一帧图片的宽高，层级关系。注意事项：zIndex属性的设置决定了哪个元素盖在哪个元素的上面
			this.nextBtn.css({
				width: w,
				height: this.setting.height,
				zIndex: Math.ceil(this.posterItems.size() / 2)
			});
			this.prevBtn.css({
				width: w,
				height: this.setting.height,
				zIndex: Math.ceil(this.posterItems.size() / 2)
			});
			this.posterFirstItem.css({
				width: this.setting.posterWidth,
				height: this.setting.posterHeight,
				left: w,
				top: 0,
				zIndex: Math.floor(this.posterItems.size() / 2)
			});
		},
		//获取人工配置参数
		getSetting: function () {
			var setting = this.poster.attr("data-setting");
			//校验是否在html元素中设置了data-setting属性
			if (setting && setting != "") {
				return $.parseJSON(setting);
			} else {
				return {};
			};
		}
	};

	//入参是html集合，如$('.class')得到的html就是集合
	Carousel.init = function (posters) {
		var _this_ = this;
		posters.each(function () {
			new _this_($(this));
		});
	};

	window["Carousel"] = Carousel;
})(jQuery);