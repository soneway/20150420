// @ koala-prepend 'carousel.js';

(function (window) {

    var document = window.document;

    /**
     * 数组遍历函数
     * @param {Array} array 待遍历的数组
     * @param {Function} fn 回调函数
     * @ignore
     */
    function forEach(array, fn) {
        for (var i = 0, len = array.length; i < len; i++) {
            fn(array[i], i);
        }
    }

    /**
     * 生成class正式表达式函数
     * @param {String} name css类名
     * @returns {RegExp} css类名正式表达式
     * @ignore
     */
    var classReg = (function () {
        var cache = {};
        return function (name) {
            return cache[name] || (cache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
        };
    })();

    /**
     * 是否有class
     * @param el
     * @param name
     * @returns {boolean}
     */
    function hasClass(el, name) {
        return classReg(name).test(el.className);
    }

    /**
     * 添加class函数
     * @param el
     * @param name
     */
    function addClass(el, name) {
        var oldClass = el.className;
        !hasClass(el, name) && (el.className += (oldClass ? ' ' : '') + name);
    }

    /**
     * 移除class函数
     * @param el
     * @param name
     */
    function removeClass(el, name) {
        var oldClass = el.className;
        oldClass = oldClass.replace(classReg(name), ' ');
        el.className = oldClass.trim();
    }

    /**
     * 创建事件函数
     * @param {string} type 事件类型
     * @param {Object} evt 事件对象
     * @returns {Event} 事件
     * @ignore
     */
    function createEvent(type, evt) {
        var event = document.createEvent('Events');
        //第二个参数:是否冒泡,第三个参数:是否可以preventDefault阻止事件
        event.initEvent(type, true, true);

        //添加事件的其他属性
        if (evt) {
            for (var p in evt) {
                event[p] === undefined && (event[p] = evt[p]);
            }
        }
        return event;
    }

    /**
     * matchesSelector函数
     * @param {Node} el 元素
     * @param {string} sel 选择器
     * @returns {boolean} 元素是否符合sel
     * @ignore
     */
    var matchesSelector = (function () {
        var bodyEl = document.body;
        if (bodyEl.matchesSelector) {
            return function (el, sel) {
                return el.matchesSelector(sel);
            };
        }
        if (bodyEl.webkitMatchesSelector) {
            return function (el, sel) {
                return el.webkitMatchesSelector(sel);
            };
        }
        if (bodyEl.msMatchesSelector) {
            return function (el, sel) {
                return el.msMatchesSelector(sel);
            };
        }
        if (bodyEl.mozMatchesSelector) {
            return function (el, sel) {
                return el.mozMatchesSelector(sel);
            };
        }
    })();


    /**
     * 轮播效果函数
     * @param opts
     */
    function carousel(opts) {

        var defaults = {
            //是否竖直方向滚动
            isVertical: true,
            //滑动阈值
            swipThreshold: 50,
            //轮播回调函数
            slideCallback: null
        };

        opts = opts || {};
        //合并配置项
        for (var p in opts) {
            defaults[p] = opts[p];
        }


        //配置项
        var el = defaults.el,
            isVertical = defaults.isVertical,
            swipThreshold = defaults.swipThreshold,
            slideCallback = defaults.slideCallback;

        //变量
        var wrapEl, wrapElStyle, itemEls, itemCount;

        //初始化函数
        function init() {
            addClass(el, 'jq-carousel');
            el.innerHTML = '<div class="jq-carousel-wrap">' + el.innerHTML + '</div>';

            wrapEl = el.querySelector('.jq-carousel-wrap');
            wrapElStyle = wrapEl.style;
            itemEls = wrapEl.children;
            itemCount = itemEls.length;

            isVertical && addClass(el, 'vertical');

            //初始化事件
            initEvent();
        }


        //初始化事件函数
        function initEvent() {
            var width, height, index = 0,
                startX, startY,
                swipSpan;

            //设置尺寸函数
            function setSize() {
                width = el.offsetWidth;
                height = el.offsetHeight;

                forEach(itemEls, function (item) {
                    var itemStyle = item.style;
                    itemStyle.width = width + 'px';
                    itemStyle.height = height + 'px';
                });

                //水平方向滚动
                if (!isVertical) {
                    wrapElStyle.width = width * itemCount + 'px';
                    wrapElStyle.height = height + 'px';
                }
                //竖直方向滚动
                else {
                    wrapElStyle.width = width + 'px';
                    wrapElStyle.height = height * itemCount + 'px';
                }
            }

            //移动到函数
            function slide(swipSpan) {
                var translate = -index * (isVertical ? height : width),
                    transform;

                if (typeof swipSpan === 'number') {
                    //起点(模拟一种拉不动的感觉)
                    if (index === 0 && swipSpan > 0) {
                        swipSpan /= 2;
                    }
                    //终点(模拟一种拉不动的感觉)
                    if (index === itemCount - 1 && swipSpan < 0) {
                        swipSpan /= 2;
                    }
                    translate += swipSpan;
                }
                else {
                    //滚动回调函数
                    typeof slideCallback === 'function' && slideCallback(index);
                    forEach(itemEls, function (item, i) {
                        i === index ? addClass(item, 'current') : removeClass(item, 'current');
                    });
                }

                transform = 'translate3d(' + (isVertical ? '0,' + translate + 'px,0' : translate + 'px,0,0') + ')';
                wrapElStyle['-webkit-transform'] = transform;
                wrapElStyle['transform'] = transform;
            }


            //初始化
            //设置尺寸
            setSize();

            //暴露slideToIndex方法
            el.slideToIndex = function (i) {
                index = i;
                slide();
            };


            //触摸开始事件
            el.addEventListener('touchstart', function (evt) {
                var touch = evt.targetTouches[0];
                //记录触摸开始位置
                startX = touch.pageX;
                startY = touch.pageY;
                //重置swipSpan
                swipSpan = 0;
                //取消动画
                removeClass(wrapEl, 'transform');
            }, false);

            //触摸移动事件
            el.addEventListener('touchmove', function (evt) {
                var touch = evt.targetTouches[0],
                    swipSpanX = touch.pageX - startX,
                    swipSpanY = touch.pageY - startY;

                //上下
                if (isVertical) {
                    if (Math.abs(swipSpanY) > Math.abs(swipSpanX)) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        slide(swipSpan = swipSpanY);
                    }
                }
                //左右
                else {
                    if (Math.abs(swipSpanX) > Math.abs(swipSpanY)) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        slide(swipSpan = swipSpanX);
                    }
                }
            }, false);

            //触摸结束事件
            el.addEventListener('touchend', function (evt) {
                //向右,下
                if (swipSpan > swipThreshold) {
                    --index < 0 && (index = 0);
                }
                //向左,上
                if (swipSpan < -swipThreshold) {
                    ++index === itemCount && (index = itemCount - 1);
                }

                //加上动画
                addClass(wrapEl, 'transform');

                //滚动
                swipSpan !== 0 && slide();
            }, false);
            el.dispatchEvent(createEvent('touchend'));

            //屏幕尺寸改变事件
            window.addEventListener('resize', function () {
                var w = el.offsetWidth;
                if (w > 0) {
                    setSize();
                    slide(0);
                }
            }, false);

        }

        //初始化
        init();

    }


    /**
     * 弹出框函数
     * @param msg
     * @param title
     */
    var alert = (function () {
        var customalertEl = document.getElementById('customalert'),
            customalertTitleEl = document.getElementById('customalert-title'),
            customalertContentEl = document.getElementById('customalert-content');

        //确定按钮点击
        document.addEventListener('click', function (evt) {
            var target = evt.target;
            if (matchesSelector(target, '#customalert-btnok')) {
                removeClass(customalertEl, 'visible');
            }
        }, false);

        return function (msg, title) {
            customalertContentEl.innerHTML = msg;
            customalertTitleEl.innerHTML = title || '提示';
            addClass(customalertEl, 'visible');
        };
    })();


    //文档加载完成
    document.addEventListener('DOMContentLoaded', function () {

        //加载完成隐藏loading
        addClass(document.body, 'loaded');


        //轮播效果
        var carouselEl = document.getElementById('carousel');
        carousel({
            el: carouselEl
        });
        //carouselEl.slideToIndex(6);


        //a标签touch
        document.addEventListener('touchstart', function (evt) {
            var target = evt.target;
            if (matchesSelector(target, 'a')) {
                addClass(target, 'focus');
            }
        }, false);
        document.addEventListener('touchend', function (evt) {
            var target = evt.target;
            if (getMatSel(target).call(target, 'a')) {
                removeClass(target, 'focus');
            }
        }, false);


        //预约按钮点击
        document.addEventListener('click', function (evt) {
            var target = evt.target;
            if (matchesSelector(target, '#btn_ok')) {
                alert('恭喜您抢得先机，排队<b>2348</b>位', '预约成功');
            }
        }, false);


        //音频
        var audioEl = document.getElementById('audio');
        document.addEventListener('click', function (evt) {
            var target = evt.target;
            if (matchesSelector(target, '.msg')) {
                audioEl.src = 'audio/a.wav';
                audioEl.play();
                addClass(target, 'clicked');
            }
        }, false);
    });

})(this);