/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.TimeSpinner"]) {
	dojo._hasResource["dojox.form.TimeSpinner"] = true;
	dojo.provide("dojox.form.TimeSpinner");
	dojo.require("dijit.form._Spinner");
	dojo.require("dojo.date");
	dojo.require("dojo.date.locale");
	dojo.require("dojo.date.stamp");
	dojo.declare("dojox.form.TimeSpinner", [dijit.form._Spinner], {required:false, adjust:function (val, delta) {
		return dojo.date.add(val, "minute", delta);
	}, isValid:function () {
		return true;
	}, smallDelta:5, largeDelta:30, timeoutChangeRate:0.5, parse:function (time, locale) {
		return dojo.date.locale.parse(time, {selector:"time", formatLength:"short"});
	}, format:function (time, locale) {
		if (dojo.isString(time)) {
			return time;
		}
		return dojo.date.locale.format(time, {selector:"time", formatLength:"short"});
	}, serialize:dojo.date.stamp.toISOString, value:"12:00 AM", _onKeyPress:function (e) {
		if ((e.charOrCode == dojo.keys.HOME || e.charOrCode == dojo.keys.END) && !(e.ctrlKey || e.altKey || e.metaKey) && typeof this.get("value") != "undefined") {
			var value = this.constraints[(e.charOrCode == dojo.keys.HOME ? "min" : "max")];
			if (value) {
				this._setValueAttr(value, true);
			}
			dojo.stopEvent(e);
		}
	}});
}

