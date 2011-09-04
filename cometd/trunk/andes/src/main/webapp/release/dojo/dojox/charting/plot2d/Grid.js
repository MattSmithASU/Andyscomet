/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.Grid"]) {
	dojo._hasResource["dojox.charting.plot2d.Grid"] = true;
	dojo.provide("dojox.charting.plot2d.Grid");
	dojo.require("dojox.charting.Element");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.utils");
	(function () {
		var du = dojox.lang.utils, dc = dojox.charting.plot2d.common;
		dojo.declare("dojox.charting.plot2d.Grid", dojox.charting.Element, {defaultParams:{hAxis:"x", vAxis:"y", hMajorLines:true, hMinorLines:false, vMajorLines:true, vMinorLines:false, hStripes:"none", vStripes:"none", animate:null}, optionalParams:{}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
			this.dirty = true;
			this.animate = this.opt.animate;
			this.zoom = null, this.zoomQueue = [];
			this.lastWindow = {vscale:1, hscale:1, xoffset:0, yoffset:0};
		}, clear:function () {
			this._hAxis = null;
			this._vAxis = null;
			this.dirty = true;
			return this;
		}, setAxis:function (axis) {
			if (axis) {
				this[axis.vertical ? "_vAxis" : "_hAxis"] = axis;
			}
			return this;
		}, addSeries:function (run) {
			return this;
		}, getSeriesStats:function () {
			return dojo.delegate(dc.defaultStats);
		}, initializeScalers:function () {
			return this;
		}, isDirty:function () {
			return this.dirty || this._hAxis && this._hAxis.dirty || this._vAxis && this._vAxis.dirty;
		}, performZoom:function (dim, offsets) {
			var vs = this._vAxis.scale || 1, hs = this._hAxis.scale || 1, vOffset = dim.height - offsets.b, hBounds = this._hAxis.getScaler().bounds, xOffset = (hBounds.from - hBounds.lower) * hBounds.scale, vBounds = this._vAxis.getScaler().bounds, yOffset = (vBounds.from - vBounds.lower) * vBounds.scale;
			rVScale = vs / this.lastWindow.vscale, rHScale = hs / this.lastWindow.hscale, rXOffset = (this.lastWindow.xoffset - xOffset) / ((this.lastWindow.hscale == 1) ? hs : this.lastWindow.hscale), rYOffset = (yOffset - this.lastWindow.yoffset) / ((this.lastWindow.vscale == 1) ? vs : this.lastWindow.vscale), shape = this.group, anim = dojox.gfx.fx.animateTransform(dojo.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:[0, 0], end:[offsets.l * (1 - rHScale), vOffset * (1 - rVScale)]}, {name:"scale", start:[1, 1], end:[rHScale, rVScale]}, {name:"original"}, {name:"translate", start:[0, 0], end:[rXOffset, rYOffset]}]}, this.zoom));
			dojo.mixin(this.lastWindow, {vscale:vs, hscale:hs, xoffset:xOffset, yoffset:yOffset});
			this.zoomQueue.push(anim);
			dojo.connect(anim, "onEnd", this, function () {
				this.zoom = null;
				this.zoomQueue.shift();
				if (this.zoomQueue.length > 0) {
					this.zoomQueue[0].play();
				}
			});
			if (this.zoomQueue.length == 1) {
				this.zoomQueue[0].play();
			}
			return this;
		}, getRequiredColors:function () {
			return 0;
		}, render:function (dim, offsets) {
			if (this.zoom) {
				return this.performZoom(dim, offsets);
			}
			this.dirty = this.isDirty();
			if (!this.dirty) {
				return this;
			}
			this.cleanGroup();
			var s = this.group, ta = this.chart.theme.axis;
			try {
				var vScaler = this._vAxis.getScaler(), vt = vScaler.scaler.getTransformerFromModel(vScaler), ticks = this._vAxis.getTicks();
				if (this.opt.hMinorLines) {
					dojo.forEach(ticks.minor, function (tick) {
						var y = dim.height - offsets.b - vt(tick.value);
						var hMinorLine = s.createLine({x1:offsets.l, y1:y, x2:dim.width - offsets.r, y2:y}).setStroke(ta.minorTick);
						if (this.animate) {
							this._animateGrid(hMinorLine, "h", offsets.l, offsets.r + offsets.l - dim.width);
						}
					}, this);
				}
				if (this.opt.hMajorLines) {
					dojo.forEach(ticks.major, function (tick) {
						var y = dim.height - offsets.b - vt(tick.value);
						var hMajorLine = s.createLine({x1:offsets.l, y1:y, x2:dim.width - offsets.r, y2:y}).setStroke(ta.majorTick);
						if (this.animate) {
							this._animateGrid(hMajorLine, "h", offsets.l, offsets.r + offsets.l - dim.width);
						}
					}, this);
				}
			}
			catch (e) {
			}
			try {
				var hScaler = this._hAxis.getScaler(), ht = hScaler.scaler.getTransformerFromModel(hScaler), ticks = this._hAxis.getTicks();
				if (ticks && this.opt.vMinorLines) {
					dojo.forEach(ticks.minor, function (tick) {
						var x = offsets.l + ht(tick.value);
						var vMinorLine = s.createLine({x1:x, y1:offsets.t, x2:x, y2:dim.height - offsets.b}).setStroke(ta.minorTick);
						if (this.animate) {
							this._animateGrid(vMinorLine, "v", dim.height - offsets.b, dim.height - offsets.b - offsets.t);
						}
					}, this);
				}
				if (ticks && this.opt.vMajorLines) {
					dojo.forEach(ticks.major, function (tick) {
						var x = offsets.l + ht(tick.value);
						var vMajorLine = s.createLine({x1:x, y1:offsets.t, x2:x, y2:dim.height - offsets.b}).setStroke(ta.majorTick);
						if (this.animate) {
							this._animateGrid(vMajorLine, "v", dim.height - offsets.b, dim.height - offsets.b - offsets.t);
						}
					}, this);
				}
			}
			catch (e) {
			}
			this.dirty = false;
			return this;
		}, _animateGrid:function (shape, type, offset, size) {
			var transStart = type == "h" ? [offset, 0] : [0, offset];
			var scaleStart = type == "h" ? [1 / size, 1] : [1, 1 / size];
			dojox.gfx.fx.animateTransform(dojo.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:transStart, end:[0, 0]}, {name:"scale", start:scaleStart, end:[1, 1]}, {name:"original"}]}, this.animate)).play();
		}});
	})();
}

