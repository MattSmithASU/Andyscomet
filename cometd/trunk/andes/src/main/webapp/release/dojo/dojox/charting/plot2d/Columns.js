/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.Columns"]) {
	dojo._hasResource["dojox.charting.plot2d.Columns"] = true;
	dojo.provide("dojox.charting.plot2d.Columns");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.charting.plot2d.Base");
	dojo.require("dojox.gfx.fx");
	dojo.require("dojox.lang.utils");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.reversed");
	(function () {
		var df = dojox.lang.functional, du = dojox.lang.utils, dc = dojox.charting.plot2d.common, purgeGroup = df.lambda("item.purgeGroup()");
		dojo.declare("dojox.charting.plot2d.Columns", dojox.charting.plot2d.Base, {defaultParams:{hAxis:"x", vAxis:"y", gap:0, animate:null}, optionalParams:{minBarSize:1, maxBarSize:1, stroke:{}, outline:{}, shadow:{}, fill:{}, font:"", fontColor:""}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
			this.animate = this.opt.animate;
		}, getSeriesStats:function () {
			var stats = dc.collectSimpleStats(this.series);
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			return stats;
		}, render:function (dim, offsets) {
			if (this.zoom && !this.isDataDirty()) {
				return this.performZoom(dim, offsets);
			}
			this.resetEvents();
			this.dirty = this.isDirty();
			if (this.dirty) {
				dojo.forEach(this.series, purgeGroup);
				this._eventSeries = {};
				this.cleanGroup();
				var s = this.group;
				df.forEachRev(this.series, function (item) {
					item.cleanGroup(s);
				});
			}
			var t = this.chart.theme, f, gap, width, ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler), vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler), baseline = Math.max(0, this._vScaler.bounds.lower), baselineHeight = vt(baseline), events = this.events();
			f = dc.calculateBarSize(this._hScaler.bounds.scale, this.opt);
			gap = f.gap;
			width = f.size;
			for (var i = this.series.length - 1; i >= 0; --i) {
				var run = this.series[i];
				if (!this.dirty && !run.dirty) {
					t.skip();
					this._reconnectEvents(run.name);
					continue;
				}
				run.cleanGroup();
				var theme = t.next("column", [this.opt, run]), s = run.group, eventSeries = new Array(run.data.length);
				for (var j = 0; j < run.data.length; ++j) {
					var value = run.data[j];
					if (value !== null) {
						var v = typeof value == "number" ? value : value.y, vv = vt(v), height = vv - baselineHeight, h = Math.abs(height), finalTheme = typeof value != "number" ? t.addMixin(theme, "column", value, true) : t.post(theme, "column");
						if (width >= 1 && h >= 1) {
							var rect = {x:offsets.l + ht(j + 0.5) + gap, y:dim.height - offsets.b - (v > baseline ? vv : baselineHeight), width:width, height:h};
							var specialFill = this._plotFill(finalTheme.series.fill, dim, offsets);
							specialFill = this._shapeFill(specialFill, rect);
							var shape = s.createRect(rect).setFill(specialFill).setStroke(finalTheme.series.stroke);
							run.dyn.fill = shape.getFill();
							run.dyn.stroke = shape.getStroke();
							if (events) {
								var o = {element:"column", index:j, run:run, shape:shape, x:j + 0.5, y:v};
								this._connectEvents(o);
								eventSeries[j] = o;
							}
							if (this.animate) {
								this._animateColumn(shape, dim.height - offsets.b - baselineHeight, h);
							}
						}
					}
				}
				this._eventSeries[run.name] = eventSeries;
				run.dirty = false;
			}
			this.dirty = false;
			return this;
		}, _animateColumn:function (shape, voffset, vsize) {
			dojox.gfx.fx.animateTransform(dojo.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:[0, voffset - (voffset / vsize)], end:[0, 0]}, {name:"scale", start:[1, 1 / vsize], end:[1, 1]}, {name:"original"}]}, this.animate)).play();
		}});
	})();
}

