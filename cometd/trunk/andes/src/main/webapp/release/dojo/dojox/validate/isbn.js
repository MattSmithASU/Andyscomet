/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.validate.isbn"]) {
	dojo._hasResource["dojox.validate.isbn"] = true;
	dojo.provide("dojox.validate.isbn");
	dojox.validate.isValidIsbn = function (value) {
		var len, sum = 0, weight;
		if (!dojo.isString(value)) {
			value = String(value);
		}
		value = value.replace(/[- ]/g, "");
		len = value.length;
		switch (len) {
		  case 10:
			weight = len;
			for (var i = 0; i < 9; i++) {
				sum += parseInt(value.charAt(i)) * weight;
				weight--;
			}
			var t = value.charAt(9).toUpperCase();
			sum += t == "X" ? 10 : parseInt(t);
			return sum % 11 == 0;
			break;
		  case 13:
			weight = -1;
			for (var i = 0; i < len; i++) {
				sum += parseInt(value.charAt(i)) * (2 + weight);
				weight *= -1;
			}
			return sum % 10 == 0;
			break;
		}
		return false;
	};
}

