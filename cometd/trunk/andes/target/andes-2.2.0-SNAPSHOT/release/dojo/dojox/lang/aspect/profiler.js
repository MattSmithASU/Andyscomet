/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.aspect.profiler"]) {
	dojo._hasResource["dojox.lang.aspect.profiler"] = true;
	dojo.provide("dojox.lang.aspect.profiler");
	(function () {
		var aop = dojox.lang.aspect, uniqueNumber = 0;
		var Profiler = function (title) {
			this.args = title ? [title] : [];
			this.inCall = 0;
		};
		dojo.extend(Profiler, {before:function () {
			if (!(this.inCall++)) {
				console.profile.apply(console, this.args);
			}
		}, after:function () {
			if (!--this.inCall) {
				console.profileEnd();
			}
		}});
		aop.profiler = function (title) {
			return new Profiler(title);
		};
	})();
}

