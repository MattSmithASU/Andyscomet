/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.fx"]) {
	dojo._hasResource["dojo._base.fx"] = true;
	dojo.provide("dojo._base.fx");
	dojo.require("dojo._base.Color");
	dojo.require("dojo._base.connect");
	dojo.require("dojo._base.lang");
	dojo.require("dojo._base.html");
	(function () {
		var d = dojo;
		var _mixin = d._mixin;
		dojo._Line = function (start, end) {
			this.start = start;
			this.end = end;
		};
		dojo._Line.prototype.getValue = function (n) {
			return ((this.end - this.start) * n) + this.start;
		};
		dojo.Animation = function (args) {
			_mixin(this, args);
			if (d.isArray(this.curve)) {
				this.curve = new d._Line(this.curve[0], this.curve[1]);
			}
		};
		d._Animation = d.Animation;
		d.extend(dojo.Animation, {duration:350, repeat:0, rate:20, _percent:0, _startRepeatCount:0, _getStep:function () {
			var _p = this._percent, _e = this.easing;
			return _e ? _e(_p) : _p;
		}, _fire:function (evt, args) {
			var a = args || [];
			if (this[evt]) {
				if (d.config.debugAtAllCosts) {
					this[evt].apply(this, a);
				} else {
					try {
						this[evt].apply(this, a);
					}
					catch (e) {
						console.error("exception in animation handler for:", evt);
						console.error(e);
					}
				}
			}
			return this;
		}, play:function (delay, gotoStart) {
			var _t = this;
			if (_t._delayTimer) {
				_t._clearTimer();
			}
			if (gotoStart) {
				_t._stopTimer();
				_t._active = _t._paused = false;
				_t._percent = 0;
			} else {
				if (_t._active && !_t._paused) {
					return _t;
				}
			}
			_t._fire("beforeBegin", [_t.node]);
			var de = delay || _t.delay, _p = dojo.hitch(_t, "_play", gotoStart);
			if (de > 0) {
				_t._delayTimer = setTimeout(_p, de);
				return _t;
			}
			_p();
			return _t;
		}, _play:function (gotoStart) {
			var _t = this;
			if (_t._delayTimer) {
				_t._clearTimer();
			}
			_t._startTime = new Date().valueOf();
			if (_t._paused) {
				_t._startTime -= _t.duration * _t._percent;
			}
			_t._active = true;
			_t._paused = false;
			var value = _t.curve.getValue(_t._getStep());
			if (!_t._percent) {
				if (!_t._startRepeatCount) {
					_t._startRepeatCount = _t.repeat;
				}
				_t._fire("onBegin", [value]);
			}
			_t._fire("onPlay", [value]);
			_t._cycle();
			return _t;
		}, pause:function () {
			var _t = this;
			if (_t._delayTimer) {
				_t._clearTimer();
			}
			_t._stopTimer();
			if (!_t._active) {
				return _t;
			}
			_t._paused = true;
			_t._fire("onPause", [_t.curve.getValue(_t._getStep())]);
			return _t;
		}, gotoPercent:function (percent, andPlay) {
			var _t = this;
			_t._stopTimer();
			_t._active = _t._paused = true;
			_t._percent = percent;
			if (andPlay) {
				_t.play();
			}
			return _t;
		}, stop:function (gotoEnd) {
			var _t = this;
			if (_t._delayTimer) {
				_t._clearTimer();
			}
			if (!_t._timer) {
				return _t;
			}
			_t._stopTimer();
			if (gotoEnd) {
				_t._percent = 1;
			}
			_t._fire("onStop", [_t.curve.getValue(_t._getStep())]);
			_t._active = _t._paused = false;
			return _t;
		}, status:function () {
			if (this._active) {
				return this._paused ? "paused" : "playing";
			}
			return "stopped";
		}, _cycle:function () {
			var _t = this;
			if (_t._active) {
				var curr = new Date().valueOf();
				var step = (curr - _t._startTime) / (_t.duration);
				if (step >= 1) {
					step = 1;
				}
				_t._percent = step;
				if (_t.easing) {
					step = _t.easing(step);
				}
				_t._fire("onAnimate", [_t.curve.getValue(step)]);
				if (_t._percent < 1) {
					_t._startTimer();
				} else {
					_t._active = false;
					if (_t.repeat > 0) {
						_t.repeat--;
						_t.play(null, true);
					} else {
						if (_t.repeat == -1) {
							_t.play(null, true);
						} else {
							if (_t._startRepeatCount) {
								_t.repeat = _t._startRepeatCount;
								_t._startRepeatCount = 0;
							}
						}
					}
					_t._percent = 0;
					_t._fire("onEnd", [_t.node]);
					!_t.repeat && _t._stopTimer();
				}
			}
			return _t;
		}, _clearTimer:function () {
			clearTimeout(this._delayTimer);
			delete this._delayTimer;
		}});
		var ctr = 0, timer = null, runner = {run:function () {
		}};
		d.extend(d.Animation, {_startTimer:function () {
			if (!this._timer) {
				this._timer = d.connect(runner, "run", this, "_cycle");
				ctr++;
			}
			if (!timer) {
				timer = setInterval(d.hitch(runner, "run"), this.rate);
			}
		}, _stopTimer:function () {
			if (this._timer) {
				d.disconnect(this._timer);
				this._timer = null;
				ctr--;
			}
			if (ctr <= 0) {
				clearInterval(timer);
				timer = null;
				ctr = 0;
			}
		}});
		var _makeFadeable = d.isIE ? function (node) {
			var ns = node.style;
			if (!ns.width.length && d.style(node, "width") == "auto") {
				ns.width = "auto";
			}
		} : function () {
		};
		dojo._fade = function (args) {
			args.node = d.byId(args.node);
			var fArgs = _mixin({properties:{}}, args), props = (fArgs.properties.opacity = {});
			props.start = !("start" in fArgs) ? function () {
				return +d.style(fArgs.node, "opacity") || 0;
			} : fArgs.start;
			props.end = fArgs.end;
			var anim = d.animateProperty(fArgs);
			d.connect(anim, "beforeBegin", d.partial(_makeFadeable, fArgs.node));
			return anim;
		};
		dojo.fadeIn = function (args) {
			return d._fade(_mixin({end:1}, args));
		};
		dojo.fadeOut = function (args) {
			return d._fade(_mixin({end:0}, args));
		};
		dojo._defaultEasing = function (n) {
			return 0.5 + ((Math.sin((n + 1.5) * Math.PI)) / 2);
		};
		var PropLine = function (properties) {
			this._properties = properties;
			for (var p in properties) {
				var prop = properties[p];
				if (prop.start instanceof d.Color) {
					prop.tempColor = new d.Color();
				}
			}
		};
		PropLine.prototype.getValue = function (r) {
			var ret = {};
			for (var p in this._properties) {
				var prop = this._properties[p], start = prop.start;
				if (start instanceof d.Color) {
					ret[p] = d.blendColors(start, prop.end, r, prop.tempColor).toCss();
				} else {
					if (!d.isArray(start)) {
						ret[p] = ((prop.end - start) * r) + start + (p != "opacity" ? prop.units || "px" : 0);
					}
				}
			}
			return ret;
		};
		dojo.animateProperty = function (args) {
			var n = args.node = d.byId(args.node);
			if (!args.easing) {
				args.easing = d._defaultEasing;
			}
			var anim = new d.Animation(args);
			d.connect(anim, "beforeBegin", anim, function () {
				var pm = {};
				for (var p in this.properties) {
					if (p == "width" || p == "height") {
						this.node.display = "block";
					}
					var prop = this.properties[p];
					if (d.isFunction(prop)) {
						prop = prop(n);
					}
					prop = pm[p] = _mixin({}, (d.isObject(prop) ? prop : {end:prop}));
					if (d.isFunction(prop.start)) {
						prop.start = prop.start(n);
					}
					if (d.isFunction(prop.end)) {
						prop.end = prop.end(n);
					}
					var isColor = (p.toLowerCase().indexOf("color") >= 0);
					function getStyle(node, p) {
						var v = {height:node.offsetHeight, width:node.offsetWidth}[p];
						if (v !== undefined) {
							return v;
						}
						v = d.style(node, p);
						return (p == "opacity") ? +v : (isColor ? v : parseFloat(v));
					}
					if (!("end" in prop)) {
						prop.end = getStyle(n, p);
					} else {
						if (!("start" in prop)) {
							prop.start = getStyle(n, p);
						}
					}
					if (isColor) {
						prop.start = new d.Color(prop.start);
						prop.end = new d.Color(prop.end);
					} else {
						prop.start = (p == "opacity") ? +prop.start : parseFloat(prop.start);
					}
				}
				this.curve = new PropLine(pm);
			});
			d.connect(anim, "onAnimate", d.hitch(d, "style", anim.node));
			return anim;
		};
		dojo.anim = function (node, properties, duration, easing, onEnd, delay) {
			return d.animateProperty({node:node, duration:duration || d.Animation.prototype.duration, properties:properties, easing:easing, onEnd:onEnd}).play(delay || 0);
		};
	})();
}

