/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.validate.web"]) {
	dojo._hasResource["dojox.validate.web"] = true;
	dojo.provide("dojox.validate.web");
	dojo.require("dojox.validate._base");
	dojox.validate.isIpAddress = function (value, flags) {
		var re = new RegExp("^" + dojox.validate.regexp.ipAddress(flags) + "$", "i");
		return re.test(value);
	};
	dojox.validate.isUrl = function (value, flags) {
		var re = new RegExp("^" + dojox.validate.regexp.url(flags) + "$", "i");
		return re.test(value);
	};
	dojox.validate.isEmailAddress = function (value, flags) {
		var re = new RegExp("^" + dojox.validate.regexp.emailAddress(flags) + "$", "i");
		return re.test(value);
	};
	dojox.validate.isEmailAddressList = function (value, flags) {
		var re = new RegExp("^" + dojox.validate.regexp.emailAddressList(flags) + "$", "i");
		return re.test(value);
	};
	dojox.validate.getEmailAddressList = function (value, flags) {
		if (!flags) {
			flags = {};
		}
		if (!flags.listSeparator) {
			flags.listSeparator = "\\s;,";
		}
		if (dojox.validate.isEmailAddressList(value, flags)) {
			return value.split(new RegExp("\\s*[" + flags.listSeparator + "]\\s*"));
		}
		return [];
	};
}

