/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.calc.Grapher"]) {
	dojo._hasResource["dojox.calc.Grapher"] = true;
	dojo.provide("dojox.calc.Grapher");
	dojo.require("dijit._Templated");
	dojo.require("dojox.math._base");
	dojo.require("dijit.dijit");
	dojo.require("dijit.form.DropDownButton");
	dojo.require("dijit.TooltipDialog");
	dojo.require("dijit.form.TextBox");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.ComboBox");
	dojo.require("dijit.form.Select");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dijit.ColorPalette");
	dojo.require("dojox.charting.Chart2D");
	dojo.require("dojox.charting.themes.Tufte");
	dojo.require("dojo.colors");
	dojo.experimental("dojox.calc.Grapher");
	dojo.declare("dojox.calc.Grapher", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dojox.calc", "templates/Grapher.html", "<div>\n<div dojoAttachPoint=\"chartsParent\" class=\"dojoxCalcChartHolder\"></div>\n<span dojoAttachPoint=\"outerDiv\">\n<div dojoType=\"dijit.form.DropDownButton\" dojoAttachPoint=\"windowOptions\" class=\"dojoxCalcDropDownForWindowOptions\" title=\"Window Options\">\n\t<div>Window Options</div>\n\t<div dojoType=\"dijit.TooltipDialog\" dojoAttachPoint=\"windowOptionsInside\" class=\"dojoxCalcTooltipDialogForWindowOptions\" title=\"\">\n\t\t<table class=\"dojoxCalcGraphOptionTable\">\n\t\t\t<tr>\n\t\t\t\t<td>\n\t\t\t\t\tWidth:\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<input dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"graphWidth\" class=\"dojoxCalcGraphWidth\" value=\"500\" />\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\tHeight:\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<input dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"graphHeight\" class=\"dojoxCalcGraphHeight\" value=\"500\" />\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t\t<tr>\n\t\t\t\t<td>\n\t\t\t\t\tX >=\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<input dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"graphMinX\" class=\"dojoxCalcGraphMinX\" value=\"-10\" />\n\t\t\t\t</td>\n\n\t\t\t\t<td>\n\t\t\t\t\tX <=\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<input dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"graphMaxX\" class=\"dojoxCalcGraphMaxX\" value=\"10\" />\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t\t<tr>\n\t\t\t\t<td>\n\t\t\t\t\tY >=\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<input dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"graphMinY\" class=\"dojoxCalcGraphMinY\" value=\"-10\" />\n\t\t\t\t</td>\n\n\t\t\t\t<td>\n\t\t\t\t\tY <=\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<input dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"graphMaxY\" class=\"dojoxCalcGraphMaxY\" value=\"10\" />\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t</table>\n\t</div>\n</div>\n\n<BR>\n\n<div class=\"dojoxCalcGrapherFuncOuterDiv\">\n\t<table class=\"dojoxCalcGrapherFuncTable\" dojoAttachPoint=\"graphTable\">\n\t</table>\n</div>\n\n<div dojoType=\"dijit.form.DropDownButton\" dojoAttachPoint='addFuncButton' class=\"dojoxCalcDropDownAddingFunction\">\n\t<div>Add Function</div>\n\t<div dojoType=\"dijit.TooltipDialog\" dojoAttachPoint=\"addFuncInside\" class=\"dojoxCalcTooltipDialogAddingFunction\" title=\"\">\n\t\t<table class=\"dojoxCalcGrapherModeTable\">\n\t\t\t<tr>\n\t\t\t\t<td>\n\t\t\t\t\tMode:\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<select dojoType=\"dijit.form.Select\" dojoAttachPoint=\"funcMode\" class=\"dojoxCalcFunctionModeSelector\">\n\t\t\t\t\t\t<option value=\"y=\" selected=\"selected\">y=</option>\n\t\t\t\t\t\t<option value=\"x=\">x=</option>\n\t\t\t\t\t</select>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t</tr>\n\t\n\t\t\t<tr>\n\t\t\t\t<td>\n\t\t\t\t\t<input dojoType=\"dijit.form.Button\" dojoAttachPoint=\"createFunc\" class=\"dojoxCalcAddFunctionButton\" label=\"Create\" />\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t</table>\n\t</div>\n</div>\n<BR>\n<BR>\n<table class=\"dijitInline dojoxCalcGrapherLayout\">\n\t<tr>\n\t\t<td class=\"dojoxCalcGrapherButtonContainer\">\n\t\t\t<input dojoType=\"dijit.form.Button\" class=\"dojoxCalcGrapherButton\" dojoAttachPoint='selectAllButton' label=\"Select All\" />\n\t\t</td>\n\t\t<td class=\"dojoxCalcGrapherButtonContainer\">\n\t\t\t<input dojoType=\"dijit.form.Button\" class=\"dojoxCalcGrapherButton\" dojoAttachPoint='deselectAllButton' label=\"Deselect All\" />\n\t\t</td>\n\t</tr>\n\t<tr>\n\t\t<td class=\"dojoxCalcGrapherButtonContainer\">\n\t\t\t<input dojoType=\"dijit.form.Button\" class=\"dojoxCalcGrapherButton\" dojoAttachPoint='drawButton'label=\"Draw Selected\" />\n\t\t</td>\n\t\t<td class=\"dojoxCalcGrapherButtonContainer\">\n\t\t\t<input dojoType=\"dijit.form.Button\" class=\"dojoxCalcGrapherButton\" dojoAttachPoint='eraseButton' label=\"Erase Selected\" />\n\t\t</td>\n\t</tr>\n\t<tr>\n\t\t<td class=\"dojoxCalcGrapherButtonContainer\">\n\t\t\t<input dojoType=\"dijit.form.Button\" class=\"dojoxCalcGrapherButton\" dojoAttachPoint='deleteButton' label=\"Delete Selected\" />\n\t\t</td>\n\t\t<td class=\"dojoxCalcGrapherButtonContainer\">\n\t\t\t<input dojoType=\"dijit.form.Button\" class=\"dojoxCalcGrapherButton\" dojoAttachPoint='closeButton' label=\"Close\" />\n\t\t</td>\n\t</tr>\n</table>\n</span>\n</div>\n"), widgetsInTemplate:true, addXYAxes:function (chart) {
		return chart.addAxis("x", {max:parseInt(this.graphMaxX.get("value")), min:parseInt(this.graphMinX.get("value")), majorLabels:true, minorLabels:true, minorTicks:false, microTicks:false, htmlLabels:true, labelFunc:function (value) {
			return value;
		}, maxLabelSize:30, fixUpper:"major", fixLower:"major", majorTick:{length:3}}).addAxis("y", {max:parseInt(this.graphMaxY.get("value")), min:parseInt(this.graphMinY.get("value")), labelFunc:function (value) {
			return value;
		}, maxLabelSize:50, vertical:true, microTicks:false, minorTicks:true, majorTick:{stroke:"black", length:3}});
	}, selectAll:function () {
		for (var i = 0; i < this.rowCount; i++) {
			this.array[i][this.checkboxIndex].set("checked", true);
		}
	}, deselectAll:function () {
		for (var i = 0; i < this.rowCount; i++) {
			this.array[i][this.checkboxIndex].set("checked", false);
		}
	}, drawOne:function (i) {
	}, onDraw:function () {
		console.log("Draw was pressed");
	}, erase:function (i) {
		var nameNum = 0;
		var name = "Series " + this.array[i][this.funcNumberIndex] + "_" + nameNum;
		while (name in this.array[i][this.chartIndex].runs) {
			this.array[i][this.chartIndex].removeSeries(name);
			nameNum++;
			name = "Series " + this.array[i][this.funcNumberIndex] + "_" + nameNum;
		}
		this.array[i][this.chartIndex].render();
		this.setStatus(i, "Hidden");
	}, onErase:function () {
		for (var i = 0; i < this.rowCount; i++) {
			if (this.array[i][this.checkboxIndex].get("checked")) {
				this.erase(i);
			}
		}
	}, onDelete:function () {
		for (var i = 0; i < this.rowCount; i++) {
			if (this.array[i][this.checkboxIndex].get("checked")) {
				this.erase(i);
				for (var k = 0; k < this.functionRef; k++) {
					if (this.array[i][k] && this.array[i][k]["destroy"]) {
						this.array[i][k].destroy();
					}
				}
				this.graphTable.deleteRow(i);
				this.array.splice(i, 1);
				this.rowCount--;
				i--;
			}
		}
	}, checkboxIndex:0, functionMode:1, expressionIndex:2, colorIndex:3, dropDownIndex:4, tooltipIndex:5, colorBoxFieldsetIndex:6, statusIndex:7, chartIndex:8, funcNumberIndex:9, evaluatedExpression:10, functionRef:11, createFunction:function () {
		var tr = this.graphTable.insertRow(-1);
		this.array[tr.rowIndex] = [];
		var td = tr.insertCell(-1);
		var d = dojo.create("div");
		td.appendChild(d);
		var checkBox = new dijit.form.CheckBox({}, d);
		this.array[tr.rowIndex][this.checkboxIndex] = checkBox;
		dojo.addClass(d, "dojoxCalcCheckBox");
		td = tr.insertCell(-1);
		var funcMode = this.funcMode.get("value");
		d = dojo.doc.createTextNode(funcMode);
		td.appendChild(d);
		this.array[tr.rowIndex][this.functionMode] = funcMode;
		td = tr.insertCell(-1);
		d = dojo.create("div");
		td.appendChild(d);
		var expression = new dijit.form.TextBox({}, d);
		this.array[tr.rowIndex][this.expressionIndex] = expression;
		dojo.addClass(d, "dojoxCalcExpressionBox");
		var b = dojo.create("div");
		var color = new dijit.ColorPalette({changedColor:this.changedColor}, b);
		dojo.addClass(b, "dojoxCalcColorPalette");
		this.array[tr.rowIndex][this.colorIndex] = color;
		var c = dojo.create("div");
		var dialog = new dijit.TooltipDialog({content:color}, c);
		this.array[tr.rowIndex][this.tooltipIndex] = dialog;
		dojo.addClass(c, "dojoxCalcContainerOfColor");
		td = tr.insertCell(-1);
		d = dojo.create("div");
		td.appendChild(d);
		var colorBoxFieldset = dojo.create("fieldset");
		dojo.style(colorBoxFieldset, {backgroundColor:"black", width:"1em", height:"1em", display:"inline"});
		this.array[tr.rowIndex][this.colorBoxFieldsetIndex] = colorBoxFieldset;
		var drop = new dijit.form.DropDownButton({label:"Color ", dropDown:dialog}, d);
		drop.containerNode.appendChild(colorBoxFieldset);
		this.array[tr.rowIndex][this.dropDownIndex] = drop;
		dojo.addClass(d, "dojoxCalcDropDownForColor");
		td = tr.insertCell(-1);
		d = dojo.create("fieldset");
		d.innerHTML = "Hidden";
		this.array[tr.rowIndex][this.statusIndex] = d;
		dojo.addClass(d, "dojoxCalcStatusBox");
		td.appendChild(d);
		d = dojo.create("div");
		dojo.style(d, {position:"absolute", left:"0px", top:"0px"});
		this.chartsParent.appendChild(d);
		this.array[tr.rowIndex][this.chartNodeIndex] = d;
		dojo.addClass(d, "dojoxCalcChart");
		var chart = new dojox.charting.Chart2D(d).setTheme(dojox.charting.themes.Tufte).addPlot("default", {type:"Lines", shadow:{dx:1, dy:1, width:2, color:[0, 0, 0, 0.3]}});
		this.addXYAxes(chart);
		this.array[tr.rowIndex][this.chartIndex] = chart;
		color.set("chart", chart);
		color.set("colorBox", colorBoxFieldset);
		color.set("onChange", dojo.hitch(color, "changedColor"));
		this.array[tr.rowIndex][this.funcNumberIndex] = this.funcNumber++;
		this.rowCount++;
	}, setStatus:function (i, status) {
		this.array[i][this.statusIndex].innerHTML = status;
	}, changedColor:function () {
		var chart = this.get("chart");
		var colorBoxFieldset = this.get("colorBox");
		for (var i = 0; i < chart.series.length; i++) {
			if (chart.series[i]["stroke"]) {
				if (chart.series[i].stroke["color"]) {
					chart.series[i]["stroke"].color = this.get("value");
					chart.dirty = true;
				}
			}
		}
		chart.render();
		dojo.style(colorBoxFieldset, {backgroundColor:this.get("value")});
	}, makeDirty:function () {
		this.dirty = true;
	}, checkDirty1:function () {
		setTimeout(dojo.hitch(this, "checkDirty"), 0);
	}, checkDirty:function () {
		if (this.dirty) {
			for (var i = 0; i < this.rowCount; i++) {
				this.array[i][this.chartIndex].removeAxis("x");
				this.array[i][this.chartIndex].removeAxis("y");
				this.addXYAxes(this.array[i][this.chartIndex]);
			}
			this.onDraw();
		}
		this.dirty = false;
	}, postCreate:function () {
		this.inherited(arguments);
		this.createFunc.set("onClick", dojo.hitch(this, "createFunction"));
		this.selectAllButton.set("onClick", dojo.hitch(this, "selectAll"));
		this.deselectAllButton.set("onClick", dojo.hitch(this, "deselectAll"));
		this.drawButton.set("onClick", dojo.hitch(this, "onDraw"));
		this.eraseButton.set("onClick", dojo.hitch(this, "onErase"));
		this.deleteButton.set("onClick", dojo.hitch(this, "onDelete"));
		this.dirty = false;
		this.graphWidth.set("onChange", dojo.hitch(this, "makeDirty"));
		this.graphHeight.set("onChange", dojo.hitch(this, "makeDirty"));
		this.graphMaxX.set("onChange", dojo.hitch(this, "makeDirty"));
		this.graphMinX.set("onChange", dojo.hitch(this, "makeDirty"));
		this.graphMaxY.set("onChange", dojo.hitch(this, "makeDirty"));
		this.graphMinY.set("onChange", dojo.hitch(this, "makeDirty"));
		this.windowOptionsInside.set("onClose", dojo.hitch(this, "checkDirty1"));
		this.funcNumber = 0;
		this.rowCount = 0;
		this.array = [];
	}, startup:function () {
		this.inherited(arguments);
		var parent = dijit.getEnclosingWidget(this.domNode.parentNode);
		if (parent && typeof parent.close == "function") {
			this.closeButton.set("onClick", dojo.hitch(parent, "close"));
		} else {
			dojo.style(this.closeButton.domNode, "display", "none");
		}
		this.createFunction();
		this.array[0][this.checkboxIndex].set("checked", true);
		this.onDraw();
		this.erase(0);
		this.array[0][this.expressionIndex].value = "";
	}});
	(function () {
		var epsilon = 1e-15 / 9, bigNumber = 1e+200, log2 = Math.log(2), defaultParams = {graphNumber:0, fOfX:true, color:{stroke:"black"}};
		dojox.calc.Grapher.draw = function (chart, functionToGraph, params) {
			params = dojo.mixin({}, defaultParams, params);
			chart.fullGeometry();
			var x;
			var y;
			var points;
			if (params.fOfX == true) {
				x = "x";
				y = "y";
				points = dojox.calc.Grapher.generatePoints(functionToGraph, x, y, chart.axes.x.scaler.bounds.span, chart.axes.x.scaler.bounds.lower, chart.axes.x.scaler.bounds.upper, chart.axes.y.scaler.bounds.lower, chart.axes.y.scaler.bounds.upper);
			} else {
				x = "y";
				y = "x";
				points = dojox.calc.Grapher.generatePoints(functionToGraph, x, y, chart.axes.y.scaler.bounds.span, chart.axes.y.scaler.bounds.lower, chart.axes.y.scaler.bounds.upper, chart.axes.x.scaler.bounds.lower, chart.axes.x.scaler.bounds.upper);
			}
			var i = 0;
			if (points.length > 0) {
				for (; i < points.length; i++) {
					if (points[i].length > 0) {
						chart.addSeries("Series " + params.graphNumber + "_" + i, points[i], params.color);
					}
				}
			}
			var name = "Series " + params.graphNumber + "_" + i;
			while (name in chart.runs) {
				chart.removeSeries(name);
				i++;
				name = "Series " + params.graphNumber + "_" + i;
			}
			chart.render();
			return points;
		};
		dojox.calc.Grapher.generatePoints = function (funcToGraph, x, y, width, minX, maxX, minY, maxY) {
			var pow2 = (1 << Math.ceil(Math.log(width) / log2));
			var dx = (maxX - minX) / pow2, points = [], series = 0, slopeTrend, slopeTrendTemp;
			points[series] = [];
			var i = minX, k, p;
			for (var counter = 0; counter <= pow2; i += dx, counter++) {
				p = {};
				p[x] = i;
				p[y] = funcToGraph({_name:x, _value:i, _graphing:true});
				if (p[x] == null || p[y] == null) {
					return {};
				}
				if (isNaN(p[y]) || isNaN(p[x])) {
					continue;
				}
				points[series].push(p);
				if (points[series].length == 3) {
					slopeTrend = getSlopePairTrend(slope(points[series][points[series].length - 3], points[series][points[series].length - 2]), slope(points[series][points[series].length - 2], points[series][points[series].length - 1]));
					continue;
				}
				if (points[series].length < 4) {
					continue;
				}
				slopeTrendTemp = getSlopePairTrend(slope(points[series][points[series].length - 3], points[series][points[series].length - 2]), slope(points[series][points[series].length - 2], points[series][points[series].length - 1]));
				if (slopeTrend.inc != slopeTrendTemp.inc || slopeTrend.pos != slopeTrendTemp.pos) {
					var a = asymptoteSearch(funcToGraph, points[series][points[series].length - 3], points[series][points[series].length - 1]);
					p = points[series].pop();
					points[series].pop();
					for (var j = 0; j < a[0].length; j++) {
						points[series].push(a[0][j]);
					}
					for (k = 1; k < a.length; k++) {
						points[++series] = a.pop();
					}
					points[series].push(p);
					slopeTrend = slopeTrendTemp;
				}
			}
			while (points.length > 1) {
				for (k = 0; k < points[1].length; k++) {
					if (points[0][points[0].length - 1][x] == points[1][k][x]) {
						continue;
					}
					points[0].push(points[1][k]);
				}
				points.splice(1, 1);
			}
			points = points[0];
			var s = 0;
			var points2 = [[]];
			for (k = 0; k < points.length; k++) {
				var x1, y1, b, slope1;
				if (isNaN(points[k][y]) || isNaN(points[k][x])) {
					while (isNaN(points[k][y]) || isNaN(points[k][x])) {
						points.splice(k, 1);
					}
					points2[++s] = [];
					k--;
				} else {
					if (points[k][y] > maxY || points[k][y] < minY) {
						if (k > 0 && points[k - 1].y != minY && points[k - 1].y != maxY) {
							slope1 = slope(points[k - 1], points[k]);
							if (slope1 > bigNumber) {
								slope1 = bigNumber;
							} else {
								if (slope1 < -bigNumber) {
									slope1 = -bigNumber;
								}
							}
							if (points[k][y] > maxY) {
								y1 = maxY;
							} else {
								y1 = minY;
							}
							b = points[k][y] - slope1 * points[k][x];
							x1 = (y1 - b) / slope1;
							p = {};
							p[x] = x1;
							p[y] = funcToGraph(x1);
							if (p[y] != y1) {
								p = findMinOrMaxY(funcToGraph, points[k - 1], points[k], y1);
							}
							points2[s].push(p);
							points2[++s] = [];
						}
						var startK = k;
						while (k < points.length && (points[k][y] > maxY || points[k][y] < minY)) {
							k++;
						}
						if (k >= points.length) {
							if (points2[s].length == 0) {
								points2.splice(s, 1);
							}
							break;
						}
						if (k > 0 && points[k].y != minY && points[k].y != maxY) {
							slope1 = slope(points[k - 1], points[k]);
							if (slope1 > bigNumber) {
								slope1 = bigNumber;
							} else {
								if (slope1 < -bigNumber) {
									slope1 = -bigNumber;
								}
							}
							if (points[k - 1][y] > maxY) {
								y1 = maxY;
							} else {
								y1 = minY;
							}
							b = points[k][y] - slope1 * points[k][x];
							x1 = (y1 - b) / slope1;
							p = {};
							p[x] = x1;
							p[y] = funcToGraph(x1);
							if (p[y] != y1) {
								p = findMinOrMaxY(funcToGraph, points[k - 1], points[k], y1);
							}
							points2[s].push(p);
							points2[s].push(points[k]);
						}
					} else {
						points2[s].push(points[k]);
					}
				}
			}
			return points2;
			function findMinOrMaxY(funcToGraph, left, right, minMaxY) {
				while (left <= right) {
					var midX = (left[x] + right[x]) / 2;
					var mid = {};
					mid[x] = midX;
					mid[y] = funcToGraph(mid[x]);
					if (minMaxY == mid[y] || mid[x] == right[x] || mid[x] == left[x]) {
						return mid;
					}
					var moveTowardsLarger = true;
					if (minMaxY < mid[y]) {
						moveTowardsLarger = false;
					}
					if (mid[y] < right[y]) {
						if (moveTowardsLarger) {
							left = mid;
						} else {
							right = mid;
						}
					} else {
						if (mid[y] < left[y]) {
							if (!moveTowardsLarger) {
								left = mid;
							} else {
								right = mid;
							}
						}
					}
				}
				return NaN;
			}
			function asymptoteSearch(funcToGraph, pointStart, pointStop) {
				var pointTemp = [[], []], left = pointStart, right = pointStop, midpoint;
				while (left[x] <= right[x]) {
					var midX = (left[x] + right[x]) / 2;
					midpoint = {};
					midpoint[x] = midX;
					midpoint[y] = funcToGraph(midX);
					var rx = nextNumber(midpoint[x]);
					var rightPoint = {};
					rightPoint[x] = rx;
					rightPoint[y] = funcToGraph(rx);
					if (Math.abs(rightPoint[y]) >= Math.abs(midpoint[y])) {
						pointTemp[0].push(midpoint);
						left = rightPoint;
					} else {
						pointTemp[1].unshift(midpoint);
						if (right[x] == midpoint[x]) {
							break;
						}
						right = midpoint;
					}
				}
				return pointTemp;
			}
			function getSlopePairTrend(slope1, slope2) {
				var isInc = false, isPos = false;
				if (slope1 < slope2) {
					isInc = true;
				}
				if (slope2 > 0) {
					isPos = true;
				}
				return {inc:isInc, pos:isPos};
			}
			function nextNumber(v) {
				var delta;
				if (v > -1 && v < 1) {
					if (v < 0) {
						if (v >= -epsilon) {
							delta = -v;
						} else {
							delta = v / Math.ceil(v / epsilon);
						}
					} else {
						delta = epsilon;
					}
				} else {
					delta = Math.abs(v) * epsilon;
				}
				return v + delta;
			}
			function slope(p1, p2) {
				return (p2[y] - p1[y]) / (p2[x] - p1[x]);
			}
		};
	})();
}

