/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.math.round"]) {
	dojo._hasResource["dojox.math.round"] = true;
	dojo.provide("dojox.math.round");
	dojo.getObject("math.round", true, dojox);
	dojo.experimental("dojox.math.round");
	dojox.math.round = function (value, places, increment) {
		var wholeFigs = Math.log(Math.abs(value)) / Math.log(10);
		var factor = 10 / (increment || 10);
		var delta = Math.pow(10, -15 + wholeFigs);
		return (factor * (+value + (value > 0 ? delta : -delta))).toFixed(places) / factor;
	};
	if ((0.9).toFixed() == 0) {
		(function () {
			var round = dojox.math.round;
			dojox.math.round = function (v, p, m) {
				var d = Math.pow(10, -p || 0), a = Math.abs(v);
				if (!v || a >= d || a * Math.pow(10, p + 1) < 5) {
					d = 0;
				}
				return round(v, p, m) + (v > 0 ? d : -d);
			};
		})();
	}
}

