/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.aspect.counter"]) {
	dojo._hasResource["dojox.lang.aspect.counter"] = true;
	dojo.provide("dojox.lang.aspect.counter");
	(function () {
		var aop = dojox.lang.aspect;
		var Counter = function () {
			this.reset();
		};
		dojo.extend(Counter, {before:function () {
			++this.calls;
		}, afterThrowing:function () {
			++this.errors;
		}, reset:function () {
			this.calls = this.errors = 0;
		}});
		aop.counter = function () {
			return new Counter;
		};
	})();
}

