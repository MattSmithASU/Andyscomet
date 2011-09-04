/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.timing.doLater"]) {
	dojo._hasResource["dojox.timing.doLater"] = true;
	dojo.provide("dojox.timing.doLater");
	dojo.experimental("dojox.timing.doLater");
	dojox.timing.doLater = function (conditional, context, interval) {
		if (conditional) {
			return false;
		}
		var callback = dojox.timing.doLater.caller, args = dojox.timing.doLater.caller.arguments;
		interval = interval || 100;
		context = context || dojo.global;
		setTimeout(function () {
			callback.apply(context, args);
		}, interval);
		return true;
	};
}

