/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.currency"]) {
	dojo._hasResource["dojo.currency"] = true;
	dojo.provide("dojo.currency");
	dojo.require("dojo.number");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojo.cldr", "currency", null, "ROOT,ar,ca,cs,da,de,el,en,en-au,en-ca,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,ro,ru,sk,sl,sv,th,tr,zh,zh-hant,zh-hk,zh-tw");
	dojo.require("dojo.cldr.monetary");
	dojo.getObject("currency", true, dojo);
	dojo.currency._mixInDefaults = function (options) {
		options = options || {};
		options.type = "currency";
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "currency", options.locale) || {};
		var iso = options.currency;
		var data = dojo.cldr.monetary.getData(iso);
		dojo.forEach(["displayName", "symbol", "group", "decimal"], function (prop) {
			data[prop] = bundle[iso + "_" + prop];
		});
		data.fractional = [true, false];
		return dojo.mixin(data, options);
	};
	dojo.currency.format = function (value, options) {
		return dojo.number.format(value, dojo.currency._mixInDefaults(options));
	};
	dojo.currency.regexp = function (options) {
		return dojo.number.regexp(dojo.currency._mixInDefaults(options));
	};
	dojo.currency.parse = function (expression, options) {
		return dojo.number.parse(expression, dojo.currency._mixInDefaults(options));
	};
}

