/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.json"]) {
	dojo._hasResource["dojo.json"] = true;
	dojo.provide("dojo.json");
	(function () {
		var result;
		var hasJSON = typeof JSON != "undefined";
		var features = {"json-parse":hasJSON, "json-stringify":hasJSON && JSON.stringify({a:0}, function (k, v) {
			return v || 1;
		}) == "{\"a\":1}"};
		function has(feature) {
			return features[feature];
		}
		if (has("json-stringify")) {
			result = JSON;
		} else {
			var escapeString = function (str) {
				return ("\"" + str.replace(/(["\\])/g, "\\$1") + "\"").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
			};
			result = {parse:has("json-parse") ? JSON.parse : function (str) {
				return eval("(" + str + ")");
			}, stringify:function (value, replacer, spacer) {
				var undef;
				if (typeof replacer == "string") {
					spacer = replacer;
					replacer = null;
				}
				function stringify(it, indent, key) {
					if (replacer) {
						it = replacer(key, it);
					}
					var val, objtype = typeof it;
					if (objtype == "number" || objtype == "boolean") {
						return it + "";
					}
					if (it === null) {
						return "null";
					}
					if (typeof it == "string") {
						return escapeString(it);
					}
					if (objtype == "function" || objtype == "undefined") {
						return undef;
					}
					if (typeof it.toJSON == "function") {
						return stringify(tf.call(it.toJSON, key), indent, key);
					}
					var nextIndent = spacer ? (indent + spacer) : "";
					if (it.nodeType && it.cloneNode) {
						throw new Error("Can't serialize DOM nodes");
					}
					var sep = spacer ? " " : "";
					var newLine = spacer ? "\n" : "";
					if (it instanceof Array) {
						var itl, res = [];
						for (key = 0, itl = it.length; key < itl; key++) {
							var obj = it[key];
							val = stringify(obj, nextIndent, key);
							if (typeof val != "string") {
								val = "null";
							}
							res.push(newLine + nextIndent + val);
						}
						return "[" + res.join(",") + newLine + indent + "]";
					}
					var output = [];
					for (key in it) {
						var keyStr;
						if (typeof key == "number") {
							keyStr = "\"" + key + "\"";
						} else {
							if (typeof key == "string") {
								keyStr = escapeString(key);
							} else {
								continue;
							}
						}
						val = stringify(it[key], nextIndent, key);
						if (typeof val != "string") {
							continue;
						}
						output.push(newLine + nextIndent + keyStr + ":" + sep + val);
					}
					return "{" + output.join(",") + newLine + indent + "}";
				}
				return stringify(value, "", "");
			}};
		}
		dojo.json = result;
		return result;
	})();
}

