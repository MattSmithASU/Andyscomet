/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.DataChart"]) {
	dojo._hasResource["dojox.charting.DataChart"] = true;
	dojo.provide("dojox.charting.DataChart");
	dojo.require("dojox.charting.Chart2D");
	dojo.require("dojox.charting.themes.PlotKit.blue");
	dojo.experimental("dojox.charting.DataChart");
	(function () {
		var _yaxis = {vertical:true, min:0, max:10, majorTickStep:5, minorTickStep:1, natural:false, stroke:"black", majorTick:{stroke:"black", length:8}, minorTick:{stroke:"gray", length:2}, majorLabels:true};
		var _xaxis = {natural:true, majorLabels:true, includeZero:false, majorTickStep:1, majorTick:{stroke:"black", length:8}, fixUpper:"major", stroke:"black", htmlLabels:true, from:1};
		var chartPlot = {markers:true, tension:2, gap:2};
		dojo.declare("dojox.charting.DataChart", [dojox.charting.Chart2D], {scroll:true, comparative:false, query:"*", queryOptions:"", fieldName:"value", chartTheme:dojox.charting.themes.PlotKit.blue, displayRange:0, stretchToFit:true, minWidth:200, minHeight:100, showing:true, label:"name", constructor:function (node, kwArgs) {
			this.domNode = dojo.byId(node);
			dojo.mixin(this, kwArgs);
			this.xaxis = dojo.mixin(dojo.mixin({}, _xaxis), kwArgs.xaxis);
			if (this.xaxis.labelFunc == "seriesLabels") {
				this.xaxis.labelFunc = dojo.hitch(this, "seriesLabels");
			}
			this.yaxis = dojo.mixin(dojo.mixin({}, _yaxis), kwArgs.yaxis);
			if (this.yaxis.labelFunc == "seriesLabels") {
				this.yaxis.labelFunc = dojo.hitch(this, "seriesLabels");
			}
			this._events = [];
			this.convertLabels(this.yaxis);
			this.convertLabels(this.xaxis);
			this.onSetItems = {};
			this.onSetInterval = 0;
			this.dataLength = 0;
			this.seriesData = {};
			this.seriesDataBk = {};
			this.firstRun = true;
			this.dataOffset = 0;
			this.chartTheme.plotarea.stroke = {color:"gray", width:3};
			this.setTheme(this.chartTheme);
			if (this.displayRange) {
				this.stretchToFit = false;
			}
			if (!this.stretchToFit) {
				this.xaxis.to = this.displayRange;
			}
			this.addAxis("x", this.xaxis);
			this.addAxis("y", this.yaxis);
			chartPlot.type = kwArgs.type || "Markers";
			this.addPlot("default", dojo.mixin(chartPlot, kwArgs.chartPlot));
			this.addPlot("grid", dojo.mixin(kwArgs.grid || {}, {type:"Grid", hMinorLines:true}));
			if (this.showing) {
				this.render();
			}
			if (kwArgs.store) {
				this.setStore(kwArgs.store, kwArgs.query, kwArgs.fieldName, kwArgs.queryOptions);
			}
		}, destroy:function () {
			dojo.forEach(this._events, dojo.disconnect);
			this.inherited(arguments);
		}, setStore:function (store, query, fieldName, queryOptions) {
			this.firstRun = true;
			this.store = store || this.store;
			this.query = query || this.query;
			this.fieldName = fieldName || this.fieldName;
			this.label = this.store.getLabelAttributes();
			this.queryOptions = queryOptions || queryOptions;
			dojo.forEach(this._events, dojo.disconnect);
			this._events = [dojo.connect(this.store, "onSet", this, "onSet"), dojo.connect(this.store, "onError", this, "onError")];
			this.fetch();
		}, show:function () {
			if (!this.showing) {
				dojo.style(this.domNode, "display", "");
				this.showing = true;
				this.render();
			}
		}, hide:function () {
			if (this.showing) {
				dojo.style(this.domNode, "display", "none");
				this.showing = false;
			}
		}, onSet:function (item) {
			var nm = this.getProperty(item, this.label);
			if (nm in this.runs || this.comparative) {
				clearTimeout(this.onSetInterval);
				if (!this.onSetItems[nm]) {
					this.onSetItems[nm] = item;
				}
				this.onSetInterval = setTimeout(dojo.hitch(this, function () {
					clearTimeout(this.onSetInterval);
					var items = [];
					for (var nm in this.onSetItems) {
						items.push(this.onSetItems[nm]);
					}
					this.onData(items);
					this.onSetItems = {};
				}), 200);
			}
		}, onError:function (err) {
			console.error("DataChart Error:", err);
		}, onDataReceived:function (items) {
		}, getProperty:function (item, prop) {
			if (prop == this.label) {
				return this.store.getLabel(item);
			}
			if (prop == "id") {
				return this.store.getIdentity(item);
			}
			var value = this.store.getValues(item, prop);
			if (value.length < 2) {
				value = this.store.getValue(item, prop);
			}
			return value;
		}, onData:function (items) {
			if (!items || !items.length) {
				return;
			}
			if (this.items && this.items.length != items.length) {
				dojo.forEach(items, function (m) {
					var id = this.getProperty(m, "id");
					dojo.forEach(this.items, function (m2, i) {
						if (this.getProperty(m2, "id") == id) {
							this.items[i] = m2;
						}
					}, this);
				}, this);
				items = this.items;
			}
			if (this.stretchToFit) {
				this.displayRange = items.length;
			}
			this.onDataReceived(items);
			this.items = items;
			if (this.comparative) {
				var nm = "default";
				this.seriesData[nm] = [];
				this.seriesDataBk[nm] = [];
				dojo.forEach(items, function (m, i) {
					var field = this.getProperty(m, this.fieldName);
					this.seriesData[nm].push(field);
				}, this);
			} else {
				dojo.forEach(items, function (m, i) {
					var nm = this.store.getLabel(m);
					if (!this.seriesData[nm]) {
						this.seriesData[nm] = [];
						this.seriesDataBk[nm] = [];
					}
					var field = this.getProperty(m, this.fieldName);
					if (dojo.isArray(field)) {
						this.seriesData[nm] = field;
					} else {
						if (!this.scroll) {
							var ar = dojo.map(new Array(i + 1), function () {
								return 0;
							});
							ar.push(Number(field));
							this.seriesData[nm] = ar;
						} else {
							if (this.seriesDataBk[nm].length > this.seriesData[nm].length) {
								this.seriesData[nm] = this.seriesDataBk[nm];
							}
							this.seriesData[nm].push(Number(field));
						}
						this.seriesDataBk[nm].push(Number(field));
					}
				}, this);
			}
			var displayData;
			if (this.firstRun) {
				this.firstRun = false;
				for (nm in this.seriesData) {
					this.addSeries(nm, this.seriesData[nm]);
					displayData = this.seriesData[nm];
				}
			} else {
				for (nm in this.seriesData) {
					displayData = this.seriesData[nm];
					if (this.scroll && displayData.length > this.displayRange) {
						this.dataOffset = displayData.length - this.displayRange - 1;
						displayData = displayData.slice(displayData.length - this.displayRange, displayData.length);
					}
					this.updateSeries(nm, displayData);
				}
			}
			this.dataLength = displayData.length;
			if (this.showing) {
				this.render();
			}
		}, fetch:function () {
			if (!this.store) {
				return;
			}
			this.store.fetch({query:this.query, queryOptions:this.queryOptions, start:this.start, count:this.count, sort:this.sort, onComplete:dojo.hitch(this, function (data) {
				setTimeout(dojo.hitch(this, function () {
					this.onData(data);
				}), 0);
			}), onError:dojo.hitch(this, "onError")});
		}, convertLabels:function (axis) {
			if (!axis.labels || dojo.isObject(axis.labels[0])) {
				return null;
			}
			axis.labels = dojo.map(axis.labels, function (ele, i) {
				return {value:i, text:ele};
			});
			return null;
		}, seriesLabels:function (val) {
			val--;
			if (this.series.length < 1 || (!this.comparative && val > this.series.length)) {
				return "-";
			}
			if (this.comparative) {
				return this.store.getLabel(this.items[val]);
			} else {
				for (var i = 0; i < this.series.length; i++) {
					if (this.series[i].data[val] > 0) {
						return this.series[i].name;
					}
				}
			}
			return "-";
		}, resizeChart:function (dim) {
			var w = Math.max(dim.w, this.minWidth);
			var h = Math.max(dim.h, this.minHeight);
			this.resize(w, h);
		}});
	})();
}

