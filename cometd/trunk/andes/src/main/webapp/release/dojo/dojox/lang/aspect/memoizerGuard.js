/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.aspect.memoizerGuard"]) {
	dojo._hasResource["dojox.lang.aspect.memoizerGuard"] = true;
	dojo.provide("dojox.lang.aspect.memoizerGuard");
	(function () {
		var aop = dojox.lang.aspect, reset = function (method) {
			var that = aop.getContext().instance, t;
			if (!(t = that.__memoizerCache)) {
				return;
			}
			if (arguments.length == 0) {
				delete that.__memoizerCache;
			} else {
				if (dojo.isArray(method)) {
					dojo.forEach(method, function (m) {
						delete t[m];
					});
				} else {
					delete t[method];
				}
			}
		};
		aop.memoizerGuard = function (method) {
			return {after:function () {
				reset(method);
			}};
		};
	})();
}

