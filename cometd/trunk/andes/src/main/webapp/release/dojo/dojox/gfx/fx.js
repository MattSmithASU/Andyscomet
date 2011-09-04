/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.fx"]) {
	dojo._hasResource["dojox.gfx.fx"] = true;
	dojo.provide("dojox.gfx.fx");
	dojo.require("dojox.gfx.matrix");
	(function () {
		var d = dojo, g = dojox.gfx, m = g.matrix;
		function InterpolNumber(start, end) {
			this.start = start, this.end = end;
		}
		InterpolNumber.prototype.getValue = function (r) {
			return (this.end - this.start) * r + this.start;
		};
		function InterpolUnit(start, end, units) {
			this.start = start, this.end = end;
			this.units = units;
		}
		InterpolUnit.prototype.getValue = function (r) {
			return (this.end - this.start) * r + this.start + this.units;
		};
		function InterpolColor(start, end) {
			this.start = start, this.end = end;
			this.temp = new dojo.Color();
		}
		InterpolColor.prototype.getValue = function (r) {
			return d.blendColors(this.start, this.end, r, this.temp);
		};
		function InterpolValues(values) {
			this.values = values;
			this.length = values.length;
		}
		InterpolValues.prototype.getValue = function (r) {
			return this.values[Math.min(Math.floor(r * this.length), this.length - 1)];
		};
		function InterpolObject(values, def) {
			this.values = values;
			this.def = def ? def : {};
		}
		InterpolObject.prototype.getValue = function (r) {
			var ret = dojo.clone(this.def);
			for (var i in this.values) {
				ret[i] = this.values[i].getValue(r);
			}
			return ret;
		};
		function InterpolTransform(stack, original) {
			this.stack = stack;
			this.original = original;
		}
		InterpolTransform.prototype.getValue = function (r) {
			var ret = [];
			dojo.forEach(this.stack, function (t) {
				if (t instanceof m.Matrix2D) {
					ret.push(t);
					return;
				}
				if (t.name == "original" && this.original) {
					ret.push(this.original);
					return;
				}
				if (!(t.name in m)) {
					return;
				}
				var f = m[t.name];
				if (typeof f != "function") {
					ret.push(f);
					return;
				}
				var val = dojo.map(t.start, function (v, i) {
					return (t.end[i] - v) * r + v;
				}), matrix = f.apply(m, val);
				if (matrix instanceof m.Matrix2D) {
					ret.push(matrix);
				}
			}, this);
			return ret;
		};
		var transparent = new d.Color(0, 0, 0, 0);
		function getColorInterpol(prop, obj, name, def) {
			if (prop.values) {
				return new InterpolValues(prop.values);
			}
			var value, start, end;
			if (prop.start) {
				start = g.normalizeColor(prop.start);
			} else {
				start = value = obj ? (name ? obj[name] : obj) : def;
			}
			if (prop.end) {
				end = g.normalizeColor(prop.end);
			} else {
				if (!value) {
					value = obj ? (name ? obj[name] : obj) : def;
				}
				end = value;
			}
			return new InterpolColor(start, end);
		}
		function getNumberInterpol(prop, obj, name, def) {
			if (prop.values) {
				return new InterpolValues(prop.values);
			}
			var value, start, end;
			if (prop.start) {
				start = prop.start;
			} else {
				start = value = obj ? obj[name] : def;
			}
			if (prop.end) {
				end = prop.end;
			} else {
				if (typeof value != "number") {
					value = obj ? obj[name] : def;
				}
				end = value;
			}
			return new InterpolNumber(start, end);
		}
		g.fx.animateStroke = function (args) {
			if (!args.easing) {
				args.easing = d._defaultEasing;
			}
			var anim = new d.Animation(args), shape = args.shape, stroke;
			d.connect(anim, "beforeBegin", anim, function () {
				stroke = shape.getStroke();
				var prop = args.color, values = {}, value, start, end;
				if (prop) {
					values.color = getColorInterpol(prop, stroke, "color", transparent);
				}
				prop = args.style;
				if (prop && prop.values) {
					values.style = new InterpolValues(prop.values);
				}
				prop = args.width;
				if (prop) {
					values.width = getNumberInterpol(prop, stroke, "width", 1);
				}
				prop = args.cap;
				if (prop && prop.values) {
					values.cap = new InterpolValues(prop.values);
				}
				prop = args.join;
				if (prop) {
					if (prop.values) {
						values.join = new InterpolValues(prop.values);
					} else {
						start = prop.start ? prop.start : (stroke && stroke.join || 0);
						end = prop.end ? prop.end : (stroke && stroke.join || 0);
						if (typeof start == "number" && typeof end == "number") {
							values.join = new InterpolNumber(start, end);
						}
					}
				}
				this.curve = new InterpolObject(values, stroke);
			});
			d.connect(anim, "onAnimate", shape, "setStroke");
			return anim;
		};
		g.fx.animateFill = function (args) {
			if (!args.easing) {
				args.easing = d._defaultEasing;
			}
			var anim = new d.Animation(args), shape = args.shape, fill;
			d.connect(anim, "beforeBegin", anim, function () {
				fill = shape.getFill();
				var prop = args.color, values = {};
				if (prop) {
					this.curve = getColorInterpol(prop, fill, "", transparent);
				}
			});
			d.connect(anim, "onAnimate", shape, "setFill");
			return anim;
		};
		g.fx.animateFont = function (args) {
			if (!args.easing) {
				args.easing = d._defaultEasing;
			}
			var anim = new d.Animation(args), shape = args.shape, font;
			d.connect(anim, "beforeBegin", anim, function () {
				font = shape.getFont();
				var prop = args.style, values = {}, value, start, end;
				if (prop && prop.values) {
					values.style = new InterpolValues(prop.values);
				}
				prop = args.variant;
				if (prop && prop.values) {
					values.variant = new InterpolValues(prop.values);
				}
				prop = args.weight;
				if (prop && prop.values) {
					values.weight = new InterpolValues(prop.values);
				}
				prop = args.family;
				if (prop && prop.values) {
					values.family = new InterpolValues(prop.values);
				}
				prop = args.size;
				if (prop && prop.units) {
					start = parseFloat(prop.start ? prop.start : (shape.font && shape.font.size || "0"));
					end = parseFloat(prop.end ? prop.end : (shape.font && shape.font.size || "0"));
					values.size = new InterpolUnit(start, end, prop.units);
				}
				this.curve = new InterpolObject(values, font);
			});
			d.connect(anim, "onAnimate", shape, "setFont");
			return anim;
		};
		g.fx.animateTransform = function (args) {
			if (!args.easing) {
				args.easing = d._defaultEasing;
			}
			var anim = new d.Animation(args), shape = args.shape, original;
			d.connect(anim, "beforeBegin", anim, function () {
				original = shape.getTransform();
				this.curve = new InterpolTransform(args.transform, original);
			});
			d.connect(anim, "onAnimate", shape, "setTransform");
			return anim;
		};
	})();
}
