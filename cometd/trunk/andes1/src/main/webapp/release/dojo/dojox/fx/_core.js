/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx._core"]) {
	dojo._hasResource["dojox.fx._core"] = true;
	dojo.provide("dojox.fx._core");
	dojox.fx._Line = function (start, end) {
		this.start = start;
		this.end = end;
		var isArray = dojo.isArray(start), d = (isArray ? [] : end - start);
		if (isArray) {
			dojo.forEach(this.start, function (s, i) {
				d[i] = this.end[i] - s;
			}, this);
			this.getValue = function (n) {
				var res = [];
				dojo.forEach(this.start, function (s, i) {
					res[i] = (d[i] * n) + s;
				}, this);
				return res;
			};
		} else {
			this.getValue = function (n) {
				return (d * n) + this.start;
			};
		}
	};
}

