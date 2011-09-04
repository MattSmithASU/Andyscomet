/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.collections.Set"]) {
	dojo._hasResource["dojox.collections.Set"] = true;
	dojo.provide("dojox.collections.Set");
	dojo.require("dojox.collections.ArrayList");
	(function () {
		var dxc = dojox.collections;
		dxc.Set = new (function () {
			function conv(arr) {
				if (arr.constructor == Array) {
					return new dojox.collections.ArrayList(arr);
				}
				return arr;
			}
			this.union = function (setA, setB) {
				setA = conv(setA);
				setB = conv(setB);
				var result = new dojox.collections.ArrayList(setA.toArray());
				var e = setB.getIterator();
				while (!e.atEnd()) {
					var item = e.get();
					if (!result.contains(item)) {
						result.add(item);
					}
				}
				return result;
			};
			this.intersection = function (setA, setB) {
				setA = conv(setA);
				setB = conv(setB);
				var result = new dojox.collections.ArrayList();
				var e = setB.getIterator();
				while (!e.atEnd()) {
					var item = e.get();
					if (setA.contains(item)) {
						result.add(item);
					}
				}
				return result;
			};
			this.difference = function (setA, setB) {
				setA = conv(setA);
				setB = conv(setB);
				var result = new dojox.collections.ArrayList();
				var e = setA.getIterator();
				while (!e.atEnd()) {
					var item = e.get();
					if (!setB.contains(item)) {
						result.add(item);
					}
				}
				return result;
			};
			this.isSubSet = function (setA, setB) {
				setA = conv(setA);
				setB = conv(setB);
				var e = setA.getIterator();
				while (!e.atEnd()) {
					if (!setB.contains(e.get())) {
						return false;
					}
				}
				return true;
			};
			this.isSuperSet = function (setA, setB) {
				setA = conv(setA);
				setB = conv(setB);
				var e = setB.getIterator();
				while (!e.atEnd()) {
					if (!setA.contains(e.get())) {
						return false;
					}
				}
				return true;
			};
		})();
	})();
}

