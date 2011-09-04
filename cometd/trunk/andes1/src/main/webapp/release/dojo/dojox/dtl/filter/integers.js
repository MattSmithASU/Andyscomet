/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.dtl.filter.integers"]) {
	dojo._hasResource["dojox.dtl.filter.integers"] = true;
	dojo.provide("dojox.dtl.filter.integers");
	dojo.mixin(dojox.dtl.filter.integers, {add:function (value, arg) {
		value = parseInt(value, 10);
		arg = parseInt(arg, 10);
		return isNaN(arg) ? value : value + arg;
	}, get_digit:function (value, arg) {
		value = parseInt(value, 10);
		arg = parseInt(arg, 10) - 1;
		if (arg >= 0) {
			value += "";
			if (arg < value.length) {
				value = parseInt(value.charAt(arg), 10);
			} else {
				value = 0;
			}
		}
		return (isNaN(value) ? 0 : value);
	}});
}

