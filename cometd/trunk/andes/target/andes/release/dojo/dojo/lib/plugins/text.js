/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



define(["dojo", "dojo/cache"], function (dojo) {
	var cached = {}, cache = function (cacheId, url, value) {
		cached[cacheId] = value;
		dojo.cache({toString:function () {
			return url;
		}}, value);
	}, strip = function (text) {
		if (text) {
			text = text.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, "");
			var matches = text.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
			if (matches) {
				text = matches[1];
			}
		} else {
			text = "";
		}
		return text;
	};
	return {load:function (id, require, load) {
		var match, cacheId, url, parts = id.split("!");
		if (require.toAbsMid) {
			match = parts[0].match(/(.+)(\.[^\/]*)$/);
			cacheId = match ? require.toAbsMid(match[1]) + match[2] : require.toAbsMid(parts[0]);
			if (cacheId in cached) {
				load(parts[1] == "strip" ? strip(cached[cacheId]) : cached[cacheId]);
				return;
			}
		}
		url = require.toUrl(parts[0]);
		dojo.xhrGet({url:url, load:function (text) {
			cacheId && cache(cacheId, url, text);
			load(parts[1] == "strip" ? strip(text) : text);
		}});
	}, cache:function (cacheId, mid, type, value) {
		cache(cacheId, require.nameToUrl(mid) + type, value);
	}};
});

