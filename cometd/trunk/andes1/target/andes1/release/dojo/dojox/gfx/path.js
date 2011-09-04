/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.path"]) {
	dojo._hasResource["dojox.gfx.path"] = true;
	dojo.provide("dojox.gfx.path");
	dojo.require("dojox.gfx.matrix");
	dojo.require("dojox.gfx.shape");
	dojo.declare("dojox.gfx.path.Path", dojox.gfx.shape.Shape, {constructor:function (rawNode) {
		this.shape = dojo.clone(dojox.gfx.defaultPath);
		this.segments = [];
		this.tbbox = null;
		this.absolute = true;
		this.last = {};
		this.rawNode = rawNode;
		this.segmented = false;
	}, setAbsoluteMode:function (mode) {
		this._confirmSegmented();
		this.absolute = typeof mode == "string" ? (mode == "absolute") : mode;
		return this;
	}, getAbsoluteMode:function () {
		this._confirmSegmented();
		return this.absolute;
	}, getBoundingBox:function () {
		this._confirmSegmented();
		return (this.bbox && ("l" in this.bbox)) ? {x:this.bbox.l, y:this.bbox.t, width:this.bbox.r - this.bbox.l, height:this.bbox.b - this.bbox.t} : null;
	}, _getRealBBox:function () {
		this._confirmSegmented();
		if (this.tbbox) {
			return this.tbbox;
		}
		var bbox = this.bbox, matrix = this._getRealMatrix();
		this.bbox = null;
		for (var i = 0, len = this.segments.length; i < len; ++i) {
			this._updateWithSegment(this.segments[i], matrix);
		}
		var t = this.bbox;
		this.bbox = bbox;
		this.tbbox = t ? [{x:t.l, y:t.t}, {x:t.r, y:t.t}, {x:t.r, y:t.b}, {x:t.l, y:t.b}] : null;
		return this.tbbox;
	}, getLastPosition:function () {
		this._confirmSegmented();
		return "x" in this.last ? this.last : null;
	}, _applyTransform:function () {
		this.tbbox = null;
		return this.inherited(arguments);
	}, _updateBBox:function (x, y, matrix) {
		if (matrix) {
			var t = dojox.gfx.matrix.multiplyPoint(matrix, x, y);
			x = t.x;
			y = t.y;
		}
		if (this.bbox && ("l" in this.bbox)) {
			if (this.bbox.l > x) {
				this.bbox.l = x;
			}
			if (this.bbox.r < x) {
				this.bbox.r = x;
			}
			if (this.bbox.t > y) {
				this.bbox.t = y;
			}
			if (this.bbox.b < y) {
				this.bbox.b = y;
			}
		} else {
			this.bbox = {l:x, b:y, r:x, t:y};
		}
	}, _updateWithSegment:function (segment, matrix) {
		var n = segment.args, l = n.length;
		switch (segment.action) {
		  case "M":
		  case "L":
		  case "C":
		  case "S":
		  case "Q":
		  case "T":
			for (var i = 0; i < l; i += 2) {
				this._updateBBox(n[i], n[i + 1], matrix);
			}
			this.last.x = n[l - 2];
			this.last.y = n[l - 1];
			this.absolute = true;
			break;
		  case "H":
			for (var i = 0; i < l; ++i) {
				this._updateBBox(n[i], this.last.y, matrix);
			}
			this.last.x = n[l - 1];
			this.absolute = true;
			break;
		  case "V":
			for (var i = 0; i < l; ++i) {
				this._updateBBox(this.last.x, n[i], matrix);
			}
			this.last.y = n[l - 1];
			this.absolute = true;
			break;
		  case "m":
			var start = 0;
			if (!("x" in this.last)) {
				this._updateBBox(this.last.x = n[0], this.last.y = n[1], matrix);
				start = 2;
			}
			for (var i = start; i < l; i += 2) {
				this._updateBBox(this.last.x += n[i], this.last.y += n[i + 1], matrix);
			}
			this.absolute = false;
			break;
		  case "l":
		  case "t":
			for (var i = 0; i < l; i += 2) {
				this._updateBBox(this.last.x += n[i], this.last.y += n[i + 1], matrix);
			}
			this.absolute = false;
			break;
		  case "h":
			for (var i = 0; i < l; ++i) {
				this._updateBBox(this.last.x += n[i], this.last.y, matrix);
			}
			this.absolute = false;
			break;
		  case "v":
			for (var i = 0; i < l; ++i) {
				this._updateBBox(this.last.x, this.last.y += n[i], matrix);
			}
			this.absolute = false;
			break;
		  case "c":
			for (var i = 0; i < l; i += 6) {
				this._updateBBox(this.last.x + n[i], this.last.y + n[i + 1], matrix);
				this._updateBBox(this.last.x + n[i + 2], this.last.y + n[i + 3], matrix);
				this._updateBBox(this.last.x += n[i + 4], this.last.y += n[i + 5], matrix);
			}
			this.absolute = false;
			break;
		  case "s":
		  case "q":
			for (var i = 0; i < l; i += 4) {
				this._updateBBox(this.last.x + n[i], this.last.y + n[i + 1], matrix);
				this._updateBBox(this.last.x += n[i + 2], this.last.y += n[i + 3], matrix);
			}
			this.absolute = false;
			break;
		  case "A":
			for (var i = 0; i < l; i += 7) {
				this._updateBBox(n[i + 5], n[i + 6], matrix);
			}
			this.last.x = n[l - 2];
			this.last.y = n[l - 1];
			this.absolute = true;
			break;
		  case "a":
			for (var i = 0; i < l; i += 7) {
				this._updateBBox(this.last.x += n[i + 5], this.last.y += n[i + 6], matrix);
			}
			this.absolute = false;
			break;
		}
		var path = [segment.action];
		for (var i = 0; i < l; ++i) {
			path.push(dojox.gfx.formatNumber(n[i], true));
		}
		if (typeof this.shape.path == "string") {
			this.shape.path += path.join("");
		} else {
			Array.prototype.push.apply(this.shape.path, path);
		}
	}, _validSegments:{m:2, l:2, h:1, v:1, c:6, s:4, q:4, t:2, a:7, z:0}, _pushSegment:function (action, args) {
		this.tbbox = null;
		var group = this._validSegments[action.toLowerCase()];
		if (typeof group == "number") {
			if (group) {
				if (args.length >= group) {
					var segment = {action:action, args:args.slice(0, args.length - args.length % group)};
					this.segments.push(segment);
					this._updateWithSegment(segment);
				}
			} else {
				var segment = {action:action, args:[]};
				this.segments.push(segment);
				this._updateWithSegment(segment);
			}
		}
	}, _collectArgs:function (array, args) {
		for (var i = 0; i < args.length; ++i) {
			var t = args[i];
			if (typeof t == "boolean") {
				array.push(t ? 1 : 0);
			} else {
				if (typeof t == "number") {
					array.push(t);
				} else {
					if (t instanceof Array) {
						this._collectArgs(array, t);
					} else {
						if ("x" in t && "y" in t) {
							array.push(t.x, t.y);
						}
					}
				}
			}
		}
	}, moveTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "M" : "m", args);
		return this;
	}, lineTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "L" : "l", args);
		return this;
	}, hLineTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "H" : "h", args);
		return this;
	}, vLineTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "V" : "v", args);
		return this;
	}, curveTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "C" : "c", args);
		return this;
	}, smoothCurveTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "S" : "s", args);
		return this;
	}, qCurveTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "Q" : "q", args);
		return this;
	}, qSmoothCurveTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "T" : "t", args);
		return this;
	}, arcTo:function () {
		this._confirmSegmented();
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "A" : "a", args);
		return this;
	}, closePath:function () {
		this._confirmSegmented();
		this._pushSegment("Z", []);
		return this;
	}, _confirmSegmented:function () {
		if (!this.segmented) {
			var path = this.shape.path;
			this.shape.path = [];
			this._setPath(path);
			this.shape.path = this.shape.path.join("");
			this.segmented = true;
		}
	}, _setPath:function (path) {
		var p = dojo.isArray(path) ? path : path.match(dojox.gfx.pathSvgRegExp);
		this.segments = [];
		this.absolute = true;
		this.bbox = {};
		this.last = {};
		if (!p) {
			return;
		}
		var action = "", args = [], l = p.length;
		for (var i = 0; i < l; ++i) {
			var t = p[i], x = parseFloat(t);
			if (isNaN(x)) {
				if (action) {
					this._pushSegment(action, args);
				}
				args = [];
				action = t;
			} else {
				args.push(x);
			}
		}
		this._pushSegment(action, args);
	}, setShape:function (newShape) {
		this.inherited(arguments, [typeof newShape == "string" ? {path:newShape} : newShape]);
		this.segmented = false;
		this.segments = [];
		if (!dojox.gfx.lazyPathSegmentation) {
			this._confirmSegmented();
		}
		return this;
	}, _2PI:Math.PI * 2});
	dojo.declare("dojox.gfx.path.TextPath", dojox.gfx.path.Path, {constructor:function (rawNode) {
		if (!("text" in this)) {
			this.text = dojo.clone(dojox.gfx.defaultTextPath);
		}
		if (!("fontStyle" in this)) {
			this.fontStyle = dojo.clone(dojox.gfx.defaultFont);
		}
	}, getText:function () {
		return this.text;
	}, setText:function (newText) {
		this.text = dojox.gfx.makeParameters(this.text, typeof newText == "string" ? {text:newText} : newText);
		this._setText();
		return this;
	}, getFont:function () {
		return this.fontStyle;
	}, setFont:function (newFont) {
		this.fontStyle = typeof newFont == "string" ? dojox.gfx.splitFontString(newFont) : dojox.gfx.makeParameters(dojox.gfx.defaultFont, newFont);
		this._setFont();
		return this;
	}});
}

