/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.analytics.plugins.consoleMessages"]) {
	dojo._hasResource["dojox.analytics.plugins.consoleMessages"] = true;
	dojo.require("dojox.analytics._base");
	dojo.provide("dojox.analytics.plugins.consoleMessages");
	dojox.analytics.plugins.consoleMessages = new (function () {
		this.addData = dojo.hitch(dojox.analytics, "addData", "consoleMessages");
		var lvls = dojo.config["consoleLogFuncs"] || ["error", "warn", "info", "rlog"];
		if (!console) {
			console = {};
		}
		for (var i = 0; i < lvls.length; i++) {
			if (console[lvls[i]]) {
				dojo.connect(console, lvls[i], dojo.hitch(this, "addData", lvls[i]));
			} else {
				console[lvls[i]] = dojo.hitch(this, "addData", lvls[i]);
			}
		}
	})();
}

