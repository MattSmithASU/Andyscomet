/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.validate.ca"]) {
	dojo._hasResource["dojox.validate.ca"] = true;
	dojo.provide("dojox.validate.ca");
	dojo.require("dojox.validate._base");
	dojo.mixin(dojox.validate.ca, {isPhoneNumber:function (value) {
		return dojox.validate.us.isPhoneNumber(value);
	}, isProvince:function (value) {
		var re = new RegExp("^" + dojox.validate.regexp.ca.province() + "$", "i");
		return re.test(value);
	}, isSocialInsuranceNumber:function (value) {
		var flags = {format:["###-###-###", "### ### ###", "#########"]};
		return dojox.validate.isNumberFormat(value, flags);
	}, isPostalCode:function (value) {
		var re = new RegExp("^" + dojox.validate.regexp.ca.postalCode() + "$", "i");
		return re.test(value);
	}});
}

