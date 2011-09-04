/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.string"]) {
	dojo._hasResource["dojo.string"] = true;
	dojo.provide("dojo.string");
	dojo.getObject("string", true, dojo);
	dojo.string.rep = function (str, num) {
		if (num <= 0 || !str) {
			return "";
		}
		var buf = [];
		for (; ; ) {
			if (num & 1) {
				buf.push(str);
			}
			if (!(num >>= 1)) {
				break;
			}
			str += str;
		}
		return buf.join("");
	};
	dojo.string.pad = function (text, size, ch, end) {
		if (!ch) {
			ch = "0";
		}
		var out = String(text), pad = dojo.string.rep(ch, Math.ceil((size - out.length) / ch.length));
		return end ? out + pad : pad + out;
	};
	dojo.string.substitute = function (template, map, transform, thisObject) {
		thisObject = thisObject || dojo.global;
		transform = transform ? dojo.hitch(thisObject, transform) : function (v) {
			return v;
		};
		return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key, format) {
			var value = dojo.getObject(key, false, map);
			if (format) {
				value = dojo.getObject(format, false, thisObject).call(thisObject, value, key);
			}
			return transform(value, key).toString();
		});
	};
	dojo.string.trim = String.prototype.trim ? dojo.trim : function (str) {
		str = str.replace(/^\s+/, "");
		for (var i = str.length - 1; i >= 0; i--) {
			if (/\S/.test(str.charAt(i))) {
				str = str.substring(0, i + 1);
				break;
			}
		}
		return str;
	};
}

