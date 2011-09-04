/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.date.relative"]) {
	dojo._hasResource["dojox.date.relative"] = true;
	dojo.provide("dojox.date.relative");
	dojo.require("dojo.date");
	dojo.require("dojo.date.locale");
	(function (d) {
		var DAY = 1000 * 60 * 60 * 24;
		var SIX_DAYS = 6 * DAY;
		var del = d.delegate;
		var ddl = d.date.locale;
		var ggb = ddl._getGregorianBundle;
		var fmt = ddl.format;
		function _clearTime(date) {
			date = dojo.clone(date);
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			return date;
		}
		dojox.date.relative.format = function (dateObject, options) {
			options = options || {};
			var today = _clearTime(options.relativeDate || new Date());
			var diff = today.getTime() - _clearTime(dateObject).getTime();
			var fmtOpts = {locale:options.locale};
			if (diff === 0) {
				return fmt(dateObject, del(fmtOpts, {selector:"time"}));
			} else {
				if (diff <= SIX_DAYS && diff > 0 && options.weekCheck !== false) {
					return fmt(dateObject, del(fmtOpts, {selector:"date", datePattern:"EEE"})) + " " + fmt(dateObject, del(fmtOpts, {selector:"time", formatLength:"short"}));
				} else {
					if (dateObject.getFullYear() == today.getFullYear()) {
						var bundle = ggb(dojo.i18n.normalizeLocale(options.locale));
						return fmt(dateObject, del(fmtOpts, {selector:"date", datePattern:bundle["dateFormatItem-MMMd"]}));
					} else {
						return fmt(dateObject, del(fmtOpts, {selector:"date", formatLength:"medium", locale:options.locale}));
					}
				}
			}
		};
	})(dojo);
}

