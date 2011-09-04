/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.validate.us"]) {
	dojo._hasResource["dojox.validate.us"] = true;
	dojo.provide("dojox.validate.us");
	dojo.require("dojox.validate._base");
	dojox.validate.us.isState = function (value, flags) {
		var re = new RegExp("^" + dojox.validate.regexp.us.state(flags) + "$", "i");
		return re.test(value);
	};
	dojox.validate.us.isPhoneNumber = function (value) {
		var flags = {format:["###-###-####", "(###) ###-####", "(###) ### ####", "###.###.####", "###/###-####", "### ### ####", "###-###-#### x#???", "(###) ###-#### x#???", "(###) ### #### x#???", "###.###.#### x#???", "###/###-#### x#???", "### ### #### x#???", "##########"]};
		return dojox.validate.isNumberFormat(value, flags);
	};
	dojox.validate.us.isSocialSecurityNumber = function (value) {
		var flags = {format:["###-##-####", "### ## ####", "#########"]};
		return dojox.validate.isNumberFormat(value, flags);
	};
	dojox.validate.us.isZipCode = function (value) {
		var flags = {format:["#####-####", "##### ####", "#########", "#####"]};
		return dojox.validate.isNumberFormat(value, flags);
	};
}

