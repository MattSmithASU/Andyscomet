/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.variablename"]) {
	dojo._hasResource["andes.variablename"] = true;
	dojo.provide("andes.variablename");
	andes.variablename.parse = function (intext) {
		if (intext) {
			var cantext = intext.replace(/\s+/g, " ");
			cantext = cantext.replace(/\s*=\s*/, " = ");
			cantext = cantext.replace(/\s*:\s*/, ": ");
			cantext = cantext.replace(/^\s/, "");
			cantext = cantext.replace(/^[?!;:,&#%]/, "");
			var equality = /^([\w\\$]+)(:| is| =) /i;
			var match = equality.exec(cantext);
			if (match) {
				return match[1];
			}
			var letre = /^let ([\w\\$]+) (=|be) /i;
			match = letre.exec(cantext);
			if (match) {
				return match[1];
			}
			var definere = /^define ([\w\\$]+) (to be|=|as) /i;
			match = definere.exec(cantext);
			if (match) {
				return match[1];
			}
		}
		return "";
	};
}

