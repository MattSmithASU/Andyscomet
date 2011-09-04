/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.wire.ml.DataStore"]) {
	dojo._hasResource["dojox.wire.ml.DataStore"] = true;
	dojo.provide("dojox.wire.ml.DataStore");
	dojo.require("dijit._Widget");
	dojo.require("dojox.wire._base");
	dojo.declare("dojox.wire.ml.DataStore", dijit._Widget, {storeClass:"", postCreate:function () {
		this.store = this._createStore();
	}, _createStore:function () {
		if (!this.storeClass) {
			return null;
		}
		var storeClass = dojox.wire._getClass(this.storeClass);
		if (!storeClass) {
			return null;
		}
		var args = {};
		var attributes = this.domNode.attributes;
		for (var i = 0; i < attributes.length; i++) {
			var a = attributes.item(i);
			if (a.specified && !this[a.nodeName]) {
				args[a.nodeName] = a.nodeValue;
			}
		}
		return new storeClass(args);
	}, getFeatures:function () {
		return this.store.getFeatures();
	}, fetch:function (request) {
		return this.store.fetch(request);
	}, save:function (args) {
		this.store.save(args);
	}, newItem:function (args) {
		return this.store.newItem(args);
	}, deleteItem:function (item) {
		return this.store.deleteItem(item);
	}, revert:function () {
		return this.store.revert();
	}});
}

