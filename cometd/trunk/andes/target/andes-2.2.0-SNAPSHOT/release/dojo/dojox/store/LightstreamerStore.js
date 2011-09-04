/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.store.LightstreamerStore"]) {
	dojo._hasResource["dojox.store.LightstreamerStore"] = true;
	dojo.provide("dojox.store.LightstreamerStore");
	dojo.require("dojo.store.util.QueryResults");
	var nextId = 0;
	function translate(id, updateInfo, schema, o) {
		o = o || {};
		dojo.forEach(schema, function (field) {
			o[field] = updateInfo.getNewValue(field);
		});
		if (!("id" in o)) {
			o["id"] = id;
		}
		return o;
	}
	dojo.declare("dojox.store.LightstreamerStore", [], {_index:{}, pushPage:null, group:[], schema:[], constructor:function (pushPage, group, schema, dataAdapter) {
		this.pushPage = pushPage;
		this.group = group;
		this.schema = schema;
		this.dataAdapter = dataAdapter || "DEFAULT";
	}, query:function (query, options) {
		options = options || {};
		var results = new dojo.Deferred(), snapshotReceived, resultsArray = [], self = this, id = "store-" + nextId++, pushPage = this.pushPage, table = new NonVisualTable(this.group, this.schema, query);
		if (!("dataAdapter" in options) && this.dataAdapter) {
			table.setDataAdapter(this.dataAdapter);
		}
		for (var prop in options) {
			var setter = "set" + prop.charAt(0).toUpperCase() + prop.slice(1);
			if (setter in table && dojo.isFunction(table[setter])) {
				table[setter][(dojo.isArray(options[prop]) ? "apply" : "call")](table, options[prop]);
			}
		}
		table.onItemUpdate = function (id, updateInfo) {
			var obj = translate(id, updateInfo, self.schema, self._index[id]);
			var newObject;
			if (!self._index[id]) {
				newObject = true;
				self._index[id] = obj;
				if (!snapshotReceived) {
					resultsArray.push(obj);
				}
			}
			table[snapshotReceived ? "onPostSnapShot" : "onPreSnapShot"](obj, newObject);
		};
		if (query == "MERGE" || options.snapshotRequired === false) {
			snapshotReceived = true;
			results.resolve(resultsArray);
		} else {
			table.onEndOfSnapshot = function () {
				snapshotReceived = true;
				results.resolve(resultsArray);
			};
		}
		table.onPreSnapShot = function () {
		};
		table.onPostSnapShot = function () {
		};
		results = dojo.store.util.QueryResults(results);
		var foreachHandler;
		results.forEach = function (callback) {
			foreachHandler = dojo.connect(table, "onPreSnapShot", callback);
		};
		var observeHandler;
		results.observe = function (listener) {
			observeHandler = dojo.connect(table, "onPostSnapShot", function (object, newObject) {
				listener.call(results, object, newObject ? -1 : undefined);
			});
		};
		results.close = function () {
			if (foreachHandler) {
				dojo.disconnect(foreachHandler);
			}
			if (observeHandler) {
				dojo.disconnect(observeHandler);
			}
			pushPage.removeTable(id);
			table = null;
		};
		pushPage.addTable(table, id);
		return results;
	}, get:function (id) {
		return this._index[id];
	}});
}

