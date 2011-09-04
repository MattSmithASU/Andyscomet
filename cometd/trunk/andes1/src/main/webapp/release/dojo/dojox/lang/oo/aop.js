/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.oo.aop"]) {
	dojo._hasResource["dojox.lang.oo.aop"] = true;
	dojo.provide("dojox.lang.oo.aop");
	dojo.require("dojox.lang.oo.Decorator");
	dojo.require("dojox.lang.oo.general");
	(function () {
		var oo = dojox.lang.oo, md = oo.makeDecorator, oog = oo.general, ooa = oo.aop, isF = dojo.isFunction;
		ooa.before = oog.before;
		ooa.around = oog.wrap;
		ooa.afterReturning = md(function (name, newValue, oldValue) {
			return isF(oldValue) ? function () {
				var ret = oldValue.apply(this, arguments);
				newValue.call(this, ret);
				return ret;
			} : function () {
				newValue.call(this);
			};
		});
		ooa.afterThrowing = md(function (name, newValue, oldValue) {
			return isF(oldValue) ? function () {
				var ret;
				try {
					ret = oldValue.apply(this, arguments);
				}
				catch (e) {
					newValue.call(this, e);
					throw e;
				}
				return ret;
			} : oldValue;
		});
		ooa.after = md(function (name, newValue, oldValue) {
			return isF(oldValue) ? function () {
				var ret;
				try {
					ret = oldValue.apply(this, arguments);
				}
				finally {
					newValue.call(this);
				}
				return ret;
			} : function () {
				newValue.call(this);
			};
		});
	})();
}

