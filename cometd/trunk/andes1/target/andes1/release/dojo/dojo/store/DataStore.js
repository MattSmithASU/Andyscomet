/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.DataStore"]) {
	dojo._hasResource["dojo.store.DataStore"] = true;
	dojo.provide("dojo.store.DataStore");
	dojo.require("dojo.store.util.QueryResults");
	dojo.declare("dojo.store.DataStore", null, {target:"", constructor:function (options) {
		dojo.mixin(this, options);
	}, store:null, _objectConverter:function (callback) {
		var store = this.store;
		return function (item) {
			var object = {};
			var attributes = store.getAttributes(item);
			for (var i = 0; i < attributes.length; i++) {
				object[attributes[i]] = store.getValue(item, attributes[i]);
			}
			return callback(object);
		};
	}, get:function (id, options) {
		var returnedObject, returnedError;
		var deferred = new dojo.Deferred();
		this.store.fetchItemByIdentity({identity:id, onItem:this._objectConverter(function (object) {
			deferred.resolve(returnedObject = object);
		}), onError:function (error) {
			deferred.reject(returnedError = error);
		}});
		if (returnedObject) {
			return returnedObject;
		}
		if (returnedError) {
			throw returnedError;
		}
		return deferred.promise;
	}, put:function (object, options) {
		var id = options && typeof options.id != "undefined" || this.getIdentity(object);
		var store = this.store;
		if (typeof id == "undefined") {
			store.newItem(object);
		} else {
			store.fetchItemByIdentity({identity:id, onItem:function (item) {
				if (item) {
					for (var i in object) {
						if (store.getValue(item, i) != object[i]) {
							store.setValue(item, i, object[i]);
						}
					}
				} else {
					store.newItem(object);
				}
			}});
		}
	}, remove:function (id) {
		var store = this.store;
		this.store.fetchItemByIdentity({identity:id, onItem:function (item) {
			store.deleteItem(item);
		}});
	}, query:function (query, options) {
		var returnedObject, returnedError;
		var deferred = new dojo.Deferred();
		deferred.total = new dojo.Deferred();
		var converter = this._objectConverter(function (object) {
			return object;
		});
		this.store.fetch(dojo.mixin({query:query, onBegin:function (count) {
			deferred.total.resolve(count);
		}, onComplete:function (results) {
			deferred.resolve(dojo.map(results, converter));
		}, onError:function (error) {
			deferred.reject(error);
		}}, options));
		return dojo.store.util.QueryResults(deferred);
	}, getIdentity:function (object) {
		return object[this.idProperty || this.store.getIdentityAttributes()[0]];
	}});
}

