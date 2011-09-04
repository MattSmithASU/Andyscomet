/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.number"]) {
	dojo._hasResource["dojo.number"] = true;
	dojo.provide("dojo.number");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojo.cldr", "number", null, "ROOT,ar,ca,cs,da,de,el,en,en-au,en-gb,es,fi,fr,fr-ch,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-hant,zh-hk");
	dojo.require("dojo.string");
	dojo.require("dojo.regexp");
	dojo.getObject("number", true, dojo);
	dojo.number.format = function (value, options) {
		options = dojo.mixin({}, options || {});
		var locale = dojo.i18n.normalizeLocale(options.locale), bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
		options.customs = bundle;
		var pattern = options.pattern || bundle[(options.type || "decimal") + "Format"];
		if (isNaN(value) || Math.abs(value) == Infinity) {
			return null;
		}
		return dojo.number._applyPattern(value, pattern, options);
	};
	dojo.number._numberPatternRE = /[#0,]*[#0](?:\.0*#*)?/;
	dojo.number._applyPattern = function (value, pattern, options) {
		options = options || {};
		var group = options.customs.group, decimal = options.customs.decimal, patternList = pattern.split(";"), positivePattern = patternList[0];
		pattern = patternList[(value < 0) ? 1 : 0] || ("-" + positivePattern);
		if (pattern.indexOf("%") != -1) {
			value *= 100;
		} else {
			if (pattern.indexOf("\u2030") != -1) {
				value *= 1000;
			} else {
				if (pattern.indexOf("\xa4") != -1) {
					group = options.customs.currencyGroup || group;
					decimal = options.customs.currencyDecimal || decimal;
					pattern = pattern.replace(/\u00a4{1,3}/, function (match) {
						var prop = ["symbol", "currency", "displayName"][match.length - 1];
						return options[prop] || options.currency || "";
					});
				} else {
					if (pattern.indexOf("E") != -1) {
						throw new Error("exponential notation not supported");
					}
				}
			}
		}
		var numberPatternRE = dojo.number._numberPatternRE;
		var numberPattern = positivePattern.match(numberPatternRE);
		if (!numberPattern) {
			throw new Error("unable to find a number expression in pattern: " + pattern);
		}
		if (options.fractional === false) {
			options.places = 0;
		}
		return pattern.replace(numberPatternRE, dojo.number._formatAbsolute(value, numberPattern[0], {decimal:decimal, group:group, places:options.places, round:options.round}));
	};
	dojo.number.round = function (value, places, increment) {
		var factor = 10 / (increment || 10);
		return (factor * +value).toFixed(places) / factor;
	};
	if ((0.9).toFixed() == 0) {
		(function () {
			var round = dojo.number.round;
			dojo.number.round = function (v, p, m) {
				var d = Math.pow(10, -p || 0), a = Math.abs(v);
				if (!v || a >= d || a * Math.pow(10, p + 1) < 5) {
					d = 0;
				}
				return round(v, p, m) + (v > 0 ? d : -d);
			};
		})();
	}
	dojo.number._formatAbsolute = function (value, pattern, options) {
		options = options || {};
		if (options.places === true) {
			options.places = 0;
		}
		if (options.places === Infinity) {
			options.places = 6;
		}
		var patternParts = pattern.split("."), comma = typeof options.places == "string" && options.places.indexOf(","), maxPlaces = options.places;
		if (comma) {
			maxPlaces = options.places.substring(comma + 1);
		} else {
			if (!(maxPlaces >= 0)) {
				maxPlaces = (patternParts[1] || []).length;
			}
		}
		if (!(options.round < 0)) {
			value = dojo.number.round(value, maxPlaces, options.round);
		}
		var valueParts = String(Math.abs(value)).split("."), fractional = valueParts[1] || "";
		if (patternParts[1] || options.places) {
			if (comma) {
				options.places = options.places.substring(0, comma);
			}
			var pad = options.places !== undefined ? options.places : (patternParts[1] && patternParts[1].lastIndexOf("0") + 1);
			if (pad > fractional.length) {
				valueParts[1] = dojo.string.pad(fractional, pad, "0", true);
			}
			if (maxPlaces < fractional.length) {
				valueParts[1] = fractional.substr(0, maxPlaces);
			}
		} else {
			if (valueParts[1]) {
				valueParts.pop();
			}
		}
		var patternDigits = patternParts[0].replace(",", "");
		pad = patternDigits.indexOf("0");
		if (pad != -1) {
			pad = patternDigits.length - pad;
			if (pad > valueParts[0].length) {
				valueParts[0] = dojo.string.pad(valueParts[0], pad);
			}
			if (patternDigits.indexOf("#") == -1) {
				valueParts[0] = valueParts[0].substr(valueParts[0].length - pad);
			}
		}
		var index = patternParts[0].lastIndexOf(","), groupSize, groupSize2;
		if (index != -1) {
			groupSize = patternParts[0].length - index - 1;
			var remainder = patternParts[0].substr(0, index);
			index = remainder.lastIndexOf(",");
			if (index != -1) {
				groupSize2 = remainder.length - index - 1;
			}
		}
		var pieces = [];
		for (var whole = valueParts[0]; whole; ) {
			var off = whole.length - groupSize;
			pieces.push((off > 0) ? whole.substr(off) : whole);
			whole = (off > 0) ? whole.slice(0, off) : "";
			if (groupSize2) {
				groupSize = groupSize2;
				delete groupSize2;
			}
		}
		valueParts[0] = pieces.reverse().join(options.group || ",");
		return valueParts.join(options.decimal || ".");
	};
	dojo.number.regexp = function (options) {
		return dojo.number._parseInfo(options).regexp;
	};
	dojo.number._parseInfo = function (options) {
		options = options || {};
		var locale = dojo.i18n.normalizeLocale(options.locale), bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale), pattern = options.pattern || bundle[(options.type || "decimal") + "Format"], group = bundle.group, decimal = bundle.decimal, factor = 1;
		if (pattern.indexOf("%") != -1) {
			factor /= 100;
		} else {
			if (pattern.indexOf("\u2030") != -1) {
				factor /= 1000;
			} else {
				var isCurrency = pattern.indexOf("\xa4") != -1;
				if (isCurrency) {
					group = bundle.currencyGroup || group;
					decimal = bundle.currencyDecimal || decimal;
				}
			}
		}
		var patternList = pattern.split(";");
		if (patternList.length == 1) {
			patternList.push("-" + patternList[0]);
		}
		var re = dojo.regexp.buildGroupRE(patternList, function (pattern) {
			pattern = "(?:" + dojo.regexp.escapeString(pattern, ".") + ")";
			return pattern.replace(dojo.number._numberPatternRE, function (format) {
				var flags = {signed:false, separator:options.strict ? group : [group, ""], fractional:options.fractional, decimal:decimal, exponent:false}, parts = format.split("."), places = options.places;
				if (parts.length == 1 && factor != 1) {
					parts[1] = "###";
				}
				if (parts.length == 1 || places === 0) {
					flags.fractional = false;
				} else {
					if (places === undefined) {
						places = options.pattern ? parts[1].lastIndexOf("0") + 1 : Infinity;
					}
					if (places && options.fractional == undefined) {
						flags.fractional = true;
					}
					if (!options.places && (places < parts[1].length)) {
						places += "," + parts[1].length;
					}
					flags.places = places;
				}
				var groups = parts[0].split(",");
				if (groups.length > 1) {
					flags.groupSize = groups.pop().length;
					if (groups.length > 1) {
						flags.groupSize2 = groups.pop().length;
					}
				}
				return "(" + dojo.number._realNumberRegexp(flags) + ")";
			});
		}, true);
		if (isCurrency) {
			re = re.replace(/([\s\xa0]*)(\u00a4{1,3})([\s\xa0]*)/g, function (match, before, target, after) {
				var prop = ["symbol", "currency", "displayName"][target.length - 1], symbol = dojo.regexp.escapeString(options[prop] || options.currency || "");
				before = before ? "[\\s\\xa0]" : "";
				after = after ? "[\\s\\xa0]" : "";
				if (!options.strict) {
					if (before) {
						before += "*";
					}
					if (after) {
						after += "*";
					}
					return "(?:" + before + symbol + after + ")?";
				}
				return before + symbol + after;
			});
		}
		return {regexp:re.replace(/[\xa0 ]/g, "[\\s\\xa0]"), group:group, decimal:decimal, factor:factor};
	};
	dojo.number.parse = function (expression, options) {
		var info = dojo.number._parseInfo(options), results = (new RegExp("^" + info.regexp + "$")).exec(expression);
		if (!results) {
			return NaN;
		}
		var absoluteMatch = results[1];
		if (!results[1]) {
			if (!results[2]) {
				return NaN;
			}
			absoluteMatch = results[2];
			info.factor *= -1;
		}
		absoluteMatch = absoluteMatch.replace(new RegExp("[" + info.group + "\\s\\xa0" + "]", "g"), "").replace(info.decimal, ".");
		return absoluteMatch * info.factor;
	};
	dojo.number._realNumberRegexp = function (flags) {
		flags = flags || {};
		if (!("places" in flags)) {
			flags.places = Infinity;
		}
		if (typeof flags.decimal != "string") {
			flags.decimal = ".";
		}
		if (!("fractional" in flags) || /^0/.test(flags.places)) {
			flags.fractional = [true, false];
		}
		if (!("exponent" in flags)) {
			flags.exponent = [true, false];
		}
		if (!("eSigned" in flags)) {
			flags.eSigned = [true, false];
		}
		var integerRE = dojo.number._integerRegexp(flags), decimalRE = dojo.regexp.buildGroupRE(flags.fractional, function (q) {
			var re = "";
			if (q && (flags.places !== 0)) {
				re = "\\" + flags.decimal;
				if (flags.places == Infinity) {
					re = "(?:" + re + "\\d+)?";
				} else {
					re += "\\d{" + flags.places + "}";
				}
			}
			return re;
		}, true);
		var exponentRE = dojo.regexp.buildGroupRE(flags.exponent, function (q) {
			if (q) {
				return "([eE]" + dojo.number._integerRegexp({signed:flags.eSigned}) + ")";
			}
			return "";
		});
		var realRE = integerRE + decimalRE;
		if (decimalRE) {
			realRE = "(?:(?:" + realRE + ")|(?:" + decimalRE + "))";
		}
		return realRE + exponentRE;
	};
	dojo.number._integerRegexp = function (flags) {
		flags = flags || {};
		if (!("signed" in flags)) {
			flags.signed = [true, false];
		}
		if (!("separator" in flags)) {
			flags.separator = "";
		} else {
			if (!("groupSize" in flags)) {
				flags.groupSize = 3;
			}
		}
		var signRE = dojo.regexp.buildGroupRE(flags.signed, function (q) {
			return q ? "[-+]" : "";
		}, true);
		var numberRE = dojo.regexp.buildGroupRE(flags.separator, function (sep) {
			if (!sep) {
				return "(?:\\d+)";
			}
			sep = dojo.regexp.escapeString(sep);
			if (sep == " ") {
				sep = "\\s";
			} else {
				if (sep == "\xa0") {
					sep = "\\s\\xa0";
				}
			}
			var grp = flags.groupSize, grp2 = flags.groupSize2;
			if (grp2) {
				var grp2RE = "(?:0|[1-9]\\d{0," + (grp2 - 1) + "}(?:[" + sep + "]\\d{" + grp2 + "})*[" + sep + "]\\d{" + grp + "})";
				return ((grp - grp2) > 0) ? "(?:" + grp2RE + "|(?:0|[1-9]\\d{0," + (grp - 1) + "}))" : grp2RE;
			}
			return "(?:0|[1-9]\\d{0," + (grp - 1) + "}(?:[" + sep + "]\\d{" + grp + "})*)";
		}, true);
		return signRE + numberRE;
	};
}

