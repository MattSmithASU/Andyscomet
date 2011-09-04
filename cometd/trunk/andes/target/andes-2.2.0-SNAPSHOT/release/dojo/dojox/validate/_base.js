/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.validate._base"]) {
	dojo._hasResource["dojox.validate._base"] = true;
	dojo.provide("dojox.validate._base");
	dojo.experimental("dojox.validate");
	dojo.require("dojo.regexp");
	dojo.require("dojo.number");
	dojo.require("dojox.validate.regexp");
	dojox.validate.isText = function (value, flags) {
		flags = (typeof flags == "object") ? flags : {};
		if (/^\s*$/.test(value)) {
			return false;
		}
		if (typeof flags.length == "number" && flags.length != value.length) {
			return false;
		}
		if (typeof flags.minlength == "number" && flags.minlength > value.length) {
			return false;
		}
		if (typeof flags.maxlength == "number" && flags.maxlength < value.length) {
			return false;
		}
		return true;
	};
	dojox.validate._isInRangeCache = {};
	dojox.validate.isInRange = function (value, flags) {
		value = dojo.number.parse(value, flags);
		if (isNaN(value)) {
			return false;
		}
		flags = (typeof flags == "object") ? flags : {};
		var max = (typeof flags.max == "number") ? flags.max : Infinity, min = (typeof flags.min == "number") ? flags.min : -Infinity, dec = (typeof flags.decimal == "string") ? flags.decimal : ".", cache = dojox.validate._isInRangeCache, cacheIdx = value + "max" + max + "min" + min + "dec" + dec;
		if (typeof cache[cacheIdx] != "undefined") {
			return cache[cacheIdx];
		}
		cache[cacheIdx] = !(value < min || value > max);
		return cache[cacheIdx];
	};
	dojox.validate.isNumberFormat = function (value, flags) {
		var re = new RegExp("^" + dojox.validate.regexp.numberFormat(flags) + "$", "i");
		return re.test(value);
	};
	dojox.validate.isValidLuhn = function (value) {
		var sum = 0, parity, curDigit;
		if (!dojo.isString(value)) {
			value = String(value);
		}
		value = value.replace(/[- ]/g, "");
		parity = value.length % 2;
		for (var i = 0; i < value.length; i++) {
			curDigit = parseInt(value.charAt(i));
			if (i % 2 == parity) {
				curDigit *= 2;
			}
			if (curDigit > 9) {
				curDigit -= 9;
			}
			sum += curDigit;
		}
		return !(sum % 10);
	};
}

