/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.oo.Filter"]) {
	dojo._hasResource["dojox.lang.oo.Filter"] = true;
	dojo.provide("dojox.lang.oo.Filter");
	(function () {
		var oo = dojox.lang.oo, F = oo.Filter = function (bag, filter) {
			this.bag = bag;
			this.filter = typeof filter == "object" ? function () {
				return filter.exec.apply(filter, arguments);
			} : filter;
		}, MapFilter = function (map) {
			this.map = map;
		};
		MapFilter.prototype.exec = function (name) {
			return this.map.hasOwnProperty(name) ? this.map[name] : name;
		};
		oo.filter = function (bag, map) {
			return new F(bag, new MapFilter(map));
		};
	})();
}

