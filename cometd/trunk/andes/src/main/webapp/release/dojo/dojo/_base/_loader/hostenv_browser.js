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
		if (document && document.getElementsByTagName) {
			var scripts = document.getElementsByTagName("script");
			var rePkg = /dojo(\.xd)?\.js(\W|$)/i;
			for (var i = 0; i < scripts.length; i++) {
				var src = scripts[i].getAttribute("src");
				if (!src) {
					continue;
				}
				var m = src.match(rePkg);
				if (m) {
					if (!d.config.baseUrl) {
						d.config.baseUrl = src.substring(0, m.index);
					}
					var cfg = (scripts[i].getAttribute("djConfig") || scripts[i].getAttribute("data-dojo-config"));
					if (cfg) {
						var cfgo = eval("({ " + cfg + " })");
						for (var x in cfgo) {
							dojo.config[x] = cfgo[x];
						}
					}
					break;
				}
			}
		}
		d.baseUrl = d.config.baseUrl;
		var n = navigator;
		var dua = n.userAgent, dav = n.appVersion, tv = parseFloat(dav);
		if (dua.indexOf("Opera") >= 0) {
			d.isOpera = tv;
		}
		if (dua.indexOf("AdobeAIR") >= 0) {
			d.isAIR = 1;
		}
		d.isKhtml = (dav.indexOf("Konqueror") >= 0) ? tv : 0;
		d.isWebKit = parseFloat(dua.split("WebKit/")[1]) || undefined;
		d.isChrome = parseFloat(dua.split("Chrome/")[1]) || undefined;
		d.isMac = dav.indexOf("Macintosh") >= 0;
		var index = Math.max(dav.indexOf("WebKit"), dav.indexOf("Safari"), 0);
		if (index && !dojo.isChrome) {
			d.isSafari = parseFloat(dav.split("Version/")[1]);
			if (!d.isSafari || parseFloat(dav.substr(index + 7)) <= 419.3) {
				d.isSafari = 2;
			}
		}
		if (dua.indexOf("Gecko") >= 0 && !d.isKhtml && !d.isWebKit) {
			d.isMozilla = d.isMoz = tv;
		}
		if (d.isMoz) {
			d.isFF = parseFloat(dua.split("Firefox/")[1] || dua.split("Minefield/")[1]) || undefined;
		}
		if (document.all && !d.isOpera) {
			d.isIE = parseFloat(dav.split("MSIE ")[1]) || undefined;
			var mode = document.documentMode;
			if (mode && mode != 5 && Math.floor(d.isIE) != mode) {
				d.isIE = mode;
			}
		}
		if (dojo.isIE && window.location.protocol === "file:") {
			dojo.config.ieForceActiveXXhr = true;
		}
		d.isQuirks = document.compatMode == "BackCompat";
		d.locale = dojo.config.locale || (d.isIE ? n.userLanguage : n.language).toLowerCase();
		d._XMLHTTP_PROGIDS = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"];
		d._xhrObj = function () {
			var http, last_e;
			if (!dojo.isIE || !dojo.config.ieForceActiveXXhr) {
				try {
					http = new XMLHttpRequest();
				}
				catch (e) {
				}
			}
			if (!http) {
				for (var i = 0; i < 3; ++i) {
					var progid = d._XMLHTTP_PROGIDS[i];
					try {
						http = new ActiveXObject(progid);
					}
					catch (e) {
						last_e = e;
					}
					if (http) {
						d._XMLHTTP_PROGIDS = [progid];
						break;
					}
				}
			}
			if (!http) {
				throw new Error("XMLHTTP not available: " + last_e);
			}
			return http;
		};
		d._isDocumentOk = function (http) {
			var stat = http.status || 0;
			return (stat >= 200 && stat < 300) || stat == 304 || stat == 1223 || !stat;
		};
		var owloc = window.location + "";
		var base = document.getElementsByTagName("base");
		var hasBase = (base && base.length > 0);
		d._getText = function (uri, fail_ok) {
			var http = d._xhrObj();
			if (!hasBase && dojo._Url) {
				uri = (new dojo._Url(owloc, uri)).toString();
			}
			if (d.config.cacheBust) {
				uri += "";
				uri += (uri.indexOf("?") == -1 ? "?" : "&") + String(d.config.cacheBust).replace(/\W+/g, "");
			}
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
		};
		var _w = window;
		var _handleNodeEvent = function (evtName, fp) {
			var _a = _w.attachEvent || _w.addEventListener;
			evtName = _w.attachEvent ? evtName : evtName.substring(2);
			_a(evtName, function () {
				fp.apply(_w, arguments);
			}, false);
		};
		d._windowUnloaders = [];
		d.windowUnloaded = function () {
			var mll = d._windowUnloaders;
			while (mll.length) {
				(mll.pop())();
			}
			d = null;
		};
		var _onWindowUnloadAttached = 0;
		d.addOnWindowUnload = function (obj, functionName) {
			d._onto(d._windowUnloaders, obj, functionName);
			if (!_onWindowUnloadAttached) {
				_onWindowUnloadAttached = 1;
				_handleNodeEvent("onunload", d.windowUnloaded);
			}
		};
		var _onUnloadAttached = 0;
		d.addOnUnload = function (obj, functionName) {
			d._onto(d._unloaders, obj, functionName);
			if (!_onUnloadAttached) {
				_onUnloadAttached = 1;
				_handleNodeEvent("onbeforeunload", dojo.unloaded);
			}
		};
	})();
	dojo._initFired = false;
	dojo._loadInit = function (e) {
		if (dojo._scrollIntervalId) {
			clearInterval(dojo._scrollIntervalId);
			dojo._scrollIntervalId = 0;
		}
		if (!dojo._initFired) {
			dojo._initFired = true;
			if (!dojo.config.afterOnLoad && window.detachEvent) {
				window.detachEvent("onload", dojo._loadInit);
			}
			if (dojo._inFlightCount == 0) {
				dojo._modulesLoaded();
			}
		}
	};
	if (!dojo.config.afterOnLoad) {
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", dojo._loadInit, false);
			window.addEventListener("load", dojo._loadInit, false);
		} else {
			if (window.attachEvent) {
				window.attachEvent("onload", dojo._loadInit);
				if (!dojo.config.skipIeDomLoaded && self === self.top) {
					dojo._scrollIntervalId = setInterval(function () {
						try {
							if (document.body) {
								document.documentElement.doScroll("left");
								dojo._loadInit();
							}
						}
						catch (e) {
						}
					}, 30);
				}
			}
		}
	}
	if (dojo.isIE) {
		try {
			(function () {
				document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
				var vmlElems = ["*", "group", "roundrect", "oval", "shape", "rect", "imagedata", "path", "textpath", "text"], i = 0, l = 1, s = document.createStyleSheet();
				if (dojo.isIE >= 8) {
					i = 1;
					l = vmlElems.length;
				}
				for (; i < l; ++i) {
					s.addRule("v\\:" + vmlElems[i], "behavior:url(#default#VML); display:inline-block");
				}
			})();
		}
		catch (e) {
		}
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
	dojo.require("dojo._firebug.firebug");
}
if (dojo.config.debugAtAllCosts) {
	dojo.require("dojo._base._loader.loader_debug");
	dojo.require("dojo.i18n");
}

