/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.date.hebrew.locale"]) {
	dojo._hasResource["dojox.date.hebrew.locale"] = true;
	dojo.provide("dojox.date.hebrew.locale");
	dojo.require("dojox.date.hebrew.Date");
	dojo.require("dojox.date.hebrew.numerals");
	dojo.require("dojo.regexp");
	dojo.require("dojo.string");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojo.cldr", "hebrew", null, "ROOT,ar,el,fi,he");
	(function () {
		function formatPattern(dateObject, bundle, locale, fullYear, pattern) {
			return pattern.replace(/([a-z])\1*/ig, function (match) {
				var s, pad;
				var c = match.charAt(0);
				var l = match.length;
				var widthList = ["abbr", "wide", "narrow"];
				switch (c) {
				  case "y":
					if (locale.match(/^he(?:-.+)?$/)) {
						s = dojox.date.hebrew.numerals.getYearHebrewLetters(dateObject.getFullYear());
					} else {
						s = String(dateObject.getFullYear());
					}
					break;
				  case "M":
					var m = dateObject.getMonth();
					if (l < 3) {
						if (!dateObject.isLeapYear(dateObject.getFullYear()) && m > 5) {
							m--;
						}
						if (locale.match(/^he(?:-.+)?$/)) {
							s = dojox.date.hebrew.numerals.getMonthHebrewLetters(m);
						} else {
							s = m + 1;
							pad = true;
						}
					} else {
						var monthNames = dojox.date.hebrew.locale.getNames("months", widthList[l - 3], "format", locale, dateObject);
						s = monthNames[m];
					}
					break;
				  case "d":
					if (locale.match(/^he(?:-.+)?$/)) {
						s = dateObject.getDateLocalized(locale);
					} else {
						s = dateObject.getDate();
						pad = true;
					}
					break;
				  case "E":
					var d = dateObject.getDay();
					if (l < 3) {
						s = d + 1;
						pad = true;
					} else {
						var propD = ["days", "format", widthList[l - 3]].join("-");
						s = bundle[propD][d];
					}
					break;
				  case "a":
					var timePeriod = (dateObject.getHours() < 12) ? "am" : "pm";
					s = bundle["dayPeriods-format-wide-" + timePeriod];
					break;
				  case "h":
				  case "H":
				  case "K":
				  case "k":
					var h = dateObject.getHours();
					switch (c) {
					  case "h":
						s = (h % 12) || 12;
						break;
					  case "H":
						s = h;
						break;
					  case "K":
						s = (h % 12);
						break;
					  case "k":
						s = h || 24;
						break;
					}
					pad = true;
					break;
				  case "m":
					s = dateObject.getMinutes();
					pad = true;
					break;
				  case "s":
					s = dateObject.getSeconds();
					pad = true;
					break;
				  case "S":
					s = Math.round(dateObject.getMilliseconds() * Math.pow(10, l - 3));
					pad = true;
					break;
				  case "z":
					s = "";
					break;
				  default:
					throw new Error("dojox.date.hebrew.locale.formatPattern: invalid pattern char: " + pattern);
				}
				if (pad) {
					s = dojo.string.pad(s, l);
				}
				return s;
			});
		}
		dojox.date.hebrew.locale.format = function (dateObject, options) {
			options = options || {};
			var locale = dojo.i18n.normalizeLocale(options.locale);
			var formatLength = options.formatLength || "short";
			var bundle = dojox.date.hebrew.locale._getHebrewBundle(locale);
			var str = [];
			var sauce = dojo.hitch(this, formatPattern, dateObject, bundle, locale, options.fullYear);
			if (options.selector == "year") {
				var year = dateObject.getFullYear();
				return locale.match(/^he(?:-.+)?$/) ? dojox.date.hebrew.numerals.getYearHebrewLetters(year) : year;
			}
			if (options.selector != "time") {
				var datePattern = options.datePattern || bundle["dateFormat-" + formatLength];
				if (datePattern) {
					str.push(_processPattern(datePattern, sauce));
				}
			}
			if (options.selector != "date") {
				var timePattern = options.timePattern || bundle["timeFormat-" + formatLength];
				if (timePattern) {
					str.push(_processPattern(timePattern, sauce));
				}
			}
			var result = str.join(" ");
			return result;
		};
		dojox.date.hebrew.locale.regexp = function (options) {
			return dojox.date.hebrew.locale._parseInfo(options).regexp;
		};
		dojox.date.hebrew.locale._parseInfo = function (options) {
			options = options || {};
			var locale = dojo.i18n.normalizeLocale(options.locale);
			var bundle = dojox.date.hebrew.locale._getHebrewBundle(locale);
			var formatLength = options.formatLength || "short";
			var datePattern = options.datePattern || bundle["dateFormat-" + formatLength];
			var timePattern = options.timePattern || bundle["timeFormat-" + formatLength];
			var pattern;
			if (options.selector == "date") {
				pattern = datePattern;
			} else {
				if (options.selector == "time") {
					pattern = timePattern;
				} else {
					pattern = (timePattern === undefined) ? datePattern : datePattern + " " + timePattern;
				}
			}
			var tokens = [];
			var re = _processPattern(pattern, dojo.hitch(this, _buildDateTimeRE, tokens, bundle, options));
			return {regexp:re, tokens:tokens, bundle:bundle};
		};
		dojox.date.hebrew.locale.parse = function (value, options) {
			value = value.replace(/[\u200E\u200F\u202A-\u202E]/g, "");
			if (!options) {
				options = {};
			}
			var info = dojox.date.hebrew.locale._parseInfo(options);
			var tokens = info.tokens, bundle = info.bundle;
			var re = new RegExp("^" + info.regexp + "$");
			var match = re.exec(value);
			var locale = dojo.i18n.normalizeLocale(options.locale);
			if (!match) {
				console.debug("dojox.date.hebrew.locale.parse: value  " + value + " doesn't match pattern   " + re);
				return null;
			}
			var date, date1;
			var result = [5730, 3, 23, 0, 0, 0, 0];
			var amPm = "";
			var mLength = 0;
			var widthList = ["abbr", "wide", "narrow"];
			var valid = dojo.every(match, function (v, i) {
				if (!i) {
					return true;
				}
				var token = tokens[i - 1];
				var l = token.length;
				switch (token.charAt(0)) {
				  case "y":
					if (locale.match(/^he(?:-.+)?$/)) {
						result[0] = dojox.date.hebrew.numerals.parseYearHebrewLetters(v);
					} else {
						result[0] = Number(v);
					}
					break;
				  case "M":
					if (l > 2) {
						var months = dojox.date.hebrew.locale.getNames("months", widthList[l - 3], "format", locale, new dojox.date.hebrew.Date(5769, 1, 1)), leapmonths = dojox.date.hebrew.locale.getNames("months", widthList[l - 3], "format", locale, new dojox.date.hebrew.Date(5768, 1, 1));
						if (!options.strict) {
							v = v.replace(".", "").toLowerCase();
							months = dojo.map(months, function (s) {
								return s ? s.replace(".", "").toLowerCase() : s;
							});
							leapmonths = dojo.map(leapmonths, function (s) {
								return s ? s.replace(".", "").toLowerCase() : s;
							});
						}
						var monthName = v;
						v = dojo.indexOf(months, monthName);
						if (v == -1) {
							v = dojo.indexOf(leapmonths, monthName);
							if (v == -1) {
								return false;
							}
						}
						mLength = l;
					} else {
						if (locale.match(/^he(?:-.+)?$/)) {
							v = dojox.date.hebrew.numerals.parseMonthHebrewLetters(v);
						} else {
							v--;
						}
					}
					result[1] = Number(v);
					break;
				  case "D":
					result[1] = 0;
				  case "d":
					if (locale.match(/^he(?:-.+)?$/)) {
						result[2] = dojox.date.hebrew.numerals.parseDayHebrewLetters(v);
					} else {
						result[2] = Number(v);
					}
					break;
				  case "a":
					var am = options.am || bundle["dayPeriods-format-wide-am"], pm = options.pm || bundle["dayPeriods-format-wide-pm"];
					if (!options.strict) {
						var period = /\./g;
						v = v.replace(period, "").toLowerCase();
						am = am.replace(period, "").toLowerCase();
						pm = pm.replace(period, "").toLowerCase();
					}
					if (options.strict && v != am && v != pm) {
						return false;
					}
					amPm = (v == pm) ? "p" : (v == am) ? "a" : "";
					break;
				  case "K":
					if (v == 24) {
						v = 0;
					}
				  case "h":
				  case "H":
				  case "k":
					result[3] = Number(v);
					break;
				  case "m":
					result[4] = Number(v);
					break;
				  case "s":
					result[5] = Number(v);
					break;
				  case "S":
					result[6] = Number(v);
				}
				return true;
			});
			var hours = +result[3];
			if (amPm === "p" && hours < 12) {
				result[3] = hours + 12;
			} else {
				if (amPm === "a" && hours == 12) {
					result[3] = 0;
				}
			}
			var dateObject = new dojox.date.hebrew.Date(result[0], result[1], result[2], result[3], result[4], result[5], result[6]);
			if (mLength < 3 && result[1] >= 5 && !dateObject.isLeapYear(dateObject.getFullYear())) {
				dateObject.setMonth(result[1] + 1);
			}
			return dateObject;
		};
		function _processPattern(pattern, applyPattern, applyLiteral, applyAll) {
			var identity = function (x) {
				return x;
			};
			applyPattern = applyPattern || identity;
			applyLiteral = applyLiteral || identity;
			applyAll = applyAll || identity;
			var chunks = pattern.match(/(''|[^'])+/g);
			var literal = pattern.charAt(0) == "'";
			dojo.forEach(chunks, function (chunk, i) {
				if (!chunk) {
					chunks[i] = "";
				} else {
					chunks[i] = (literal ? applyLiteral : applyPattern)(chunk);
					literal = !literal;
				}
			});
			return applyAll(chunks.join(""));
		}
		function _buildDateTimeRE(tokens, bundle, options, pattern) {
			pattern = dojo.regexp.escapeString(pattern);
			var locale = dojo.i18n.normalizeLocale(options.locale);
			return pattern.replace(/([a-z])\1*/ig, function (match) {
				var s;
				var c = match.charAt(0);
				var l = match.length;
				var p2 = "", p3 = "";
				if (options.strict) {
					if (l > 1) {
						p2 = "0" + "{" + (l - 1) + "}";
					}
					if (l > 2) {
						p3 = "0" + "{" + (l - 2) + "}";
					}
				} else {
					p2 = "0?";
					p3 = "0{0,2}";
				}
				switch (c) {
				  case "y":
					s = "\\S+";
					break;
				  case "M":
					if (locale.match("^he(?:-.+)?$")) {
						s = (l > 2) ? "\\S+ ?\\S+" : "\\S{1,4}";
					} else {
						s = (l > 2) ? "\\S+ ?\\S+" : p2 + "[1-9]|1[0-2]";
					}
					break;
				  case "d":
					if (locale.match("^he(?:-.+)?$")) {
						s = "\\S['\"'\u05f3]{1,2}\\S?";
					} else {
						s = "[12]\\d|" + p2 + "[1-9]|30";
					}
					break;
				  case "E":
					if (locale.match("^he(?:-.+)?$")) {
						s = (l > 3) ? "\\S+ ?\\S+" : "\\S";
					} else {
						s = "\\S+";
					}
					break;
				  case "h":
					s = p2 + "[1-9]|1[0-2]";
					break;
				  case "k":
					s = p2 + "\\d|1[01]";
					break;
				  case "H":
					s = p2 + "\\d|1\\d|2[0-3]";
					break;
				  case "K":
					s = p2 + "[1-9]|1\\d|2[0-4]";
					break;
				  case "m":
				  case "s":
					s = p2 + "\\d|[0-5]\\d";
					break;
				  case "S":
					s = "\\d{" + l + "}";
					break;
				  case "a":
					var am = options.am || bundle["dayPeriods-format-wide-am"], pm = options.pm || bundle["dayPeriods-format-wide-pm"];
					if (options.strict) {
						s = am + "|" + pm;
					} else {
						s = am + "|" + pm;
						if (am != am.toLowerCase()) {
							s += "|" + am.toLowerCase();
						}
						if (pm != pm.toLowerCase()) {
							s += "|" + pm.toLowerCase();
						}
					}
					break;
				  default:
					s = ".*";
				}
				if (tokens) {
					tokens.push(match);
				}
				return "(" + s + ")";
			}).replace(/[\xa0 ]/g, "[\\s\\xa0]");
		}
	})();
	(function () {
		var _customFormats = [];
		dojox.date.hebrew.locale.addCustomFormats = function (packageName, bundleName) {
			_customFormats.push({pkg:packageName, name:bundleName});
		};
		dojox.date.hebrew.locale._getHebrewBundle = function (locale) {
			var hebrew = {};
			dojo.forEach(_customFormats, function (desc) {
				var bundle = dojo.i18n.getLocalization(desc.pkg, desc.name, locale);
				hebrew = dojo.mixin(hebrew, bundle);
			}, this);
			return hebrew;
		};
	})();
	dojox.date.hebrew.locale.addCustomFormats("dojo.cldr", "hebrew");
	dojox.date.hebrew.locale.getNames = function (item, type, context, locale, date) {
		var label, lookup = dojox.date.hebrew.locale._getHebrewBundle(locale), props = [item, context, type];
		if (context == "standAlone") {
			var key = props.join("-");
			label = lookup[key];
			if (label[0] == 1) {
				label = undefined;
			}
		}
		props[1] = "format";
		var result = (label || lookup[props.join("-")]).concat();
		if (item == "months") {
			if (date.isLeapYear(date.getFullYear())) {
				props.push("leap");
				result[6] = lookup[props.join("-")];
			} else {
				delete result[5];
			}
		}
		return result;
	};
}

