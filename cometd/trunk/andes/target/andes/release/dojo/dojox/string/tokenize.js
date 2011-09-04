/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.string.tokenize"]) {
	dojo._hasResource["dojox.string.tokenize"] = true;
	dojo.provide("dojox.string.tokenize");
	dojox.string.tokenize = function (str, re, parseDelim, instance) {
		var tokens = [];
		var match, content, lastIndex = 0;
		while (match = re.exec(str)) {
			content = str.slice(lastIndex, re.lastIndex - match[0].length);
			if (content.length) {
				tokens.push(content);
			}
			if (parseDelim) {
				if (dojo.isOpera) {
					var copy = match.slice(0);
					while (copy.length < match.length) {
						copy.push(null);
					}
					match = copy;
				}
				var parsed = parseDelim.apply(instance, match.slice(1).concat(tokens.length));
				if (typeof parsed != "undefined") {
					tokens.push(parsed);
				}
			}
			lastIndex = re.lastIndex;
		}
		content = str.slice(lastIndex);
		if (content.length) {
			tokens.push(content);
		}
		return tokens;
	};
}

