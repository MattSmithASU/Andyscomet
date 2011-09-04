/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.DataSeries"]) {
	dojo._hasResource["dojox.charting.DataSeries"] = true;
	dojo.provide("dojox.charting.DataSeries");
	dojo.require("dojox.lang.functional");
	dojo.declare("dojox.charting.DataSeries", null, {constructor:function (store, kwArgs, value) {
		this.store = store;
		this.kwArgs = kwArgs;
		if (value) {
			if (dojo.isFunction(value)) {
				this.value = value;
			} else {
				if (dojo.isObject(value)) {
					this.value = dojo.hitch(this, "_dictValue", dojox.lang.functional.keys(value), value);
				} else {
					this.value = dojo.hitch(this, "_fieldValue", value);
				}
			}
		} else {
			this.value = dojo.hitch(this, "_defaultValue");
		}
		this.data = [];
		this._events = [];
		if (this.store.getFeatures()["dojo.data.api.Notification"]) {
			this._events.push(dojo.connect(this.store, "onNew", this, "_onStoreNew"), dojo.connect(this.store, "onDelete", this, "_onStoreDelete"), dojo.connect(this.store, "onSet", this, "_onStoreSet"));
		}
		this.fetch();
	}, destroy:function () {
		dojo.forEach(this._events, dojo.disconnect);
	}, setSeriesObject:function (series) {
		this.series = series;
	}, _dictValue:function (keys, dict, store, item) {
		var o = {};
		dojo.forEach(keys, function (key) {
			o[key] = store.getValue(item, dict[key]);
		});
		return o;
	}, _fieldValue:function (field, store, item) {
		return store.getValue(item, field);
	}, _defaultValue:function (store, item) {
		return store.getValue(item, "value");
	}, fetch:function () {
		if (!this._inFlight) {
			this._inFlight = true;
			var kwArgs = dojo.delegate(this.kwArgs);
			kwArgs.onComplete = dojo.hitch(this, "_onFetchComplete");
			kwArgs.onError = dojo.hitch(this, "onFetchError");
			this.store.fetch(kwArgs);
		}
	}, _onFetchComplete:function (items, request) {
		this.items = items;
		this._buildItemMap();
		this.data = dojo.map(this.items, function (item) {
			return this.value(this.store, item);
		}, this);
		this._pushDataChanges();
		this._inFlight = false;
	}, onFetchError:function (errorData, request) {
		this._inFlight = false;
	}, _buildItemMap:function () {
		if (this.store.getFeatures()["dojo.data.api.Identity"]) {
			var itemMap = {};
			dojo.forEach(this.items, function (item, index) {
				itemMap[this.store.getIdentity(item)] = index;
			}, this);
			this.itemMap = itemMap;
		}
	}, _pushDataChanges:function () {
		if (this.series) {
			this.series.chart.updateSeries(this.series.name, this);
			this.series.chart.delayedRender();
		}
	}, _onStoreNew:function () {
		this.fetch();
	}, _onStoreDelete:function (item) {
		if (this.items) {
			var flag = dojo.some(this.items, function (it, index) {
				if (it === item) {
					this.items.splice(index, 1);
					this._buildItemMap();
					this.data.splice(index, 1);
					return true;
				}
				return false;
			}, this);
			if (flag) {
				this._pushDataChanges();
			}
		}
	}, _onStoreSet:function (item) {
		if (this.itemMap) {
			var id = this.store.getIdentity(item), index = this.itemMap[id];
			if (typeof index == "number") {
				this.data[index] = this.value(this.store, this.items[index]);
				this._pushDataChanges();
			}
		} else {
			if (this.items) {
				var flag = dojo.some(this.items, function (it, index) {
					if (it === item) {
						this.data[index] = this.value(this.store, it);
						return true;
					}
					return false;
				}, this);
				if (flag) {
					this._pushDataChanges();
				}
			}
		}
	}});
}

