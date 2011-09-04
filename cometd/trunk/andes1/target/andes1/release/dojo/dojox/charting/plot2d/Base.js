/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.Base"]) {
	dojo._hasResource["dojox.charting.plot2d.Base"] = true;
	dojo.provide("dojox.charting.plot2d.Base");
	dojo.require("dojox.charting.scaler.primitive");
	dojo.require("dojox.charting.Element");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.charting.plot2d._PlotEvents");
	dojo.declare("dojox.charting.plot2d.Base", [dojox.charting.Element, dojox.charting.plot2d._PlotEvents], {constructor:function (chart, kwArgs) {
		this.zoom = null, this.zoomQueue = [];
		this.lastWindow = {vscale:1, hscale:1, xoffset:0, yoffset:0};
	}, clear:function () {
		this.series = [];
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
		this.series.push(run);
		return this;
	}, getSeriesStats:function () {
		return dojox.charting.plot2d.common.collectSimpleStats(this.series);
	}, calculateAxes:function (dim) {
		this.initializeScalers(dim, this.getSeriesStats());
		return this;
	}, isDirty:function () {
		return this.dirty || this._hAxis && this._hAxis.dirty || this._vAxis && this._vAxis.dirty;
	}, isDataDirty:function () {
		return dojo.some(this.series, function (item) {
			return item.dirty;
		});
	}, performZoom:function (dim, offsets) {
		var vs = this._vAxis.scale || 1, hs = this._hAxis.scale || 1, vOffset = dim.height - offsets.b, hBounds = this._hScaler.bounds, xOffset = (hBounds.from - hBounds.lower) * hBounds.scale, vBounds = this._vScaler.bounds, yOffset = (vBounds.from - vBounds.lower) * vBounds.scale;
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
	}, render:function (dim, offsets) {
		return this;
	}, getRequiredColors:function () {
		return this.series.length;
	}, initializeScalers:function (dim, stats) {
		if (this._hAxis) {
			if (!this._hAxis.initialized()) {
				this._hAxis.calculate(stats.hmin, stats.hmax, dim.width);
			}
			this._hScaler = this._hAxis.getScaler();
		} else {
			this._hScaler = dojox.charting.scaler.primitive.buildScaler(stats.hmin, stats.hmax, dim.width);
		}
		if (this._vAxis) {
			if (!this._vAxis.initialized()) {
				this._vAxis.calculate(stats.vmin, stats.vmax, dim.height);
			}
			this._vScaler = this._vAxis.getScaler();
		} else {
			this._vScaler = dojox.charting.scaler.primitive.buildScaler(stats.vmin, stats.vmax, dim.height);
		}
		return this;
	}});
}

