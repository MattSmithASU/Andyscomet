/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base._loader.loader_xd"]) {
	dojo._hasResource["dojo._base._loader.loader_xd"] = true;
	dojo.provide("dojo._base._loader.loader_xd");
	dojo._xdReset = function () {
		dojo._isXDomain = dojo.config.useXDomain || false;
		dojo._xdClearInterval();
		dojo._xdInFlight = {};
		dojo._xdOrderedReqs = [];
		dojo._xdDepMap = {};
		dojo._xdContents = [];
		dojo._xdDefList = [];
	};
	dojo._xdClearInterval = function () {
		if (dojo._xdTimer) {
			clearInterval(dojo._xdTimer);
			dojo._xdTimer = 0;
		}
	};
	dojo._xdReset();
	dojo._xdCreateResource = function (contents, resourceName, resourcePath) {
		var depContents = contents.replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, "");
		var deps = [];
		var depRegExp = /dojo.(require|requireIf|provide|requireAfterIf|platformRequire|requireLocalization)\s*\(([\w\W]*?)\)/mg;
		var match;
		while ((match = depRegExp.exec(depContents)) != null) {
			if (match[1] == "requireLocalization") {
				eval(match[0]);
			} else {
				deps.push("\"" + match[1] + "\", " + match[2]);
			}
		}
		var output = [];
		output.push(dojo._scopeName + "._xdResourceLoaded(function(" + dojo._scopePrefixArgs + "){\n");
		var loadInitCalls = dojo._xdExtractLoadInits(contents);
		if (loadInitCalls) {
			contents = loadInitCalls[0];
			for (var i = 1; i < loadInitCalls.length; i++) {
				output.push(loadInitCalls[i] + ";\n");
			}
		}
		output.push("return {");
		if (deps.length > 0) {
			output.push("depends: [");
			for (i = 0; i < deps.length; i++) {
				if (i > 0) {
					output.push(",\n");
				}
				output.push("[" + deps[i] + "]");
			}
			output.push("],");
		}
		output.push("\ndefineResource: function(" + dojo._scopePrefixArgs + "){");
		if (!dojo.config["debugAtAllCosts"] || resourceName == "dojo._base._loader.loader_debug") {
			output.push(contents);
		}
		output.push("\n}, resourceName: '" + resourceName + "', resourcePath: '" + resourcePath + "'};});");
		return output.join("");
	};
	dojo._xdExtractLoadInits = function (fileContents) {
		var regexp = /dojo.loadInit\s*\(/g;
		regexp.lastIndex = 0;
		var parenRe = /[\(\)]/g;
		parenRe.lastIndex = 0;
		var results = [];
		var matches;
		while ((matches = regexp.exec(fileContents))) {
			parenRe.lastIndex = regexp.lastIndex;
			var matchCount = 1;
			var parenMatch;
			while ((parenMatch = parenRe.exec(fileContents))) {
				if (parenMatch[0] == ")") {
					matchCount -= 1;
				} else {
					matchCount += 1;
				}
				if (matchCount == 0) {
					break;
				}
			}
			if (matchCount != 0) {
				throw "unmatched paren around character " + parenRe.lastIndex + " in: " + fileContents;
			}
			var startIndex = regexp.lastIndex - matches[0].length;
			results.push(fileContents.substring(startIndex, parenRe.lastIndex));
			var remLength = parenRe.lastIndex - startIndex;
			fileContents = fileContents.substring(0, startIndex) + fileContents.substring(parenRe.lastIndex, fileContents.length);
			regexp.lastIndex = parenRe.lastIndex - remLength;
			regexp.lastIndex = parenRe.lastIndex;
		}
		if (results.length > 0) {
			results.unshift(fileContents);
		}
		return (results.length ? results : null);
	};
	dojo._xdIsXDomainPath = function (relpath) {
		var colonIndex = relpath.indexOf(":");
		var slashIndex = relpath.indexOf("/");
		if (colonIndex > 0 && colonIndex < slashIndex || relpath.indexOf("//") === 0) {
			return true;
		} else {
			var url = dojo.baseUrl;
			colonIndex = url.indexOf(":");
			slashIndex = url.indexOf("/");
			if (url.indexOf("//") === 0 || (colonIndex > 0 && colonIndex < slashIndex && (!location.host || url.indexOf("http://" + location.host) != 0))) {
				return true;
			}
		}
		return false;
	};
	dojo._loadPath = function (relpath, module, cb) {
		var currentIsXDomain = dojo._xdIsXDomainPath(relpath);
		dojo._isXDomain |= currentIsXDomain;
		var uri = ((relpath.charAt(0) == "/" || relpath.match(/^\w+:/)) ? "" : dojo.baseUrl) + relpath;
		try {
			return ((!module || dojo._isXDomain) ? dojo._loadUri(uri, cb, currentIsXDomain, module) : dojo._loadUriAndCheck(uri, module, cb));
		}
		catch (e) {
			console.error(e);
			return false;
		}
	};
	dojo._xdCharSet = "utf-8";
	dojo._loadUri = function (uri, cb, currentIsXDomain, module) {
		if (dojo._loadedUrls[uri]) {
			return 1;
		}
		if (dojo._isXDomain && module && module != "dojo.i18n") {
			dojo._xdOrderedReqs.push(module);
			if (currentIsXDomain || uri.indexOf("/nls/") == -1) {
				dojo._xdInFlight[module] = true;
				dojo._inFlightCount++;
			}
			if (!dojo._xdTimer) {
				if (dojo.isAIR) {
					dojo._xdTimer = setInterval(function () {
						dojo._xdWatchInFlight();
					}, 100);
				} else {
					dojo._xdTimer = setInterval(dojo._scopeName + "._xdWatchInFlight();", 100);
				}
			}
			dojo._xdStartTime = (new Date()).getTime();
		}
		if (currentIsXDomain) {
			var lastIndex = uri.lastIndexOf(".");
			if (lastIndex <= 0) {
				lastIndex = uri.length - 1;
			}
			var xdUri = uri.substring(0, lastIndex) + ".xd";
			if (lastIndex != uri.length - 1) {
				xdUri += uri.substring(lastIndex, uri.length);
			}
			if (dojo.isAIR) {
				xdUri = xdUri.replace("app:/", "/");
			}
			var element = document.createElement("script");
			element.type = "text/javascript";
			if (dojo._xdCharSet) {
				element.charset = dojo._xdCharSet;
			}
			element.src = xdUri;
			if (!dojo.headElement) {
				dojo._headElement = document.getElementsByTagName("head")[0];
				if (!dojo._headElement) {
					dojo._headElement = document.getElementsByTagName("html")[0];
				}
			}
			dojo._headElement.appendChild(element);
		} else {
			var contents = dojo._getText(uri, null, true);
			if (contents == null) {
				return 0;
			}
			if (dojo._isXDomain && uri.indexOf("/nls/") == -1 && module != "dojo.i18n") {
				var res = dojo._xdCreateResource(contents, module, uri);
				dojo.eval(res);
			} else {
				if (cb) {
					contents = "(" + contents + ")";
				} else {
					contents = dojo._scopePrefix + contents + dojo._scopeSuffix;
				}
				var value = dojo["eval"](contents + "\r\n//@ sourceURL=" + uri);
				if (cb) {
					cb(value);
				}
			}
		}
		dojo._loadedUrls[uri] = true;
		dojo._loadedUrls.push(uri);
		return true;
	};
	dojo._xdResourceLoaded = function (res) {
		res = res.apply(dojo.global, dojo._scopeArgs);
		var deps = res.depends;
		var requireList = null;
		var requireAfterList = null;
		var provideList = [];
		if (deps && deps.length > 0) {
			var dep = null;
			var insertHint = 0;
			var attachedResource = false;
			for (var i = 0; i < deps.length; i++) {
				dep = deps[i];
				if (dep[0] == "provide") {
					provideList.push(dep[1]);
				} else {
					if (!requireList) {
						requireList = [];
					}
					if (!requireAfterList) {
						requireAfterList = [];
					}
					var unpackedDeps = dojo._xdUnpackDependency(dep);
					if (unpackedDeps.requires) {
						requireList = requireList.concat(unpackedDeps.requires);
					}
					if (unpackedDeps.requiresAfter) {
						requireAfterList = requireAfterList.concat(unpackedDeps.requiresAfter);
					}
				}
				var depType = dep[0];
				var objPath = depType.split(".");
				if (objPath.length == 2) {
					dojo[objPath[0]][objPath[1]].apply(dojo[objPath[0]], dep.slice(1));
				} else {
					dojo[depType].apply(dojo, dep.slice(1));
				}
			}
			if (provideList.length == 1 && provideList[0] == "dojo._base._loader.loader_debug") {
				res.defineResource(dojo);
			} else {
				var contentIndex = dojo._xdContents.push({content:res.defineResource, resourceName:res["resourceName"], resourcePath:res["resourcePath"], isDefined:false}) - 1;
				for (i = 0; i < provideList.length; i++) {
					dojo._xdDepMap[provideList[i]] = {requires:requireList, requiresAfter:requireAfterList, contentIndex:contentIndex};
				}
			}
			for (i = 0; i < provideList.length; i++) {
				dojo._xdInFlight[provideList[i]] = false;
			}
		}
	};
	dojo._xdLoadFlattenedBundle = function (moduleName, bundleName, locale, bundleData) {
		locale = locale || "root";
		var jsLoc = dojo.i18n.normalizeLocale(locale).replace("-", "_");
		var bundleResource = [moduleName, "nls", bundleName].join(".");
		var bundle = dojo["provide"](bundleResource);
		bundle[jsLoc] = bundleData;
		var mapName = [moduleName, jsLoc, bundleName].join(".");
		var bundleMap = dojo._xdBundleMap[mapName];
		if (bundleMap) {
			for (var param in bundleMap) {
				bundle[param] = bundleData;
			}
		}
	};
	dojo._xdInitExtraLocales = function () {
		var extra = dojo.config.extraLocale;
		if (extra) {
			if (!extra instanceof Array) {
				extra = [extra];
			}
			dojo._xdReqLoc = dojo.xdRequireLocalization;
			dojo.xdRequireLocalization = function (m, b, locale, fLocales) {
				dojo._xdReqLoc(m, b, locale, fLocales);
				if (locale) {
					return;
				}
				for (var i = 0; i < extra.length; i++) {
					dojo._xdReqLoc(m, b, extra[i], fLocales);
				}
			};
		}
	};
	dojo._xdBundleMap = {};
	dojo.xdRequireLocalization = function (moduleName, bundleName, locale, availableFlatLocales) {
		if (dojo._xdInitExtraLocales) {
			dojo._xdInitExtraLocales();
			dojo._xdInitExtraLocales = null;
			dojo.xdRequireLocalization.apply(dojo, arguments);
			return;
		}
		var locales = availableFlatLocales.split(",");
		var jsLoc = dojo.i18n.normalizeLocale(locale);
		var bestLocale = "";
		for (var i = 0; i < locales.length; i++) {
			if (jsLoc.indexOf(locales[i]) == 0) {
				if (locales[i].length > bestLocale.length) {
					bestLocale = locales[i];
				}
			}
		}
		var fixedBestLocale = bestLocale.replace("-", "_");
		var bundleResource = dojo.getObject([moduleName, "nls", bundleName].join("."));
		if (!bundleResource || !bundleResource[fixedBestLocale]) {
			var mapName = [moduleName, (fixedBestLocale || "root"), bundleName].join(".");
			var bundleMap = dojo._xdBundleMap[mapName];
			if (!bundleMap) {
				bundleMap = dojo._xdBundleMap[mapName] = {};
			}
			bundleMap[jsLoc.replace("-", "_")] = true;
			dojo.require(moduleName + ".nls" + (bestLocale ? "." + bestLocale : "") + "." + bundleName);
		}
	};
	dojo._xdRealRequireLocalization = dojo.requireLocalization;
	dojo.requireLocalization = function (moduleName, bundleName, locale, availableFlatLocales) {
		var modulePath = dojo.moduleUrl(moduleName).toString();
		if (dojo._xdIsXDomainPath(modulePath)) {
			return dojo.xdRequireLocalization.apply(dojo, arguments);
		} else {
			return dojo._xdRealRequireLocalization.apply(dojo, arguments);
		}
	};
	dojo._xdUnpackDependency = function (dep) {
		var newDeps = null;
		var newAfterDeps = null;
		switch (dep[0]) {
		  case "requireIf":
		  case "requireAfterIf":
			if (dep[1] === true) {
				newDeps = [{name:dep[2], content:null}];
			}
			break;
		  case "platformRequire":
			var modMap = dep[1];
			var common = modMap["common"] || [];
			newDeps = (modMap[dojo.hostenv.name_]) ? common.concat(modMap[dojo.hostenv.name_] || []) : common.concat(modMap["default"] || []);
			if (newDeps) {
				for (var i = 0; i < newDeps.length; i++) {
					if (newDeps[i] instanceof Array) {
						newDeps[i] = {name:newDeps[i][0], content:null};
					} else {
						newDeps[i] = {name:newDeps[i], content:null};
					}
				}
			}
			break;
		  case "require":
			newDeps = [{name:dep[1], content:null}];
			break;
		  case "i18n._preloadLocalizations":
			dojo.i18n._preloadLocalizations.apply(dojo.i18n._preloadLocalizations, dep.slice(1));
			break;
		}
		if (dep[0] == "requireAfterIf" || dep[0] == "requireIf") {
			newAfterDeps = newDeps;
			newDeps = null;
		}
		return {requires:newDeps, requiresAfter:newAfterDeps};
	};
	dojo._xdWalkReqs = function () {
		var reqChain = null;
		var req;
		for (var i = 0; i < dojo._xdOrderedReqs.length; i++) {
			req = dojo._xdOrderedReqs[i];
			if (dojo._xdDepMap[req]) {
				reqChain = [req];
				reqChain[req] = true;
				dojo._xdEvalReqs(reqChain);
			}
		}
	};
	dojo._xdEvalReqs = function (reqChain) {
		while (reqChain.length > 0) {
			var req = reqChain[reqChain.length - 1];
			var res = dojo._xdDepMap[req];
			var i, reqs, nextReq;
			if (res) {
				reqs = res.requires;
				if (reqs && reqs.length > 0) {
					for (i = 0; i < reqs.length; i++) {
						nextReq = reqs[i].name;
						if (nextReq && !reqChain[nextReq]) {
							reqChain.push(nextReq);
							reqChain[nextReq] = true;
							dojo._xdEvalReqs(reqChain);
						}
					}
				}
				var contents = dojo._xdContents[res.contentIndex];
				if (!contents.isDefined) {
					var content = contents.content;
					content["resourceName"] = contents["resourceName"];
					content["resourcePath"] = contents["resourcePath"];
					dojo._xdDefList.push(content);
					contents.isDefined = true;
				}
				dojo._xdDepMap[req] = null;
				reqs = res.requiresAfter;
				if (reqs && reqs.length > 0) {
					for (i = 0; i < reqs.length; i++) {
						nextReq = reqs[i].name;
						if (nextReq && !reqChain[nextReq]) {
							reqChain.push(nextReq);
							reqChain[nextReq] = true;
							dojo._xdEvalReqs(reqChain);
						}
					}
				}
			}
			reqChain.pop();
		}
	};
	dojo._xdWatchInFlight = function () {
		var noLoads = "";
		var waitInterval = (dojo.config.xdWaitSeconds || 15) * 1000;
		var expired = (dojo._xdStartTime + waitInterval) < (new Date()).getTime();
		for (var param in dojo._xdInFlight) {
			if (dojo._xdInFlight[param] === true) {
				if (expired) {
					noLoads += param + " ";
				} else {
					return;
				}
			}
		}
		dojo._xdClearInterval();
		if (expired) {
			throw "Could not load cross-domain resources: " + noLoads;
		}
		dojo._xdWalkReqs();
		var defLength = dojo._xdDefList.length;
		for (var i = 0; i < defLength; i++) {
			var content = dojo._xdDefList[i];
			if (dojo.config["debugAtAllCosts"] && content["resourceName"]) {
				if (!dojo["_xdDebugQueue"]) {
					dojo._xdDebugQueue = [];
				}
				dojo._xdDebugQueue.push({resourceName:content.resourceName, resourcePath:content.resourcePath});
			} else {
				content.apply(dojo.global, dojo._scopeArgs);
			}
		}
		for (i = 0; i < dojo._xdContents.length; i++) {
			var current = dojo._xdContents[i];
			if (current.content && !current.isDefined) {
				current.content.apply(dojo.global, dojo._scopeArgs);
			}
		}
		dojo._xdReset();
		if (dojo["_xdDebugQueue"] && dojo._xdDebugQueue.length > 0) {
			dojo._xdDebugFileLoaded();
		} else {
			dojo._xdNotifyLoaded();
		}
	};
	dojo._xdNotifyLoaded = function () {
		for (var prop in dojo._xdInFlight) {
			if (typeof dojo._xdInFlight[prop] == "boolean") {
				return;
			}
		}
		dojo._inFlightCount = 0;
		if (dojo._initFired && !dojo._loadNotifying) {
			dojo._callLoaded();
		}
	};
}

