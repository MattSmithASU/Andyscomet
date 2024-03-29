/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.storage.BehaviorStorageProvider"]) {
	dojo._hasResource["dojox.storage.BehaviorStorageProvider"] = true;
	dojo.provide("dojox.storage.BehaviorStorageProvider");
	dojo.require("dojox.storage.Provider");
	dojo.require("dojox.storage.manager");
	dojo.declare("dojox.storage.BehaviorStorageProvider", [dojox.storage.Provider], {store:null, storeName:"__dojox_BehaviorStorage", keys:[], initialize:function () {
		try {
			this.store = this._createStore();
			this.store.load(this.storeName);
		}
		catch (e) {
			throw new Error("Store is not available: " + e);
		}
		var keys = this.get("keys", "dojoxSystemNS");
		this.keys = keys || [];
		this.initialized = true;
		dojox.storage.manager.loaded();
	}, isAvailable:function () {
		return dojo.isIE && dojo.isIE >= 5;
	}, _createStore:function () {
		var storeNode = dojo.create("link", {id:this.storeName + "Node", style:{"display":"none"}}, dojo.query("head")[0]);
		storeNode.addBehavior("#default#userdata");
		return storeNode;
	}, put:function (key, value, resultsHandler, namespace) {
		this._assertIsValidKey(key);
		namespace = namespace || this.DEFAULT_NAMESPACE;
		this._assertIsValidNamespace(namespace);
		var fullKey = this.getFullKey(key, namespace);
		value = dojo.toJson(value);
		this.store.setAttribute(fullKey, value);
		this.store.save(this.storeName);
		var success = this.store.getAttribute(fullKey) === value;
		if (success) {
			this._addKey(fullKey);
			this.store.setAttribute("__dojoxSystemNS_keys", dojo.toJson(this.keys));
			this.store.save(this.storeName);
		}
		if (resultsHandler) {
			resultsHandler(success ? this.SUCCESS : this.FAILED, key, null, namespace);
		}
	}, get:function (key, namespace) {
		this._assertIsValidKey(key);
		namespace = namespace || this.DEFAULT_NAMESPACE;
		this._assertIsValidNamespace(namespace);
		key = this.getFullKey(key, namespace);
		return dojo.fromJson(this.store.getAttribute(key));
	}, getKeys:function (namespace) {
		namespace = namespace || this.DEFAULT_NAMESPACE;
		this._assertIsValidNamespace(namespace);
		namespace = "__" + namespace + "_";
		var keys = [];
		for (var i = 0; i < this.keys.length; i++) {
			var currentKey = this.keys[i];
			if (this._beginsWith(currentKey, namespace)) {
				currentKey = currentKey.substring(namespace.length);
				keys.push(currentKey);
			}
		}
		return keys;
	}, clear:function (namespace) {
		namespace = namespace || this.DEFAULT_NAMESPACE;
		this._assertIsValidNamespace(namespace);
		namespace = "__" + namespace + "_";
		var keys = [];
		for (var i = 0; i < this.keys.length; i++) {
			var currentKey = this.keys[i];
			if (this._beginsWith(currentKey, namespace)) {
				keys.push(currentKey);
			}
		}
		dojo.forEach(keys, function (key) {
			this.store.removeAttribute(key);
			this._removeKey(key);
		}, this);
		this.put("keys", this.keys, null, "dojoxSystemNS");
		this.store.save(this.storeName);
	}, remove:function (key, namespace) {
		this._assertIsValidKey(key);
		namespace = namespace || this.DEFAULT_NAMESPACE;
		this._assertIsValidNamespace(namespace);
		key = this.getFullKey(key, namespace);
		this.store.removeAttribute(key);
		this._removeKey(key);
		this.put("keys", this.keys, null, "dojoxSystemNS");
		this.store.save(this.storeName);
	}, getNamespaces:function () {
		var results = [this.DEFAULT_NAMESPACE];
		var found = {};
		found[this.DEFAULT_NAMESPACE] = true;
		var tester = /^__([^_]*)_/;
		for (var i = 0; i < this.keys.length; i++) {
			var currentKey = this.keys[i];
			if (tester.test(currentKey) == true) {
				var currentNS = currentKey.match(tester)[1];
				if (typeof found[currentNS] == "undefined") {
					found[currentNS] = true;
					results.push(currentNS);
				}
			}
		}
		return results;
	}, isPermanent:function () {
		return true;
	}, getMaximumSize:function () {
		return 64;
	}, hasSettingsUI:function () {
		return false;
	}, isValidKey:function (keyName) {
		if (keyName === null || keyName === undefined) {
			return false;
		}
		return /^[0-9A-Za-z_-]*$/.test(keyName);
	}, isValidNamespace:function (keyName) {
		if (keyName === null || keyName === undefined) {
			return false;
		}
		return /^[0-9A-Za-z-]*$/.test(keyName);
	}, getFullKey:function (key, namespace) {
		return "__" + namespace + "_" + key;
	}, _beginsWith:function (haystack, needle) {
		if (needle.length > haystack.length) {
			return false;
		}
		return haystack.substring(0, needle.length) === needle;
	}, _assertIsValidNamespace:function (namespace) {
		if (this.isValidNamespace(namespace) === false) {
			throw new Error("Invalid namespace given: " + namespace);
		}
	}, _assertIsValidKey:function (key) {
		if (this.isValidKey(key) === false) {
			throw new Error("Invalid key given: " + key);
		}
	}, _addKey:function (key) {
		this._removeKey(key);
		this.keys.push(key);
	}, _removeKey:function (key) {
		this.keys = dojo.filter(this.keys, function (item) {
			return item !== key;
		}, this);
	}});
	dojox.storage.manager.register("dojox.storage.BehaviorStorageProvider", new dojox.storage.BehaviorStorageProvider());
}

