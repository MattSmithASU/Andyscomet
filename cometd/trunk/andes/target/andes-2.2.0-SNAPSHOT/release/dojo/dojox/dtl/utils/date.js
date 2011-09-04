/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.dtl.utils.date"]) {
	dojo._hasResource["dojox.dtl.utils.date"] = true;
	dojo.provide("dojox.dtl.utils.date");
	dojo.require("dojox.date.php");
	dojox.dtl.utils.date.DateFormat = function (format) {
		dojox.date.php.DateFormat.call(this, format);
	};
	dojo.extend(dojox.dtl.utils.date.DateFormat, dojox.date.php.DateFormat.prototype, {f:function () {
		return (!this.date.getMinutes()) ? this.g() : this.g() + ":" + this.i();
	}, N:function () {
		return dojox.dtl.utils.date._months_ap[this.date.getMonth()];
	}, P:function () {
		if (!this.date.getMinutes() && !this.date.getHours()) {
			return "midnight";
		}
		if (!this.date.getMinutes() && this.date.getHours() == 12) {
			return "noon";
		}
		return this.f() + " " + this.a();
	}});
	dojo.mixin(dojox.dtl.utils.date, {format:function (date, format) {
		var df = new dojox.dtl.utils.date.DateFormat(format);
		return df.format(date);
	}, timesince:function (d, now) {
		if (!(d instanceof Date)) {
			d = new Date(d.year, d.month, d.day);
		}
		if (!now) {
			now = new Date();
		}
		var delta = Math.abs(now.getTime() - d.getTime());
		for (var i = 0, chunk; chunk = dojox.dtl.utils.date._chunks[i]; i++) {
			var count = Math.floor(delta / chunk[0]);
			if (count) {
				break;
			}
		}
		return count + " " + chunk[1](count);
	}, _chunks:[[60 * 60 * 24 * 365 * 1000, function (n) {
		return (n == 1) ? "year" : "years";
	}], [60 * 60 * 24 * 30 * 1000, function (n) {
		return (n == 1) ? "month" : "months";
	}], [60 * 60 * 24 * 7 * 1000, function (n) {
		return (n == 1) ? "week" : "weeks";
	}], [60 * 60 * 24 * 1000, function (n) {
		return (n == 1) ? "day" : "days";
	}], [60 * 60 * 1000, function (n) {
		return (n == 1) ? "hour" : "hours";
	}], [60 * 1000, function (n) {
		return (n == 1) ? "minute" : "minutes";
	}]], _months_ap:["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."]});
}

