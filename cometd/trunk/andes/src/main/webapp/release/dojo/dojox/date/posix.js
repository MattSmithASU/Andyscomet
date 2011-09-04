/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.date.posix"]) {
	dojo._hasResource["dojox.date.posix"] = true;
	dojo.provide("dojox.date.posix");
	dojo.require("dojo.date");
	dojo.require("dojo.date.locale");
	dojo.require("dojo.string");
	dojox.date.posix.strftime = function (dateObject, format, locale) {
		var padChar = null;
		var _ = function (s, n) {
			return dojo.string.pad(s, n || 2, padChar || "0");
		};
		var bundle = dojo.date.locale._getGregorianBundle(locale);
		var $ = function (property) {
			switch (property) {
			  case "a":
				return dojo.date.locale.getNames("days", "abbr", "format", locale)[dateObject.getDay()];
			  case "A":
				return dojo.date.locale.getNames("days", "wide", "format", locale)[dateObject.getDay()];
			  case "b":
			  case "h":
				return dojo.date.locale.getNames("months", "abbr", "format", locale)[dateObject.getMonth()];
			  case "B":
				return dojo.date.locale.getNames("months", "wide", "format", locale)[dateObject.getMonth()];
			  case "c":
				return dojo.date.locale.format(dateObject, {formatLength:"full", locale:locale});
			  case "C":
				return _(Math.floor(dateObject.getFullYear() / 100));
			  case "d":
				return _(dateObject.getDate());
			  case "D":
				return $("m") + "/" + $("d") + "/" + $("y");
			  case "e":
				if (padChar == null) {
					padChar = " ";
				}
				return _(dateObject.getDate());
			  case "f":
				if (padChar == null) {
					padChar = " ";
				}
				return _(dateObject.getMonth() + 1);
			  case "g":
				break;
			  case "G":
				dojo.unimplemented("unimplemented modifier 'G'");
				break;
			  case "F":
				return $("Y") + "-" + $("m") + "-" + $("d");
			  case "H":
				return _(dateObject.getHours());
			  case "I":
				return _(dateObject.getHours() % 12 || 12);
			  case "j":
				return _(dojo.date.locale._getDayOfYear(dateObject), 3);
			  case "k":
				if (padChar == null) {
					padChar = " ";
				}
				return _(dateObject.getHours());
			  case "l":
				if (padChar == null) {
					padChar = " ";
				}
				return _(dateObject.getHours() % 12 || 12);
			  case "m":
				return _(dateObject.getMonth() + 1);
			  case "M":
				return _(dateObject.getMinutes());
			  case "n":
				return "\n";
			  case "p":
				return bundle["dayPeriods-format-wide-" + (dateObject.getHours() < 12 ? "am" : "pm")];
			  case "r":
				return $("I") + ":" + $("M") + ":" + $("S") + " " + $("p");
			  case "R":
				return $("H") + ":" + $("M");
			  case "S":
				return _(dateObject.getSeconds());
			  case "t":
				return "\t";
			  case "T":
				return $("H") + ":" + $("M") + ":" + $("S");
			  case "u":
				return String(dateObject.getDay() || 7);
			  case "U":
				return _(dojo.date.locale._getWeekOfYear(dateObject));
			  case "V":
				return _(dojox.date.posix.getIsoWeekOfYear(dateObject));
			  case "W":
				return _(dojo.date.locale._getWeekOfYear(dateObject, 1));
			  case "w":
				return String(dateObject.getDay());
			  case "x":
				return dojo.date.locale.format(dateObject, {selector:"date", formatLength:"full", locale:locale});
			  case "X":
				return dojo.date.locale.format(dateObject, {selector:"time", formatLength:"full", locale:locale});
			  case "y":
				return _(dateObject.getFullYear() % 100);
			  case "Y":
				return String(dateObject.getFullYear());
			  case "z":
				var timezoneOffset = dateObject.getTimezoneOffset();
				return (timezoneOffset > 0 ? "-" : "+") + _(Math.floor(Math.abs(timezoneOffset) / 60)) + ":" + _(Math.abs(timezoneOffset) % 60);
			  case "Z":
				return dojo.date.getTimezoneName(dateObject);
			  case "%":
				return "%";
			}
		};
		var string = "";
		var i = 0;
		var index = 0;
		var switchCase = null;
		while ((index = format.indexOf("%", i)) != -1) {
			string += format.substring(i, index++);
			switch (format.charAt(index++)) {
			  case "_":
				padChar = " ";
				break;
			  case "-":
				padChar = "";
				break;
			  case "0":
				padChar = "0";
				break;
			  case "^":
				switchCase = "upper";
				break;
			  case "*":
				switchCase = "lower";
				break;
			  case "#":
				switchCase = "swap";
				break;
			  default:
				padChar = null;
				index--;
				break;
			}
			var property = $(format.charAt(index++));
			switch (switchCase) {
			  case "upper":
				property = property.toUpperCase();
				break;
			  case "lower":
				property = property.toLowerCase();
				break;
			  case "swap":
				var compareString = property.toLowerCase();
				var swapString = "";
				var ch = "";
				for (var j = 0; j < property.length; j++) {
					ch = property.charAt(j);
					swapString += (ch == compareString.charAt(j)) ? ch.toUpperCase() : ch.toLowerCase();
				}
				property = swapString;
				break;
			  default:
				break;
			}
			switchCase = null;
			string += property;
			i = index;
		}
		string += format.substring(i);
		return string;
	};
	dojox.date.posix.getStartOfWeek = function (dateObject, firstDay) {
		if (isNaN(firstDay)) {
			firstDay = dojo.cldr.supplemental.getFirstDayOfWeek ? dojo.cldr.supplemental.getFirstDayOfWeek() : 0;
		}
		var offset = firstDay;
		if (dateObject.getDay() >= firstDay) {
			offset -= dateObject.getDay();
		} else {
			offset -= (7 - dateObject.getDay());
		}
		var date = new Date(dateObject);
		date.setHours(0, 0, 0, 0);
		return dojo.date.add(date, "day", offset);
	};
	dojox.date.posix.setIsoWeekOfYear = function (dateObject, week) {
		if (!week) {
			return dateObject;
		}
		var currentWeek = dojox.date.posix.getIsoWeekOfYear(dateObject);
		var offset = week - currentWeek;
		if (week < 0) {
			var weeks = dojox.date.posix.getIsoWeeksInYear(dateObject);
			offset = (weeks + week + 1) - currentWeek;
		}
		return dojo.date.add(dateObject, "week", offset);
	};
	dojox.date.posix.getIsoWeekOfYear = function (dateObject) {
		var weekStart = dojox.date.posix.getStartOfWeek(dateObject, 1);
		var yearStart = new Date(dateObject.getFullYear(), 0, 4);
		yearStart = dojox.date.posix.getStartOfWeek(yearStart, 1);
		var diff = weekStart.getTime() - yearStart.getTime();
		if (diff < 0) {
			return dojox.date.posix.getIsoWeeksInYear(weekStart);
		}
		return Math.ceil(diff / 604800000) + 1;
	};
	dojox.date.posix.getIsoWeeksInYear = function (dateObject) {
		function p(y) {
			return y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400);
		}
		var y = dateObject.getFullYear();
		return (p(y) % 7 == 4 || p(y - 1) % 7 == 3) ? 53 : 52;
	};
}

