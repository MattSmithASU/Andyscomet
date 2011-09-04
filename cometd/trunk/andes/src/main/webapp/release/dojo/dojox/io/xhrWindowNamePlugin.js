/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.io.xhrWindowNamePlugin"]) {
	dojo._hasResource["dojox.io.xhrWindowNamePlugin"] = true;
	dojo.provide("dojox.io.xhrWindowNamePlugin");
	dojo.require("dojox.io.xhrPlugins");
	dojo.require("dojox.io.windowName");
	dojo.require("dojox.io.httpParse");
	dojo.require("dojox.secure.capability");
	dojox.io.xhrWindowNamePlugin = function (url, httpAdapter, trusted) {
		dojox.io.xhrPlugins.register("windowName", function (method, args) {
			return args.sync !== true && (method == "GET" || method == "POST" || httpAdapter) && (args.url.substring(0, url.length) == url);
		}, function (method, args, hasBody) {
			var send = dojox.io.windowName.send;
			var load = args.load;
			args.load = undefined;
			var dfd = (httpAdapter ? httpAdapter(send, true) : send)(method, args, hasBody);
			dfd.addCallback(function (result) {
				var ioArgs = dfd.ioArgs;
				ioArgs.xhr = {getResponseHeader:function (name) {
					return dojo.queryToObject(ioArgs.hash.match(/[^#]*$/)[0])[name];
				}};
				if (ioArgs.handleAs == "json") {
					if (!trusted) {
						dojox.secure.capability.validate(result, ["Date"], {});
					}
					return dojo.fromJson(result);
				}
				return dojo._contentHandlers[ioArgs.handleAs || "text"]({responseText:result});
			});
			args.load = load;
			if (load) {
				dfd.addCallback(load);
			}
			return dfd;
		});
	};
}

