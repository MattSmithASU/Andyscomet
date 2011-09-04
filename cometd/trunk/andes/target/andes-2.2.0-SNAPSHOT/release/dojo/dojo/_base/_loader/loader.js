/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.foo"]) {
	dojo._hasResource["dojo.foo"] = true;
	(function () {
		var d = dojo, currentModule;
		d.mixin(d, {_loadedModules:{}, _inFlightCount:0, _hasResource:{}, _modulePrefixes:{dojo:{name:"dojo", value:"."}, doh:{name:"doh", value:"../util/doh"}, tests:{name:"tests", value:"tests"}}, _moduleHasPrefix:function (module) {
			var mp = d._modulePrefixes;
			return !!(mp[module] && mp[module].value);
		}, _getModulePrefix:function (module) {
			var mp = d._modulePrefixes;
			if (d._moduleHasPrefix(module)) {
				return mp[module].value;
			}
			return module;
		}, _loadedUrls:[], _postLoad:false, _loaders:[], _unloaders:[], _loadNotifying:false});
		dojo._loadPath = function (relpath, module, cb) {
			var uri = ((relpath.charAt(0) == "/" || relpath.match(/^\w+:/)) ? "" : d.baseUrl) + relpath;
			try {
				currentModule = module;
				return !module ? d._loadUri(uri, cb) : d._loadUriAndCheck(uri, module, cb);
			}
			catch (e) {
				console.error(e);
				return false;
			}
			finally {
				currentModule = null;
			}
		};
		dojo._loadUri = function (uri, cb) {
			if (d._loadedUrls[uri]) {
				return true;
			}
			d._inFlightCount++;
			var contents = d._getText(uri, true);
			if (contents) {
				d._loadedUrls[uri] = true;
				d._loadedUrls.push(uri);
				if (cb) {
					contents = /^define\(/.test(contents) ? contents : "(" + contents + ")";
				} else {
					contents = d._scopePrefix + contents + d._scopeSuffix;
				}
				if (!d.isIE) {
					contents += "\r\n//@ sourceURL=" + uri;
				}
				var value = d["eval"](contents);
				if (cb) {
					cb(value);
				}
			}
			if (--d._inFlightCount == 0 && d._postLoad && d._loaders.length) {
				setTimeout(function () {
					if (d._inFlightCount == 0) {
						d._callLoaded();
					}
				}, 0);
			}
			return !!contents;
		};
		dojo._loadUriAndCheck = function (uri, moduleName, cb) {
			var ok = false;
			try {
				ok = d._loadUri(uri, cb);
			}
			catch (e) {
				console.error("failed loading " + uri + " with error: " + e);
			}
			return !!(ok && d._loadedModules[moduleName]);
		};
		dojo.loaded = function () {
			d._loadNotifying = true;
			d._postLoad = true;
			var mll = d._loaders;
			d._loaders = [];
			for (var x = 0; x < mll.length; x++) {
				mll[x]();
			}
			d._loadNotifying = false;
			if (d._postLoad && d._inFlightCount == 0 && mll.length) {
				d._callLoaded();
			}
		};
		dojo.unloaded = function () {
			var mll = d._unloaders;
			while (mll.length) {
				(mll.pop())();
			}
		};
		d._onto = function (arr, obj, fn) {
			if (!fn) {
				arr.push(obj);
			} else {
				if (fn) {
					var func = (typeof fn == "string") ? obj[fn] : fn;
					arr.push(function () {
						func.call(obj);
					});
				}
			}
		};
		dojo.ready = dojo.addOnLoad = function (obj, functionName) {
			d._onto(d._loaders, obj, functionName);
			if (d._postLoad && d._inFlightCount == 0 && !d._loadNotifying) {
				d._callLoaded();
			}
		};
		var dca = d.config.addOnLoad;
		if (dca) {
			d.addOnLoad[(dca instanceof Array ? "apply" : "call")](d, dca);
		}
		dojo._modulesLoaded = function () {
			if (d._postLoad) {
				return;
			}
			if (d._inFlightCount > 0) {
				console.warn("files still in flight!");
				return;
			}
			d._callLoaded();
		};
		dojo._callLoaded = function () {
			if (typeof setTimeout == "object" || (d.config.useXDomain && d.isOpera)) {
				setTimeout(d.isAIR ? function () {
					d.loaded();
				} : d._scopeName + ".loaded();", 0);
			} else {
				d.loaded();
			}
		};
		dojo._getModuleSymbols = function (modulename) {
			var syms = modulename.split(".");
			for (var i = syms.length; i > 0; i--) {
				var parentModule = syms.slice(0, i).join(".");
				if (i == 1 && !d._moduleHasPrefix(parentModule)) {
					syms[0] = "../" + syms[0];
				} else {
					var parentModulePath = d._getModulePrefix(parentModule);
					if (parentModulePath != parentModule) {
						syms.splice(0, i, parentModulePath);
						break;
					}
				}
			}
			return syms;
		};
		dojo._global_omit_module_check = false;
		dojo.loadInit = function (init) {
			init();
		};
		dojo._loadModule = dojo.require = function (moduleName, omitModuleCheck) {
			omitModuleCheck = d._global_omit_module_check || omitModuleCheck;
			var module = d._loadedModules[moduleName];
			if (module) {
				return module;
			}
			var relpath = d._getModuleSymbols(moduleName).join("/") + ".js";
			var modArg = !omitModuleCheck ? moduleName : null;
			var ok = d._loadPath(relpath, modArg);
			if (!ok && !omitModuleCheck) {
				throw new Error("Could not load '" + moduleName + "'; last tried '" + relpath + "'");
			}
			if (!omitModuleCheck && !d._isXDomain) {
				module = d._loadedModules[moduleName];
				if (!module) {
					throw new Error("symbol '" + moduleName + "' is not defined after loading '" + relpath + "'");
				}
			}
			return module;
		};
		dojo.provide = function (resourceName) {
			resourceName = resourceName + "";
			return (d._loadedModules[resourceName] = d.getObject(resourceName, true));
		};
		dojo.platformRequire = function (modMap) {
			var common = modMap.common || [];
			var result = common.concat(modMap[d._name] || modMap["default"] || []);
			for (var x = 0; x < result.length; x++) {
				var curr = result[x];
				if (curr.constructor == Array) {
					d._loadModule.apply(d, curr);
				} else {
					d._loadModule(curr);
				}
			}
		};
		dojo.requireIf = function (condition, resourceName) {
			if (condition === true) {
				var args = [];
				for (var i = 1; i < arguments.length; i++) {
					args.push(arguments[i]);
				}
				d.require.apply(d, args);
			}
		};
		dojo.requireAfterIf = d.requireIf;
		dojo.registerModulePath = function (module, prefix) {
			d._modulePrefixes[module] = {name:module, value:prefix};
		};
		dojo.requireLocalization = function (moduleName, bundleName, locale, availableFlatLocales) {
			d.require("dojo.i18n");
			d.i18n._requireLocalization.apply(d.hostenv, arguments);
		};
		var ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$"), ire = new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$");
		dojo._Url = function () {
			var n = null, _a = arguments, uri = [_a[0]];
			for (var i = 1; i < _a.length; i++) {
				if (!_a[i]) {
					continue;
				}
				var relobj = new d._Url(_a[i] + ""), uriobj = new d._Url(uri[0] + "");
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
			var loc = d._getModuleSymbols(module).join("/");
			if (!loc) {
				return null;
			}
			if (loc.lastIndexOf("/") != loc.length - 1) {
				loc += "/";
			}
			var colonIndex = loc.indexOf(":");
			if (loc.charAt(0) != "/" && (colonIndex == -1 || colonIndex > loc.indexOf("/"))) {
				loc = d.baseUrl + loc;
			}
			return new d._Url(loc, url);
		};
	})();
}

