/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



define(["require", "dojo/_base/_loader/bootstrap"], function (require, dojo) {
	var names = ["_moduleHasPrefix", "_loadPath", "_loadUri", "_loadUriAndCheck", "loaded", "_callLoaded", "_getModuleSymbols", "_loadModule", "require", "provide", "platformRequire", "requireIf", "requireAfterIf", "registerModulePath"], i, name;
	for (i = 0; i < names.length; ) {
		name = names[i++];
		dojo[name] = (function (name) {
			return function () {
				console.warn("dojo." + name + " not available when using an AMD loader.");
			};
		})(name);
	}
	var argsToArray = function (args) {
		var result = [], i;
		for (i = 0; i < args.length; ) {
			result.push(args[i++]);
		}
		return result;
	}, simpleHitch = function (context, callback) {
		if (callback) {
			return (typeof callback == "string") ? function () {
				context[callback]();
			} : function () {
				callback.call(context);
			};
		} else {
			return context;
		}
	};
	dojo.ready = dojo.addOnLoad = function (context, callback) {
		require.ready(callback ? simpleHitch(context, callback) : context);
	};
	dojo.addOnLoad(function () {
		dojo._postLoad = dojo.config.afterOnLoad = true;
	});
	var dca = dojo.config.addOnLoad;
	if (dca) {
		dojo.addOnLoad[(dca instanceof Array ? "apply" : "call")](dojo, dca);
	}
	var loaders = dojo._loaders = [], runLoaders = function () {
		var temp = loaders.slice(0);
		Array.prototype.splice.apply(loaders, [0, loaders.length]);
		while (temp.length) {
			temp.shift().call();
		}
	};
	loaders.unshift = function () {
		Array.prototype.unshift.apply(loaders, argsToArray(arguments));
		require.ready(runLoaders);
	};
	loaders.splice = function () {
		Array.prototype.splice.apply(loaders, argsToArray(arguments));
		require.ready(runLoaders);
	};
	var unloaders = dojo._unloaders = [];
	dojo.unloaded = function () {
		while (unloaders.length) {
			unloaders.pop().call();
		}
	};
	dojo._onto = function (arr, obj, fn) {
		arr.push(fn ? simpleHitch(obj, fn) : obj);
	};
	dojo._modulesLoaded = function () {
	};
	dojo.loadInit = function (init) {
		init();
	};
	var amdModuleName = function (moduleName) {
		return moduleName.replace(/\./g, "/");
	};
	dojo.getL10nName = function (moduleName, bundleName, locale) {
		locale = locale ? locale.toLowerCase() : dojo.locale;
		moduleName = "i18n!" + amdModuleName(moduleName);
		return (/root/i.test(locale)) ? (moduleName + "/nls/" + bundleName) : (moduleName + "/nls/" + locale + "/" + bundleName);
	};
	dojo.requireLocalization = function (moduleName, bundleName, locale) {
		if (require.vendor != "altoviso.com") {
			locale = !locale || locale.toLowerCase() === dojo.locale ? "root" : locale;
		}
		return require(dojo.getL10nName(moduleName, bundleName, locale));
	};
	dojo.i18n = {getLocalization:dojo.requireLocalization, normalizeLocale:function (locale) {
		var result = locale ? locale.toLowerCase() : dojo.locale;
		if (result == "root") {
			result = "ROOT";
		}
		return result;
	}};
	var ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$"), ire = new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$");
	dojo._Url = function () {
		var n = null, _a = arguments, uri = [_a[0]];
		for (var i = 1; i < _a.length; i++) {
			if (!_a[i]) {
				continue;
			}
			var relobj = new dojo._Url(_a[i] + ""), uriobj = new dojo._Url(uri[0] + "");
			if (relobj.path == "" && !relobj.scheme && !relobj.authority && !relobj.query) {
				if (relobj.fragment != n) {
					uriobj.fragment = relobj.fragment;
				}
				relobj = uriobj;
			} else {
				if (!relobj.scheme) {
					relobj.scheme = uriobj.scheme;
					if (!relobj.authority) {
						relobj.authority = uriobj.authority;
						if (relobj.path.charAt(0) != "/") {
							var path = uriobj.path.substring(0, uriobj.path.lastIndexOf("/") + 1) + relobj.path;
							var segs = path.split("/");
							for (var j = 0; j < segs.length; j++) {
								if (segs[j] == ".") {
									if (j == segs.length - 1) {
										segs[j] = "";
									} else {
										segs.splice(j, 1);
										j--;
									}
								} else {
									if (j > 0 && !(j == 1 && segs[0] == "") && segs[j] == ".." && segs[j - 1] != "..") {
										if (j == (segs.length - 1)) {
											segs.splice(j, 1);
											segs[j - 1] = "";
										} else {
											segs.splice(j - 1, 2);
											j -= 2;
										}
									}
								}
							}
							relobj.path = segs.join("/");
						}
					}
				}
			}
			uri = [];
			if (relobj.scheme) {
				uri.push(relobj.scheme, ":");
			}
			if (relobj.authority) {
				uri.push("//", relobj.authority);
			}
			uri.push(relobj.path);
			if (relobj.query) {
				uri.push("?", relobj.query);
			}
			if (relobj.fragment) {
				uri.push("#", relobj.fragment);
			}
		}
		this.uri = uri.join("");
		var r = this.uri.match(ore);
		this.scheme = r[2] || (r[1] ? "" : n);
		this.authority = r[4] || (r[3] ? "" : n);
		this.path = r[5];
		this.query = r[7] || (r[6] ? "" : n);
		this.fragment = r[9] || (r[8] ? "" : n);
		if (this.authority != n) {
			r = this.authority.match(ire);
			this.user = r[3] || n;
			this.password = r[4] || n;
			this.host = r[6] || r[7];
			this.port = r[9] || n;
		}
	};
	dojo._Url.prototype.toString = function () {
		return this.uri;
	};
	dojo.moduleUrl = function (module, url) {
		if (!module) {
			return null;
		}
		module = amdModuleName(module) + (url ? ("/" + url) : "");
		var type = "", match = module.match(/(.+)(\.[^\/]*)$/);
		if (match) {
			module = match[1];
			type = match[2];
		}
		return new dojo._Url(require.nameToUrl(module, type));
	};
	return dojo;
});

