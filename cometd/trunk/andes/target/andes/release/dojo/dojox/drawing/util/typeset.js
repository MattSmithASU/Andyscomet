/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.util.typeset"]) {
	dojo._hasResource["dojox.drawing.util.typeset"] = true;
	dojo.provide("dojox.drawing.util.typeset");
	dojo.require("dojox.drawing.library.greek");
	(function () {
		var greeks = dojox.drawing.library.greek;
		dojox.drawing.util.typeset = {convertHTML:function (inText) {
			if (inText) {
				return inText.replace(/&([^;]+);/g, function (match, code) {
					if (code.charAt(0) == "#") {
						var number = +code.substr(1);
						if (!isNaN(number)) {
							return String.fromCharCode(number);
						}
					} else {
						if (greeks[code]) {
							return String.fromCharCode(greeks[code]);
						}
					}
					console.warn("no HTML conversion for ", match);
					return match;
				});
			}
			return inText;
		}, convertLaTeX:function (inText) {
			if (inText) {
				return inText.replace(/\\([a-zA-Z]+)/g, function (match, word) {
					if (greeks[word]) {
						return String.fromCharCode(greeks[word]);
					} else {
						if (word.substr(0, 2) == "mu") {
							return String.fromCharCode(greeks["mu"]) + word.substr(2);
						} else {
							if (word.substr(0, 5) == "theta") {
								return String.fromCharCode(greeks["theta"]) + word.substr(5);
							} else {
								if (word.substr(0, 3) == "phi") {
									return String.fromCharCode(greeks["phi"]) + word.substr(3);
								}
							}
						}
					}
					console.log("no match for ", match, " in ", inText);
					console.log("Need user-friendly error handling here!");
				}).replace(/\\\\/g, "\\");
			}
			return inText;
		}};
	})();
}

