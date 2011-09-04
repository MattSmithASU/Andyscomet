/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.regexp"]) {
	dojo._hasResource["dojo.regexp"] = true;
	dojo.provide("dojo.regexp");
	dojo.getObject("regexp", true, dojo);
	dojo.regexp.escapeString = function (str, except) {
		return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function (ch) {
			if (except && except.indexOf(ch) != -1) {
				return ch;
			}
			return "\\" + ch;
		});
	};
	dojo.regexp.buildGroupRE = function (arr, re, nonCapture) {
		if (!(arr instanceof Array)) {
			return re(arr);
		}
		var b = [];
		for (var i = 0; i < arr.length; i++) {
			b.push(re(arr[i]));
		}
		return dojo.regexp.group(b.join("|"), nonCapture);
	};
	dojo.regexp.group = function (expression, nonCapture) {
		return "(" + (nonCapture ? "?:" : "") + expression + ")";
	};
}

