/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.date.hebrew.numerals"]) {
	dojo._hasResource["dojox.date.hebrew.numerals"] = true;
	dojo.provide("dojox.date.hebrew.numerals");
	(function () {
		var DIG = "\u05d0\u05d1\u05d2\u05d3\u05d4\u05d5\u05d6\u05d7\u05d8";
		var TEN = "\u05d9\u05db\u05dc\u05de\u05e0\u05e1\u05e2\u05e4\u05e6";
		var HUN = "\u05e7\u05e8\u05e9\u05ea";
		var transformChars = function (str, nogrsh) {
			str = str.replace("\u05d9\u05d4", "\u05d8\u05d5").replace("\u05d9\u05d5", "\u05d8\u05d6");
			if (!nogrsh) {
				var len = str.length;
				if (len > 1) {
					str = str.substr(0, len - 1) + "\"" + str.charAt(len - 1);
				} else {
					str += "\u05f3";
				}
			}
			return str;
		};
		var parseStrToNumber = function (str) {
			var num = 0;
			dojo.forEach(str, function (ch) {
				var i;
				if ((i = DIG.indexOf(ch)) != -1) {
					num += ++i;
				} else {
					if ((i = TEN.indexOf(ch)) != -1) {
						num += 10 * ++i;
					} else {
						if ((i = HUN.indexOf(ch)) != -1) {
							num += 100 * ++i;
						}
					}
				}
			});
			return num;
		};
		var convertNumberToStr = function (num) {
			var str = "", n = 4, j = 9;
			while (num) {
				if (num >= n * 100) {
					str += HUN.charAt(n - 1);
					num -= n * 100;
					continue;
				} else {
					if (n > 1) {
						n--;
						continue;
					} else {
						if (num >= j * 10) {
							str += TEN.charAt(j - 1);
							num -= j * 10;
						} else {
							if (j > 1) {
								j--;
								continue;
							} else {
								if (num > 0) {
									str += DIG.charAt(num - 1);
									num = 0;
								}
							}
						}
					}
				}
			}
			return str;
		};
		dojox.date.hebrew.numerals.getYearHebrewLetters = function (year) {
			var rem = year % 1000;
			return transformChars(convertNumberToStr(rem));
		};
		dojox.date.hebrew.numerals.parseYearHebrewLetters = function (year) {
			return parseStrToNumber(year) + 5000;
		};
		dojox.date.hebrew.numerals.getDayHebrewLetters = function (day, nogrsh) {
			return transformChars(convertNumberToStr(day), nogrsh);
		};
		dojox.date.hebrew.numerals.parseDayHebrewLetters = function (day) {
			return parseStrToNumber(day);
		};
		dojox.date.hebrew.numerals.getMonthHebrewLetters = function (month) {
			return transformChars(convertNumberToStr(month + 1));
		};
		dojox.date.hebrew.numerals.parseMonthHebrewLetters = function (monthStr) {
			var monnum = dojox.date.hebrew.numerals.parseDayHebrewLetters(monthStr) - 1;
			if (monnum == -1 || monnum > 12) {
				throw new Error("The month name is incorrect , month = " + monnum);
			}
			return monnum;
		};
	})();
}

