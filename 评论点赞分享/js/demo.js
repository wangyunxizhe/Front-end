window.onload = function () {
    var list = document.getElementById('list');
    var boxs = list.children;
    var timer;

    //格式化日期
    function formateDate(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var h = date.getHours();
        var mi = date.getMinutes();
        m = m > 9 ? m : '0' + m;
        return y + '-' + m + '-' + d + ' ' + h + ':' + mi;
    }

    //删除节点
    function removeNode(node) {
        node.parentNode.removeChild(node);
    }

    /**
     * 点赞/取消赞
     * @param box 每个分享的div容器
     * @param el 点击的元素
     */
    function praiseBox(box, el) {
        var txt = el.innerHTML; //获取当前主内容点赞区中的文字（点赞/取消赞）,以便确定后续对点赞总数进行的是加法还是减法（点赞->加/取消赞->减）
        var praisesTotal = box.getElementsByClassName('praises-total')[0];
        var oldTotal = parseInt(praisesTotal.getAttribute('total')); //获取当前点赞总数
        var newTotal;
        if (txt == '赞') {
            newTotal = oldTotal + 1;
            praisesTotal.innerHTML = (newTotal == 1) ? '我觉得很赞' : '我和' + oldTotal + '个人觉得很赞';
            el.innerHTML = '取消赞';
        } else {
            newTotal = oldTotal - 1;
            praisesTotal.innerHTML = (newTotal == 0) ? '' : newTotal + '个人觉得很赞';
            el.innerHTML = '赞';
        }
        //更新处理完毕的点赞数
        praisesTotal.setAttribute('total', newTotal);
        //当没有人点赞时，将 点赞详情区 隐藏起来
        praisesTotal.style.display = (newTotal == 0) ? 'none' : 'block';
    }

    /**
     * 发评论效果
     * @param box 每个分享的div容器
     * @param el 点击的元素
     */
    function reply(box, el) {
        var commentList = box.getElementsByClassName('comment-list')[0];
        var textarea = box.getElementsByClassName('comment')[0]; //获取下方输入框中的内容
        var commentBox = document.createElement('div');
        commentBox.className = 'comment-box clearfix';
        commentBox.setAttribute('user', 'self');
        //组装评论的html
        commentBox.innerHTML =
            '<img class="myhead" src="images/my.jpg" alt=""/>' +
            '<div class="comment-content">' +
            '<p class="comment-text"><span class="user">我：</span>' + textarea.value + '</p>' +
            '<p class="comment-time">' +
            formateDate(new Date()) +
            '<a href="javascript:;" class="comment-praise" total="0" my="0" style="">赞</a>' +
            '<a href="javascript:;" class="comment-operate">删除</a>' +
            '</p>' +
            '</div>'
        commentList.appendChild(commentBox); //在指定元素下追加组装好的评论
        textarea.value = ''; //将输入框内容清空
        textarea.onblur(); //调用下面写好的-->评论框失去焦点时触发的事件
    }

    /**
     * 点赞/取消赞 回复
     * @param el 点击的元素
     */
    function praiseReply(el) {
        var myPraise = parseInt(el.getAttribute('my')); //获取我点的赞
        var oldTotal = parseInt(el.getAttribute('total')); //当前该回复的点赞总数
        var newTotal;
        if (myPraise == 0) { //当前我点赞等于0的情况下
            newTotal = oldTotal + 1;
            el.setAttribute('total', newTotal);
            el.setAttribute('my', 1);
            el.innerHTML = newTotal + ' 取消赞';
        } else {
            newTotal = oldTotal - 1;
            el.setAttribute('total', newTotal);
            el.setAttribute('my', 0);
            el.innerHTML = (newTotal == 0) ? '赞' : newTotal + ' 赞';
        }
        el.style.display = (newTotal == 0) ? '' : 'inline-block'; //有人点赞的情况下，该元素一直显示
    }

    /**
     * 操作留言
     * @param el 点击的元素
     */
    function operate(el) {
        var commentBox = el.parentNode.parentNode.parentNode;
        var box = commentBox.parentNode.parentNode.parentNode;
        var txt = el.innerHTML; //获取元素中的文字
        var user = commentBox.getElementsByClassName('user')[0].innerHTML; //获取该留言作者
        var textarea = box.getElementsByClassName('comment')[0];
        if (txt == '回复') { //当文字是“回复”的时候
            textarea.focus();
            textarea.value = '回复' + user;
            textarea.onkeyup();
        } else {
            removeNode(commentBox);
        }
    }

    //把事件代理到每条分享div容器
    for (var i = 0; i < boxs.length; i++) {

        //点击
        boxs[i].onclick = function (e) {
            e = e || window.event; //将事件对象做浏览器兼容性处理
            var el = e.srcElement; //获取被点击的元素对象
            switch (el.className) { //根据被点击元素的class，来判断应该触发怎样的function
                //关闭窗口
                case 'close':
                    removeNode(el.parentNode);
                    break;
                    //点赞
                case 'praise':
                    praiseBox(el.parentNode.parentNode.parentNode, el);
                    break;
                    //当回复按钮是蓝色
                case 'btn':
                    reply(el.parentNode.parentNode.parentNode, el);
                    break
                    //当回复按钮是灰色，清除定时器
                case 'btn btn-off':
                    clearTimeout(timer);
                    break;
                    //点赞/取消赞 留言
                case 'comment-praise':
                    praiseReply(el);
                    break;
                    //操作留言
                case 'comment-operate':
                    operate(el);
                    break;
            }
        }

        //获取评论框
        var textArea = boxs[i].getElementsByClassName('comment')[0];
        //评论框获取焦点时触发的事件
        textArea.onfocus = function () {
            this.parentNode.className = 'text-box text-box-on';
            this.value = this.value == '评论…' ? '' : this.value; //判断输入框中是控制还是有值
            this.onkeyup();
        }
        //评论框失去焦点时触发的事件
        textArea.onblur = function () {
            var me = this;
            var val = me.value;
            if (val == '') { //只有在评论为空的情况下，将输入框恢复的初始时的样式
                timer = setTimeout(function () {
                    me.value = '评论…';
                    me.parentNode.className = 'text-box';
                }, 200);
            }
        }
        //回复按键事件。onkeyup-->键盘按键被松开时发生
        textArea.onkeyup = function () {
            var val = this.value;
            var len = val.length; //获取评论框中已有字数的长度
            var els = this.parentNode.children;
            var btn = els[1];
            var word = els[2];
            if (len <= 0 || len > 140) { //如果已有字数长度不符合要求，“回复”按钮置灰
                btn.className = 'btn btn-off';
            } else {
                btn.className = 'btn';
            }
            word.innerHTML = len + '/140';
        }

    }
}