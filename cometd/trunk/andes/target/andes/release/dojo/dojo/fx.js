/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.fx"]) {
	dojo._hasResource["dojo.fx"] = true;
	dojo.provide("dojo.fx");
	dojo.require("dojo.fx.Toggler");
	(function () {
		var d = dojo, _baseObj = {_fire:function (evt, args) {
			if (this[evt]) {
				this[evt].apply(this, args || []);
			}
			return this;
		}};
		var _chain = function (animations) {
			this._index = -1;
			this._animations = animations || [];
			this._current = this._onAnimateCtx = this._onEndCtx = null;
			this.duration = 0;
			d.forEach(this._animations, function (a) {
				this.duration += a.duration;
				if (a.delay) {
					this.duration += a.delay;
				}
			}, this);
		};
		d.extend(_chain, {_onAnimate:function () {
			this._fire("onAnimate", arguments);
		}, _onEnd:function () {
			d.disconnect(this._onAnimateCtx);
			d.disconnect(this._onEndCtx);
			this._onAnimateCtx = this._onEndCtx = null;
			if (this._index + 1 == this._animations.length) {
				this._fire("onEnd");
			} else {
				this._current = this._animations[++this._index];
				this._onAnimateCtx = d.connect(this._current, "onAnimate", this, "_onAnimate");
				this._onEndCtx = d.connect(this._current, "onEnd", this, "_onEnd");
				this._current.play(0, true);
			}
		}, play:function (delay, gotoStart) {
			if (!this._current) {
				this._current = this._animations[this._index = 0];
			}
			if (!gotoStart && this._current.status() == "playing") {
				return this;
			}
			var beforeBegin = d.connect(this._current, "beforeBegin", this, function () {
				this._fire("beforeBegin");
			}), onBegin = d.connect(this._current, "onBegin", this, function (arg) {
				this._fire("onBegin", arguments);
			}), onPlay = d.connect(this._current, "onPlay", this, function (arg) {
				this._fire("onPlay", arguments);
				d.disconnect(beforeBegin);
				d.disconnect(onBegin);
				d.disconnect(onPlay);
			});
			if (this._onAnimateCtx) {
				d.disconnect(this._onAnimateCtx);
			}
			this._onAnimateCtx = d.connect(this._current, "onAnimate", this, "_onAnimate");
			if (this._onEndCtx) {
				d.disconnect(this._onEndCtx);
			}
			this._onEndCtx = d.connect(this._current, "onEnd", this, "_onEnd");
			this._current.play.apply(this._current, arguments);
			return this;
		}, pause:function () {
			if (this._current) {
				var e = d.connect(this._current, "onPause", this, function (arg) {
					this._fire("onPause", arguments);
					d.disconnect(e);
				});
				this._current.pause();
			}
			return this;
		}, gotoPercent:function (percent, andPlay) {
			this.pause();
			var offset = this.duration * percent;
			this._current = null;
			d.some(this._animations, function (a) {
				if (a.duration <= offset) {
					this._current = a;
					return true;
				}
				offset -= a.duration;
				return false;
			});
			if (this._current) {
				this._current.gotoPercent(offset / this._current.duration, andPlay);
			}
			return this;
		}, stop:function (gotoEnd) {
			if (this._current) {
				if (gotoEnd) {
					for (; this._index + 1 < this._animations.length; ++this._index) {
						this._animations[this._index].stop(true);
					}
					this._current = this._animations[this._index];
				}
				var e = d.connect(this._current, "onStop", this, function (arg) {
					this._fire("onStop", arguments);
					d.disconnect(e);
				});
				this._current.stop();
			}
			return this;
		}, status:function () {
			return this._current ? this._current.status() : "stopped";
		}, destroy:function () {
			if (this._onAnimateCtx) {
				d.disconnect(this._onAnimateCtx);
			}
			if (this._onEndCtx) {
				d.disconnect(this._onEndCtx);
			}
		}});
		d.extend(_chain, _baseObj);
		dojo.fx.chain = function (animations) {
			return new _chain(animations);
		};
		var _combine = function (animations) {
			this._animations = animations || [];
			this._connects = [];
			this._finished = 0;
			this.duration = 0;
			d.forEach(animations, function (a) {
				var duration = a.duration;
				if (a.delay) {
					duration += a.delay;
				}
				if (this.duration < duration) {
					this.duration = duration;
				}
				this._connects.push(d.connect(a, "onEnd", this, "_onEnd"));
			}, this);
			this._pseudoAnimation = new d.Animation({curve:[0, 1], duration:this.duration});
			var self = this;
			d.forEach(["beforeBegin", "onBegin", "onPlay", "onAnimate", "onPause", "onStop", "onEnd"], function (evt) {
				self._connects.push(d.connect(self._pseudoAnimation, evt, function () {
					self._fire(evt, arguments);
				}));
			});
		};
		d.extend(_combine, {_doAction:function (action, args) {
			d.forEach(this._animations, function (a) {
				a[action].apply(a, args);
			});
			return this;
		}, _onEnd:function () {
			if (++this._finished > this._animations.length) {
				this._fire("onEnd");
			}
		}, _call:function (action, args) {
			var t = this._pseudoAnimation;
			t[action].apply(t, args);
		}, play:function (delay, gotoStart) {
			this._finished = 0;
			this._doAction("play", arguments);
			this._call("play", arguments);
			return this;
		}, pause:function () {
			this._doAction("pause", arguments);
			this._call("pause", arguments);
			return this;
		}, gotoPercent:function (percent, andPlay) {
			var ms = this.duration * percent;
			d.forEach(this._animations, function (a) {
				a.gotoPercent(a.duration < ms ? 1 : (ms / a.duration), andPlay);
			});
			this._call("gotoPercent", arguments);
			return this;
		}, stop:function (gotoEnd) {
			this._doAction("stop", arguments);
			this._call("stop", arguments);
			return this;
		}, status:function () {
			return this._pseudoAnimation.status();
		}, destroy:function () {
			d.forEach(this._connects, dojo.disconnect);
		}});
		d.extend(_combine, _baseObj);
		dojo.fx.combine = function (animations) {
			return new _combine(animations);
		};
		dojo.fx.wipeIn = function (args) {
			var node = args.node = d.byId(args.node), s = node.style, o;
			var anim = d.animateProperty(d.mixin({properties:{height:{start:function () {
				o = s.overflow;
				s.overflow = "hidden";
				if (s.visibility == "hidden" || s.display == "none") {
					s.height = "1px";
					s.display = "";
					s.visibility = "";
					return 1;
				} else {
					var height = d.style(node, "height");
					return Math.max(height, 1);
				}
			}, end:function () {
				return node.scrollHeight;
			}}}}, args));
			var fini = function () {
				s.height = "auto";
				s.overflow = o;
			};
			d.connect(anim, "onStop", fini);
			d.connect(anim, "onEnd", fini);
			return anim;
		};
		dojo.fx.wipeOut = function (args) {
			var node = args.node = d.byId(args.node), s = node.style, o;
			var anim = d.animateProperty(d.mixin({properties:{height:{end:1}}}, args));
			d.connect(anim, "beforeBegin", function () {
				o = s.overflow;
				s.overflow = "hidden";
				s.display = "";
			});
			var fini = function () {
				s.overflow = o;
				s.height = "auto";
				s.display = "none";
			};
			d.connect(anim, "onStop", fini);
			d.connect(anim, "onEnd", fini);
			return anim;
		};
		dojo.fx.slideTo = function (args) {
			var node = args.node = d.byId(args.node), top = null, left = null;
			var init = (function (n) {
				return function () {
					var cs = d.getComputedStyle(n);
					var pos = cs.position;
					top = (pos == "absolute" ? n.offsetTop : parseInt(cs.top) || 0);
					left = (pos == "absolute" ? n.offsetLeft : parseInt(cs.left) || 0);
					if (pos != "absolute" && pos != "relative") {
						var ret = d.position(n, true);
						top = ret.y;
						left = ret.x;
						n.style.position = "absolute";
						n.style.top = top + "px";
						n.style.left = left + "px";
					}
				};
			})(node);
			init();
			var anim = d.animateProperty(d.mixin({properties:{top:args.top || 0, left:args.left || 0}}, args));
			d.connect(anim, "beforeBegin", anim, init);
			return anim;
		};
	})();
}

