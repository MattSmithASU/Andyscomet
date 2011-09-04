/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.io.xhrScriptPlugin"]) {
	dojo._hasResource["dojox.io.xhrScriptPlugin"] = true;
	dojo.provide("dojox.io.xhrScriptPlugin");
	dojo.require("dojox.io.xhrPlugins");
	dojo.require("dojo.io.script");
	dojo.require("dojox.io.scriptFrame");
	dojox.io.xhrScriptPlugin = function (url, callbackParamName, httpAdapter) {
		dojox.io.xhrPlugins.register("script", function (method, args) {
			return args.sync !== true && (method == "GET" || httpAdapter) && (args.url.substring(0, url.length) == url);
		}, function (method, args, hasBody) {
			var send = function () {
				args.callbackParamName = callbackParamName;
				if (dojo.body()) {
					args.frameDoc = "frame" + Math.random();
				}
				return dojo.io.script.get(args);
			};
			return (httpAdapter ? httpAdapter(send, true) : send)(method, args, hasBody);
		});
	};
}

