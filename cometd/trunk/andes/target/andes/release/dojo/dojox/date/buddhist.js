/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.date.buddhist"]) {
	dojo._hasResource["dojox.date.buddhist"] = true;
	dojo.provide("dojox.date.buddhist");
	dojo.experimental("dojox.date.buddhist");
	dojo.require("dojox.date.buddhist.Date");
	dojo.require("dojo.date");
	dojox.date.buddhist.getDaysInMonth = function (dateObject) {
		return dojo.date.getDaysInMonth(dateObject.toGregorian());
	};
	dojox.date.buddhist.isLeapYear = function (dateObject) {
		return dojo.date.isLeapYear(dateObject.toGregorian());
	};
	dojox.date.buddhist.compare = function (date1, date2, portion) {
		return dojo.date.compare(date1, date2, portion);
	};
	dojox.date.buddhist.add = function (date, interval, amount) {
		var newBuddDate = new dojox.date.buddhist.Date(date);
		switch (interval) {
		  case "day":
			newBuddDate.setDate(date.getDate(true) + amount);
			break;
		  case "weekday":
			var days, weeks;
			var mod = amount % 5;
			if (!mod) {
				days = (amount > 0) ? 5 : -5;
				weeks = (amount > 0) ? ((amount - 5) / 5) : ((amount + 5) / 5);
			} else {
				days = mod;
				weeks = parseInt(amount / 5);
			}
			var strt = date.getDay();
			var adj = 0;
			if (strt == 6 && amount > 0) {
				adj = 1;
			} else {
				if (strt == 0 && amount < 0) {
					adj = -1;
				}
			}
			var trgt = strt + days;
			if (trgt == 0 || trgt == 6) {
				adj = (amount > 0) ? 2 : -2;
			}
			amount = (7 * weeks) + days + adj;
			newBuddDate.setDate(date.getDate(true) + amount);
			break;
		  case "year":
			newBuddDate.setFullYear(date.getFullYear() + amount);
			break;
		  case "week":
			amount *= 7;
			newBuddDate.setDate(date.getDate(true) + amount);
			break;
		  case "month":
			newBuddDate.setMonth(date.getMonth() + amount);
			break;
		  case "hour":
			newBuddDate.setHours(date.getHours() + amount);
			break;
		  case "minute":
			newBuddDate.setMinutes(date.getMinutes() + amount);
			break;
		  case "second":
			newBuddDate.setSeconds(date.getSeconds() + amount);
			break;
		  case "millisecond":
			newBuddDate.setMilliseconds(date.getMilliseconds() + amount);
			break;
		}
		return newBuddDate;
	};
	dojox.date.buddhist.difference = function (date1, date2, interval) {
		date2 = date2 || new dojox.date.buddhist.Date();
		interval = interval || "day";
		var yearDiff = date1.getFullYear() - date2.getFullYear();
		var delta = 1;
		switch (interval) {
		  case "weekday":
			var days = Math.round(dojox.date.buddhist.difference(date1, date2, "day"));
			var weeks = parseInt(dojox.date.buddhist.difference(date1, date2, "week"));
			var mod = days % 7;
			if (mod == 0) {
				days = weeks * 5;
			} else {
				var adj = 0;
				var aDay = date2.getDay();
				var bDay = date1.getDay();
				weeks = parseInt(days / 7);
				mod = days % 7;
				var dtMark = new dojox.date.buddhist.Date(date1);
				dtMark.setDate(dtMark.getDate(true) + (weeks * 7));
				var dayMark = dtMark.getDay();
				if (days > 0) {
					switch (true) {
					  case aDay == 5:
						adj = -1;
						break;
					  case aDay == 6:
						adj = 0;
						break;
					  case bDay == 5:
						adj = -1;
						break;
					  case bDay == 6:
						adj = -2;
						break;
					  case (dayMark + mod) > 5:
						adj = -2;
					}
				} else {
					if (days < 0) {
						switch (true) {
						  case aDay == 5:
							adj = 0;
							break;
						  case aDay == 6:
							adj = 1;
							break;
						  case bDay == 5:
							adj = 2;
							break;
						  case bDay == 6:
							adj = 1;
							break;
						  case (dayMark + mod) < 0:
							adj = 2;
						}
					}
				}
				days += adj;
				days -= (weeks * 2);
			}
			delta = days;
			break;
		  case "year":
			delta = yearDiff;
			break;
		  case "month":
			var startdate = (date1.toGregorian() > date2.toGregorian()) ? date1 : date2;
			var enddate = (date1.toGregorian() > date2.toGregorian()) ? date2 : date1;
			var month1 = startdate.getMonth();
			var month2 = enddate.getMonth();
			if (yearDiff == 0) {
				delta = startdate.getMonth() - enddate.getMonth();
			} else {
				delta = 12 - month2;
				delta += month1;
				var i = enddate.getFullYear() + 1;
				var e = startdate.getFullYear();
				for (i; i < e; i++) {
					delta += 12;
				}
			}
			if (date1.toGregorian() < date2.toGregorian()) {
				delta = -delta;
			}
			break;
		  case "week":
			delta = parseInt(dojox.date.buddhist.difference(date1, date2, "day") / 7);
			break;
		  case "day":
			delta /= 24;
		  case "hour":
			delta /= 60;
		  case "minute":
			delta /= 60;
		  case "second":
			delta /= 1000;
		  case "millisecond":
			delta *= date1.toGregorian().getTime() - date2.toGregorian().getTime();
		}
		return Math.round(delta);
	};
}

