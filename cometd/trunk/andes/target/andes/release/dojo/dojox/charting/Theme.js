/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.Theme"]) {
	dojo._hasResource["dojox.charting.Theme"] = true;
	dojo.provide("dojox.charting.Theme");
	dojo.require("dojox.color");
	dojo.require("dojox.color.Palette");
	dojo.require("dojox.lang.utils");
	dojo.require("dojox.gfx.gradutils");
	dojo.declare("dojox.charting.Theme", null, {shapeSpaces:{shape:1, shapeX:1, shapeY:1}, constructor:function (kwArgs) {
		kwArgs = kwArgs || {};
		var def = dojox.charting.Theme.defaultTheme;
		dojo.forEach(["chart", "plotarea", "axis", "series", "marker"], function (name) {
			this[name] = dojo.delegate(def[name], kwArgs[name]);
		}, this);
		if (kwArgs.seriesThemes && kwArgs.seriesThemes.length) {
			this.colors = null;
			this.seriesThemes = kwArgs.seriesThemes.slice(0);
		} else {
			this.seriesThemes = null;
			this.colors = (kwArgs.colors || dojox.charting.Theme.defaultColors).slice(0);
		}
		this.markerThemes = null;
		if (kwArgs.markerThemes && kwArgs.markerThemes.length) {
			this.markerThemes = kwArgs.markerThemes.slice(0);
		}
		this.markers = kwArgs.markers ? dojo.clone(kwArgs.markers) : dojo.delegate(dojox.charting.Theme.defaultMarkers);
		this.noGradConv = kwArgs.noGradConv;
		this.noRadialConv = kwArgs.noRadialConv;
		if (kwArgs.reverseFills) {
			this.reverseFills();
		}
		this._current = 0;
		this._buildMarkerArray();
	}, clone:function () {
		var theme = new dojox.charting.Theme({chart:this.chart, plotarea:this.plotarea, axis:this.axis, series:this.series, marker:this.marker, colors:this.colors, markers:this.markers, seriesThemes:this.seriesThemes, markerThemes:this.markerThemes, noGradConv:this.noGradConv, noRadialConv:this.noRadialConv});
		dojo.forEach(["clone", "clear", "next", "skip", "addMixin", "post", "getTick"], function (name) {
			if (this.hasOwnProperty(name)) {
				theme[name] = this[name];
			}
		}, this);
		return theme;
	}, clear:function () {
		this._current = 0;
	}, next:function (elementType, mixin, doPost) {
		var merge = dojox.lang.utils.merge, series, marker;
		if (this.colors) {
			series = dojo.delegate(this.series);
			marker = dojo.delegate(this.marker);
			var color = new dojo.Color(this.colors[this._current % this.colors.length]), old;
			if (series.stroke && series.stroke.color) {
				series.stroke = dojo.delegate(series.stroke);
				old = new dojo.Color(series.stroke.color);
				series.stroke.color = new dojo.Color(color);
				series.stroke.color.a = old.a;
			} else {
				series.stroke = {color:color};
			}
			if (marker.stroke && marker.stroke.color) {
				marker.stroke = dojo.delegate(marker.stroke);
				old = new dojo.Color(marker.stroke.color);
				marker.stroke.color = new dojo.Color(color);
				marker.stroke.color.a = old.a;
			} else {
				marker.stroke = {color:color};
			}
			if (!series.fill || series.fill.type) {
				series.fill = color;
			} else {
				old = new dojo.Color(series.fill);
				series.fill = new dojo.Color(color);
				series.fill.a = old.a;
			}
			if (!marker.fill || marker.fill.type) {
				marker.fill = color;
			} else {
				old = new dojo.Color(marker.fill);
				marker.fill = new dojo.Color(color);
				marker.fill.a = old.a;
			}
		} else {
			series = this.seriesThemes ? merge(this.series, this.seriesThemes[this._current % this.seriesThemes.length]) : this.series;
			marker = this.markerThemes ? merge(this.marker, this.markerThemes[this._current % this.markerThemes.length]) : series;
		}
		var symbol = marker && marker.symbol || this._markers[this._current % this._markers.length];
		var theme = {series:series, marker:marker, symbol:symbol};
		++this._current;
		if (mixin) {
			theme = this.addMixin(theme, elementType, mixin);
		}
		if (doPost) {
			theme = this.post(theme, elementType);
		}
		return theme;
	}, skip:function () {
		++this._current;
	}, addMixin:function (theme, elementType, mixin, doPost) {
		if (dojo.isArray(mixin)) {
			dojo.forEach(mixin, function (m) {
				theme = this.addMixin(theme, elementType, m);
			}, this);
		} else {
			var t = {};
			if ("color" in mixin) {
				if (elementType == "line" || elementType == "area") {
					dojo.setObject("series.stroke.color", mixin.color, t);
					dojo.setObject("marker.stroke.color", mixin.color, t);
				} else {
					dojo.setObject("series.fill", mixin.color, t);
				}
			}
			dojo.forEach(["stroke", "outline", "shadow", "fill", "font", "fontColor", "labelWiring"], function (name) {
				var markerName = "marker" + name.charAt(0).toUpperCase() + name.substr(1), b = markerName in mixin;
				if (name in mixin) {
					dojo.setObject("series." + name, mixin[name], t);
					if (!b) {
						dojo.setObject("marker." + name, mixin[name], t);
					}
				}
				if (b) {
					dojo.setObject("marker." + name, mixin[markerName], t);
				}
			});
			if ("marker" in mixin) {
				t.symbol = mixin.marker;
			}
			theme = dojox.lang.utils.merge(theme, t);
		}
		if (doPost) {
			theme = this.post(theme, elementType);
		}
		return theme;
	}, post:function (theme, elementType) {
		var fill = theme.series.fill, t;
		if (!this.noGradConv && this.shapeSpaces[fill.space] && fill.type == "linear") {
			if (elementType == "bar") {
				t = {x1:fill.y1, y1:fill.x1, x2:fill.y2, y2:fill.x2};
			} else {
				if (!this.noRadialConv && fill.space == "shape" && (elementType == "slice" || elementType == "circle")) {
					t = {type:"radial", cx:0, cy:0, r:100};
				}
			}
			if (t) {
				return dojox.lang.utils.merge(theme, {series:{fill:t}});
			}
		}
		return theme;
	}, getTick:function (name, mixin) {
		var tick = this.axis.tick, tickName = name + "Tick";
		merge = dojox.lang.utils.merge;
		if (tick) {
			if (this.axis[tickName]) {
				tick = merge(tick, this.axis[tickName]);
			}
		} else {
			tick = this.axis[tickName];
		}
		if (mixin) {
			if (tick) {
				if (mixin[tickName]) {
					tick = merge(tick, mixin[tickName]);
				}
			} else {
				tick = mixin[tickName];
			}
		}
		return tick;
	}, inspectObjects:function (f) {
		dojo.forEach(["chart", "plotarea", "axis", "series", "marker"], function (name) {
			f(this[name]);
		}, this);
		if (this.seriesThemes) {
			dojo.forEach(this.seriesThemes, f);
		}
		if (this.markerThemes) {
			dojo.forEach(this.markerThemes, f);
		}
	}, reverseFills:function () {
		this.inspectObjects(function (o) {
			if (o && o.fill) {
				o.fill = dojox.gfx.gradutils.reverse(o.fill);
			}
		});
	}, addMarker:function (name, segment) {
		this.markers[name] = segment;
		this._buildMarkerArray();
	}, setMarkers:function (obj) {
		this.markers = obj;
		this._buildMarkerArray();
	}, _buildMarkerArray:function () {
		this._markers = [];
		for (var p in this.markers) {
			this._markers.push(this.markers[p]);
		}
	}});
	dojo.mixin(dojox.charting.Theme, {defaultMarkers:{CIRCLE:"m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0", SQUARE:"m-3,-3 l0,6 6,0 0,-6 z", DIAMOND:"m0,-3 l3,3 -3,3 -3,-3 z", CROSS:"m0,-3 l0,6 m-3,-3 l6,0", X:"m-3,-3 l6,6 m0,-6 l-6,6", TRIANGLE:"m-3,3 l3,-6 3,6 z", TRIANGLE_INVERTED:"m-3,-3 l3,6 3,-6 z"}, defaultColors:["#54544c", "#858e94", "#6e767a", "#948585", "#474747"], defaultTheme:{chart:{stroke:null, fill:"white", pageStyle:null, titleGap:20, titlePos:"top", titleFont:"normal normal bold 14pt Tahoma", titleFontColor:"#333"}, plotarea:{stroke:null, fill:"white"}, axis:{stroke:{color:"#333", width:1}, tick:{color:"#666", position:"center", font:"normal normal normal 7pt Tahoma", fontColor:"#333", titleGap:15, titleFont:"normal normal normal 11pt Tahoma", titleFontColor:"#333", titleOrientation:"axis"}, majorTick:{width:1, length:6}, minorTick:{width:0.8, length:3}, microTick:{width:0.5, length:1}}, series:{stroke:{width:1.5, color:"#333"}, outline:{width:0.1, color:"#ccc"}, shadow:null, fill:"#ccc", font:"normal normal normal 8pt Tahoma", fontColor:"#000", labelWiring:{width:1, color:"#ccc"}}, marker:{stroke:{width:1.5, color:"#333"}, outline:{width:0.1, color:"#ccc"}, shadow:null, fill:"#ccc", font:"normal normal normal 8pt Tahoma", fontColor:"#000"}}, defineColors:function (kwArgs) {
		kwArgs = kwArgs || {};
		var c = [], n = kwArgs.num || 5;
		if (kwArgs.colors) {
			var l = kwArgs.colors.length;
			for (var i = 0; i < n; i++) {
				c.push(kwArgs.colors[i % l]);
			}
			return c;
		}
		if (kwArgs.hue) {
			var s = kwArgs.saturation || 100;
			var st = kwArgs.low || 30;
			var end = kwArgs.high || 90;
			var l = (end + st) / 2;
			return dojox.color.Palette.generate(dojox.color.fromHsv(kwArgs.hue, s, l), "monochromatic").colors;
		}
		if (kwArgs.generator) {
			return dojox.color.Palette.generate(kwArgs.base, kwArgs.generator).colors;
		}
		return c;
	}, generateGradient:function (fillPattern, colorFrom, colorTo) {
		var fill = dojo.delegate(fillPattern);
		fill.colors = [{offset:0, color:colorFrom}, {offset:1, color:colorTo}];
		return fill;
	}, generateHslColor:function (color, luminance) {
		color = new dojox.color.Color(color);
		var hsl = color.toHsl(), result = dojox.color.fromHsl(hsl.h, hsl.s, luminance);
		result.a = color.a;
		return result;
	}, generateHslGradient:function (color, fillPattern, lumFrom, lumTo) {
		color = new dojox.color.Color(color);
		var hsl = color.toHsl(), colorFrom = dojox.color.fromHsl(hsl.h, hsl.s, lumFrom), colorTo = dojox.color.fromHsl(hsl.h, hsl.s, lumTo);
		colorFrom.a = colorTo.a = color.a;
		return dojox.charting.Theme.generateGradient(fillPattern, colorFrom, colorTo);
	}});
}

