/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.widget.SelectableLegend"]) {
	dojo._hasResource["dojox.charting.widget.SelectableLegend"] = true;
	dojo.provide("dojox.charting.widget.SelectableLegend");
	dojo.require("dojox.charting.widget.Legend");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dojox.charting.action2d.Highlight");
	(function () {
		var df = dojox.lang.functional;
		dojo.declare("dojox.charting.widget.SelectableLegend", [dojox.charting.widget.Legend], {outline:false, transitionFill:null, transitionStroke:null, postCreate:function () {
			this.legends = [];
			this.legendAnim = {};
			this.inherited(arguments);
		}, refresh:function () {
			this.legends = [];
			this.inherited(arguments);
			this._applyEvents();
			new dojox.charting.widget._FocusManager(this);
		}, _addLabel:function (dyn, label) {
			this.inherited(arguments);
			var legendNodes = dojo.query("td", this.legendBody);
			var currentLegendNode = legendNodes[legendNodes.length - 1];
			this.legends.push(currentLegendNode);
			var checkbox = new dijit.form.CheckBox({checked:true});
			dojo.place(checkbox.domNode, currentLegendNode, "first");
			var label = dojo.query("label", currentLegendNode)[0];
			dojo.attr(label, "for", checkbox.id);
		}, _applyEvents:function () {
			dojo.forEach(this.legends, function (legend, i) {
				var targetData, shapes = [], plotName, seriesName;
				if (this._isPie()) {
					targetData = this.chart.stack[0];
					shapes.push(targetData.group.children[i]);
					plotName = targetData.name;
					seriesName = this.chart.series[0].name;
				} else {
					targetData = this.chart.series[i];
					shapes = targetData.group.children;
					plotName = targetData.plot;
					seriesName = targetData.name;
				}
				var originalDyn = {fills:df.map(shapes, "x.getFill()"), strokes:df.map(shapes, "x.getStroke()")};
				var legendCheckBox = dojo.query(".dijitCheckBox", legend)[0];
				dojo.connect(legendCheckBox, "onclick", this, function (e) {
					this._toggle(shapes, i, legend.vanished, originalDyn, seriesName, plotName);
					legend.vanished = !legend.vanished;
					e.stopPropagation();
				});
				var legendIcon = dojo.query(".dojoxLegendIcon", legend)[0], iconShape = this._getFilledShape(this._surfaces[i].children);
				dojo.forEach(["onmouseenter", "onmouseleave"], function (event) {
					dojo.connect(legendIcon, event, this, function (e) {
						this._highlight(e, iconShape, shapes, i, legend.vanished, originalDyn, seriesName, plotName);
					});
				}, this);
			}, this);
		}, _toggle:function (shapes, index, isOff, dyn, seriesName, plotName) {
			dojo.forEach(shapes, function (shape, i) {
				var startFill = dyn.fills[i], endFill = this._getTransitionFill(plotName), startStroke = dyn.strokes[i], endStroke = this.transitionStroke;
				if (startFill) {
					if (endFill && (typeof startFill == "string" || startFill instanceof dojo.Color)) {
						dojox.gfx.fx.animateFill({shape:shape, color:{start:isOff ? endFill : startFill, end:isOff ? startFill : endFill}}).play();
					} else {
						shape.setFill(isOff ? startFill : endFill);
					}
				}
				if (startStroke && !this.outline) {
					shape.setStroke(isOff ? startStroke : endStroke);
				}
			}, this);
		}, _highlight:function (e, iconShape, shapes, index, isOff, dyn, seriesName, plotName) {
			if (!isOff) {
				var anim = this._getAnim(plotName), isPie = this._isPie(), type = formatEventType(e.type);
				var label = {shape:iconShape, index:isPie ? "legend" + index : "legend", run:{name:seriesName}, type:type};
				anim.process(label);
				dojo.forEach(shapes, function (shape, i) {
					shape.setFill(dyn.fills[i]);
					var o = {shape:shape, index:isPie ? index : i, run:{name:seriesName}, type:type};
					anim.duration = 100;
					anim.process(o);
				});
			}
		}, _getAnim:function (plotName) {
			if (!this.legendAnim[plotName]) {
				this.legendAnim[plotName] = new dojox.charting.action2d.Highlight(this.chart, plotName);
			}
			return this.legendAnim[plotName];
		}, _getTransitionFill:function (plotName) {
			if (this.chart.stack[this.chart.plots[plotName]].declaredClass.indexOf("dojox.charting.plot2d.Stacked") != -1) {
				return this.chart.theme.plotarea.fill;
			}
			return null;
		}, _getFilledShape:function (shapes) {
			var i = 0;
			while (shapes[i]) {
				if (shapes[i].getFill()) {
					return shapes[i];
				}
				i++;
			}
		}, _isPie:function () {
			return this.chart.stack[0].declaredClass == "dojox.charting.plot2d.Pie";
		}});
		function formatEventType(type) {
			if (type == "mouseenter") {
				return "onmouseover";
			}
			if (type == "mouseleave") {
				return "onmouseout";
			}
			return "on" + type;
		}
		dojo.declare("dojox.charting.widget._FocusManager", null, {constructor:function (legend) {
			this.legend = legend;
			this.index = 0;
			this.horizontalLength = this._getHrizontalLength();
			dojo.forEach(legend.legends, function (item, i) {
				if (i > 0) {
					dojo.query("input", item).attr("tabindex", -1);
				}
			});
			this.firstLabel = dojo.query("input", legend.legends[0])[0];
			dojo.connect(this.firstLabel, "focus", this, function () {
				this.legend.active = true;
			});
			dojo.connect(this.legend.legendNode, "keydown", this, "_onKeyEvent");
		}, _getHrizontalLength:function () {
			var horizontal = this.legend.horizontal;
			if (typeof horizontal == "number") {
				return Math.min(horizontal, this.legend.legends.length);
			} else {
				if (!horizontal) {
					return 1;
				} else {
					return this.legend.legends.length;
				}
			}
		}, _onKeyEvent:function (e) {
			if (!this.legend.active) {
				return;
			}
			if (e.keyCode == dojo.keys.TAB) {
				this.legend.active = false;
				return;
			}
			var max = this.legend.legends.length;
			switch (e.keyCode) {
			  case dojo.keys.LEFT_ARROW:
				this.index--;
				if (this.index < 0) {
					this.index += max;
				}
				break;
			  case dojo.keys.RIGHT_ARROW:
				this.index++;
				if (this.index >= max) {
					this.index -= max;
				}
				break;
			  case dojo.keys.UP_ARROW:
				if (this.index - this.horizontalLength >= 0) {
					this.index -= this.horizontalLength;
				}
				break;
			  case dojo.keys.DOWN_ARROW:
				if (this.index + this.horizontalLength < max) {
					this.index += this.horizontalLength;
				}
				break;
			  default:
				return;
			}
			this._moveToFocus();
			dojo.stopEvent(e);
		}, _moveToFocus:function () {
			dojo.query("input", this.legend.legends[this.index])[0].focus();
		}});
	})();
}

