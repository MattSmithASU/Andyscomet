/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.cache"]) {
	dojo._hasResource["dojo.cache"] = true;
	dojo.provide("dojo.cache");
	var cache = {};
	dojo.cache = function (module, url, value) {
		if (typeof module == "string") {
			var pathObj = dojo.moduleUrl(module, url);
		} else {
			pathObj = module;
			value = url;
		}
		var key = pathObj.toString();
		var val = value;
		if (value != undefined && !dojo.isString(value)) {
			val = ("value" in value ? value.value : undefined);
		}
		var sanitize = value && value.sanitize ? true : false;
		if (typeof val == "string") {
			val = cache[key] = sanitize ? dojo.cache._sanitize(val) : val;
		} else {
			if (val === null) {
				delete cache[key];
			} else {
				if (!(key in cache)) {
					val = dojo._getText(key);
					cache[key] = sanitize ? dojo.cache._sanitize(val) : val;
				}
				val = cache[key];
			}
		}
		return val;
	};
	dojo.cache._sanitize = function (val) {
		if (val) {
			val = val.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, "");
			var matches = val.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
			if (matches) {
				val = matches[1];
			}
		} else {
			val = "";
		}
		return val;
	};
}

