/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.aspect.timer"]) {
	dojo._hasResource["dojox.lang.aspect.timer"] = true;
	dojo.provide("dojox.lang.aspect.timer");
	(function () {
		var aop = dojox.lang.aspect, uniqueNumber = 0;
		var Timer = function (name) {
			this.name = name || ("DojoAopTimer #" + ++uniqueNumber);
			this.inCall = 0;
		};
		dojo.extend(Timer, {before:function () {
			if (!(this.inCall++)) {
				console.time(this.name);
			}
		}, after:function () {
			if (!--this.inCall) {
				console.timeEnd(this.name);
			}
		}});
		aop.timer = function (name) {
			return new Timer(name);
		};
	})();
}

