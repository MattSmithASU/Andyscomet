/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.silverlight"]) {
	dojo._hasResource["dojox.gfx.silverlight"] = true;
	dojo.provide("dojox.gfx.silverlight");
	dojo.require("dojox.gfx._base");
	dojo.require("dojox.gfx.shape");
	dojo.require("dojox.gfx.path");
	dojo.experimental("dojox.gfx.silverlight");
	(function () {
		var d = dojo, g = dojox.gfx, gs = g.shape, sl = g.silverlight;
		var dasharray = {solid:"none", shortdash:[4, 1], shortdot:[1, 1], shortdashdot:[4, 1, 1, 1], shortdashdotdot:[4, 1, 1, 1, 1, 1], dot:[1, 3], dash:[4, 3], longdash:[8, 3], dashdot:[4, 3, 1, 3], longdashdot:[8, 3, 1, 3], longdashdotdot:[8, 3, 1, 3, 1, 3]}, fontweight = {normal:400, bold:700}, caps = {butt:"Flat", round:"Round", square:"Square"}, joins = {bevel:"Bevel", round:"Round"}, fonts = {serif:"Times New Roman", times:"Times New Roman", "sans-serif":"Arial", helvetica:"Arial", monotone:"Courier New", courier:"Courier New"};
		function hexColor(color) {
			var c = g.normalizeColor(color), t = c.toHex(), a = Math.round(c.a * 255);
			a = (a < 0 ? 0 : a > 255 ? 255 : a).toString(16);
			return "#" + (a.length < 2 ? "0" + a : a) + t.slice(1);
		}
		d.declare("dojox.gfx.silverlight.Shape", gs.Shape, {setFill:function (fill) {
			var p = this.rawNode.getHost().content, r = this.rawNode, f;
			if (!fill) {
				this.fillStyle = null;
				this._setFillAttr(null);
				return this;
			}
			if (typeof (fill) == "object" && "type" in fill) {
				switch (fill.type) {
				  case "linear":
					this.fillStyle = f = g.makeParameters(g.defaultLinearGradient, fill);
					var lgb = p.createFromXaml("<LinearGradientBrush/>");
					lgb.mappingMode = "Absolute";
					lgb.startPoint = f.x1 + "," + f.y1;
					lgb.endPoint = f.x2 + "," + f.y2;
					d.forEach(f.colors, function (c) {
						var t = p.createFromXaml("<GradientStop/>");
						t.offset = c.offset;
						t.color = hexColor(c.color);
						lgb.gradientStops.add(t);
					});
					this._setFillAttr(lgb);
					break;
				  case "radial":
					this.fillStyle = f = g.makeParameters(g.defaultRadialGradient, fill);
					var rgb = p.createFromXaml("<RadialGradientBrush/>"), c = g.matrix.multiplyPoint(g.matrix.invert(this._getAdjustedMatrix()), f.cx, f.cy), pt = c.x + "," + c.y;
					rgb.mappingMode = "Absolute";
					rgb.gradientOrigin = pt;
					rgb.center = pt;
					rgb.radiusX = rgb.radiusY = f.r;
					d.forEach(f.colors, function (c) {
						var t = p.createFromXaml("<GradientStop/>");
						t.offset = c.offset;
						t.color = hexColor(c.color);
						rgb.gradientStops.add(t);
					});
					this._setFillAttr(rgb);
					break;
				  case "pattern":
					this.fillStyle = null;
					this._setFillAttr(null);
					break;
				}
				return this;
			}
			this.fillStyle = f = g.normalizeColor(fill);
			var scb = p.createFromXaml("<SolidColorBrush/>");
			scb.color = f.toHex();
			scb.opacity = f.a;
			this._setFillAttr(scb);
			return this;
		}, _setFillAttr:function (f) {
			this.rawNode.fill = f;
		}, setStroke:function (stroke) {
			var p = this.rawNode.getHost().content, r = this.rawNode;
			if (!stroke) {
				this.strokeStyle = null;
				r.stroke = null;
				return this;
			}
			if (typeof stroke == "string" || d.isArray(stroke) || stroke instanceof d.Color) {
				stroke = {color:stroke};
			}
			var s = this.strokeStyle = g.makeParameters(g.defaultStroke, stroke);
			s.color = g.normalizeColor(s.color);
			if (s) {
				var scb = p.createFromXaml("<SolidColorBrush/>");
				scb.color = s.color.toHex();
				scb.opacity = s.color.a;
				r.stroke = scb;
				r.strokeThickness = s.width;
				r.strokeStartLineCap = r.strokeEndLineCap = r.strokeDashCap = caps[s.cap];
				if (typeof s.join == "number") {
					r.strokeLineJoin = "Miter";
					r.strokeMiterLimit = s.join;
				} else {
					r.strokeLineJoin = joins[s.join];
				}
				var da = s.style.toLowerCase();
				if (da in dasharray) {
					da = dasharray[da];
				}
				if (da instanceof Array) {
					da = d.clone(da);
					var i;
					if (s.cap != "butt") {
						for (i = 0; i < da.length; i += 2) {
							--da[i];
							if (da[i] < 1) {
								da[i] = 1;
							}
						}
						for (i = 1; i < da.length; i += 2) {
							++da[i];
						}
					}
					r.strokeDashArray = da.join(",");
				} else {
					r.strokeDashArray = null;
				}
			}
			return this;
		}, _getParentSurface:function () {
			var surface = this.parent;
			for (; surface && !(surface instanceof g.Surface); surface = surface.parent) {
			}
			return surface;
		}, _applyTransform:function () {
			var tm = this._getAdjustedMatrix(), r = this.rawNode;
			if (tm) {
				var p = this.rawNode.getHost().content, mt = p.createFromXaml("<MatrixTransform/>"), mm = p.createFromXaml("<Matrix/>");
				mm.m11 = tm.xx;
				mm.m21 = tm.xy;
				mm.m12 = tm.yx;
				mm.m22 = tm.yy;
				mm.offsetX = tm.dx;
				mm.offsetY = tm.dy;
				mt.matrix = mm;
				r.renderTransform = mt;
			} else {
				r.renderTransform = null;
			}
			return this;
		}, setRawNode:function (rawNode) {
			rawNode.fill = null;
			rawNode.stroke = null;
			this.rawNode = rawNode;
		}, _moveToFront:function () {
			var c = this.parent.rawNode.children, r = this.rawNode;
			c.remove(r);
			c.add(r);
			return this;
		}, _moveToBack:function () {
			var c = this.parent.rawNode.children, r = this.rawNode;
			c.remove(r);
			c.insert(0, r);
			return this;
		}, _getAdjustedMatrix:function () {
			return this.matrix;
		}});
		d.declare("dojox.gfx.silverlight.Group", sl.Shape, {constructor:function () {
			gs.Container._init.call(this);
		}, setRawNode:function (rawNode) {
			this.rawNode = rawNode;
		}});
		sl.Group.nodeType = "Canvas";
		d.declare("dojox.gfx.silverlight.Rect", [sl.Shape, gs.Rect], {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, n = this.shape;
			r.width = n.width;
			r.height = n.height;
			r.radiusX = r.radiusY = n.r;
			return this._applyTransform();
		}, _getAdjustedMatrix:function () {
			var matrix = this.matrix, s = this.shape, delta = {dx:s.x, dy:s.y};
			return new g.Matrix2D(matrix ? [matrix, delta] : delta);
		}});
		sl.Rect.nodeType = "Rectangle";
		d.declare("dojox.gfx.silverlight.Ellipse", [sl.Shape, gs.Ellipse], {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, n = this.shape;
			r.width = 2 * n.rx;
			r.height = 2 * n.ry;
			return this._applyTransform();
		}, _getAdjustedMatrix:function () {
			var matrix = this.matrix, s = this.shape, delta = {dx:s.cx - s.rx, dy:s.cy - s.ry};
			return new g.Matrix2D(matrix ? [matrix, delta] : delta);
		}});
		sl.Ellipse.nodeType = "Ellipse";
		d.declare("dojox.gfx.silverlight.Circle", [sl.Shape, gs.Circle], {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, n = this.shape;
			r.width = r.height = 2 * n.r;
			return this._applyTransform();
		}, _getAdjustedMatrix:function () {
			var matrix = this.matrix, s = this.shape, delta = {dx:s.cx - s.r, dy:s.cy - s.r};
			return new g.Matrix2D(matrix ? [matrix, delta] : delta);
		}});
		sl.Circle.nodeType = "Ellipse";
		d.declare("dojox.gfx.silverlight.Line", [sl.Shape, gs.Line], {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, n = this.shape;
			r.x1 = n.x1;
			r.y1 = n.y1;
			r.x2 = n.x2;
			r.y2 = n.y2;
			return this;
		}});
		sl.Line.nodeType = "Line";
		d.declare("dojox.gfx.silverlight.Polyline", [sl.Shape, gs.Polyline], {setShape:function (points, closed) {
			if (points && points instanceof Array) {
				this.shape = g.makeParameters(this.shape, {points:points});
				if (closed && this.shape.points.length) {
					this.shape.points.push(this.shape.points[0]);
				}
			} else {
				this.shape = g.makeParameters(this.shape, points);
			}
			this.bbox = null;
			this._normalizePoints();
			var p = this.shape.points, rp = [];
			for (var i = 0; i < p.length; ++i) {
				rp.push(p[i].x, p[i].y);
			}
			this.rawNode.points = rp.join(",");
			return this;
		}});
		sl.Polyline.nodeType = "Polyline";
		d.declare("dojox.gfx.silverlight.Image", [sl.Shape, gs.Image], {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, n = this.shape;
			r.width = n.width;
			r.height = n.height;
			r.source = n.src;
			return this._applyTransform();
		}, _getAdjustedMatrix:function () {
			var matrix = this.matrix, s = this.shape, delta = {dx:s.x, dy:s.y};
			return new g.Matrix2D(matrix ? [matrix, delta] : delta);
		}, setRawNode:function (rawNode) {
			this.rawNode = rawNode;
		}});
		sl.Image.nodeType = "Image";
		d.declare("dojox.gfx.silverlight.Text", [sl.Shape, gs.Text], {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, s = this.shape;
			r.text = s.text;
			r.textDecorations = s.decoration === "underline" ? "Underline" : "None";
			r["Canvas.Left"] = -10000;
			r["Canvas.Top"] = -10000;
			if (!this._delay) {
				this._delay = window.setTimeout(d.hitch(this, "_delayAlignment"), 10);
			}
			return this;
		}, _delayAlignment:function () {
			var r = this.rawNode, s = this.shape, w, h;
			try {
				w = r.actualWidth;
				h = r.actualHeight;
			}
			catch (e) {
				return;
			}
			var x = s.x, y = s.y - h * 0.75;
			switch (s.align) {
			  case "middle":
				x -= w / 2;
				break;
			  case "end":
				x -= w;
				break;
			}
			this._delta = {dx:x, dy:y};
			r["Canvas.Left"] = 0;
			r["Canvas.Top"] = 0;
			this._applyTransform();
			delete this._delay;
		}, _getAdjustedMatrix:function () {
			var matrix = this.matrix, delta = this._delta, x;
			if (matrix) {
				x = delta ? [matrix, delta] : matrix;
			} else {
				x = delta ? delta : {};
			}
			return new g.Matrix2D(x);
		}, setStroke:function () {
			return this;
		}, _setFillAttr:function (f) {
			this.rawNode.foreground = f;
		}, setRawNode:function (rawNode) {
			this.rawNode = rawNode;
		}, getTextWidth:function () {
			return this.rawNode.actualWidth;
		}});
		sl.Text.nodeType = "TextBlock";
		d.declare("dojox.gfx.silverlight.Path", [sl.Shape, g.path.Path], {_updateWithSegment:function (segment) {
			this.inherited(arguments);
			var p = this.shape.path;
			if (typeof (p) == "string") {
				this.rawNode.data = p ? p : null;
			}
		}, setShape:function (newShape) {
			this.inherited(arguments);
			var p = this.shape.path;
			this.rawNode.data = p ? p : null;
			return this;
		}});
		sl.Path.nodeType = "Path";
		d.declare("dojox.gfx.silverlight.TextPath", [sl.Shape, g.path.TextPath], {_updateWithSegment:function (segment) {
		}, setShape:function (newShape) {
		}, _setText:function () {
		}});
		sl.TextPath.nodeType = "text";
		var surfaces = {}, nullFunc = new Function;
		d.declare("dojox.gfx.silverlight.Surface", gs.Surface, {constructor:function () {
			gs.Container._init.call(this);
		}, destroy:function () {
			window[this._onLoadName] = nullFunc;
			delete surfaces[this._nodeName];
			this.inherited(arguments);
		}, setDimensions:function (width, height) {
			this.width = g.normalizedLength(width);
			this.height = g.normalizedLength(height);
			var p = this.rawNode && this.rawNode.getHost();
			if (p) {
				p.width = width;
				p.height = height;
			}
			return this;
		}, getDimensions:function () {
			var p = this.rawNode && this.rawNode.getHost();
			var t = p ? {width:p.content.actualWidth, height:p.content.actualHeight} : null;
			if (t.width <= 0) {
				t.width = this.width;
			}
			if (t.height <= 0) {
				t.height = this.height;
			}
			return t;
		}});
		sl.createSurface = function (parentNode, width, height) {
			if (!width && !height) {
				var pos = d.position(parentNode);
				width = width || pos.w;
				height = height || pos.h;
			}
			if (typeof width == "number") {
				width = width + "px";
			}
			if (typeof height == "number") {
				height = height + "px";
			}
			var s = new sl.Surface();
			parentNode = d.byId(parentNode);
			s._parent = parentNode;
			s._nodeName = g._base._getUniqueId();
			var t = parentNode.ownerDocument.createElement("script");
			t.type = "text/xaml";
			t.id = g._base._getUniqueId();
			t.text = "<?xml version='1.0'?><Canvas xmlns='http://schemas.microsoft.com/client/2007' Name='" + s._nodeName + "'/>";
			parentNode.parentNode.insertBefore(t, parentNode);
			s._nodes.push(t);
			var obj, pluginName = g._base._getUniqueId(), onLoadName = "__" + g._base._getUniqueId() + "_onLoad";
			s._onLoadName = onLoadName;
			window[onLoadName] = function (sender) {
				if (!s.rawNode) {
					s.rawNode = d.byId(pluginName).content.root;
					surfaces[s._nodeName] = parentNode;
					s.onLoad(s);
				}
			};
			if (d.isSafari) {
				obj = "<embed type='application/x-silverlight' id='" + pluginName + "' width='" + width + "' height='" + height + " background='transparent'" + " source='#" + t.id + "'" + " windowless='true'" + " maxFramerate='60'" + " onLoad='" + onLoadName + "'" + " onError='__dojoSilverlightError'" + " /><iframe style='visibility:hidden;height:0;width:0'/>";
			} else {
				obj = "<object type='application/x-silverlight' data='data:application/x-silverlight,' id='" + pluginName + "' width='" + width + "' height='" + height + "'>" + "<param name='background' value='transparent' />" + "<param name='source' value='#" + t.id + "' />" + "<param name='windowless' value='true' />" + "<param name='maxFramerate' value='60' />" + "<param name='onLoad' value='" + onLoadName + "' />" + "<param name='onError' value='__dojoSilverlightError' />" + "</object>";
			}
			parentNode.innerHTML = obj;
			var pluginNode = d.byId(pluginName);
			if (pluginNode.content && pluginNode.content.root) {
				s.rawNode = pluginNode.content.root;
				surfaces[s._nodeName] = parentNode;
			} else {
				s.rawNode = null;
				s.isLoaded = false;
			}
			s._nodes.push(pluginNode);
			s.width = g.normalizedLength(width);
			s.height = g.normalizedLength(height);
			return s;
		};
		__dojoSilverlightError = function (sender, err) {
			var t = "Silverlight Error:\n" + "Code: " + err.ErrorCode + "\n" + "Type: " + err.ErrorType + "\n" + "Message: " + err.ErrorMessage + "\n";
			switch (err.ErrorType) {
			  case "ParserError":
				t += "XamlFile: " + err.xamlFile + "\n" + "Line: " + err.lineNumber + "\n" + "Position: " + err.charPosition + "\n";
				break;
			  case "RuntimeError":
				t += "MethodName: " + err.methodName + "\n";
				if (err.lineNumber != 0) {
					t += "Line: " + err.lineNumber + "\n" + "Position: " + err.charPosition + "\n";
				}
				break;
			}
		};
		var Font = {_setFont:function () {
			var f = this.fontStyle, r = this.rawNode, t = f.family.toLowerCase();
			r.fontStyle = f.style == "italic" ? "Italic" : "Normal";
			r.fontWeight = f.weight in fontweight ? fontweight[f.weight] : f.weight;
			r.fontSize = g.normalizedLength(f.size);
			r.fontFamily = t in fonts ? fonts[t] : f.family;
			if (!this._delay) {
				this._delay = window.setTimeout(d.hitch(this, "_delayAlignment"), 10);
			}
		}};
		var C = gs.Container, Container = {add:function (shape) {
			if (this != shape.getParent()) {
				C.add.apply(this, arguments);
				this.rawNode.children.add(shape.rawNode);
			}
			return this;
		}, remove:function (shape, silently) {
			if (this == shape.getParent()) {
				var parent = shape.rawNode.getParent();
				if (parent) {
					parent.children.remove(shape.rawNode);
				}
				C.remove.apply(this, arguments);
			}
			return this;
		}, clear:function () {
			this.rawNode.children.clear();
			return C.clear.apply(this, arguments);
		}, _moveChildToFront:C._moveChildToFront, _moveChildToBack:C._moveChildToBack};
		var Creator = {createObject:function (shapeType, rawShape) {
			if (!this.rawNode) {
				return null;
			}
			var shape = new shapeType();
			var node = this.rawNode.getHost().content.createFromXaml("<" + shapeType.nodeType + "/>");
			shape.setRawNode(node);
			shape.setShape(rawShape);
			this.add(shape);
			return shape;
		}};
		d.extend(sl.Text, Font);
		d.extend(sl.Group, Container);
		d.extend(sl.Group, gs.Creator);
		d.extend(sl.Group, Creator);
		d.extend(sl.Surface, Container);
		d.extend(sl.Surface, gs.Creator);
		d.extend(sl.Surface, Creator);
		function mouseFix(s, a) {
			var ev = {target:s, currentTarget:s, preventDefault:function () {
			}, stopPropagation:function () {
			}};
			try {
				if (a.source) {
					ev.target = a.source;
				}
			}
			catch (e) {
			}
			if (a) {
				try {
					ev.ctrlKey = a.ctrl;
					ev.shiftKey = a.shift;
					var p = a.getPosition(null);
					ev.x = ev.offsetX = ev.layerX = p.x;
					ev.y = ev.offsetY = ev.layerY = p.y;
					var parent = surfaces[s.getHost().content.root.name];
					var t = d.position(parent);
					ev.clientX = t.x + p.x;
					ev.clientY = t.y + p.y;
				}
				catch (e) {
				}
			}
			return ev;
		}
		function keyFix(s, a) {
			var ev = {keyCode:a.platformKeyCode, ctrlKey:a.ctrl, shiftKey:a.shift};
			try {
				if (a.source) {
					ev.target = a.source;
				}
			}
			catch (e) {
			}
			return ev;
		}
		var eventNames = {onclick:{name:"MouseLeftButtonUp", fix:mouseFix}, onmouseenter:{name:"MouseEnter", fix:mouseFix}, onmouseleave:{name:"MouseLeave", fix:mouseFix}, onmouseover:{name:"MouseEnter", fix:mouseFix}, onmouseout:{name:"MouseLeave", fix:mouseFix}, onmousedown:{name:"MouseLeftButtonDown", fix:mouseFix}, onmouseup:{name:"MouseLeftButtonUp", fix:mouseFix}, onmousemove:{name:"MouseMove", fix:mouseFix}, onkeydown:{name:"KeyDown", fix:keyFix}, onkeyup:{name:"KeyUp", fix:keyFix}};
		var eventsProcessing = {connect:function (name, object, method) {
			var token, n = name in eventNames ? eventNames[name] : {name:name, fix:function () {
				return {};
			}};
			if (arguments.length > 2) {
				token = this.getEventSource().addEventListener(n.name, function (s, a) {
					d.hitch(object, method)(n.fix(s, a));
				});
			} else {
				token = this.getEventSource().addEventListener(n.name, function (s, a) {
					object(n.fix(s, a));
				});
			}
			return {name:n.name, token:token};
		}, disconnect:function (token) {
			try {
				this.getEventSource().removeEventListener(token.name, token.token);
			}
			catch (e) {
			}
		}};
		d.extend(sl.Shape, eventsProcessing);
		d.extend(sl.Surface, eventsProcessing);
		g.equalSources = function (a, b) {
			return a && b && a.equals(b);
		};
		if (g.loadAndSwitch === "silverlight") {
			g.switchTo("silverlight");
			delete g.loadAndSwitch;
		}
	})();
}

