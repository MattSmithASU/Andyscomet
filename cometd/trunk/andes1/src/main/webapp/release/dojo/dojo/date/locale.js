/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.date.locale"]) {
	dojo._hasResource["dojo.date.locale"] = true;
	dojo.provide("dojo.date.locale");
	dojo.require("dojo.date");
	dojo.require("dojo.cldr.supplemental");
	dojo.require("dojo.regexp");
	dojo.require("dojo.string");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojo.cldr", "gregorian", null, "ROOT,ar,ca,cs,da,de,el,en,en-au,en-ca,en-gb,es,fi,fr,fr-ch,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-hant,zh-hk,zh-tw");
	dojo.getObject("date.locale", true, dojo);
	(function () {
		function formatPattern(dateObject, bundle, options, pattern) {
			return pattern.replace(/([a-z])\1*/ig, function (match) {
				var s, pad, c = match.charAt(0), l = match.length, widthList = ["abbr", "wide", "narrow"];
				switch (c) {
				  case "G":
					s = bundle[(l < 4) ? "eraAbbr" : "eraNames"][dateObject.getFullYear() < 0 ? 0 : 1];
					break;
				  case "y":
					s = dateObject.getFullYear();
					switch (l) {
					  case 1:
						break;
					  case 2:
						if (!options.fullYear) {
							s = String(s);
							s = s.substr(s.length - 2);
							break;
						}
					  default:
						pad = true;
					}
					break;
				  case "Q":
				  case "q":
					s = Math.ceil((dateObject.getMonth() + 1) / 3);
					pad = true;
					break;
				  case "M":
					var m = dateObject.getMonth();
					if (l < 3) {
						s = m + 1;
						pad = true;
					} else {
						var propM = ["months", "format", widthList[l - 3]].join("-");
						s = bundle[propM][m];
					}
					break;
				  case "w":
					var firstDay = 0;
					s = dojo.date.locale._getWeekOfYear(dateObject, firstDay);
					pad = true;
					break;
				  case "d":
					s = dateObject.getDate();
					pad = true;
					break;
				  case "D":
					s = dojo.date.locale._getDayOfYear(dateObject);
					pad = true;
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
					s = options[timePeriod] || bundle["dayPeriods-format-wide-" + timePeriod];
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
				  case "v":
				  case "z":
					s = dojo.date.locale._getZone(dateObject, true, options);
					if (s) {
						break;
					}
					l = 4;
				  case "Z":
					var offset = dojo.date.locale._getZone(dateObject, false, options);
					var tz = [(offset <= 0 ? "+" : "-"), dojo.string.pad(Math.floor(Math.abs(offset) / 60), 2), dojo.string.pad(Math.abs(offset) % 60, 2)];
					if (l == 4) {
						tz.splice(0, 0, "GMT");
						tz.splice(3, 0, ":");
					}
					s = tz.join("");
					break;
				  default:
					throw new Error("dojo.date.locale.format: invalid pattern char: " + pattern);
				}
				if (pad) {
					s = dojo.string.pad(s, l);
				}
				return s;
			});
		}
		dojo.date.locale._getZone = function (dateObject, getName, options) {
			if (getName) {
				return dojo.date.getTimezoneName(dateObject);
			} else {
				return dateObject.getTimezoneOffset();
			}
		};
		dojo.date.locale.format = function (dateObject, options) {
			options = options || {};
			var locale = dojo.i18n.normalizeLocale(options.locale), formatLength = options.formatLength || "short", bundle = dojo.date.locale._getGregorianBundle(locale), str = [], sauce = dojo.hitch(this, formatPattern, dateObject, bundle, options);
			if (options.selector == "year") {
				return _processPattern(bundle["dateFormatItem-yyyy"] || "yyyy", sauce);
			}
			var pattern;
			if (options.selector != "date") {
				pattern = options.timePattern || bundle["timeFormat-" + formatLength];
				if (pattern) {
					str.push(_processPattern(pattern, sauce));
				}
			}
			if (options.selector != "time") {
				pattern = options.datePattern || bundle["dateFormat-" + formatLength];
				if (pattern) {
					str.push(_processPattern(pattern, sauce));
				}
			}
			return str.length == 1 ? str[0] : bundle["dateTimeFormat-" + formatLength].replace(/\{(\d+)\}/g, function (match, key) {
				return str[key];
			});
		};
		dojo.date.locale.regexp = function (options) {
			return dojo.date.locale._parseInfo(options).regexp;
		};
		dojo.date.locale._parseInfo = function (options) {
			options = options || {};
			var locale = dojo.i18n.normalizeLocale(options.locale), bundle = dojo.date.locale._getGregorianBundle(locale), formatLength = options.formatLength || "short", datePattern = options.datePattern || bundle["dateFormat-" + formatLength], timePattern = options.timePattern || bundle["timeFormat-" + formatLength], pattern;
			if (options.selector == "date") {
				pattern = datePattern;
			} else {
				if (options.selector == "time") {
					pattern = timePattern;
				} else {
					pattern = bundle["dateTimeFormat-" + formatLength].replace(/\{(\d+)\}/g, function (match, key) {
						return [timePattern, datePattern][key];
					});
				}
			}
			var tokens = [], re = _processPattern(pattern, dojo.hitch(this, _buildDateTimeRE, tokens, bundle, options));
			return {regexp:re, tokens:tokens, bundle:bundle};
		};
		dojo.date.locale.parse = function (value, options) {
			var controlChars = /[\u200E\u200F\u202A\u202E]/g, info = dojo.date.locale._parseInfo(options), tokens = info.tokens, bundle = info.bundle, re = new RegExp("^" + info.regexp.replace(controlChars, "") + "$", info.strict ? "" : "i"), match = re.exec(value && value.replace(controlChars, ""));
			if (!match) {
				return null;
			}
			var widthList = ["abbr", "wide", "narrow"], result = [1970, 0, 1, 0, 0, 0, 0], amPm = "", valid = dojo.every(match, function (v, i) {
				if (!i) {
					return true;
				}
				var token = tokens[i - 1];
				var l = token.length;
				switch (token.charAt(0)) {
				  case "y":
					if (l != 2 && options.strict) {
						result[0] = v;
					} else {
						if (v < 100) {
							v = Number(v);
							var year = "" + new Date().getFullYear(), century = year.substring(0, 2) * 100, cutoff = Math.min(Number(year.substring(2, 4)) + 20, 99), num = (v < cutoff) ? century + v : century - 100 + v;
							result[0] = num;
						} else {
							if (options.strict) {
								return false;
							}
							result[0] = v;
						}
					}
					break;
				  case "M":
					if (l > 2) {
						var months = bundle["months-format-" + widthList[l - 3]].concat();
						if (!options.strict) {
							v = v.replace(".", "").toLowerCase();
							months = dojo.map(months, function (s) {
								return s.replace(".", "").toLowerCase();
							});
						}
						v = dojo.indexOf(months, v);
						if (v == -1) {
							return false;
						}
					} else {
						v--;
					}
					result[1] = v;
					break;
				  case "E":
				  case "e":
					var days = bundle["days-format-" + widthList[l - 3]].concat();
					if (!options.strict) {
						v = v.toLowerCase();
						days = dojo.map(days, function (d) {
							return d.toLowerCase();
						});
					}
					v = dojo.indexOf(days, v);
					if (v == -1) {
						return false;
					}
					break;
				  case "D":
					result[1] = 0;
				  case "d":
					result[2] = v;
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
					if (v > 23) {
						return false;
					}
					result[3] = v;
					break;
				  case "m":
					result[4] = v;
					break;
				  case "s":
					result[5] = v;
					break;
				  case "S":
					result[6] = v;
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
			var dateObject = new Date(result[0], result[1], result[2], result[3], result[4], result[5], result[6]);
			if (options.strict) {
				dateObject.setFullYear(result[0]);
			}
			var allTokens = tokens.join(""), dateToken = allTokens.indexOf("d") != -1, monthToken = allTokens.indexOf("M") != -1;
			if (!valid || (monthToken && dateObject.getMonth() > result[1]) || (dateToken && dateObject.getDate() > result[2])) {
				return null;
			}
			if ((monthToken && dateObject.getMonth() < result[1]) || (dateToken && dateObject.getDate() < result[2])) {
				dateObject = dojo.date.add(dateObject, "hour", 1);
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
			var chunks = pattern.match(/(''|[^'])+/g), literal = pattern.charAt(0) == "'";
			dojo.forEach(chunks, function (chunk, i) {
				if (!chunk) {
					chunks[i] = "";
				} else {
					chunks[i] = (literal ? applyLiteral : applyPattern)(chunk.replace(/''/g, "'"));
					literal = !literal;
				}
			});
			return applyAll(chunks.join(""));
		}
		function _buildDateTimeRE(tokens, bundle, options, pattern) {
			pattern = dojo.regexp.escapeString(pattern);
			if (!options.strict) {
				pattern = pattern.replace(" a", " ?a");
			}
			return pattern.replace(/([a-z])\1*/ig, function (match) {
				var s, c = match.charAt(0), l = match.length, p2 = "", p3 = "";
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
					s = "\\d{2,4}";
					break;
				  case "M":
					s = (l > 2) ? "\\S+?" : "1[0-2]|" + p2 + "[1-9]";
					break;
				  case "D":
					s = "[12][0-9][0-9]|3[0-5][0-9]|36[0-6]|" + p3 + "[1-9][0-9]|" + p2 + "[1-9]";
					break;
				  case "d":
					s = "3[01]|[12]\\d|" + p2 + "[1-9]";
					break;
				  case "w":
					s = "[1-4][0-9]|5[0-3]|" + p2 + "[1-9]";
					break;
				  case "E":
					s = "\\S+";
					break;
				  case "h":
					s = "1[0-2]|" + p2 + "[1-9]";
					break;
				  case "k":
					s = "1[01]|" + p2 + "\\d";
					break;
				  case "H":
					s = "1\\d|2[0-3]|" + p2 + "\\d";
					break;
				  case "K":
					s = "1\\d|2[0-4]|" + p2 + "[1-9]";
					break;
				  case "m":
				  case "s":
					s = "[0-5]\\d";
					break;
				  case "S":
					s = "\\d{" + l + "}";
					break;
				  case "a":
					var am = options.am || bundle["dayPeriods-format-wide-am"], pm = options.pm || bundle["dayPeriods-format-wide-pm"];
					s = am + "|" + pm;
					if (!options.strict) {
						if (am != am.toLowerCase()) {
							s += "|" + am.toLowerCase();
						}
						if (pm != pm.toLowerCase()) {
							s += "|" + pm.toLowerCase();
						}
						if (s.indexOf(".") != -1) {
							s += "|" + s.replace(/\./g, "");
						}
					}
					s = s.replace(/\./g, "\\.");
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
		dojo.date.locale.addCustomFormats = function (packageName, bundleName) {
			_customFormats.push({pkg:packageName, name:bundleName});
		};
		dojo.date.locale._getGregorianBundle = function (locale) {
			var gregorian = {};
			dojo.forEach(_customFormats, function (desc) {
				var bundle = dojo.i18n.getLocalization(desc.pkg, desc.name, locale);
				gregorian = dojo.mixin(gregorian, bundle);
			}, this);
			return gregorian;
		};
	})();
	dojo.date.locale.addCustomFormats("dojo.cldr", "gregorian");
	dojo.date.locale.getNames = function (item, type, context, locale) {
		var label, lookup = dojo.date.locale._getGregorianBundle(locale), props = [item, context, type];
		if (context == "standAlone") {
			var key = props.join("-");
			label = lookup[key];
			if (label[0] == 1) {
				label = undefined;
			}
		}
		props[1] = "format";
		return (label || lookup[props.join("-")]).concat();
	};
	dojo.date.locale.isWeekend = function (dateObject, locale) {
		var weekend = dojo.cldr.supplemental.getWeekend(locale), day = (dateObject || new Date()).getDay();
		if (weekend.end < weekend.start) {
			weekend.end += 7;
			if (day < weekend.start) {
				day += 7;
			}
		}
		return day >= weekend.start && day <= weekend.end;
	};
	dojo.date.locale._getDayOfYear = function (dateObject) {
		return dojo.date.difference(new Date(dateObject.getFullYear(), 0, 1, dateObject.getHours()), dateObject) + 1;
	};
	dojo.date.locale._getWeekOfYear = function (dateObject, firstDayOfWeek) {
		if (arguments.length == 1) {
			firstDayOfWeek = 0;
		}
		var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1).getDay(), adj = (firstDayOfYear - firstDayOfWeek + 7) % 7, week = Math.floor((dojo.date.locale._getDayOfYear(dateObject) + adj - 1) / 7);
		if (firstDayOfYear == firstDayOfWeek) {
			week++;
		}
		return week;
	};
}

