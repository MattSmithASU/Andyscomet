/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (typeof window != "undefined") {
	dojo.isBrowser = true;
	dojo._name = "browser";
	(function () {
		var d = dojo;
		d.baseUrl = d.config.baseUrl;
		var n = navigator;
		var dua = n.userAgent;
		var dav = n.appVersion;
		var tv = parseFloat(dav);
		d.isMozilla = d.isMoz = tv;
		if (d.isMoz) {
			d.isFF = parseFloat(dua.split("Firefox/")[1]) || undefined;
		}
		d.isQuirks = document.compatMode == "BackCompat";
		d.locale = dojo.config.locale || n.language.toLowerCase();
		d._xhrObj = function () {
			return new XMLHttpRequest();
		};
		var oldLoadUri = d._loadUri;
		d._loadUri = function (uri, cb) {
			var handleLocal = ["file:", "chrome:", "resource:"].some(function (prefix) {
				return String(uri).indexOf(prefix) == 0;
			});
			if (handleLocal) {
				var l = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
				var value = l.loadSubScript(uri, d.global);
				if (cb) {
					cb(value);
				}
				return true;
			} else {
				return oldLoadUri.apply(d, arguments);
			}
		};
		d._isDocumentOk = function (http) {
			var stat = http.status || 0;
			return (stat >= 200 && stat < 300) || stat == 304 || stat == 1223 || (!stat && (location.protocol == "file:" || location.protocol == "chrome:"));
		};
		var hasBase = false;
		d._getText = function (uri, fail_ok) {
			var http = d._xhrObj();
			if (!hasBase && dojo._Url) {
				uri = (new dojo._Url(uri)).toString();
			}
			if (d.config.cacheBust) {
				uri += "";
				uri += (uri.indexOf("?") == -1 ? "?" : "&") + String(d.config.cacheBust).replace(/\W+/g, "");
			}
			var handleLocal = ["file:", "chrome:", "resource:"].some(function (prefix) {
				return String(uri).indexOf(prefix) == 0;
			});
			if (handleLocal) {
				var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"].getService(Components.interfaces.nsIScriptableInputStream);
				var channel = ioService.newChannel(uri, null, null);
				var input = channel.open();
				scriptableStream.init(input);
				var str = scriptableStream.read(input.available());
				scriptableStream.close();
				input.close();
				return str;
			} else {
				http.open("GET", uri, false);
				try {
					http.send(null);
					if (!d._isDocumentOk(http)) {
						var err = Error("Unable to load " + uri + " status:" + http.status);
						err.status = http.status;
						err.responseText = http.responseText;
						throw err;
					}
				}
				catch (e) {
					if (fail_ok) {
						return null;
					}
					throw e;
				}
				return http.responseText;
			}
		};
		d._windowUnloaders = [];
		d.windowUnloaded = function () {
			var mll = d._windowUnloaders;
			while (mll.length) {
				(mll.pop())();
			}
		};
		d.addOnWindowUnload = function (obj, functionName) {
			d._onto(d._windowUnloaders, obj, functionName);
		};
		var contexts = [];
		var current = null;
		dojo._defaultContext = [window, document];
		dojo.pushContext = function (g, d) {
			var old = [dojo.global, dojo.doc];
			contexts.push(old);
			var n;
			if (!g && !d) {
				n = dojo._defaultContext;
			} else {
				n = [g, d];
				if (!d && dojo.isString(g)) {
					var t = document.getElementById(g);
					if (t.contentDocument) {
						n = [t.contentWindow, t.contentDocument];
					}
				}
			}
			current = n;
			dojo.setContext.apply(dojo, n);
			return old;
		};
		dojo.popContext = function () {
			var oc = current;
			if (!contexts.length) {
				return oc;
			}
			dojo.setContext.apply(dojo, contexts.pop());
			return oc;
		};
		dojo._inContext = function (g, d, f) {
			var a = dojo._toArray(arguments);
			f = a.pop();
			if (a.length == 1) {
				d = null;
			}
			dojo.pushContext(g, d);
			var r = f();
			dojo.popContext();
			return r;
		};
	})();
	dojo._initFired = false;
	dojo._loadInit = function (e) {
		dojo._initFired = true;
		var type = (e && e.type) ? e.type.toLowerCase() : "load";
		if (arguments.callee.initialized || (type != "domcontentloaded" && type != "load")) {
			return;
		}
		arguments.callee.initialized = true;
		if (dojo._inFlightCount == 0) {
			dojo._modulesLoaded();
		}
	};
	if (!dojo.config.afterOnLoad) {
		window.addEventListener("DOMContentLoaded", function (e) {
			dojo._loadInit(e);
		}, false);
	}
}
(function () {
	var mp = dojo.config["modulePaths"];
	if (mp) {
		for (var param in mp) {
			dojo.registerModulePath(param, mp[param]);
		}
	}
})();
if (dojo.config.isDebug) {
	console.log = function (m) {
		var s = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		s.logStringMessage(m);
	};
	console.debug = function () {
		console.log(dojo._toArray(arguments).join(" "));
	};
}

