/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.shape"]) {
	dojo._hasResource["dojox.gfx.shape"] = true;
	dojo.provide("dojox.gfx.shape");
	dojo.require("dojox.gfx._base");
	dojo.declare("dojox.gfx.shape.Shape", null, {constructor:function () {
		this.rawNode = null;
		this.shape = null;
		this.matrix = null;
		this.fillStyle = null;
		this.strokeStyle = null;
		this.bbox = null;
		this.parent = null;
		this.parentMatrix = null;
	}, getNode:function () {
		return this.rawNode;
	}, getShape:function () {
		return this.shape;
	}, getTransform:function () {
		return this.matrix;
	}, getFill:function () {
		return this.fillStyle;
	}, getStroke:function () {
		return this.strokeStyle;
	}, getParent:function () {
		return this.parent;
	}, getBoundingBox:function () {
		return this.bbox;
	}, getTransformedBoundingBox:function () {
		var b = this.getBoundingBox();
		if (!b) {
			return null;
		}
		var m = this._getRealMatrix();
		gm = dojox.gfx.matrix;
		return [gm.multiplyPoint(m, b.x, b.y), gm.multiplyPoint(m, b.x + b.width, b.y), gm.multiplyPoint(m, b.x + b.width, b.y + b.height), gm.multiplyPoint(m, b.x, b.y + b.height)];
	}, getEventSource:function () {
		return this.rawNode;
	}, setShape:function (shape) {
		this.shape = dojox.gfx.makeParameters(this.shape, shape);
		this.bbox = null;
		return this;
	}, setFill:function (fill) {
		if (!fill) {
			this.fillStyle = null;
			return this;
		}
		var f = null;
		if (typeof (fill) == "object" && "type" in fill) {
			switch (fill.type) {
			  case "linear":
				f = dojox.gfx.makeParameters(dojox.gfx.defaultLinearGradient, fill);
				break;
			  case "radial":
				f = dojox.gfx.makeParameters(dojox.gfx.defaultRadialGradient, fill);
				break;
			  case "pattern":
				f = dojox.gfx.makeParameters(dojox.gfx.defaultPattern, fill);
				break;
			}
		} else {
			f = dojox.gfx.normalizeColor(fill);
		}
		this.fillStyle = f;
		return this;
	}, setStroke:function (stroke) {
		if (!stroke) {
			this.strokeStyle = null;
			return this;
		}
		if (typeof stroke == "string" || dojo.isArray(stroke) || stroke instanceof dojo.Color) {
			stroke = {color:stroke};
		}
		var s = this.strokeStyle = dojox.gfx.makeParameters(dojox.gfx.defaultStroke, stroke);
		s.color = dojox.gfx.normalizeColor(s.color);
		return this;
	}, setTransform:function (matrix) {
		this.matrix = dojox.gfx.matrix.clone(matrix ? dojox.gfx.matrix.normalize(matrix) : dojox.gfx.matrix.identity);
		return this._applyTransform();
	}, _applyTransform:function () {
		return this;
	}, moveToFront:function () {
		var p = this.getParent();
		if (p) {
			p._moveChildToFront(this);
			this._moveToFront();
		}
		return this;
	}, moveToBack:function () {
		var p = this.getParent();
		if (p) {
			p._moveChildToBack(this);
			this._moveToBack();
		}
		return this;
	}, _moveToFront:function () {
	}, _moveToBack:function () {
	}, applyRightTransform:function (matrix) {
		return matrix ? this.setTransform([this.matrix, matrix]) : this;
	}, applyLeftTransform:function (matrix) {
		return matrix ? this.setTransform([matrix, this.matrix]) : this;
	}, applyTransform:function (matrix) {
		return matrix ? this.setTransform([this.matrix, matrix]) : this;
	}, removeShape:function (silently) {
		if (this.parent) {
			this.parent.remove(this, silently);
		}
		return this;
	}, _setParent:function (parent, matrix) {
		this.parent = parent;
		return this._updateParentMatrix(matrix);
	}, _updateParentMatrix:function (matrix) {
		this.parentMatrix = matrix ? dojox.gfx.matrix.clone(matrix) : null;
		return this._applyTransform();
	}, _getRealMatrix:function () {
		var m = this.matrix;
		var p = this.parent;
		while (p) {
			if (p.matrix) {
				m = dojox.gfx.matrix.multiply(p.matrix, m);
			}
			p = p.parent;
		}
		return m;
	}});
	dojox.gfx.shape._eventsProcessing = {connect:function (name, object, method) {
		return arguments.length > 2 ? dojo.connect(this.getEventSource(), name, object, method) : dojo.connect(this.getEventSource(), name, object);
	}, disconnect:function (token) {
		dojo.disconnect(token);
	}};
	dojo.extend(dojox.gfx.shape.Shape, dojox.gfx.shape._eventsProcessing);
	dojox.gfx.shape.Container = {_init:function () {
		this.children = [];
	}, openBatch:function () {
	}, closeBatch:function () {
	}, add:function (shape) {
		var oldParent = shape.getParent();
		if (oldParent) {
			oldParent.remove(shape, true);
		}
		this.children.push(shape);
		return shape._setParent(this, this._getRealMatrix());
	}, remove:function (shape, silently) {
		for (var i = 0; i < this.children.length; ++i) {
			if (this.children[i] == shape) {
				if (silently) {
				} else {
					shape.parent = null;
					shape.parentMatrix = null;
				}
				this.children.splice(i, 1);
				break;
			}
		}
		return this;
	}, clear:function () {
		this.children = [];
		return this;
	}, _moveChildToFront:function (shape) {
		for (var i = 0; i < this.children.length; ++i) {
			if (this.children[i] == shape) {
				this.children.splice(i, 1);
				this.children.push(shape);
				break;
			}
		}
		return this;
	}, _moveChildToBack:function (shape) {
		for (var i = 0; i < this.children.length; ++i) {
			if (this.children[i] == shape) {
				this.children.splice(i, 1);
				this.children.unshift(shape);
				break;
			}
		}
		return this;
	}};
	dojo.declare("dojox.gfx.shape.Surface", null, {constructor:function () {
		this.rawNode = null;
		this._parent = null;
		this._nodes = [];
		this._events = [];
	}, destroy:function () {
		dojo.forEach(this._nodes, dojo.destroy);
		this._nodes = [];
		dojo.forEach(this._events, dojo.disconnect);
		this._events = [];
		this.rawNode = null;
		if (dojo.isIE) {
			while (this._parent.lastChild) {
				dojo.destroy(this._parent.lastChild);
			}
		} else {
			this._parent.innerHTML = "";
		}
		this._parent = null;
	}, getEventSource:function () {
		return this.rawNode;
	}, _getRealMatrix:function () {
		return null;
	}, isLoaded:true, onLoad:function (surface) {
	}, whenLoaded:function (context, method) {
		var f = dojo.hitch(context, method);
		if (this.isLoaded) {
			f(this);
		} else {
			var h = dojo.connect(this, "onLoad", function (surface) {
				dojo.disconnect(h);
				f(surface);
			});
		}
	}});
	dojo.extend(dojox.gfx.shape.Surface, dojox.gfx.shape._eventsProcessing);
	dojo.declare("dojox.gfx.Point", null, {});
	dojo.declare("dojox.gfx.Rectangle", null, {});
	dojo.declare("dojox.gfx.shape.Rect", dojox.gfx.shape.Shape, {constructor:function (rawNode) {
		this.shape = dojox.gfx.getDefault("Rect");
		this.rawNode = rawNode;
	}, getBoundingBox:function () {
		return this.shape;
	}});
	dojo.declare("dojox.gfx.shape.Ellipse", dojox.gfx.shape.Shape, {constructor:function (rawNode) {
		this.shape = dojox.gfx.getDefault("Ellipse");
		this.rawNode = rawNode;
	}, getBoundingBox:function () {
		if (!this.bbox) {
			var shape = this.shape;
			this.bbox = {x:shape.cx - shape.rx, y:shape.cy - shape.ry, width:2 * shape.rx, height:2 * shape.ry};
		}
		return this.bbox;
	}});
	dojo.declare("dojox.gfx.shape.Circle", dojox.gfx.shape.Shape, {constructor:function (rawNode) {
		this.shape = dojox.gfx.getDefault("Circle");
		this.rawNode = rawNode;
	}, getBoundingBox:function () {
		if (!this.bbox) {
			var shape = this.shape;
			this.bbox = {x:shape.cx - shape.r, y:shape.cy - shape.r, width:2 * shape.r, height:2 * shape.r};
		}
		return this.bbox;
	}});
	dojo.declare("dojox.gfx.shape.Line", dojox.gfx.shape.Shape, {constructor:function (rawNode) {
		this.shape = dojox.gfx.getDefault("Line");
		this.rawNode = rawNode;
	}, getBoundingBox:function () {
		if (!this.bbox) {
			var shape = this.shape;
			this.bbox = {x:Math.min(shape.x1, shape.x2), y:Math.min(shape.y1, shape.y2), width:Math.abs(shape.x2 - shape.x1), height:Math.abs(shape.y2 - shape.y1)};
		}
		return this.bbox;
	}});
	dojo.declare("dojox.gfx.shape.Polyline", dojox.gfx.shape.Shape, {constructor:function (rawNode) {
		this.shape = dojox.gfx.getDefault("Polyline");
		this.rawNode = rawNode;
	}, setShape:function (points, closed) {
		if (points && points instanceof Array) {
			this.inherited(arguments, [{points:points}]);
			if (closed && this.shape.points.length) {
				this.shape.points.push(this.shape.points[0]);
			}
		} else {
			this.inherited(arguments, [points]);
		}
		return this;
	}, _normalizePoints:function () {
		var p = this.shape.points, l = p && p.length;
		if (l && typeof p[0] == "number") {
			var points = [];
			for (var i = 0; i < l; i += 2) {
				points.push({x:p[i], y:p[i + 1]});
			}
			this.shape.points = points;
		}
	}, getBoundingBox:function () {
		if (!this.bbox && this.shape.points.length) {
			var p = this.shape.points;
			var l = p.length;
			var t = p[0];
			var bbox = {l:t.x, t:t.y, r:t.x, b:t.y};
			for (var i = 1; i < l; ++i) {
				t = p[i];
				if (bbox.l > t.x) {
					bbox.l = t.x;
				}
				if (bbox.r < t.x) {
					bbox.r = t.x;
				}
				if (bbox.t > t.y) {
					bbox.t = t.y;
				}
				if (bbox.b < t.y) {
					bbox.b = t.y;
				}
			}
			this.bbox = {x:bbox.l, y:bbox.t, width:bbox.r - bbox.l, height:bbox.b - bbox.t};
		}
		return this.bbox;
	}});
	dojo.declare("dojox.gfx.shape.Image", dojox.gfx.shape.Shape, {constructor:function (rawNode) {
		this.shape = dojox.gfx.getDefault("Image");
		this.rawNode = rawNode;
	}, getBoundingBox:function () {
		return this.shape;
	}, setStroke:function () {
		return this;
	}, setFill:function () {
		return this;
	}});
	dojo.declare("dojox.gfx.shape.Text", dojox.gfx.shape.Shape, {constructor:function (rawNode) {
		this.fontStyle = null;
		this.shape = dojox.gfx.getDefault("Text");
		this.rawNode = rawNode;
	}, getFont:function () {
		return this.fontStyle;
	}, setFont:function (newFont) {
		this.fontStyle = typeof newFont == "string" ? dojox.gfx.splitFontString(newFont) : dojox.gfx.makeParameters(dojox.gfx.defaultFont, newFont);
		this._setFont();
		return this;
	}});
	dojox.gfx.shape.Creator = {createShape:function (shape) {
		var gfx = dojox.gfx;
		switch (shape.type) {
		  case gfx.defaultPath.type:
			return this.createPath(shape);
		  case gfx.defaultRect.type:
			return this.createRect(shape);
		  case gfx.defaultCircle.type:
			return this.createCircle(shape);
		  case gfx.defaultEllipse.type:
			return this.createEllipse(shape);
		  case gfx.defaultLine.type:
			return this.createLine(shape);
		  case gfx.defaultPolyline.type:
			return this.createPolyline(shape);
		  case gfx.defaultImage.type:
			return this.createImage(shape);
		  case gfx.defaultText.type:
			return this.createText(shape);
		  case gfx.defaultTextPath.type:
			return this.createTextPath(shape);
		}
		return null;
	}, createGroup:function () {
		return this.createObject(dojox.gfx.Group);
	}, createRect:function (rect) {
		return this.createObject(dojox.gfx.Rect, rect);
	}, createEllipse:function (ellipse) {
		return this.createObject(dojox.gfx.Ellipse, ellipse);
	}, createCircle:function (circle) {
		return this.createObject(dojox.gfx.Circle, circle);
	}, createLine:function (line) {
		return this.createObject(dojox.gfx.Line, line);
	}, createPolyline:function (points) {
		return this.createObject(dojox.gfx.Polyline, points);
	}, createImage:function (image) {
		return this.createObject(dojox.gfx.Image, image);
	}, createText:function (text) {
		return this.createObject(dojox.gfx.Text, text);
	}, createPath:function (path) {
		return this.createObject(dojox.gfx.Path, path);
	}, createTextPath:function (text) {
		return this.createObject(dojox.gfx.TextPath, {}).setText(text);
	}, createObject:function (shapeType, rawShape) {
		return null;
	}};
}

