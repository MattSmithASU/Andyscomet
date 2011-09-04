/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.axis2d.Invisible"]) {
	dojo._hasResource["dojox.charting.axis2d.Invisible"] = true;
	dojo.provide("dojox.charting.axis2d.Invisible");
	dojo.require("dojox.charting.scaler.linear");
	dojo.require("dojox.charting.axis2d.common");
	dojo.require("dojox.charting.axis2d.Base");
	dojo.require("dojo.string");
	dojo.require("dojox.gfx");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.utils");
	(function () {
		var dc = dojox.charting, df = dojox.lang.functional, du = dojox.lang.utils, g = dojox.gfx, lin = dc.scaler.linear, merge = du.merge, labelGap = 4, centerAnchorLimit = 45;
		dojo.declare("dojox.charting.axis2d.Invisible", dojox.charting.axis2d.Base, {defaultParams:{vertical:false, fixUpper:"none", fixLower:"none", natural:false, leftBottom:true, includeZero:false, fixed:true, majorLabels:true, minorTicks:true, minorLabels:true, microTicks:false, rotation:0}, optionalParams:{min:0, max:1, from:0, to:1, majorTickStep:4, minorTickStep:2, microTickStep:1, labels:[], labelFunc:null, maxLabelSize:0, maxLabelCharCount:0, trailingSymbol:null}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
		}, dependOnData:function () {
			return !("min" in this.opt) || !("max" in this.opt);
		}, clear:function () {
			delete this.scaler;
			delete this.ticks;
			this.dirty = true;
			return this;
		}, initialized:function () {
			return "scaler" in this && !(this.dirty && this.dependOnData());
		}, setWindow:function (scale, offset) {
			this.scale = scale;
			this.offset = offset;
			return this.clear();
		}, getWindowScale:function () {
			return "scale" in this ? this.scale : 1;
		}, getWindowOffset:function () {
			return "offset" in this ? this.offset : 0;
		}, _groupLabelWidth:function (labels, font, wcLimit) {
			if (!labels.length) {
				return 0;
			}
			if (dojo.isObject(labels[0])) {
				labels = df.map(labels, function (label) {
					return label.text;
				});
			}
			if (wcLimit) {
				labels = df.map(labels, function (label) {
					return dojo.trim(label).length == 0 ? "" : label.substring(0, wcLimit) + this.trailingSymbol;
				}, this);
			}
			var s = labels.join("<br>");
			return dojox.gfx._base._getTextBox(s, {font:font}).w || 0;
		}, calculate:function (min, max, span, labels) {
			if (this.initialized()) {
				return this;
			}
			var o = this.opt;
			this.labels = "labels" in o ? o.labels : labels;
			this.scaler = lin.buildScaler(min, max, span, o);
			var tsb = this.scaler.bounds;
			if ("scale" in this) {
				o.from = tsb.lower + this.offset;
				o.to = (tsb.upper - tsb.lower) / this.scale + o.from;
				if (!isFinite(o.from) || isNaN(o.from) || !isFinite(o.to) || isNaN(o.to) || o.to - o.from >= tsb.upper - tsb.lower) {
					delete o.from;
					delete o.to;
					delete this.scale;
					delete this.offset;
				} else {
					if (o.from < tsb.lower) {
						o.to += tsb.lower - o.from;
						o.from = tsb.lower;
					} else {
						if (o.to > tsb.upper) {
							o.from += tsb.upper - o.to;
							o.to = tsb.upper;
						}
					}
					this.offset = o.from - tsb.lower;
				}
				this.scaler = lin.buildScaler(min, max, span, o);
				tsb = this.scaler.bounds;
				if (this.scale == 1 && this.offset == 0) {
					delete this.scale;
					delete this.offset;
				}
			}
			var ta = this.chart.theme.axis, labelWidth = 0, rotation = o.rotation % 360, taFont = o.font || (ta.majorTick && ta.majorTick.font) || (ta.tick && ta.tick.font), size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0, cosr = Math.abs(Math.cos(rotation * Math.PI / 180)), sinr = Math.abs(Math.sin(rotation * Math.PI / 180));
			if (rotation < 0) {
				rotation += 360;
			}
			if (size) {
				if (this.vertical ? rotation != 0 && rotation != 180 : rotation != 90 && rotation != 270) {
					if (this.labels) {
						labelWidth = this._groupLabelWidth(this.labels, taFont, o.maxLabelCharCount);
					} else {
						var labelLength = Math.ceil(Math.log(Math.max(Math.abs(tsb.from), Math.abs(tsb.to))) / Math.LN10), t = [];
						if (tsb.from < 0 || tsb.to < 0) {
							t.push("-");
						}
						t.push(dojo.string.rep("9", labelLength));
						var precision = Math.floor(Math.log(tsb.to - tsb.from) / Math.LN10);
						if (precision > 0) {
							t.push(".");
							t.push(dojo.string.rep("9", precision));
						}
						labelWidth = dojox.gfx._base._getTextBox(t.join(""), {font:taFont}).w;
					}
					labelWidth = o.maxLabelSize ? Math.min(o.maxLabelSize, labelWidth) : labelWidth;
				} else {
					labelWidth = size;
				}
				switch (rotation) {
				  case 0:
				  case 90:
				  case 180:
				  case 270:
					break;
				  default:
					var gap1 = Math.sqrt(labelWidth * labelWidth + size * size), gap2 = this.vertical ? size * cosr + labelWidth * sinr : labelWidth * cosr + size * sinr;
					labelWidth = Math.min(gap1, gap2);
					break;
				}
			}
			this.scaler.minMinorStep = labelWidth + labelGap;
			this.ticks = lin.buildTicks(this.scaler, o);
			return this;
		}, getScaler:function () {
			return this.scaler;
		}, getTicks:function () {
			return this.ticks;
		}});
	})();
}

