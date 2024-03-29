/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.collections.ArrayList"]) {
	dojo._hasResource["dojox.collections.ArrayList"] = true;
	dojo.provide("dojox.collections.ArrayList");
	dojo.require("dojox.collections._base");
	dojox.collections.ArrayList = function (arr) {
		var items = [];
		if (arr) {
			items = items.concat(arr);
		}
		this.count = items.length;
		this.add = function (obj) {
			items.push(obj);
			this.count = items.length;
		};
		this.addRange = function (a) {
			if (a.getIterator) {
				var e = a.getIterator();
				while (!e.atEnd()) {
					this.add(e.get());
				}
				this.count = items.length;
			} else {
				for (var i = 0; i < a.length; i++) {
					items.push(a[i]);
				}
				this.count = items.length;
			}
		};
		this.clear = function () {
			items.splice(0, items.length);
			this.count = 0;
		};
		this.clone = function () {
			return new dojox.collections.ArrayList(items);
		};
		this.contains = function (obj) {
			for (var i = 0; i < items.length; i++) {
				if (items[i] == obj) {
					return true;
				}
			}
			return false;
		};
		this.forEach = function (fn, scope) {
			dojo.forEach(items, fn, scope);
		};
		this.getIterator = function () {
			return new dojox.collections.Iterator(items);
		};
		this.indexOf = function (obj) {
			for (var i = 0; i < items.length; i++) {
				if (items[i] == obj) {
					return i;
				}
			}
			return -1;
		};
		this.insert = function (i, obj) {
			items.splice(i, 0, obj);
			this.count = items.length;
		};
		this.item = function (i) {
			return items[i];
		};
		this.remove = function (obj) {
			var i = this.indexOf(obj);
			if (i >= 0) {
				items.splice(i, 1);
			}
			this.count = items.length;
		};
		this.removeAt = function (i) {
			items.splice(i, 1);
			this.count = items.length;
		};
		this.reverse = function () {
			items.reverse();
		};
		this.sort = function (fn) {
			if (fn) {
				items.sort(fn);
			} else {
				items.sort();
			}
		};
		this.setByIndex = function (i, obj) {
			items[i] = obj;
			this.count = items.length;
		};
		this.toArray = function () {
			return [].concat(items);
		};
		this.toString = function (delim) {
			return items.join((delim || ","));
		};
	};
}

