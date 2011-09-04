/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.oo.general"]) {
	dojo._hasResource["dojox.lang.oo.general"] = true;
	dojo.provide("dojox.lang.oo.general");
	dojo.require("dojox.lang.oo.Decorator");
	(function () {
		var oo = dojox.lang.oo, md = oo.makeDecorator, oog = oo.general, isF = dojo.isFunction;
		oog.augment = md(function (name, newValue, oldValue) {
			return typeof oldValue == "undefined" ? newValue : oldValue;
		});
		oog.override = md(function (name, newValue, oldValue) {
			return typeof oldValue != "undefined" ? newValue : oldValue;
		});
		oog.shuffle = md(function (name, newValue, oldValue) {
			return isF(oldValue) ? function () {
				return oldValue.apply(this, newValue.apply(this, arguments));
			} : oldValue;
		});
		oog.wrap = md(function (name, newValue, oldValue) {
			return function () {
				return newValue.call(this, oldValue, arguments);
			};
		});
		oog.tap = md(function (name, newValue, oldValue) {
			return function () {
				newValue.apply(this, arguments);
				return this;
			};
		});
		oog.before = md(function (name, newValue, oldValue) {
			return isF(oldValue) ? function () {
				newValue.apply(this, arguments);
				return oldValue.apply(this, arguments);
			} : newValue;
		});
		oog.after = md(function (name, newValue, oldValue) {
			return isF(oldValue) ? function () {
				oldValue.apply(this, arguments);
				return newValue.apply(this, arguments);
			} : newValue;
		});
	})();
}

