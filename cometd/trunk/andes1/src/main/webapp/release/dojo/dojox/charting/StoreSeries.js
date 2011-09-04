/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.StoreSeries"]) {
	dojo._hasResource["dojox.charting.StoreSeries"] = true;
	dojo.provide("dojox.charting.StoreSeries");
	dojo.declare("dojox.charting.StoreSeries", null, {constructor:function (store, kwArgs, value) {
		this.store = store;
		this.kwArgs = kwArgs;
		if (value) {
			if (typeof value == "function") {
				this.value = value;
			} else {
				if (typeof value == "object") {
					this.value = function (object) {
						var o = {};
						for (var key in value) {
							o[key] = object[value[key]];
						}
						return o;
					};
				} else {
					this.value = function (object) {
						return object[value];
					};
				}
			}
		} else {
			this.value = function (object) {
				return object.value;
			};
		}
		this.data = [];
		this.fetch();
	}, destroy:function () {
		if (this.observeHandle) {
			this.observeHandle.dismiss();
		}
	}, setSeriesObject:function (series) {
		this.series = series;
	}, fetch:function () {
		var objects = this.objects = [];
		var self = this;
		if (this.observeHandle) {
			this.observeHandle.dismiss();
		}
		var results = this.store.query(this.kwArgs.query, this.kwArgs);
		dojo.when(results, function (objects) {
			self.objects = objects;
			update();
		});
		if (results.observe) {
			this.observeHandle = results.observe(update, true);
		}
		function update() {
			self.data = dojo.map(self.objects, function (object) {
				return self.value(object, self.store);
			});
			self._pushDataChanges();
		}
	}, _pushDataChanges:function () {
		if (this.series) {
			this.series.chart.updateSeries(this.series.name, this);
			this.series.chart.delayedRender();
		}
	}});
}

