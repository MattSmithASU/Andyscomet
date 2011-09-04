/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.dtl.filter.dates"]) {
	dojo._hasResource["dojox.dtl.filter.dates"] = true;
	dojo.provide("dojox.dtl.filter.dates");
	dojo.require("dojox.dtl.utils.date");
	(function () {
		var ddfd = dojox.dtl.filter.dates;
		dojo.mixin(ddfd, {_toDate:function (value) {
			if (value instanceof Date) {
				return value;
			}
			value = new Date(value);
			if (value.getTime() == new Date(0).getTime()) {
				return "";
			}
			return value;
		}, date:function (value, arg) {
			value = ddfd._toDate(value);
			if (!value) {
				return "";
			}
			arg = arg || "N j, Y";
			return dojox.dtl.utils.date.format(value, arg);
		}, time:function (value, arg) {
			value = ddfd._toDate(value);
			if (!value) {
				return "";
			}
			arg = arg || "P";
			return dojox.dtl.utils.date.format(value, arg);
		}, timesince:function (value, arg) {
			value = ddfd._toDate(value);
			if (!value) {
				return "";
			}
			var timesince = dojox.dtl.utils.date.timesince;
			if (arg) {
				return timesince(arg, value);
			}
			return timesince(value);
		}, timeuntil:function (value, arg) {
			value = ddfd._toDate(value);
			if (!value) {
				return "";
			}
			var timesince = dojox.dtl.utils.date.timesince;
			if (arg) {
				return timesince(arg, value);
			}
			return timesince(new Date(), value);
		}});
	})();
}

