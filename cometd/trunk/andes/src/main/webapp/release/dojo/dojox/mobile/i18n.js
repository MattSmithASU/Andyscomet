/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.i18n"]) {
	dojo._hasResource["dojox.mobile.i18n"] = true;
	dojo.provide("dojox.mobile.i18n");
	dojo.require("dojo.i18n");
	dojo.require("dojox.mobile");
	dojox.mobile.i18n.load = function (packageName, bundleName, locale, availableFlatLocales) {
		dojo.requireLocalization(packageName, bundleName, locale, availableFlatLocales, "");
		if (!dojox.mobile.i18n.bundle) {
			dojox.mobile.i18n.bundle = [];
		}
		return dojo.mixin(dojox.mobile.i18n.bundle, dojo.i18n.getLocalization(packageName, bundleName, locale));
	};
	dojo.extend(dijit._WidgetBase, {mblNoConv:false, _cv:function (s) {
		if (this.mblNoConv || !dojox.mobile.i18n.bundle) {
			return s;
		}
		return dojox.mobile.i18n.bundle[dojo.trim(s)] || s;
	}});
}

