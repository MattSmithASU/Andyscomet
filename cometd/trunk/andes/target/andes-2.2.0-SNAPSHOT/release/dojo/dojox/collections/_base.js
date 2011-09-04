/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.collections._base"]) {
	dojo._hasResource["dojox.collections._base"] = true;
	dojo.provide("dojox.collections._base");
	dojox.collections.DictionaryEntry = function (k, v) {
		this.key = k;
		this.value = v;
		this.valueOf = function () {
			return this.value;
		};
		this.toString = function () {
			return String(this.value);
		};
	};
	dojox.collections.Iterator = function (arr) {
		var a = arr;
		var position = 0;
		this.element = a[position] || null;
		this.atEnd = function () {
			return (position >= a.length);
		};
		this.get = function () {
			if (this.atEnd()) {
				return null;
			}
			this.element = a[position++];
			return this.element;
		};
		this.map = function (fn, scope) {
			return dojo.map(a, fn, scope);
		};
		this.reset = function () {
			position = 0;
			this.element = a[position];
		};
	};
	dojox.collections.DictionaryIterator = function (obj) {
		var a = [];
		var testObject = {};
		for (var p in obj) {
			if (!testObject[p]) {
				a.push(obj[p]);
			}
		}
		var position = 0;
		this.element = a[position] || null;
		this.atEnd = function () {
			return (position >= a.length);
		};
		this.get = function () {
			if (this.atEnd()) {
				return null;
			}
			this.element = a[position++];
			return this.element;
		};
		this.map = function (fn, scope) {
			return dojo.map(a, fn, scope);
		};
		this.reset = function () {
			position = 0;
			this.element = a[position];
		};
	};
}

