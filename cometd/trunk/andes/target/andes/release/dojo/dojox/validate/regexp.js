/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.validate.regexp"]) {
	dojo._hasResource["dojox.validate.regexp"] = true;
	dojo.provide("dojox.validate.regexp");
	dojo.require("dojo.regexp");
	dojo.mixin(dojox.validate.regexp, {ipAddress:function (flags) {
		flags = (typeof flags == "object") ? flags : {};
		if (typeof flags.allowDottedDecimal != "boolean") {
			flags.allowDottedDecimal = true;
		}
		if (typeof flags.allowDottedHex != "boolean") {
			flags.allowDottedHex = true;
		}
		if (typeof flags.allowDottedOctal != "boolean") {
			flags.allowDottedOctal = true;
		}
		if (typeof flags.allowDecimal != "boolean") {
			flags.allowDecimal = true;
		}
		if (typeof flags.allowHex != "boolean") {
			flags.allowHex = true;
		}
		if (typeof flags.allowIPv6 != "boolean") {
			flags.allowIPv6 = true;
		}
		if (typeof flags.allowHybrid != "boolean") {
			flags.allowHybrid = true;
		}
		var dottedDecimalRE = "((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";
		var dottedHexRE = "(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]";
		var dottedOctalRE = "(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]";
		var decimalRE = "(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|" + "4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])";
		var hexRE = "0[xX]0*[\\da-fA-F]{1,8}";
		var ipv6RE = "([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}";
		var hybridRE = "([\\da-fA-F]{1,4}\\:){6}" + "((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";
		var a = [];
		if (flags.allowDottedDecimal) {
			a.push(dottedDecimalRE);
		}
		if (flags.allowDottedHex) {
			a.push(dottedHexRE);
		}
		if (flags.allowDottedOctal) {
			a.push(dottedOctalRE);
		}
		if (flags.allowDecimal) {
			a.push(decimalRE);
		}
		if (flags.allowHex) {
			a.push(hexRE);
		}
		if (flags.allowIPv6) {
			a.push(ipv6RE);
		}
		if (flags.allowHybrid) {
			a.push(hybridRE);
		}
		var ipAddressRE = "";
		if (a.length > 0) {
			ipAddressRE = "(" + a.join("|") + ")";
		}
		return ipAddressRE;
	}, host:function (flags) {
		flags = (typeof flags == "object") ? flags : {};
		if (typeof flags.allowIP != "boolean") {
			flags.allowIP = true;
		}
		if (typeof flags.allowLocal != "boolean") {
			flags.allowLocal = false;
		}
		if (typeof flags.allowPort != "boolean") {
			flags.allowPort = true;
		}
		if (typeof flags.allowNamed != "boolean") {
			flags.allowNamed = false;
		}
		var domainLabelRE = "(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)";
		var domainNameRE = "(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)";
		var portRE = flags.allowPort ? "(\\:\\d+)?" : "";
		var hostNameRE = "((?:" + domainLabelRE + "\\.)+" + domainNameRE + "\\.?)";
		if (flags.allowIP) {
			hostNameRE += "|" + dojox.validate.regexp.ipAddress(flags);
		}
		if (flags.allowLocal) {
			hostNameRE += "|localhost";
		}
		if (flags.allowNamed) {
			hostNameRE += "|^[^-][a-zA-Z0-9_-]*";
		}
		return "(" + hostNameRE + ")" + portRE;
	}, url:function (flags) {
		flags = (typeof flags == "object") ? flags : {};
		if (!("scheme" in flags)) {
			flags.scheme = [true, false];
		}
		var protocolRE = dojo.regexp.buildGroupRE(flags.scheme, function (q) {
			if (q) {
				return "(https?|ftps?)\\://";
			}
			return "";
		});
		var pathRE = "(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]+(?:\\?[^?#\\s/]*)?(?:#[A-Za-z][\\w.:-]*)?)?)?";
		return protocolRE + dojox.validate.regexp.host(flags) + pathRE;
	}, emailAddress:function (flags) {
		flags = (typeof flags == "object") ? flags : {};
		if (typeof flags.allowCruft != "boolean") {
			flags.allowCruft = false;
		}
		flags.allowPort = false;
		var usernameRE = "([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+";
		var emailAddressRE = usernameRE + "@" + dojox.validate.regexp.host(flags);
		if (flags.allowCruft) {
			emailAddressRE = "<?(mailto\\:)?" + emailAddressRE + ">?";
		}
		return emailAddressRE;
	}, emailAddressList:function (flags) {
		flags = (typeof flags == "object") ? flags : {};
		if (typeof flags.listSeparator != "string") {
			flags.listSeparator = "\\s;,";
		}
		var emailAddressRE = dojox.validate.regexp.emailAddress(flags);
		var emailAddressListRE = "(" + emailAddressRE + "\\s*[" + flags.listSeparator + "]\\s*)*" + emailAddressRE + "\\s*[" + flags.listSeparator + "]?\\s*";
		return emailAddressListRE;
	}, numberFormat:function (flags) {
		flags = (typeof flags == "object") ? flags : {};
		if (typeof flags.format == "undefined") {
			flags.format = "###-###-####";
		}
		var digitRE = function (format) {
			return dojo.regexp.escapeString(format, "?").replace(/\?/g, "\\d?").replace(/#/g, "\\d");
		};
		return dojo.regexp.buildGroupRE(flags.format, digitRE);
	}});
	dojox.validate.regexp.ca = {postalCode:function () {
		return "([A-Z][0-9][A-Z] [0-9][A-Z][0-9])";
	}, province:function () {
		return "(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)";
	}};
	dojox.validate.regexp.us = {state:function (flags) {
		flags = (typeof flags == "object") ? flags : {};
		if (typeof flags.allowTerritories != "boolean") {
			flags.allowTerritories = true;
		}
		if (typeof flags.allowMilitary != "boolean") {
			flags.allowMilitary = true;
		}
		var statesRE = "AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|" + "NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY";
		var territoriesRE = "AS|FM|GU|MH|MP|PW|PR|VI";
		var militaryRE = "AA|AE|AP";
		if (flags.allowTerritories) {
			statesRE += "|" + territoriesRE;
		}
		if (flags.allowMilitary) {
			statesRE += "|" + militaryRE;
		}
		return "(" + statesRE + ")";
	}};
}

