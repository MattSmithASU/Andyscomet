/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.NumberSpinner"]) {
	dojo._hasResource["dijit.form.NumberSpinner"] = true;
	dojo.provide("dijit.form.NumberSpinner");
	dojo.require("dijit.form._Spinner");
	dojo.require("dijit.form.NumberTextBox");
	dojo.declare("dijit.form.NumberSpinner", [dijit.form._Spinner, dijit.form.NumberTextBoxMixin], {adjust:function (val, delta) {
		var tc = this.constraints, v = isNaN(val), gotMax = !isNaN(tc.max), gotMin = !isNaN(tc.min);
		if (v && delta != 0) {
			val = (delta > 0) ? gotMin ? tc.min : gotMax ? tc.max : 0 : gotMax ? this.constraints.max : gotMin ? tc.min : 0;
		}
		var newval = val + delta;
		if (v || isNaN(newval)) {
			return val;
		}
		if (gotMax && (newval > tc.max)) {
			newval = tc.max;
		}
		if (gotMin && (newval < tc.min)) {
			newval = tc.min;
		}
		return newval;
	}, _onKeyPress:function (e) {
		if ((e.charOrCode == dojo.keys.HOME || e.charOrCode == dojo.keys.END) && !(e.ctrlKey || e.altKey || e.metaKey) && typeof this.get("value") != "undefined") {
			var value = this.constraints[(e.charOrCode == dojo.keys.HOME ? "min" : "max")];
			if (typeof value == "number") {
				this._setValueAttr(value, false);
			}
			dojo.stopEvent(e);
		}
	}});
}

