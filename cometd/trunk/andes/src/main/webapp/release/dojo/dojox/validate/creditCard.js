/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.validate.creditCard"]) {
	dojo._hasResource["dojox.validate.creditCard"] = true;
	dojo.provide("dojox.validate.creditCard");
	dojo.require("dojox.validate._base");
	dojox.validate._cardInfo = {"mc":"5[1-5][0-9]{14}", "ec":"5[1-5][0-9]{14}", "vi":"4(?:[0-9]{12}|[0-9]{15})", "ax":"3[47][0-9]{13}", "dc":"3(?:0[0-5][0-9]{11}|[68][0-9]{12})", "bl":"3(?:0[0-5][0-9]{11}|[68][0-9]{12})", "di":"6011[0-9]{12}", "jcb":"(?:3[0-9]{15}|(2131|1800)[0-9]{11})", "er":"2(?:014|149)[0-9]{11}"};
	dojox.validate.isValidCreditCard = function (value, ccType) {
		return ((ccType.toLowerCase() == "er" || dojox.validate.isValidLuhn(value)) && dojox.validate.isValidCreditCardNumber(value, ccType.toLowerCase()));
	};
	dojox.validate.isValidCreditCardNumber = function (value, ccType) {
		value = String(value).replace(/[- ]/g, "");
		var cardinfo = dojox.validate._cardInfo, results = [];
		if (ccType) {
			var expr = "^" + cardinfo[ccType.toLowerCase()] + "$";
			return expr ? !!value.match(expr) : false;
		}
		for (var p in cardinfo) {
			if (value.match("^" + cardinfo[p] + "$")) {
				results.push(p);
			}
		}
		return results.length ? results.join("|") : false;
	};
	dojox.validate.isValidCvv = function (value, ccType) {
		if (!dojo.isString(value)) {
			value = String(value);
		}
		var format;
		switch (ccType.toLowerCase()) {
		  case "mc":
		  case "ec":
		  case "vi":
		  case "di":
			format = "###";
			break;
		  case "ax":
			format = "####";
			break;
		}
		return !!format && value.length && dojox.validate.isNumberFormat(value, {format:format});
	};
}

