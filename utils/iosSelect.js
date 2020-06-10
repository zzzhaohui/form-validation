/**
 * IosSelect
 * @param {number} level 选择的层级 1 2 3 4 5 6 最多支持6层 
 * @param {...Array} data [oneLevelData[, twoLevelData[, threeLevelData[, fourLevelData[, fiveLevelData[, sixLevelData]]]]]] 可以用数组，也可以用方法
 * @param {Object} options
 * @param {string=} options.container 组件插入到该元素下 '可选'
 * @param {Function} options.callback 选择完毕后的回调函数  
 * @param {Function} options.fallback 选择取消后的回调函数  '可选'
 * @param {Function} options.maskCallback 点击背景层关闭组件时触发的方法 '可选'
 * @param {string=} options.title 选择框title  '可选'
 * @param {string=} options.sureText 设置确定按钮文字，默认 确定 '可选'
 * @param {string=} options.closeText 设置取消按钮文字，默认 取消 '可选'
 * @param {number=} options.itemHeight 每一项的高度，默认 35
 * @param {number=} options.itemShowCount 组件展示的项数，默认 7，可选3,5,7,9，不过不是3,5,7,9则展示7项
 * @param {number=} options.headerHeight 组件标题栏高度 默认 44  
 * @param {css=} options.cssUnit px或者rem 默认是px
 * @param {string=} options.addClassName 组件额外类名 用于自定义样式
 * @param {...Array=} options.relation 数组 [oneTwoRelation, twoThreeRelation, threeFourRelation, fourFiveRelation] 默认值：[0, 0, 0, 0, 0, 0]
 * @param {number=} options.relation.oneTwoRelation 第一列和第二列是否通过parentId关联
 * @param {number=} options.relation.twoThreeRelation 第二列和第三列是否通过parentId关联
 * @param {number=} options.relation.threeFourRelation 第三列和第四列是否通过parentId关联
 * @param {number=} options.relation.fourFiveRelation 第四列和第五列是否通过parentId关联
 * @param {number=} options.relation.fiveSixRelation 第五列和第六列是否通过parentId关联
 * @param {string=} options.oneLevelId 第一级选中id
 * @param {string=} options.twoLevelId 第二级选中id
 * @param {string=} options.threeLevelId 第三级选中id
 * @param {string=} options.fourLevelId 第四级选中id
 * @param {string=} options.fiveLevelId 第五级选中id
 * @param {string=} options.sixLevelId 第六级选中id
 * @param {boolean=} options.showLoading 如果你的数据是异步加载的，可以使用该参数设置为true，下拉菜单会有加载中的效果
 * @param {boolean=} options.showAnimate 是否需要入场动画和退场动画，如需自定义动画效果，请修改css
 */
(function () {
	/* modify by zhoushengmufc,based on iScroll v5.2.0 */
	var rAF = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) { window.setTimeout(callback, 1000 / 60); };
	var aF = (function () {
		var eleStyle = document.createElement('div').style;
		var verdors = ['a', 'webkitA', 'MozA', 'OA', 'msA'];
		var endEvents = ['animationend', 'webkitAnimationEnd', 'animationend', 'oAnimationEnd', 'MSAnimationEnd'];
		var animation;
		for (var i = 0, len = verdors.length; i < len; i++) {
			animation = verdors[i] + 'nimation';
			if (animation in eleStyle) {
				return endEvents[i];
			}
		}
		return 'animationend';
	}());

	var utils = (function () {
		var me = {};

		var _elementStyle = document.createElement('div').style;
		var _vendor = (function () {
			var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
				transform,
				i = 0,
				l = vendors.length;

			for (; i < l; i++) {
				transform = vendors[i] + 'ransform';
				if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
			}

			return false;
		})();

		function _prefixStyle(style) {
			if (_vendor === false) return false;
			if (_vendor === '') return style;
			return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
		}

		me.getTime = Date.now || function getTime() { return new Date().getTime(); };

		me.extend = function (target, obj) {
			for (var i in obj) {
				target[i] = obj[i];
			}
		};

		me.addEvent = function (el, type, fn, capture) {
			el.addEventListener(type, fn, !!capture);
		};

		me.removeEvent = function (el, type, fn, capture) {
			el.removeEventListener(type, fn, !!capture);
		};

		me.prefixPointerEvent = function (pointerEvent) {
			return window.MSPointerEvent ?
				'MSPointer' + pointerEvent.charAt(7).toUpperCase() + pointerEvent.substr(8) :
				pointerEvent;
		};

		me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
			var distance = current - start,
				speed = Math.abs(distance) / time,
				destination,
				duration;

			deceleration = deceleration === undefined ? 0.0006 : deceleration;

			destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
			duration = speed / deceleration;

			if (destination < lowerMargin) {
				destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
				distance = Math.abs(destination - current);
				duration = distance / speed;
			} else if (destination > 0) {
				destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
				distance = Math.abs(current) + destination;
				duration = distance / speed;
			}

			return {
				destination: Math.round(destination),
				duration: duration
			};
		};

		var _transform = _prefixStyle('transform');
		var isWechatDevTool = navigator.userAgent.toLowerCase().indexOf('wechatdevtools') > -1;

		me.extend(me, {
			hasTransform: _transform !== false,
			hasPerspective: _prefixStyle('perspective') in _elementStyle,
			hasTouch: 'ontouchstart' in window || isWechatDevTool,
			hasPointer: !!(window.PointerEvent || window.MSPointerEvent), // IE10 is prefixed
			hasTransition: _prefixStyle('transition') in _elementStyle
		});

	    /*
	    This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	    - galaxy S2 is ok
	    - 2.3.6 : `AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
	    - 4.0.4 : `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
	   - galaxy S3 is badAndroid (stock brower, webview)
	     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
	   - galaxy S4 is badAndroid (stock brower, webview)
	     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
	   - galaxy S5 is OK
	     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
	   - galaxy S6 is OK
	     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
	  */
		me.isBadAndroid = (function () {
			var appVersion = window.navigator.appVersion;
			// Android browser is not a chrome browser.
			if (/Android/.test(appVersion) && !(/Chrome\/\d/.test(appVersion))) {
				var safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
				if (safariVersion && typeof safariVersion === "object" && safariVersion.length >= 2) {
					return parseFloat(safariVersion[1]) < 535.19;
				} else {
					return true;
				}
			} else {
				return false;
			}
		})();

		me.extend(me.style = {}, {
			transform: _transform,
			transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
			transitionDuration: _prefixStyle('transitionDuration'),
			transitionDelay: _prefixStyle('transitionDelay'),
			transformOrigin: _prefixStyle('transformOrigin')
		});

		me.hasClass = function (e, c) {
			var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
			return re.test(e.className);
		};

		me.addClass = function (e, c) {
			if (me.hasClass(e, c)) {
				return;
			}

			var newclass = e.className.split(' ');
			newclass.push(c);
			e.className = newclass.join(' ');
		};

		me.removeClass = function (e, c) {
			if (!me.hasClass(e, c)) {
				return;
			}

			var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
			e.className = e.className.replace(re, ' ');
		};

		me.offset = function (el) {
			var left = -el.offsetLeft,
				top = -el.offsetTop;

			// jshint -W084
			while (el = el.offsetParent) {
				left -= el.offsetLeft;
				top -= el.offsetTop;
			}
			// jshint +W084

			return {
				left: left,
				top: top
			};
		};

		me.preventDefaultException = function (el, exceptions) {
			for (var i in exceptions) {
				if (exceptions[i].test(el[i])) {
					return true;
				}
			}

			return false;
		};

		me.extend(me.eventType = {}, {
			touchstart: 1,
			touchmove: 1,
			touchend: 1,

			mousedown: 2,
			mousemove: 2,
			mouseup: 2,

			pointerdown: 3,
			pointermove: 3,
			pointerup: 3,

			MSPointerDown: 3,
			MSPointerMove: 3,
			MSPointerUp: 3
		});

		me.extend(me.ease = {}, {
			quadratic: {
				style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				fn: function (k) {
					return k * (2 - k);
				}
			},
			circular: {
				style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',   // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
				fn: function (k) {
					return Math.sqrt(1 - (--k * k));
				}
			},
			back: {
				style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				fn: function (k) {
					var b = 4;
					return (k = k - 1) * k * ((b + 1) * k + b) + 1;
				}
			},
			bounce: {
				style: '',
				fn: function (k) {
					if ((k /= 1) < (1 / 2.75)) {
						return 7.5625 * k * k;
					} else if (k < (2 / 2.75)) {
						return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
					} else if (k < (2.5 / 2.75)) {
						return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
					} else {
						return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
					}
				}
			},
			elastic: {
				style: '',
				fn: function (k) {
					var f = 0.22,
						e = 0.4;

					if (k === 0) { return 0; }
					if (k == 1) { return 1; }

					return (e * Math.pow(2, - 10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1);
				}
			}
		});

		me.tap = function (e, eventName) {
			var ev = document.createEvent('Event');
			ev.initEvent(eventName, true, true);
			ev.pageX = e.pageX;
			ev.pageY = e.pageY;
			e.target.dispatchEvent(ev);
		};

		me.click = function (e) {
			var target = e.target,
				ev;

			if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
				// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent
				// initMouseEvent is deprecated.
				ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
				ev.initEvent('click', true, true);
				ev.view = e.view || window;
				ev.detail = 1;
				ev.screenX = target.screenX || 0;
				ev.screenY = target.screenY || 0;
				ev.clientX = target.clientX || 0;
				ev.clientY = target.clientY || 0;
				ev.ctrlKey = !!e.ctrlKey;
				ev.altKey = !!e.altKey;
				ev.shiftKey = !!e.shiftKey;
				ev.metaKey = !!e.metaKey;
				ev.button = 0;
				ev.relatedTarget = null;
				ev._constructed = true;
				target.dispatchEvent(ev);
			}
		};

		return me;
	})();
	function IScrollForIosSelect(el, options) {
		this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
		this.scroller = this.wrapper.children[0];
		this.scrollerStyle = this.scroller.style;       // cache style for better performance

		this.options = {
			disablePointer: true,
			disableTouch: !utils.hasTouch,
			disableMouse: utils.hasTouch,
			startX: 0,
			startY: 0,
			scrollY: true,
			directionLockThreshold: 5,
			momentum: true,

			bounce: true,
			bounceTime: 600,
			bounceEasing: '',

			preventDefault: true,
			preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

			HWCompositing: true,
			useTransition: true,
			useTransform: true,
			bindToWrapper: typeof window.onmousedown === "undefined"
		};

		for (var i in options) {
			this.options[i] = options[i];
		}

		// Normalize options
		this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

		this.options.useTransition = utils.hasTransition && this.options.useTransition;
		this.options.useTransform = utils.hasTransform && this.options.useTransform;

		this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
		this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

		// If you want eventPassthrough I have to lock one of the axes
		this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
		this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

		// With eventPassthrough we also need lockDirection mechanism
		this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
		this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

		this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

		this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

		if (this.options.tap === true) {
			this.options.tap = 'tap';
		}

		// https://github.com/cubiq/iscrollForIosSelect/issues/1029
		if (!this.options.useTransition && !this.options.useTransform) {
			if (!(/relative|absolute/i).test(this.scrollerStyle.position)) {
				this.scrollerStyle.position = "relative";
			}
		}

		if (this.options.shrinkScrollbars == 'scale') {
			this.options.useTransition = false;
		}

		this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

		if (this.options.probeType == 3) {
			this.options.useTransition = false;
		}
		this.x = 0;
		this.y = 0;
		this.directionX = 0;
		this.directionY = 0;
		this._events = {};
		this._init();
		this.refresh();

		this.scrollTo(this.options.startX, this.options.startY);
		this.enable();
	}

	IScrollForIosSelect.prototype = {
		version: '1.0.0',

		_init: function () {
			this._initEvents();
		},

		destroy: function () {
			this._initEvents(true);
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = null;
			this._execEvent('destroy');
		},

		_transitionEnd: function (e) {
			if (e.target != this.scroller || !this.isInTransition) {
				return;
			}

			this._transitionTime();
			if (!this.resetPosition(this.options.bounceTime)) {
				this.isInTransition = false;
				this._execEvent('scrollEnd');
			}
		},

		_start: function (e) {
			// React to left mouse button only
			if (utils.eventType[e.type] != 1) {
				// for button property
				// http://unixpapa.com/js/mouse.html
				var button;
				if (!e.which) {
					/* IE case */
					button = (e.button < 2) ? 0 :
						((e.button == 4) ? 1 : 2);
				} else {
					/* All others */
					button = e.button;
				}
				if (button !== 0) {
					return;
				}
			}

			if (!this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) {
				return;
			}

			if (this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
				e.preventDefault();
			}

			var point = e.touches ? e.touches[0] : e,
				pos;

			this.initiated = utils.eventType[e.type];
			this.moved = false;
			this.distX = 0;
			this.distY = 0;
			this.directionX = 0;
			this.directionY = 0;
			this.directionLocked = 0;

			this.startTime = utils.getTime();

			if (this.options.useTransition && this.isInTransition) {
				this._transitionTime();
				this.isInTransition = false;
				pos = this.getComputedPosition();
				this._translate(Math.round(pos.x), Math.round(pos.y));
				this._execEvent('scrollEnd');
			} else if (!this.options.useTransition && this.isAnimating) {
				this.isAnimating = false;
				this._execEvent('scrollEnd');
			}

			this.startX = this.x;
			this.startY = this.y;
			this.absStartX = this.x;
			this.absStartY = this.y;
			this.pointX = point.pageX;
			this.pointY = point.pageY;

			this._execEvent('beforeScrollStart');
		},

		_move: function (e) {
			if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
				return;
			}

			if (this.options.preventDefault) {    // increases performance on Android? TODO: check!
				// e.preventDefault();
			}

			var point = e.touches ? e.touches[0] : e,
				deltaX = point.pageX - this.pointX,
				deltaY = point.pageY - this.pointY,
				timestamp = utils.getTime(),
				newX, newY,
				absDistX, absDistY;

			this.pointX = point.pageX;
			this.pointY = point.pageY;

			this.distX += deltaX;
			this.distY += deltaY;
			absDistX = Math.abs(this.distX);
			absDistY = Math.abs(this.distY);

			// We need to move at least 10 pixels for the scrolling to initiate
			if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
				return;
			}

			// If you are scrolling in one direction lock the other
			if (!this.directionLocked && !this.options.freeScroll) {
				if (absDistX > absDistY + this.options.directionLockThreshold) {
					this.directionLocked = 'h';     // lock horizontally
				} else if (absDistY >= absDistX + this.options.directionLockThreshold) {
					this.directionLocked = 'v';     // lock vertically
				} else {
					this.directionLocked = 'n';     // no lock
				}
			}

			if (this.directionLocked == 'h') {
				if (this.options.eventPassthrough == 'vertical') {
					e.preventDefault();
				} else if (this.options.eventPassthrough == 'horizontal') {
					this.initiated = false;
					return;
				}

				deltaY = 0;
			} else if (this.directionLocked == 'v') {
				if (this.options.eventPassthrough == 'horizontal') {
					e.preventDefault();
				} else if (this.options.eventPassthrough == 'vertical') {
					this.initiated = false;
					return;
				}

				deltaX = 0;
			}

			deltaX = this.hasHorizontalScroll ? deltaX : 0;
			deltaY = this.hasVerticalScroll ? deltaY : 0;

			newX = this.x + deltaX;
			newY = this.y + deltaY;

			// Slow down if outside of the boundaries
			if (newX > 0 || newX < this.maxScrollX) {
				newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
			}
			if (newY > 0 || newY < this.maxScrollY) {
				newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
			}

			this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
			this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

			if (!this.moved) {
				this._execEvent('scrollStart');
			}

			this.moved = true;

			this._translate(newX, newY);
			if (timestamp - this.startTime > 300) {
				this.startTime = timestamp;
				this.startX = this.x;
				this.startY = this.y;

				if (this.options.probeType == 1) {
					this._execEvent('scroll');
				}
			}

			if (this.options.probeType > 1) {
				this._execEvent('scroll');
			}

		},

		_end: function (e) {
			if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
				return;
			}

			if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
				e.preventDefault();
			}

			var point = e.changedTouches ? e.changedTouches[0] : e,
				momentumX,
				momentumY,
				duration = utils.getTime() - this.startTime,
				newX = Math.round(this.x),
				newY = Math.round(this.y),
				distanceX = Math.abs(newX - this.startX),
				distanceY = Math.abs(newY - this.startY),
				time = 0,
				easing = '';

			this.isInTransition = 0;
			this.initiated = 0;
			this.endTime = utils.getTime();

			// reset if we are outside of the boundaries
			if (this.resetPosition(this.options.bounceTime)) {
				return;
			}

			this.scrollTo(newX, newY);  // ensures that the last position is rounded

			// we scrolled less than 10 pixels
			if (!this.moved) {
				if (this.options.tap) {
					utils.tap(e, this.options.tap);
				}

				if (this.options.click) {
					utils.click(e);
				}

				this._execEvent('scrollCancel');
				return;
			}

			if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
				this._execEvent('flick');
				return;
			}

			// start momentum animation if needed
			if (this.options.momentum && duration < 300) {
				momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
				momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
				newX = momentumX.destination;
				newY = momentumY.destination;
				time = Math.max(momentumX.duration, momentumY.duration);
				this.isInTransition = 1;
			}


			if (this.options.snap) {
				var snap = this._nearestSnap(newX, newY);
				this.currentPage = snap;
				time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(newX - snap.x), 1000),
						Math.min(Math.abs(newY - snap.y), 1000)
					), 300);
				newX = snap.x;
				newY = snap.y;

				this.directionX = 0;
				this.directionY = 0;
				easing = this.options.bounceEasing;
			}


			if (newX != this.x || newY != this.y) {
				// change easing function when scroller goes out of the boundaries
				if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
					easing = utils.ease.quadratic;
				}

				this.scrollTo(newX, newY, time, easing);
				return;
			}

			this._execEvent('scrollEnd');
		},

		_resize: function () {
			var that = this;

			clearTimeout(this.resizeTimeout);

			this.resizeTimeout = setTimeout(function () {
				that.refresh();
			}, this.options.resizePolling);
		},

		resetPosition: function (time) {
			var x = this.x,
				y = this.y;

			time = time || 0;

			if (!this.hasHorizontalScroll || this.x > 0) {
				x = 0;
			} else if (this.x < this.maxScrollX) {
				x = this.maxScrollX;
			}

			if (!this.hasVerticalScroll || this.y > 0) {
				y = 0;
			} else if (this.y < this.maxScrollY) {
				y = this.maxScrollY;
			}

			if (x == this.x && y == this.y) {
				return false;
			}

			this.scrollTo(x, y, time, this.options.bounceEasing);

			return true;
		},

		disable: function () {
			this.enabled = false;
		},

		enable: function () {
			this.enabled = true;
		},

		refresh: function () {
			var rf = this.wrapper.offsetHeight;     // Force reflow

			this.wrapperWidth = this.wrapper.clientWidth;
			this.wrapperHeight = this.wrapper.clientHeight;


			this.scrollerWidth = this.scroller.offsetWidth;
			this.scrollerHeight = this.scroller.offsetHeight;

			this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
			this.maxScrollY = this.wrapperHeight - this.scrollerHeight;


			this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0;
			this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;

			if (!this.hasHorizontalScroll) {
				this.maxScrollX = 0;
				this.scrollerWidth = this.wrapperWidth;
			}

			if (!this.hasVerticalScroll) {
				this.maxScrollY = 0;
				this.scrollerHeight = this.wrapperHeight;
			}

			this.endTime = 0;
			this.directionX = 0;
			this.directionY = 0;

			this.wrapperOffset = utils.offset(this.wrapper);

			this._execEvent('refresh');

			this.resetPosition();


		},

		on: function (type, fn) {
			if (!this._events[type]) {
				this._events[type] = [];
			}

			this._events[type].push(fn);
		},

		off: function (type, fn) {
			if (!this._events[type]) {
				return;
			}

			var index = this._events[type].indexOf(fn);

			if (index > -1) {
				this._events[type].splice(index, 1);
			}
		},

		_execEvent: function (type) {
			if (!this._events[type]) {
				return;
			}

			var i = 0,
				l = this._events[type].length;

			if (!l) {
				return;
			}

			for (; i < l; i++) {
				this._events[type][i].apply(this, [].slice.call(arguments, 1));
			}
		},

		scrollTo: function (x, y, time, easing) {
			easing = easing || utils.ease.circular;

			this.isInTransition = this.options.useTransition && time > 0;
			var transitionType = this.options.useTransition && easing.style;
			if (!time || transitionType) {
				if (transitionType) {
					this._transitionTimingFunction(easing.style);
					this._transitionTime(time);
				}
				this._translate(x, y);
			} else {
				this._animate(x, y, time, easing.fn);
			}
		},

		scrollToElement: function (el, time, offsetX, offsetY, easing) {
			el = el.nodeType ? el : this.scroller.querySelector(el);

			if (!el) {
				return;
			}

			var pos = utils.offset(el);

			pos.left -= this.wrapperOffset.left;
			pos.top -= this.wrapperOffset.top;

			// if offsetX/Y are true we center the element to the screen
			if (offsetX === true) {
				offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
			}
			if (offsetY === true) {
				offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
			}

			pos.left -= offsetX || 0;
			pos.top -= offsetY || 0;

			pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
			pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;

			time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;

			this.scrollTo(pos.left, pos.top, time, easing);
		},

		_transitionTime: function (time) {
			if (!this.options.useTransition) {
				return;
			}
			time = time || 0;
			var durationProp = utils.style.transitionDuration;
			if (!durationProp) {
				return;
			}

			this.scrollerStyle[durationProp] = time + 'ms';

			if (!time && utils.isBadAndroid) {
				this.scrollerStyle[durationProp] = '0.0001ms';
				// remove 0.0001ms
				var self = this;
				rAF(function () {
					if (self.scrollerStyle[durationProp] === '0.0001ms') {
						self.scrollerStyle[durationProp] = '0s';
					}
				});
			}



		},

		_transitionTimingFunction: function (easing) {
			this.scrollerStyle[utils.style.transitionTimingFunction] = easing;



		},

		_translate: function (x, y) {
			if (this.options.useTransform) {


				this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;


			} else {
				x = Math.round(x);
				y = Math.round(y);
				this.scrollerStyle.left = x + 'px';
				this.scrollerStyle.top = y + 'px';
			}

			this.x = x;
			this.y = y;



		},

		_initEvents: function (remove) {
			var eventType = remove ? utils.removeEvent : utils.addEvent,
				target = this.options.bindToWrapper ? this.wrapper : window;

			eventType(window, 'orientationchange', this);
			eventType(window, 'resize', this);

			if (this.options.click) {
				eventType(this.wrapper, 'click', this, true);
			}

			if (!this.options.disableMouse) {
				eventType(this.wrapper, 'mousedown', this);
				eventType(target, 'mousemove', this);
				eventType(target, 'mousecancel', this);
				eventType(target, 'mouseup', this);
			}

			if (utils.hasPointer && !this.options.disablePointer) {
				eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
				eventType(target, utils.prefixPointerEvent('pointermove'), this);
				eventType(target, utils.prefixPointerEvent('pointercancel'), this);
				eventType(target, utils.prefixPointerEvent('pointerup'), this);
			}

			if (utils.hasTouch && !this.options.disableTouch) {
				eventType(this.wrapper, 'touchstart', this);
				eventType(target, 'touchmove', this);
				eventType(target, 'touchcancel', this);
				eventType(target, 'touchend', this);
			}

			eventType(this.scroller, 'transitionend', this);
			eventType(this.scroller, 'webkitTransitionEnd', this);
			eventType(this.scroller, 'oTransitionEnd', this);
			eventType(this.scroller, 'MSTransitionEnd', this);
		},

		getComputedPosition: function () {
			var matrix = window.getComputedStyle(this.scroller, null),
				x, y;

			if (this.options.useTransform) {
				matrix = matrix[utils.style.transform].split(')')[0].split(', ');
				x = +(matrix[12] || matrix[4]);
				y = +(matrix[13] || matrix[5]);
			} else {
				x = +matrix.left.replace(/[^-\d.]/g, '');
				y = +matrix.top.replace(/[^-\d.]/g, '');
			}

			return { x: x, y: y };
		},

		_animate: function (destX, destY, duration, easingFn) {
			var that = this,
				startX = this.x,
				startY = this.y,
				startTime = utils.getTime(),
				destTime = startTime + duration;

			function step() {
				var now = utils.getTime(),
					newX, newY,
					easing;

				if (now >= destTime) {
					that.isAnimating = false;
					that._translate(destX, destY);

					if (!that.resetPosition(that.options.bounceTime)) {
						that._execEvent('scrollEnd');
					}

					return;
				}

				now = (now - startTime) / duration;
				easing = easingFn(now);
				newX = (destX - startX) * easing + startX;
				newY = (destY - startY) * easing + startY;
				that._translate(newX, newY);

				if (that.isAnimating) {
					rAF(step);
				}

				if (that.options.probeType == 3) {
					that._execEvent('scroll');
				}
			}

			this.isAnimating = true;
			step();
		},

		handleEvent: function (e) {
			switch (e.type) {
				case 'touchstart':
				case 'pointerdown':
				case 'MSPointerDown':
				case 'mousedown':
					this._start(e);
					break;
				case 'touchmove':
				case 'pointermove':
				case 'MSPointerMove':
				case 'mousemove':
					this._move(e);
					break;
				case 'touchend':
				case 'pointerup':
				case 'MSPointerUp':
				case 'mouseup':
				case 'touchcancel':
				case 'pointercancel':
				case 'MSPointerCancel':
				case 'mousecancel':
					this._end(e);
					break;
				case 'orientationchange':
				case 'resize':
					this._resize();
					break;
				case 'transitionend':
				case 'webkitTransitionEnd':
				case 'oTransitionEnd':
				case 'MSTransitionEnd':
					this._transitionEnd(e);
					break;
				case 'click':
					if (this.enabled && !e._constructed) {
						e.preventDefault();
						e.stopPropagation();
					}
					break;
			}
		}
	};
	IScrollForIosSelect.utils = utils;

	var iosSelectUtil = {
		isArray: function (arg1) {
			return Object.prototype.toString.call(arg1) === '[object Array]';
		},
		isFunction: function (arg1) {
			return typeof arg1 === 'function';
		},
		attrToData: function (dom, index) {
			var obj = {};
			for (var p in dom.dataset) {
				obj[p] = dom.dataset[p];
			}
			obj['dom'] = dom;
			obj['atindex'] = index;
			return obj;
		},
		attrToHtml: function (obj) {
			var html = '';
			for (var p in obj) {
				html += 'data-' + p + '="' + obj[p] + '"';
			}
			return html;
		}
	};
	/*function preventEventFun(e) {
		e.preventDefault();
	}*/
	// Layer
	function Layer(html, opts) {
		if (!(this instanceof Layer)) {
			return new Layer(html, opts);
		}
		this.html = html;
		this.opts = opts;
		var el = document.createElement('div');
		el.className = 'olay';
		var layer_el = document.createElement('div');
		layer_el.className = 'layer';
		this.el = el;
		this.layer_el = layer_el;
		this.init();
	}
	Layer.prototype = {
		init: function () {
			this.layer_el.innerHTML = this.html;
			if (this.opts.container && document.querySelector(this.opts.container)) {
				document.querySelector(this.opts.container).appendChild(this.el);
			}
			else {
				document.body.appendChild(this.el);
			}
			this.el.appendChild(this.layer_el);
			this.el.style.height = Math.max(document.documentElement.getBoundingClientRect().height, window.innerHeight);
			if (this.opts.className) {
				this.el.className += ' ' + this.opts.className;
			}
			this.bindEvent();
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent('IosSelectCreated', true, false);
			this.el.dispatchEvent(evt);
		},
		bindEvent: function () {
			var sureDom = this.el.querySelectorAll('.sure');
			var closeDom = this.el.querySelectorAll('.close');
			var self = this;
			this.el.addEventListener('click', function (e) {
				self.close();
				self.opts.maskCallback && self.opts.maskCallback(e);
			});
			this.layer_el.addEventListener('click', function (e) {
				e.stopPropagation();
			});
			Array.prototype.slice.call(sureDom).forEach(function (item, index) {
				item.addEventListener('click', function () {
					self.close();
				});
			});
			Array.prototype.slice.call(closeDom).forEach(function (item, index) {
				item.addEventListener('click', function (e) {
					self.close();
					self.opts.fallback && self.opts.fallback(e);
				});
			});
		},
		close: function () {
			var self = this;
			if (self.el) {
				if (self.opts.showAnimate) {
					self.el.className += ' fadeOutDown';
					self.el.addEventListener(aF, function () {
						self.removeDom();
					});
				}
				else {
					self.removeDom();
				}
			}
		},
		removeDom: function () {
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent('IosSelectDestroyed', true, false);
			this.el.dispatchEvent(evt);
			this.el.parentNode.removeChild(this.el);
			this.el = null;
			if (document.documentElement.classList.contains('ios-select-body-class')) {
				document.documentElement.classList.remove('ios-select-body-class');
				/*document.body.removeEventListener('touchmove', preventEventFun, {
					passive: false
				});*/
			}
		}
	}

	function IosSelect(level, data, options) {
		if (!iosSelectUtil.isArray(data) || data.length === 0) {
			throw new TypeError('the data must be a non-empty array!');
			return;
		}
		if ([1, 2, 3, 4, 5, 6].indexOf(level) == -1) {
			throw new RangeError('the level parameter must be one of 1,2,3,4,5,6!');
			return;
		}
		this.data = data;
		this.level = level || 1;
		this.options = options;
		this.typeBox = 'one-level-box';
		var boxClass = ['one', 'two', 'three', 'four', 'five', 'six'];
		if (this.level <= 6 && this.level >= 1) {
			this.typeBox = boxClass[parseInt(this.level) - 1] + '-level-box';
		}
		this.title = options.title || '';

		this.options.itemHeight = options.itemHeight || 35;
		this.options.itemShowCount = [3, 5, 7, 9].indexOf(options.itemShowCount) !== -1 ? options.itemShowCount : 7;
		this.options.coverArea1Top = Math.floor(this.options.itemShowCount / 2);
		this.options.coverArea2Top = Math.ceil(this.options.itemShowCount / 2);
		this.options.headerHeight = options.headerHeight || 44;
		this.options.relation = iosSelectUtil.isArray(this.options.relation) ? this.options.relation : [];
		this.options.oneTwoRelation = this.options.relation[0];
		this.options.twoThreeRelation = this.options.relation[1];
		this.options.threeFourRelation = this.options.relation[2];
		this.options.fourFiveRelation = this.options.relation[3];
		this.options.fiveSixRelation = this.options.relation[4];

		if (this.options.cssUnit !== 'px' && this.options.cssUnit !== 'rem') {
			this.options.cssUnit = 'px'; 
		}
		var self = this;
		// 选中元素的信息
		this.selectDataObj = {
			selectOneObj: {
				id: self.options.oneLevelId
			},
			selectTwoObj: {
				id: self.options.twoLevelId
			},
			selectThreeObj: {
				id: self.options.threeLevelId
			},
			selectFourObj: {
				id: self.options.fourLevelId
			},
			selectFiveObj: {
				id: self.options.fiveLevelId
			},
			selectSixObj: {
				id: self.options.sixLevelId
			}
		}
		IosSelect.prototype.setBase(this);
		IosSelect.prototype.init(this);
	};
	
	IosSelect.prototype = {
		init: function (that) {
			this.initLayer(that);
			this.setLevelData(that, 1, that.options.oneLevelId, that.options.twoLevelId, that.options.threeLevelId, that.options.fourLevelId, that.options.fiveLevelId, that.options.sixLevelId);
		},
		initLayer: function (that) {
			var self = that;
			var sureText = that.options.sureText || '确定';
			var closeText = that.options.closeText || '取消';
			var headerHeightCss = that.options.headerHeight + that.options.cssUnit;
			var all_html = [
				'<header style="height: ' + headerHeightCss + '; line-height: ' + headerHeightCss + '" class="iosselect-header">',
				'<a style="height: ' + headerHeightCss + '; line-height: ' + headerHeightCss + '" href="javascript:void(0)" class="close">' + closeText + '</a>',
				'<a style="height: ' + headerHeightCss + '; line-height: ' + headerHeightCss + '" href="javascript:void(0)" class="sure">' + sureText + '</a>',
				'<h2 id="iosSelectTitle"></h2>',
				'</header>',
				'<section class="iosselect-box">',
				'<div class="one-level-contain" id="oneLevelContain">',
				'<ul class="select-one-level">',
				'</ul>',
				'</div>',
				'<div class="two-level-contain" id="twoLevelContain">',
				'<ul class="select-two-level">',
				'</ul>',
				'</div>',
				'<div class="three-level-contain" id="threeLevelContain">',
				'<ul class="select-three-level">',
				'</ul>',
				'</div>',
				'<div class="four-level-contain" id="fourLevelContain">',
				'<ul class="select-four-level">',
				'</ul>',
				'</div>',
				'<div class="five-level-contain" id="fiveLevelContain">',
				'<ul class="select-five-level">',
				'</ul>',
				'</div>',
				'<div class="six-level-contain" id="sixLevelContain">',
				'<ul class="select-six-level">',
				'</ul>',
				'</div>',
				'</section>',
				'<hr class="cover-area1"/>',
				'<hr class="cover-area2"/>',
				'<div class="ios-select-loading-box" id="iosSelectLoadingBox">',
				'<div class="ios-select-loading"></div>',
				'</div>'
			].join('\r\n');
			that.iosSelectLayer = new Layer(all_html, {
				className: 'ios-select-widget-box ' + that.typeBox + (that.options.addClassName ? ' ' + that.options.addClassName : '') + (that.options.showAnimate ? ' fadeInUp' : ''),
				container: that.options.container || '',
				showAnimate: that.options.showAnimate,
				fallback: that.options.fallback,
				maskCallback: that.options.maskCallback
			});

			that.iosSelectTitleDom = that.iosSelectLayer.el.querySelector('#iosSelectTitle');
			that.iosSelectLoadingBoxDom = that.iosSelectLayer.el.querySelector('#iosSelectLoadingBox');
			that.iosSelectTitleDom.innerHTML = that.title;
			if (that.options.headerHeight && that.options.itemHeight) {
				that.coverArea1Dom = that.iosSelectLayer.el.querySelector('.cover-area1');
				that.coverArea1Dom.style.top = that.options.headerHeight + that.options.itemHeight * that.options.coverArea1Top + that.options.cssUnit;
				that.coverArea2Dom = that.iosSelectLayer.el.querySelector('.cover-area2');
				that.coverArea2Dom.style.top = that.options.headerHeight + that.options.itemHeight * that.options.coverArea2Top + that.options.cssUnit;
			}

			that.oneLevelContainDom = that.iosSelectLayer.el.querySelector('#oneLevelContain');
			that.twoLevelContainDom = that.iosSelectLayer.el.querySelector('#twoLevelContain');
			that.threeLevelContainDom = that.iosSelectLayer.el.querySelector('#threeLevelContain');
			that.fourLevelContainDom = that.iosSelectLayer.el.querySelector('#fourLevelContain');
			that.fiveLevelContainDom = that.iosSelectLayer.el.querySelector('#fiveLevelContain');
			that.sixLevelContainDom = that.iosSelectLayer.el.querySelector('#sixLevelContain');

			that.oneLevelUlContainDom = that.iosSelectLayer.el.querySelector('.select-one-level');
			that.twoLevelUlContainDom = that.iosSelectLayer.el.querySelector('.select-two-level');
			that.threeLevelUlContainDom = that.iosSelectLayer.el.querySelector('.select-three-level');
			that.fourLevelUlContainDom = that.iosSelectLayer.el.querySelector('.select-four-level');
			that.fiveLevelUlContainDom = that.iosSelectLayer.el.querySelector('.select-five-level');
			that.sixLevelUlContainDom = that.iosSelectLayer.el.querySelector('.select-six-level');

			that.iosSelectLayer.el.querySelector('.layer').style.height = that.options.itemHeight * that.options.itemShowCount + that.options.headerHeight + that.options.cssUnit;

			that.oneLevelContainDom.style.height = that.options.itemHeight * that.options.itemShowCount + that.options.cssUnit;
			document.documentElement.classList.add('ios-select-body-class');
			/*document.body.addEventListener('touchmove', preventEventFun, {
				passive: false
			});*/

			that.scrollOne = new IScrollForIosSelect('#oneLevelContain', {
				probeType: 3,
				bounce: false
			});
			this.setScorllEvent(that, that.scrollOne, 1);

			if (that.level >= 2) {
				that.twoLevelContainDom.style.height = that.options.itemHeight * that.options.itemShowCount + that.options.cssUnit;
				that.scrollTwo = new IScrollForIosSelect('#twoLevelContain', {
					probeType: 3,
					bounce: false
				});
				this.setScorllEvent(that, that.scrollTwo, 2);
			}
			if (that.level >= 3) {
				that.threeLevelContainDom.style.height = that.options.itemHeight * that.options.itemShowCount + that.options.cssUnit;
				that.scrollThree = new IScrollForIosSelect('#threeLevelContain', {
					probeType: 3,
					bounce: false
				});
				this.setScorllEvent(that, that.scrollThree, 3);
			}
			if (that.level >= 4) {
				that.fourLevelContainDom.style.height = that.options.itemHeight * that.options.itemShowCount + that.options.cssUnit;
				that.scrollFour = new IScrollForIosSelect('#fourLevelContain', {
					probeType: 3,
					bounce: false
				});
				this.setScorllEvent(that, that.scrollFour, 4);
			}
			if (that.level >= 5) {
				that.fiveLevelContainDom.style.height = that.options.itemHeight * that.options.itemShowCount + that.options.cssUnit;
				that.scrollFive = new IScrollForIosSelect('#fiveLevelContain', {
					probeType: 3,
					bounce: false
				});
				this.setScorllEvent(that, that.scrollFive, 5);
			}
			if (that.level >= 6) {
				that.sixLevelContainDom.style.height = that.options.itemHeight * that.options.itemShowCount + that.options.cssUnit;
				that.scrollSix = new IScrollForIosSelect('#sixLevelContain', {
					probeType: 3,
					bounce: false
				});
				this.setScorllEvent(that, that.scrollSix, 6);
			}

			// 确认
			that.selectBtnDom = that.iosSelectLayer.el.querySelector('.sure');
			that.selectBtnDom.addEventListener('click', function (e) {
				self.options.callback && self.options.callback(self.selectDataObj);
			});
		},
		close: function () {
			this.options.callback && this.options.callback(this.selectDataObj);
			this.iosSelectLayer.close();
		},
		mapKeyByIndex: function (that, index) {
			var self = that;
			var map = {
				index: 1,
				levelContain: self.oneLevelContainDom,
				relation: self.options.oneTwoRelation
			};
			if (index === 2) {
				map = {
					index: 2,
					levelContain: self.twoLevelContainDom,
					relation: self.options.twoThreeRelation
				};
			}
			else if (index === 3) {
				map = {
					index: 3,
					levelContain: self.threeLevelContainDom,
					relation: self.options.threeFourRelation
				};
			}
			else if (index === 4) {
				map = {
					index: 4,
					levelContain: self.fourLevelContainDom,
					relation: self.options.fourFiveRelation
				};
			}
			else if (index === 5) {
				map = {
					index: 5,
					levelContain: self.fiveLevelContainDom,
					relation: self.options.fiveSixRelation
				};
			}
			else if (index === 6) {
				map = {
					index: 6,
					levelContain: self.sixLevelContainDom,
					relation: 0
				};
			}
			return map;
		},
		setScorllEvent: function (that, scrollInstance, index) {
			var self = this;
			var mapKey = self.mapKeyByIndex(that, index);
			scrollInstance.on('scrollStart', function () {
				self.toggleClassList(mapKey.levelContain);
			});
			scrollInstance.on('scroll', function () {
				if (isNaN(this.y)) {
					return;
				}
				var pa = Math.abs(this.y / that.baseSize) / that.options.itemHeight;
				var plast = 1;
				plast = Math.round(pa) + 1;
				self.toggleClassList(mapKey.levelContain);
				self.changeClassName(that, mapKey.levelContain, plast);
			});
			scrollInstance.on('scrollEnd', function () {
				var pa = Math.abs(this.y / that.baseSize) / that.options.itemHeight;
				var plast = 1;
				var to = 0;
				if (Math.ceil(pa) === Math.round(pa)) {
					to = Math.ceil(pa) * that.options.itemHeight * that.baseSize;
					plast = Math.ceil(pa) + 1;
				} else {
					to = Math.floor(pa) * that.options.itemHeight * that.baseSize;
					plast = Math.floor(pa) + 1;
				}
				scrollInstance.scrollTo(0, -to, 0);

				self.toggleClassList(mapKey.levelContain);

				var pdom = self.changeClassName(that, mapKey.levelContain, plast);
				var obj = iosSelectUtil.attrToData(pdom, plast);
				self.setSelectObj(that, index, obj);

				if (that.level > index) {
					if ((mapKey.relation === 1 && iosSelectUtil.isArray(that.data[index])) || iosSelectUtil.isFunction(that.data[index])) {
						self.setLevelData(that, index + 1, that.selectDataObj.selectOneObj.id, that.selectDataObj.selectTwoObj.id, that.selectDataObj.selectThreeObj.id, that.selectDataObj.selectFourObj.id, that.selectDataObj.selectFiveObj.id, that.selectDataObj.selectSixObj.id);
					}
				}
			});
			scrollInstance.on('scrollCancel', function () {
				var pa = Math.abs(this.y / that.baseSize) / that.options.itemHeight;
				var plast = 1;
				var to = 0;
				if (Math.ceil(pa) === Math.round(pa)) {
					to = Math.ceil(pa) * that.options.itemHeight * that.baseSize;
					plast = Math.ceil(pa) + 1;
				} else {
					to = Math.floor(pa) * that.options.itemHeight * that.baseSize;
					plast = Math.floor(pa) + 1;
				}
				scrollInstance.scrollTo(0, -to, 0);

				self.toggleClassList(mapKey.levelContain);

				var pdom = self.changeClassName(that, mapKey.levelContain, plast);
				var obj = iosSelectUtil.attrToData(pdom, plast);
				self.setSelectObj(that, index, obj);

				if (that.level > index) {
					if ((mapKey.relation === 1 && iosSelectUtil.isArray(that.data[index])) || iosSelectUtil.isFunction(that.data[index])) {
						self.setLevelData(that, index + 1, that.selectDataObj.selectOneObj.id, that.selectDataObj.selectTwoObj.id, that.selectDataObj.selectThreeObj.id, that.selectDataObj.selectFourObj.id, that.selectDataObj.selectFiveObj.id, that.selectDataObj.selectSixObj.id);
					}

				}
			});
		},
		loadingShow: function () {
			this.options.showLoading && (this.iosSelectLoadingBoxDom.style.display = 'block');
		},
		loadingHide: function () {
			this.iosSelectLoadingBoxDom.style.display = 'none';
		},
		mapRenderByIndex: function (that, index) {
			var self = that;
			var map = {
				index: 1,
				relation: 0,
				levelUlContainDom: self.oneLevelUlContainDom,
				scrollInstance: self.scrollOne,
				levelContainDom: self.oneLevelContainDom
			};
			if (index === 2) {
				map = {
					index: 2,
					relation: self.options.oneTwoRelation,
					levelUlContainDom: self.twoLevelUlContainDom,
					scrollInstance: self.scrollTwo,
					levelContainDom: self.twoLevelContainDom
				};
			}
			else if (index === 3) {
				map = {
					index: 3,
					relation: self.options.twoThreeRelation,
					levelUlContainDom: self.threeLevelUlContainDom,
					scrollInstance: self.scrollThree,
					levelContainDom: self.threeLevelContainDom
				};
			}
			else if (index === 4) {
				map = {
					index: 4,
					relation: self.options.threeFourRelation,
					levelUlContainDom: self.fourLevelUlContainDom,
					scrollInstance: self.scrollFour,
					levelContainDom: self.fourLevelContainDom
				};
			}
			else if (index === 5) {
				map = {
					index: 5,
					relation: self.options.fourFiveRelation,
					levelUlContainDom: self.fiveLevelUlContainDom,
					scrollInstance: self.scrollFive,
					levelContainDom: self.fiveLevelContainDom
				};
			}
			else if (index === 6) {
				map = {
					index: 6,
					relation: self.options.fiveSixRelation,
					levelUlContainDom: self.sixLevelUlContainDom,
					scrollInstance: self.scrollSix,
					levelContainDom: self.sixLevelContainDom
				};
			}
			return map;
		},
		getLevelData: function (that, index, oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId) {
			var levelData = [];
			var renderMap = this.mapRenderByIndex(that, index);
			if (index === 1) {
				levelData = that.data[0];
			}
			else if (renderMap.relation === 1) {
				var pid = arguments[index];
				that.data[index - 1].forEach(function (v, i, o) {
					if (v['parentId'] == pid) {
						levelData.push(v);
					}
				});
			}
			else {
				levelData = that.data[index - 1];
			}
			return levelData;
		},
		setLevelData: function (that, index, oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, sixLevelId) {
			if (iosSelectUtil.isArray(that.data[index - 1])) {
				var levelData = this.getLevelData(that, index, oneLevelId, twoLevelId, threeLevelId, fourLevelId);
				this.renderLevel(that, index, oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, sixLevelId, levelData);
			}
			else if (iosSelectUtil.isFunction(that.data[index - 1])) {
				this.loadingShow();
				that.data[index - 1].apply(this, [oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId].slice(0, index - 1).concat(function (levelData) {
					that.loadingHide();
					this.renderLevel(that, index, oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, sixLevelId, levelData);
				}.bind(this)));
			}
			else {
				throw new Error('data format error');
			}
		},
		renderLevel: function (that, index, oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, sixLevelId, levelData) {
			var plast = 0;
			var curLevelId = arguments[index + 1];
			var hasAtId = levelData.some(function (v, i, o) {
				return v.id == curLevelId;
			});
			if (!hasAtId) {
				curLevelId = levelData[0]['id'];
			}
			var tmpHtml = '';
			var itemHeightStyle = that.options.itemHeight + that.options.cssUnit;
			tmpHtml += this.getWhiteItem(that);
			levelData.forEach(function (v, i, o) {
				if (v.id == curLevelId) {
					tmpHtml += '<li style="height: ' + itemHeightStyle + '; line-height: ' + itemHeightStyle + ';"' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					plast = i + 1;
				}
				else {
					tmpHtml += '<li style="height: ' + itemHeightStyle + '; line-height: ' + itemHeightStyle + ';"' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			});
			tmpHtml += this.getWhiteItem(that);
			var renderMap = this.mapRenderByIndex(that, index);
			renderMap.levelUlContainDom.innerHTML = tmpHtml;
			renderMap.scrollInstance.refresh();
			renderMap.scrollInstance.scrollToElement(':nth-child(' + plast + ')', 0);
			var pdom = this.changeClassName(that, renderMap.levelContainDom, plast);
			var obj = iosSelectUtil.attrToData(pdom, plast);
			this.setSelectObj(that, index, obj);
			if (that.level > index) {
				this.setLevelData(that, index + 1, that.selectDataObj.selectOneObj.id, that.selectDataObj.selectTwoObj.id, that.selectDataObj.selectThreeObj.id, that.selectDataObj.selectFourObj.id, that.selectDataObj.selectFiveObj.id, that.selectDataObj.selectSixObj.id);
			}
		},
		setSelectObj: function (that, index, obj) {
			var selectDataObj = that.selectDataObj
			if (index === 1) {
				selectDataObj.selectOneObj = obj;
			}
			else if (index === 2) {
				selectDataObj.selectTwoObj = obj;
			}
			else if (index === 3) {
				selectDataObj.selectThreeObj = obj;
			}
			else if (index === 4) {
				selectDataObj.selectFourObj = obj;
			}
			else if (index === 5) {
				selectDataObj.selectFiveObj = obj;
			}
			else if (index === 6) {
				selectDataObj.selectSixObj = obj;
			}
		},
		getWhiteItem: function (that) {
			var whiteItemHtml = '';
			var itemHeightStyle = that.options.itemHeight + that.options.cssUnit;
			var itemLi = '<li style="height: ' + itemHeightStyle + '; line-height: ' + itemHeightStyle + '"></li>';
			whiteItemHtml += itemLi;
			if (that.options.itemShowCount > 3) {
				whiteItemHtml += itemLi;
			}
			if (that.options.itemShowCount > 5) {
				whiteItemHtml += itemLi;
			}
			if (that.options.itemShowCount > 7) {
				whiteItemHtml += itemLi;
			}
			return whiteItemHtml;
		},
		changeClassName: function (that, levelContainDom, plast) {
			var pdom;
			if (that.options.itemShowCount === 3) {
				pdom = levelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')');
				pdom.classList.add('at');
			}
			else if (that.options.itemShowCount === 5) {
				pdom = levelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')');
				pdom.classList.add('at');
				levelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side1');
				levelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')').classList.add('side1');
			}
			else if (that.options.itemShowCount === 7) {
				pdom = levelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');
				pdom.classList.add('at');
				levelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
				levelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
				levelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
				levelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');
			}
			else if (that.options.itemShowCount === 9) {
				pdom = levelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')');
				pdom.classList.add('at');
				levelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')').classList.add('side1');
				levelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side2');
				levelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side1');
				levelContainDom.querySelector('li:nth-child(' + (plast + 6) + ')').classList.add('side2');
			}
			return pdom;
		},
		setBase: function (that) {
			if (that.options.cssUnit === 'rem') {
				var dltDom = document.documentElement;
				var dltStyle = window.getComputedStyle(dltDom, null);
				var dltFontSize = dltStyle.fontSize;
				try {
					that.baseSize = /\d+(?:\.\d+)?/.exec(dltFontSize)[0];
				}
				catch (e) {
					that.baseSize = 1;
				}
			}
			else {
				that.baseSize = 1;
			}
		},
		toggleClassList: function (dom) {
			Array.prototype.slice.call(dom.querySelectorAll('li')).forEach(function (v) {
				if (v.classList.contains('at')) {
					v.classList.remove('at');
				}
				else if (v.classList.contains('side1')) {
					v.classList.remove('side1');
				}
				else if (v.classList.contains('side2')) {
					v.classList.remove('side2');
				}
			})
		}
	}
	if (typeof module != 'undefined' && module.exports) {
		module.exports = IosSelect;
	}
	else if (typeof define == 'function' && define.amd) {
		define(function () {
			return IosSelect;
		});
	}
	else {
		window.IosSelect = IosSelect;
	}

})();



