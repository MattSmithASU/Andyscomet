/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.collections.Queue"]) {
	dojo._hasResource["dojox.collections.Queue"] = true;
	dojo.provide("dojox.collections.Queue");
	dojo.require("dojox.collections._base");
	dojox.collections.Queue = function (arr) {
		var q = [];
		if (arr) {
			q = q.concat(arr);
		}
		this.count = q.length;
		this.clear = function () {
			q = [];
			this.count = q.length;
		};
		this.clone = function () {
			return new dojox.collections.Queue(q);
		};
		this.contains = function (o) {
			for (var i = 0; i < q.length; i++) {
				if (q[i] == o) {
					return true;
				}
			}
			return false;
		};
		this.copyTo = function (arr, i) {
			arr.splice(i, 0, q);
		};
		this.dequeue = function () {
			var r = q.shift();
			this.count = q.length;
			return r;
		};
		this.enqueue = function (o) {
			this.count = q.push(o);
		};
		this.forEach = function (fn, scope) {
			dojo.forEach(q, fn, scope);
		};
		this.getIterator = function () {
			return new dojox.collections.Iterator(q);
		};
		this.peek = function () {
			return q[0];
		};
		this.toArray = function () {
			return [].concat(q);
		};
	};
}

