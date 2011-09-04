/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.data.util.filter"]) {
	dojo._hasResource["dojo.data.util.filter"] = true;
	dojo.provide("dojo.data.util.filter");
	dojo.getObject("data.util.filter", true, dojo);
	dojo.data.util.filter.patternToRegExp = function (pattern, ignoreCase) {
		var rxp = "^";
		var c = null;
		for (var i = 0; i < pattern.length; i++) {
			c = pattern.charAt(i);
			switch (c) {
			  case "\\":
				rxp += c;
				i++;
				rxp += pattern.charAt(i);
				break;
			  case "*":
				rxp += ".*";
				break;
			  case "?":
				rxp += ".";
				break;
			  case "$":
			  case "^":
			  case "/":
			  case "+":
			  case ".":
			  case "|":
			  case "(":
			  case ")":
			  case "{":
			  case "}":
			  case "[":
			  case "]":
				rxp += "\\";
			  default:
				rxp += c;
			}
		}
		rxp += "$";
		if (ignoreCase) {
			return new RegExp(rxp, "mi");
		} else {
			return new RegExp(rxp, "m");
		}
	};
}

