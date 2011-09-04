/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.scrollable"]) {
	dojo._hasResource["dojox.mobile.scrollable"] = true;
	if (typeof dojo != "undefined" && dojo.provide) {
		dojo.provide("dojox.mobile.scrollable");
	} else {
		dojo = {doc:document, global:window, isWebKit:navigator.userAgent.indexOf("WebKit") != -1};
		dojox = {mobile:{}};
	}
	dojox.mobile.scrollable = function (dojo, dojox) {
		this.fixedHeaderHeight = 0;
		this.fixedFooterHeight = 0;
		this.isLocalFooter = false;
		this.scrollBar = true;
		this.scrollDir = "v";
		this.weight = 0.6;
		this.fadeScrollBar = true;
		this.disableFlashScrollBar = false;
		this.threshold = 4;
		this.constraint = true;
		this.touchNode = null;
		this.init = function (params) {
			if (params) {
				for (var p in params) {
					if (params.hasOwnProperty(p)) {
						this[p] = ((p == "domNode" || p == "containerNode") && typeof params[p] == "string") ? dojo.doc.getElementById(params[p]) : params[p];
					}
				}
			}
			this.touchNode = this.touchNode || this.containerNode;
			this._v = (this.scrollDir.indexOf("v") != -1);
			this._h = (this.scrollDir.indexOf("h") != -1);
			this._f = (this.scrollDir == "f");
			this._ch = [];
			this._ch.push(dojo.connect(this.touchNode, dojox.mobile.hasTouch ? "touchstart" : "onmousedown", this, "onTouchStart"));
			if (dojo.isWebKit) {
				this._ch.push(dojo.connect(this.domNode, "webkitAnimationEnd", this, "onFlickAnimationEnd"));
				this._ch.push(dojo.connect(this.domNode, "webkitAnimationStart", this, "onFlickAnimationStart"));
			}
			this._appFooterHeight = 0;
			if (this.isTopLevel() && !this.noResize) {
				this.resize();
			}
			var _this = this;
			setTimeout(function () {
				_this.flashScrollBar();
			}, 600);
		};
		this.isTopLevel = function () {
			return true;
		};
		this.cleanup = function () {
			for (var i = 0; i < this._ch.length; i++) {
				dojo.disconnect(this._ch[i]);
			}
			this._ch = null;
		};
		this.findDisp = function (node) {
			var nodes = node.parentNode.childNodes;
			for (var i = 0; i < nodes.length; i++) {
				var n = nodes[i];
				if (n.nodeType === 1 && dojo.hasClass(n, "mblView") && n.style.display !== "none") {
					return n;
				}
			}
			return node;
		};
		this.resize = function (e) {
			this._appFooterHeight = (this.fixedFooterHeight && !this.isLocalFooter) ? this.fixedFooterHeight : 0;
			if (this.isLocalHeader) {
				this.containerNode.style.marginTop = this.fixedHeaderHeight + "px";
			}
			var top = 0;
			for (var n = this.domNode; n && n.tagName != "BODY"; n = n.offsetParent) {
				n = this.findDisp(n);
				if (!n) {
					break;
				}
				top += n.offsetTop;
			}
			this.domNode.style.height = (dojo.global.innerHeight || dojo.doc.documentElement.clientHeight) - top - this._appFooterHeight + "px";
			this.onTouchEnd();
		};
		this.onFlickAnimationStart = function (e) {
			dojo.stopEvent(e);
		};
		this.onFlickAnimationEnd = function (e) {
			if (this._scrollBarNodeV) {
				this._scrollBarNodeV.className = "";
			}
			if (this._scrollBarNodeH) {
				this._scrollBarNodeH.className = "";
			}
			if (e && e.animationName && e.animationName.indexOf("scrollableViewScroll") === -1) {
				return;
			}
			if (e && e.srcElement) {
				dojo.stopEvent(e);
			}
			this.stopAnimation();
			if (this._bounce) {
				var _this = this;
				var bounce = _this._bounce;
				setTimeout(function () {
					_this.slideTo(bounce, 0.3, "ease-out");
				}, 0);
				_this._bounce = undefined;
			} else {
				this.hideScrollBar();
				this.removeCover();
			}
		};
		this.onTouchStart = function (e) {
			if (this._conn && (new Date()).getTime() - this.startTime < 500) {
				return;
			}
			if (!this._conn) {
				this._conn = [];
				this._conn.push(dojo.connect(dojo.doc, dojox.mobile.hasTouch ? "touchmove" : "onmousemove", this, "onTouchMove"));
				this._conn.push(dojo.connect(dojo.doc, dojox.mobile.hasTouch ? "touchend" : "onmouseup", this, "onTouchEnd"));
			}
			this._aborted = false;
			if (dojo.hasClass(this.containerNode, "mblScrollableScrollTo2")) {
				this.abort();
			}
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
			this.startTime = (new Date()).getTime();
			this.startPos = this.getPos();
			this._dim = this.getDim();
			this._time = [0];
			this._posX = [this.touchStartX];
			this._posY = [this.touchStartY];
			if (e.target.nodeType != 1 || (e.target.tagName != "SELECT" && e.target.tagName != "INPUT" && e.target.tagName != "TEXTAREA")) {
				dojo.stopEvent(e);
			}
		};
		this.onTouchMove = function (e) {
			var x = e.touches ? e.touches[0].pageX : e.clientX;
			var y = e.touches ? e.touches[0].pageY : e.clientY;
			var dx = x - this.touchStartX;
			var dy = y - this.touchStartY;
			var to = {x:this.startPos.x + dx, y:this.startPos.y + dy};
			var dim = this._dim;
			if (this._time.length == 1) {
				if (Math.abs(dx) < this.threshold && Math.abs(dy) < this.threshold) {
					return;
				}
				this.addCover();
				this.showScrollBar();
			}
			var weight = this.weight;
			if (this._v && this.constraint) {
				if (to.y > 0) {
					to.y = Math.round(to.y * weight);
				} else {
					if (to.y < -dim.o.h) {
						if (dim.c.h < dim.d.h) {
							to.y = Math.round(to.y * weight);
						} else {
							to.y = -dim.o.h - Math.round((-dim.o.h - to.y) * weight);
						}
					}
				}
			}
			if ((this._h || this._f) && this.constraint) {
				if (to.x > 0) {
					to.x = Math.round(to.x * weight);
				} else {
					if (to.x < -dim.o.w) {
						if (dim.c.w < dim.d.w) {
							to.x = Math.round(to.x * weight);
						} else {
							to.x = -dim.o.w - Math.round((-dim.o.w - to.x) * weight);
						}
					}
				}
			}
			this.scrollTo(to);
			var max = 10;
			var n = this._time.length;
			if (n >= 2) {
				var d0, d1;
				if (this._v && !this._h) {
					d0 = this._posY[n - 1] - this._posY[n - 2];
					d1 = y - this._posY[n - 1];
				} else {
					if (!this._v && this._h) {
						d0 = this._posX[n - 1] - this._posX[n - 2];
						d1 = x - this._posX[n - 1];
					}
				}
				if (d0 * d1 < 0) {
					this._time = [this._time[n - 1]];
					this._posX = [this._posX[n - 1]];
					this._posY = [this._posY[n - 1]];
					n = 1;
				}
			}
			if (n == max) {
				this._time.shift();
				this._posX.shift();
				this._posY.shift();
			}
			this._time.push((new Date()).getTime() - this.startTime);
			this._posX.push(x);
			this._posY.push(y);
		};
		this.onTouchEnd = function (e) {
			var speed = {x:0, y:0};
			var dim = this._dim;
			var pos = this.getPos();
			var to = {};
			if (e) {
				if (!this._conn) {
					return;
				}
				for (var i = 0; i < this._conn.length; i++) {
					dojo.disconnect(this._conn[i]);
				}
				this._conn = null;
				var n = this._time.length;
				var clicked = false;
				if (!this._aborted) {
					if (n <= 1) {
						clicked = true;
					} else {
						if (n == 2 && Math.abs(this._posY[1] - this._posY[0]) < 4) {
							clicked = true;
						}
					}
				}
				if (clicked) {
					this.hideScrollBar();
					this.removeCover();
					if (dojox.mobile.hasTouch) {
						var elem = e.target;
						if (elem.nodeType != 1) {
							elem = elem.parentNode;
						}
						var ev = dojo.doc.createEvent("MouseEvents");
						ev.initEvent("click", true, true);
						elem.dispatchEvent(ev);
					}
					return;
				}
				if (n >= 2 && (new Date()).getTime() - this.startTime - this._time[n - 1] < 500) {
					var dy = this._posY[n - (n > 3 ? 2 : 1)] - this._posY[(n - 6) >= 0 ? n - 6 : 0];
					var dx = this._posX[n - (n > 3 ? 2 : 1)] - this._posX[(n - 6) >= 0 ? n - 6 : 0];
					var dt = this._time[n - (n > 3 ? 2 : 1)] - this._time[(n - 6) >= 0 ? n - 6 : 0];
					speed.y = this.calcSpeed(dy, dt);
					speed.x = this.calcSpeed(dx, dt);
				}
			} else {
				if (pos.x == 0 && pos.y == 0) {
					return;
				}
				dim = this.getDim();
			}
			if (this._v) {
				to.y = pos.y + speed.y;
			}
			if (this._h || this._f) {
				to.x = pos.x + speed.x;
			}
			this.adjustDestination(to, pos);
			if (this.scrollDir == "v" && dim.c.h < dim.d.h) {
				this.slideTo({y:0}, 0.3, "ease-out");
				return;
			} else {
				if (this.scrollDir == "h" && dim.c.w < dim.d.w) {
					this.slideTo({x:0}, 0.3, "ease-out");
					return;
				} else {
					if (this._v && this._h && dim.c.h < dim.d.h && dim.c.w < dim.d.w) {
						this.slideTo({x:0, y:0}, 0.3, "ease-out");
						return;
					}
				}
			}
			var duration, easing = "ease-out";
			var bounce = {};
			if (this._v && this.constraint) {
				if (to.y > 0) {
					if (pos.y > 0) {
						duration = 0.3;
						to.y = 0;
					} else {
						to.y = Math.min(to.y, 20);
						easing = "linear";
						bounce.y = 0;
					}
				} else {
					if (-speed.y > dim.o.h - (-pos.y)) {
						if (pos.y < -dim.o.h) {
							duration = 0.3;
							to.y = dim.c.h <= dim.d.h ? 0 : -dim.o.h;
						} else {
							to.y = Math.max(to.y, -dim.o.h - 20);
							easing = "linear";
							bounce.y = -dim.o.h;
						}
					}
				}
			}
			if ((this._h || this._f) && this.constraint) {
				if (to.x > 0) {
					if (pos.x > 0) {
						duration = 0.3;
						to.x = 0;
					} else {
						to.x = Math.min(to.x, 20);
						easing = "linear";
						bounce.x = 0;
					}
				} else {
					if (-speed.x > dim.o.w - (-pos.x)) {
						if (pos.x < -dim.o.w) {
							duration = 0.3;
							to.x = dim.c.w <= dim.d.w ? 0 : -dim.o.w;
						} else {
							to.x = Math.max(to.x, -dim.o.w - 20);
							easing = "linear";
							bounce.x = -dim.o.w;
						}
					}
				}
			}
			this._bounce = (bounce.x !== undefined || bounce.y !== undefined) ? bounce : undefined;
			if (duration === undefined) {
				var distance, velocity;
				if (this._v && this._h) {
					velocity = Math.sqrt(speed.x + speed.x + speed.y * speed.y);
					distance = Math.sqrt(Math.pow(to.y - pos.y, 2) + Math.pow(to.x - pos.x, 2));
				} else {
					if (this._v) {
						velocity = speed.y;
						distance = to.y - pos.y;
					} else {
						if (this._h) {
							velocity = speed.x;
							distance = to.x - pos.x;
						}
					}
				}
				duration = velocity !== 0 ? Math.abs(distance / velocity) : 0.01;
			}
			this.slideTo(to, duration, easing);
		};
		this.adjustDestination = function (to, pos) {
		};
		this.abort = function () {
			this.scrollTo(this.getPos());
			this.stopAnimation();
			this._aborted = true;
		};
		this.stopAnimation = function () {
			dojo.removeClass(this.containerNode, "mblScrollableScrollTo2");
			if (this._scrollBarV) {
				this._scrollBarV.className = "";
			}
			if (this._scrollBarH) {
				this._scrollBarH.className = "";
			}
		};
		this.calcSpeed = function (d, t) {
			return Math.round(d / t * 100) * 4;
		};
		this.scrollTo = function (to, doNotMoveScrollBar, node) {
			var s = (node || this.containerNode).style;
			if (dojo.isWebKit) {
				s.webkitTransform = this.makeTranslateStr(to);
			} else {
				if (this._v) {
					s.top = to.y + "px";
				}
				if (this._h || this._f) {
					s.left = to.x + "px";
				}
			}
			if (!doNotMoveScrollBar) {
				this.scrollScrollBarTo(this.calcScrollBarPos(to));
			}
		};
		this.slideTo = function (to, duration, easing) {
			this._runSlideAnimation(this.getPos(), to, duration, easing, this.containerNode, 2);
			this.slideScrollBarTo(to, duration, easing);
		};
		this.makeTranslateStr = function (to) {
			var y = this._v && typeof to.y == "number" ? to.y + "px" : "0px";
			var x = (this._h || this._f) && typeof to.x == "number" ? to.x + "px" : "0px";
			return dojox.mobile.hasTranslate3d ? "translate3d(" + x + "," + y + ",0px)" : "translate(" + x + "," + y + ")";
		};
		this.getPos = function () {
			if (dojo.isWebKit) {
				var m = dojo.doc.defaultView.getComputedStyle(this.containerNode, "")["-webkit-transform"];
				if (m && m.indexOf("matrix") === 0) {
					var arr = m.split(/[,\s\)]+/);
					return {y:arr[5] - 0, x:arr[4] - 0};
				}
				return {x:0, y:0};
			} else {
				var y = parseInt(this.containerNode.style.top) || 0;
				return {y:y, x:this.containerNode.offsetLeft};
			}
		};
		this.getDim = function () {
			var d = {};
			d.c = {h:this.containerNode.offsetHeight, w:this.containerNode.offsetWidth};
			d.v = {h:this.domNode.offsetHeight + this._appFooterHeight, w:this.domNode.offsetWidth};
			d.d = {h:d.v.h - this.fixedHeaderHeight - this.fixedFooterHeight, w:d.v.w};
			d.o = {h:d.c.h - d.v.h + this.fixedHeaderHeight + this.fixedFooterHeight, w:d.c.w - d.v.w};
			return d;
		};
		this.showScrollBar = function () {
			if (!this.scrollBar) {
				return;
			}
			var dim = this._dim;
			if (this.scrollDir == "v" && dim.c.h <= dim.d.h) {
				return;
			}
			if (this.scrollDir == "h" && dim.c.w <= dim.d.w) {
				return;
			}
			if (this._v && this._h && dim.c.h <= dim.d.h && dim.c.w <= dim.d.w) {
				return;
			}
			var createBar = function (self, dir) {
				var bar = self["_scrollBarNode" + dir];
				if (!bar) {
					var wrapper = dojo.create("div", null, self.domNode);
					var props = {position:"absolute", overflow:"hidden"};
					if (dir == "V") {
						props.right = "2px";
						props.width = "5px";
					} else {
						props.bottom = (self.isLocalFooter ? self.fixedFooterHeight : 0) + 2 + "px";
						props.height = "5px";
					}
					dojo.style(wrapper, props);
					wrapper.className = "mblScrollBarWrapper";
					self["_scrollBarWrapper" + dir] = wrapper;
					bar = dojo.create("div", null, wrapper);
					dojo.style(bar, {opacity:0.6, position:"absolute", backgroundColor:"#606060", fontSize:"1px", webkitBorderRadius:"2px", MozBorderRadius:"2px", webkitTransformOrigin:"0 0", zIndex:2147483647});
					dojo.style(bar, dir == "V" ? {width:"5px"} : {height:"5px"});
					self["_scrollBarNode" + dir] = bar;
				}
				return bar;
			};
			if (this._v && !this._scrollBarV) {
				this._scrollBarV = createBar(this, "V");
			}
			if (this._h && !this._scrollBarH) {
				this._scrollBarH = createBar(this, "H");
			}
			this.resetScrollBar();
		};
		this.hideScrollBar = function () {
			var fadeRule;
			if (this.fadeScrollBar && dojo.isWebKit) {
				if (!dojox.mobile._fadeRule) {
					var node = dojo.create("style", null, dojo.doc.getElementsByTagName("head")[0]);
					node.textContent = ".mblScrollableFadeScrollBar{" + "  -webkit-animation-duration: 1s;" + "  -webkit-animation-name: scrollableViewFadeScrollBar;}" + "@-webkit-keyframes scrollableViewFadeScrollBar{" + "  from { opacity: 0.6; }" + "  50% { opacity: 0.6; }" + "  to { opacity: 0; }}";
					dojox.mobile._fadeRule = node.sheet.cssRules[1];
				}
				fadeRule = dojox.mobile._fadeRule;
			}
			if (!this.scrollBar) {
				return;
			}
			var f = function (bar) {
				dojo.style(bar, {opacity:0, webkitAnimationDuration:""});
				bar.className = "mblScrollableFadeScrollBar";
			};
			if (this._scrollBarV) {
				f(this._scrollBarV);
				this._scrollBarV = null;
			}
			if (this._scrollBarH) {
				f(this._scrollBarH);
				this._scrollBarH = null;
			}
		};
		this.calcScrollBarPos = function (to) {
			var pos = {};
			var dim = this._dim;
			var f = function (wrapperH, barH, t, d, c) {
				var y = Math.round((d - barH - 8) / (d - c) * t);
				if (y < -barH + 5) {
					y = -barH + 5;
				}
				if (y > wrapperH - 5) {
					y = wrapperH - 5;
				}
				return y;
			};
			if (typeof to.y == "number" && this._scrollBarV) {
				pos.y = f(this._scrollBarWrapperV.offsetHeight, this._scrollBarV.offsetHeight, to.y, dim.d.h, dim.c.h);
			}
			if (typeof to.x == "number" && this._scrollBarH) {
				pos.x = f(this._scrollBarWrapperH.offsetWidth, this._scrollBarH.offsetWidth, to.x, dim.d.w, dim.c.w);
			}
			return pos;
		};
		this.scrollScrollBarTo = function (to) {
			if (!this.scrollBar) {
				return;
			}
			if (this._v && this._scrollBarV && typeof to.y == "number") {
				if (dojo.isWebKit) {
					this._scrollBarV.style.webkitTransform = this.makeTranslateStr({y:to.y});
				} else {
					this._scrollBarV.style.top = to.y + "px";
				}
			}
			if (this._h && this._scrollBarH && typeof to.x == "number") {
				if (dojo.isWebKit) {
					this._scrollBarH.style.webkitTransform = this.makeTranslateStr({x:to.x});
				} else {
					this._scrollBarH.style.left = to.x + "px";
				}
			}
		};
		this.slideScrollBarTo = function (to, duration, easing) {
			if (!this.scrollBar) {
				return;
			}
			var fromPos = this.calcScrollBarPos(this.getPos());
			var toPos = this.calcScrollBarPos(to);
			if (this._v && this._scrollBarV) {
				this._runSlideAnimation({y:fromPos.y}, {y:toPos.y}, duration, easing, this._scrollBarV, 0);
			}
			if (this._h && this._scrollBarH) {
				this._runSlideAnimation({x:fromPos.x}, {x:toPos.x}, duration, easing, this._scrollBarH, 1);
			}
		};
		this._runSlideAnimation = function (from, to, duration, easing, node, idx) {
			if (dojo.isWebKit) {
				this.setKeyframes(from, to, idx);
				dojo.style(node, {webkitAnimationDuration:duration + "s", webkitAnimationTimingFunction:easing});
				dojo.addClass(node, "mblScrollableScrollTo" + idx);
				if (idx == 2) {
					this.scrollTo(to, true, node);
				} else {
					this.scrollScrollBarTo(to);
				}
			} else {
				if (dojo.fx && dojo.fx.easing && duration) {
					var s = dojo.fx.slideTo({node:node, duration:duration * 1000, left:to.x, top:to.y, easing:(easing == "ease-out") ? dojo.fx.easing.quadOut : dojo.fx.easing.linear}).play();
					if (idx == 2) {
						dojo.connect(s, "onEnd", this, "onFlickAnimationEnd");
					}
				} else {
					if (idx == 2) {
						this.scrollTo(to, false, node);
						this.onFlickAnimationEnd();
					} else {
						this.scrollScrollBarTo(to);
					}
				}
			}
		};
		this.resetScrollBar = function () {
			var f = function (wrapper, bar, d, c, hd, v) {
				if (!bar) {
					return;
				}
				var props = {};
				props[v ? "top" : "left"] = hd + 4 + "px";
				props[v ? "height" : "width"] = d - 8 + "px";
				dojo.style(wrapper, props);
				var l = Math.round(d * d / c);
				l = Math.min(Math.max(l - 8, 5), d - 8);
				bar.style[v ? "height" : "width"] = l + "px";
				dojo.style(bar, {"opacity":0.6});
			};
			var dim = this.getDim();
			f(this._scrollBarWrapperV, this._scrollBarV, dim.d.h, dim.c.h, this.fixedHeaderHeight, true);
			f(this._scrollBarWrapperH, this._scrollBarH, dim.d.w, dim.c.w, 0);
			this.createMask();
		};
		this.createMask = function () {
			if (!dojo.isWebKit) {
				return;
			}
			var ctx;
			if (this._scrollBarWrapperV) {
				var h = this._scrollBarWrapperV.offsetHeight;
				ctx = dojo.doc.getCSSCanvasContext("2d", "scrollBarMaskV", 5, h);
				ctx.fillStyle = "rgba(0,0,0,0.5)";
				ctx.fillRect(1, 0, 3, 2);
				ctx.fillRect(0, 1, 5, 1);
				ctx.fillRect(0, h - 2, 5, 1);
				ctx.fillRect(1, h - 1, 3, 2);
				ctx.fillStyle = "rgb(0,0,0)";
				ctx.fillRect(0, 2, 5, h - 4);
				this._scrollBarWrapperV.style.webkitMaskImage = "-webkit-canvas(scrollBarMaskV)";
			}
			if (this._scrollBarWrapperH) {
				var w = this._scrollBarWrapperH.offsetWidth;
				ctx = dojo.doc.getCSSCanvasContext("2d", "scrollBarMaskH", w, 5);
				ctx.fillStyle = "rgba(0,0,0,0.5)";
				ctx.fillRect(0, 1, 2, 3);
				ctx.fillRect(1, 0, 1, 5);
				ctx.fillRect(w - 2, 0, 1, 5);
				ctx.fillRect(w - 1, 1, 2, 3);
				ctx.fillStyle = "rgb(0,0,0)";
				ctx.fillRect(2, 0, w - 4, 5);
				this._scrollBarWrapperH.style.webkitMaskImage = "-webkit-canvas(scrollBarMaskH)";
			}
		};
		this.flashScrollBar = function () {
			if (this.disableFlashScrollBar) {
				return;
			}
			this._dim = this.getDim();
			if (this._dim.d.h <= 0) {
				return;
			}
			this.showScrollBar();
			var _this = this;
			setTimeout(function () {
				_this.hideScrollBar();
			}, 300);
		};
		this.addCover = function () {
			if (!dojox.mobile.hasTouch && !this.noCover) {
				if (!this._cover) {
					this._cover = dojo.create("div", null, dojo.doc.body);
					dojo.style(this._cover, {backgroundColor:"#ffff00", opacity:0, position:"absolute", top:"0px", left:"0px", width:"100%", height:"100%", zIndex:2147483647});
					this._ch.push(dojo.connect(this._cover, dojox.mobile.hasTouch ? "touchstart" : "onmousedown", this, "onTouchEnd"));
				} else {
					this._cover.style.display = "";
				}
				this.setSelectable(this._cover, false);
				this.setSelectable(this.domNode, false);
			}
		};
		this.removeCover = function () {
			if (!dojox.mobile.hasTouch && this._cover) {
				this._cover.style.display = "none";
				this.setSelectable(this._cover, true);
				this.setSelectable(this.domNode, true);
			}
		};
		this.setKeyframes = function (from, to, idx) {
			if (!dojox.mobile._rule) {
				dojox.mobile._rule = [];
			}
			if (!dojox.mobile._rule[idx]) {
				var node = dojo.create("style", null, dojo.doc.getElementsByTagName("head")[0]);
				node.textContent = ".mblScrollableScrollTo" + idx + "{-webkit-animation-name: scrollableViewScroll" + idx + ";}" + "@-webkit-keyframes scrollableViewScroll" + idx + "{}";
				dojox.mobile._rule[idx] = node.sheet.cssRules[1];
			}
			var rule = dojox.mobile._rule[idx];
			if (rule) {
				if (from) {
					rule.deleteRule("from");
					rule.insertRule("from { -webkit-transform: " + this.makeTranslateStr(from) + "; }");
				}
				if (to) {
					if (to.x === undefined) {
						to.x = from.x;
					}
					if (to.y === undefined) {
						to.y = from.y;
					}
					rule.deleteRule("to");
					rule.insertRule("to { -webkit-transform: " + this.makeTranslateStr(to) + "; }");
				}
			}
		};
		this.setSelectable = function (node, selectable) {
			node.style.KhtmlUserSelect = selectable ? "auto" : "none";
			node.style.MozUserSelect = selectable ? "" : "none";
			node.onselectstart = selectable ? null : function () {
				return false;
			};
			node.unselectable = selectable ? "" : "on";
		};
	};
	(function () {
		if (dojo.isWebKit) {
			var elem = dojo.doc.createElement("div");
			elem.style.webkitTransform = "translate3d(0px,1px,0px)";
			dojo.doc.documentElement.appendChild(elem);
			var v = dojo.doc.defaultView.getComputedStyle(elem, "")["-webkit-transform"];
			dojox.mobile.hasTranslate3d = v && v.indexOf("matrix") === 0;
			dojo.doc.documentElement.removeChild(elem);
			dojox.mobile.hasTouch = (typeof dojo.doc.documentElement.ontouchstart != "undefined" && navigator.appVersion.indexOf("Mobile") != -1);
		}
	})();
}

