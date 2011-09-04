/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.i18n"]) {
	dojo._hasResource["dojo.i18n"] = true;
	dojo.provide("dojo.i18n");
	dojo.getObject("i18n", true, dojo);
	dojo.i18n.getLocalization = dojo.i18n.getLocalization || function (packageName, bundleName, locale) {
		locale = dojo.i18n.normalizeLocale(locale);
		var elements = locale.split("-");
		var module = [packageName, "nls", bundleName].join(".");
		var bundle = dojo._loadedModules[module];
		if (bundle) {
			var localization;
			for (var i = elements.length; i > 0; i--) {
				var loc = elements.slice(0, i).join("_");
				if (bundle[loc]) {
					localization = bundle[loc];
					break;
				}
			}
			if (!localization) {
				localization = bundle.ROOT;
			}
			if (localization) {
				var clazz = function () {
				};
				clazz.prototype = localization;
				return new clazz();
			}
		}
		throw new Error("Bundle not found: " + bundleName + " in " + packageName + " , locale=" + locale);
	};
	dojo.i18n.normalizeLocale = function (locale) {
		var result = locale ? locale.toLowerCase() : dojo.locale;
		if (result == "root") {
			result = "ROOT";
		}
		return result;
	};
	dojo.i18n._requireLocalization = function (moduleName, bundleName, locale, availableFlatLocales) {
		var targetLocale = dojo.i18n.normalizeLocale(locale);
		var bundlePackage = [moduleName, "nls", bundleName].join(".");
		var bestLocale = "";
		if (availableFlatLocales) {
			var flatLocales = availableFlatLocales.split(",");
			for (var i = 0; i < flatLocales.length; i++) {
				if (targetLocale["indexOf"](flatLocales[i]) == 0) {
					if (flatLocales[i].length > bestLocale.length) {
						bestLocale = flatLocales[i];
					}
				}
			}
			if (!bestLocale) {
				bestLocale = "ROOT";
			}
		}
		var tempLocale = availableFlatLocales ? bestLocale : targetLocale;
		var bundle = dojo._loadedModules[bundlePackage];
		var localizedBundle = null;
		if (bundle) {
			if (dojo.config.localizationComplete && bundle._built) {
				return;
			}
			var jsLoc = tempLocale.replace(/-/g, "_");
			var translationPackage = bundlePackage + "." + jsLoc;
			localizedBundle = dojo._loadedModules[translationPackage];
		}
		if (!localizedBundle) {
			bundle = dojo["provide"](bundlePackage);
			var syms = dojo._getModuleSymbols(moduleName);
			var modpath = syms.concat("nls").join("/");
			var parent;
			dojo.i18n._searchLocalePath(tempLocale, availableFlatLocales, function (loc) {
				var jsLoc = loc.replace(/-/g, "_");
				var translationPackage = bundlePackage + "." + jsLoc;
				var loaded = false;
				if (!dojo._loadedModules[translationPackage]) {
					dojo["provide"](translationPackage);
					var module = [modpath];
					if (loc != "ROOT") {
						module.push(loc);
					}
					module.push(bundleName);
					var filespec = module.join("/") + ".js";
					loaded = dojo._loadPath(filespec, null, function (hash) {
						hash = hash.root || hash;
						var clazz = function () {
						};
						clazz.prototype = parent;
						bundle[jsLoc] = new clazz();
						for (var j in hash) {
							bundle[jsLoc][j] = hash[j];
						}
					});
				} else {
					loaded = true;
				}
				if (loaded && bundle[jsLoc]) {
					parent = bundle[jsLoc];
				} else {
					bundle[jsLoc] = parent;
				}
				if (availableFlatLocales) {
					return true;
				}
			});
		}
		if (availableFlatLocales && targetLocale != bestLocale) {
			bundle[targetLocale.replace(/-/g, "_")] = bundle[bestLocale.replace(/-/g, "_")];
		}
	};
	(function () {
		var extra = dojo.config.extraLocale;
		if (extra) {
			if (!extra instanceof Array) {
				extra = [extra];
			}
			var req = dojo.i18n._requireLocalization;
			dojo.i18n._requireLocalization = function (m, b, locale, availableFlatLocales) {
				req(m, b, locale, availableFlatLocales);
				if (locale) {
					return;
				}
				for (var i = 0; i < extra.length; i++) {
					req(m, b, extra[i], availableFlatLocales);
				}
			};
		}
	})();
	dojo.i18n._searchLocalePath = function (locale, down, searchFunc) {
		locale = dojo.i18n.normalizeLocale(locale);
		var elements = locale.split("-");
		var searchlist = [];
		for (var i = elements.length; i > 0; i--) {
			searchlist.push(elements.slice(0, i).join("-"));
		}
		searchlist.push(false);
		if (down) {
			searchlist.reverse();
		}
		for (var j = searchlist.length - 1; j >= 0; j--) {
			var loc = searchlist[j] || "ROOT";
			var stop = searchFunc(loc);
			if (stop) {
				break;
			}
		}
	};
	dojo.i18n._preloadLocalizations = function (bundlePrefix, localesGenerated) {
		function preload(locale) {
			locale = dojo.i18n.normalizeLocale(locale);
			dojo.i18n._searchLocalePath(locale, true, function (loc) {
				for (var i = 0; i < localesGenerated.length; i++) {
					if (localesGenerated[i] == loc) {
						dojo["require"](bundlePrefix + "_" + loc);
						return true;
					}
				}
				return false;
			});
		}
		preload();
		var extra = dojo.config.extraLocale || [];
		for (var i = 0; i < extra.length; i++) {
			preload(extra[i]);
		}
	};
}

