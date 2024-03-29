/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.Bars"]) {
	dojo._hasResource["dojox.charting.plot2d.Bars"] = true;
	dojo.provide("dojox.charting.plot2d.Bars");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.charting.plot2d.Base");
	dojo.require("dojox.gfx.fx");
	dojo.require("dojox.lang.utils");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.reversed");
	(function () {
		var df = dojox.lang.functional, du = dojox.lang.utils, dc = dojox.charting.plot2d.common, purgeGroup = df.lambda("item.purgeGroup()");
		dojo.declare("dojox.charting.plot2d.Bars", dojox.charting.plot2d.Base, {defaultParams:{hAxis:"x", vAxis:"y", gap:0, animate:null}, optionalParams:{minBarSize:1, maxBarSize:1, stroke:{}, outline:{}, shadow:{}, fill:{}, font:"", fontColor:""}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
			this.animate = this.opt.animate;
		}, getSeriesStats:function () {
			var stats = dc.collectSimpleStats(this.series), t;
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			t = stats.hmin, stats.hmin = stats.vmin, stats.vmin = t;
			t = stats.hmax, stats.hmax = stats.vmax, stats.vmax = t;
			return stats;
		}, render:function (dim, offsets) {
			if (this.zoom && !this.isDataDirty()) {
				return this.performZoom(dim, offsets);
			}
			this.dirty = this.isDirty();
			this.resetEvents();
			if (this.dirty) {
				dojo.forEach(this.series, purgeGroup);
				this._eventSeries = {};
				this.cleanGroup();
				var s = this.group;
				df.forEachRev(this.series, function (item) {
					item.cleanGroup(s);
				});
			}
			var t = this.chart.theme, f, gap, height, ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler), vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler), baseline = Math.max(0, this._hScaler.bounds.lower), baselineWidth = ht(baseline), events = this.events();
			f = dc.calculateBarSize(this._vScaler.bounds.scale, this.opt);
			gap = f.gap;
			height = f.size;
			for (var i = this.series.length - 1; i >= 0; --i) {
				var run = this.series[i];
				if (!this.dirty && !run.dirty) {
					t.skip();
					this._reconnectEvents(run.name);
					continue;
				}
				run.cleanGroup();
				var theme = t.next("bar", [this.opt, run]), s = run.group, eventSeries = new Array(run.data.length);
				for (var j = 0; j < run.data.length; ++j) {
					var value = run.data[j];
					if (value !== null) {
						var v = typeof value == "number" ? value : value.y, hv = ht(v), width = hv - baselineWidth, w = Math.abs(width), finalTheme = typeof value != "number" ? t.addMixin(theme, "bar", value, true) : t.post(theme, "bar");
						if (w >= 1 && height >= 1) {
							var rect = {x:offsets.l + (v < baseline ? hv : baselineWidth), y:dim.height - offsets.b - vt(j + 1.5) + gap, width:w, height:height};
							var specialFill = this._plotFill(finalTheme.series.fill, dim, offsets);
							specialFill = this._shapeFill(specialFill, rect);
							var shape = s.createRect(rect).setFill(specialFill).setStroke(finalTheme.series.stroke);
							run.dyn.fill = shape.getFill();
							run.dyn.stroke = shape.getStroke();
							if (events) {
								var o = {element:"bar", index:j, run:run, shape:shape, x:v, y:j + 1.5};
								this._connectEvents(o);
								eventSeries[j] = o;
							}
							if (this.animate) {
								this._animateBar(shape, offsets.l + baselineWidth, -w);
							}
						}
					}
				}
				this._eventSeries[run.name] = eventSeries;
				run.dirty = false;
			}
			this.dirty = false;
			return this;
		}, _animateBar:function (shape, hoffset, hsize) {
			dojox.gfx.fx.animateTransform(dojo.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:[hoffset - (hoffset / hsize), 0], end:[0, 0]}, {name:"scale", start:[1 / hsize, 1], end:[1, 1]}, {name:"original"}]}, this.animate)).play();
		}});
	})();
}

