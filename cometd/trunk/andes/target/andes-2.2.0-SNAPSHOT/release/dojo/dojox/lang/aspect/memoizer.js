/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.aspect.memoizer"]) {
	dojo._hasResource["dojox.lang.aspect.memoizer"] = true;
	dojo.provide("dojox.lang.aspect.memoizer");
	(function () {
		var aop = dojox.lang.aspect;
		var memoize1 = {around:function (key) {
			var ctx = aop.getContext(), self = ctx.joinPoint, that = ctx.instance, t, u, ret;
			if ((t = that.__memoizerCache) && (t = t[self.targetName]) && (key in t)) {
				return t[key];
			}
			var ret = aop.proceed.apply(null, arguments);
			if (!(t = that.__memoizerCache)) {
				t = that.__memoizerCache = {};
			}
			if (!(u = t[self.targetName])) {
				u = t[self.targetName] = {};
			}
			return u[key] = ret;
		}};
		var memoizeN = function (keyMaker) {
			return {around:function () {
				var ctx = aop.getContext(), self = ctx.joinPoint, that = ctx.instance, t, u, ret, key = keyMaker.apply(that, arguments);
				if ((t = that.__memoizerCache) && (t = t[self.targetName]) && (key in t)) {
					return t[key];
				}
				var ret = aop.proceed.apply(null, arguments);
				if (!(t = that.__memoizerCache)) {
					t = that.__memoizerCache = {};
				}
				if (!(u = t[self.targetName])) {
					u = t[self.targetName] = {};
				}
				return u[key] = ret;
			}};
		};
		aop.memoizer = function (keyMaker) {
			return arguments.length == 0 ? memoize1 : memoizeN(keyMaker);
		};
	})();
}

