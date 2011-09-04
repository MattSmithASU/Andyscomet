/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.collections.Dictionary"]) {
	dojo._hasResource["dojox.collections.Dictionary"] = true;
	dojo.provide("dojox.collections.Dictionary");
	dojo.require("dojox.collections._base");
	dojox.collections.Dictionary = function (dictionary) {
		var items = {};
		this.count = 0;
		var testObject = {};
		this.add = function (k, v) {
			var b = (k in items);
			items[k] = new dojox.collections.DictionaryEntry(k, v);
			if (!b) {
				this.count++;
			}
		};
		this.clear = function () {
			items = {};
			this.count = 0;
		};
		this.clone = function () {
			return new dojox.collections.Dictionary(this);
		};
		this.contains = this.containsKey = function (k) {
			if (testObject[k]) {
				return false;
			}
			return (items[k] != null);
		};
		this.containsValue = function (v) {
			var e = this.getIterator();
			while (e.get()) {
				if (e.element.value == v) {
					return true;
				}
			}
			return false;
		};
		this.entry = function (k) {
			return items[k];
		};
		this.forEach = function (fn, scope) {
			var a = [];
			for (var p in items) {
				if (!testObject[p]) {
					a.push(items[p]);
				}
			}
			dojo.forEach(a, fn, scope);
		};
		this.getKeyList = function () {
			return (this.getIterator()).map(function (entry) {
				return entry.key;
			});
		};
		this.getValueList = function () {
			return (this.getIterator()).map(function (entry) {
				return entry.value;
			});
		};
		this.item = function (k) {
			if (k in items) {
				return items[k].valueOf();
			}
			return undefined;
		};
		this.getIterator = function () {
			return new dojox.collections.DictionaryIterator(items);
		};
		this.remove = function (k) {
			if (k in items && !testObject[k]) {
				delete items[k];
				this.count--;
				return true;
			}
			return false;
		};
		if (dictionary) {
			var e = dictionary.getIterator();
			while (e.get()) {
				this.add(e.element.key, e.element.value);
			}
		}
	};
}

