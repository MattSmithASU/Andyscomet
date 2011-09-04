/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.date.hebrew"]) {
	dojo._hasResource["dojox.date.hebrew"] = true;
	dojo.provide("dojox.date.hebrew");
	dojo.require("dojox.date.hebrew.Date");
	dojo.require("dojo.date");
	dojox.date.hebrew.getDaysInMonth = function (month) {
		return month.getDaysInHebrewMonth(month.getMonth(), month.getFullYear());
	};
	dojox.date.hebrew.compare = function (dateheb1, dateheb2, portion) {
		if (dateheb1 instanceof dojox.date.hebrew.Date) {
			dateheb1 = dateheb1.toGregorian();
		}
		if (dateheb2 instanceof dojox.date.hebrew.Date) {
			dateheb2 = dateheb2.toGregorian();
		}
		return dojo.date.compare.apply(null, arguments);
	};
	dojox.date.hebrew.add = function (date, interval, amount) {
		var newHebrDate = new dojox.date.hebrew.Date(date);
		switch (interval) {
		  case "day":
			newHebrDate.setDate(date.getDate() + amount);
			break;
		  case "weekday":
			var day = date.getDay();
			var remdays = 0;
			if (amount < 0 && day == 6) {
				day = 5;
				remdays = -1;
			}
			if ((day + amount) < 5 && (day + amount) >= 0) {
				newHebrDate.setDate(date.getDate() + amount + remdays);
			} else {
				var add = (amount > 0) ? 5 : -1;
				var adddays = (amount > 0) ? 2 : -2;
				if (amount > 0 && (day == 5 || day == 6)) {
					remdays = 4 - day;
					day = 4;
				}
				var newamount = day + amount - add;
				var weeks = parseInt(newamount / 5);
				var newday = newamount % 5;
				newHebrDate.setDate(date.getDate() - day + adddays + weeks * 7 + remdays + newday + add);
			}
			break;
		  case "year":
			newHebrDate.setFullYear(date.getFullYear() + amount);
			break;
		  case "week":
			amount *= 7;
			newHebrDate.setDate(date.getDate() + amount);
			break;
		  case "month":
			var month = date.getMonth();
			var add = month + amount;
			if (!date.isLeapYear(date.getFullYear())) {
				if (month < 5 && add >= 5) {
					add++;
				} else {
					if (month > 5 && add <= 5) {
						add--;
					}
				}
			}
			newHebrDate.setMonth(add);
			break;
		  case "hour":
			newHebrDate.setHours(date.getHours() + amount);
			break;
		  case "minute":
			newHebrDate.setMinutes(date.getMinutes() + amount);
			break;
		  case "second":
			newHebrDate.setSeconds(date.getSeconds() + amount);
			break;
		  case "millisecond":
			newHebrDate.setMilliseconds(date.getMilliseconds() + amount);
			break;
		}
		return newHebrDate;
	};
	dojox.date.hebrew.difference = function (date1, date2, interval) {
		date2 = date2 || new dojox.date.hebrew.Date();
		interval = interval || "day";
		var yearDiff = date1.getFullYear() - date2.getFullYear();
		var delta = 1;
		switch (interval) {
		  case "weekday":
			var days = Math.round(dojox.date.hebrew.difference(date1, date2, "day"));
			var weeks = parseInt(dojox.date.hebrew.difference(date1, date2, "week"));
			var mod = days % 7;
			if (mod == 0) {
				days = weeks * 5;
			} else {
				var adj = 0;
				var aDay = date2.getDay();
				var bDay = date1.getDay();
				weeks = parseInt(days / 7);
				mod = days % 7;
				var dtMark = new dojox.date.hebrew.Date(date2);
				dtMark.setDate(dtMark.getDate() + (weeks * 7));
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
				delta = (!date1.isLeapYear(date1.getFullYear()) && startdate.getMonth() > 5 && enddate.getMonth() <= 5) ? (startdate.getMonth() - enddate.getMonth() - 1) : (startdate.getMonth() - enddate.getMonth());
			} else {
				delta = (!enddate.isLeapYear(enddate.getFullYear()) && month2 < 6) ? (13 - month2 - 1) : (13 - month2);
				delta += (!startdate.isLeapYear(startdate.getFullYear()) && month1 > 5) ? (month1 - 1) : month1;
				var i = enddate.getFullYear() + 1;
				var e = startdate.getFullYear();
				for (i; i < e; i++) {
					delta += enddate.isLeapYear(i) ? 13 : 12;
				}
			}
			if (date1.toGregorian() < date2.toGregorian()) {
				delta = -delta;
			}
			break;
		  case "week":
			delta = parseInt(dojox.date.hebrew.difference(date1, date2, "day") / 7);
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

