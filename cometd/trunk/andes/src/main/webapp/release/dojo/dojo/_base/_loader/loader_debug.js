/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base._loader.loader_debug"]) {
	dojo._hasResource["dojo._base._loader.loader_debug"] = true;
	dojo.provide("dojo._base._loader.loader_debug");
	dojo.nonDebugProvide = dojo.provide;
	dojo.provide = function (resourceName) {
		var dbgQueue = dojo["_xdDebugQueue"];
		if (dbgQueue && dbgQueue.length > 0 && resourceName == dbgQueue["currentResourceName"]) {
			if (dojo.isAIR) {
				window.setTimeout(function () {
					dojo._xdDebugFileLoaded(resourceName);
				}, 1);
			} else {
				window.setTimeout(dojo._scopeName + "._xdDebugFileLoaded('" + resourceName + "')", 1);
			}
		}
		return dojo.nonDebugProvide.apply(dojo, arguments);
	};
	dojo._xdDebugFileLoaded = function (resourceName) {
		if (!dojo._xdDebugScopeChecked) {
			if (dojo._scopeName != "dojo") {
				window.dojo = window[dojo.config.scopeMap[0][1]];
				window.dijit = window[dojo.config.scopeMap[1][1]];
				window.dojox = window[dojo.config.scopeMap[2][1]];
			}
			dojo._xdDebugScopeChecked = true;
		}
		var dbgQueue = dojo._xdDebugQueue;
		if (resourceName && resourceName == dbgQueue.currentResourceName) {
			dbgQueue.shift();
		}
		if (dbgQueue.length == 0) {
			dojo._xdWatchInFlight();
		}
		if (dbgQueue.length == 0) {
			dbgQueue.currentResourceName = null;
			for (var param in dojo._xdInFlight) {
				if (dojo._xdInFlight[param] === true) {
					return;
				}
			}
			dojo._xdNotifyLoaded();
		} else {
			if (resourceName == dbgQueue.currentResourceName) {
				dbgQueue.currentResourceName = dbgQueue[0].resourceName;
				var element = document.createElement("script");
				element.type = "text/javascript";
				element.src = dbgQueue[0].resourcePath;
				document.getElementsByTagName("head")[0].appendChild(element);
			}
		}
	};
}

