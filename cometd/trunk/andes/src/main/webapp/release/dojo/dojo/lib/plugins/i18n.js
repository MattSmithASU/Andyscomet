/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



define(["dojo"], function (dojo) {
	var nlsRe = /(^.*(^|\/)nls(\/|$))([^\/]*)\/?([^\/]*)/, getAvailableLocales = function (root, locale, bundlePath, bundleName) {
		for (var result = [bundlePath + bundleName], localeParts = locale.split("-"), current = "", i = 0; i < localeParts.length; i++) {
			current += localeParts[i];
			if (root[current]) {
				result.push(bundlePath + current + "/" + bundleName);
			}
		}
		return result;
	}, cache = {};
	return {load:function (id, require, load) {
		var match = nlsRe.exec(id), bundlePath = (require.toAbsMid && require.toAbsMid(match[1])) || match[1], bundleName = match[5] || match[4], bundlePathAndName = bundlePath + bundleName, locale = (match[5] && match[4]) || dojo.locale, target = bundlePathAndName + "/" + locale;
		if (cache[target]) {
			load(cache[target]);
			return;
		}
		require([bundlePathAndName], function (root) {
			var current = cache[bundlePathAndName + "/"] = dojo.clone(root.root), availableLocales = getAvailableLocales(root, locale, bundlePath, bundleName);
			require(availableLocales, function () {
				for (var i = 1; i < availableLocales.length; i++) {
					cache[bundlePathAndName + "/" + availableLocales[i]] = current = dojo.mixin(dojo.clone(current), arguments[i]);
				}
				cache[target] = current;
				load(current);
			});
		});
	}, cache:function (mid, value) {
		cache[mid] = value;
	}};
});

