/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.ToggleButton"]) {
	dojo._hasResource["dojox.mobile.ToggleButton"] = true;
	dojo.provide("dojox.mobile.ToggleButton");
	dojo.require("dojox.mobile.Button");
	dojo.require("dijit.form._ToggleButtonMixin");
	dojo.declare("dojox.mobile.ToggleButton", [dojox.mobile.Button, dijit.form._ToggleButtonMixin], {baseClass:"mblToggleButton", _setCheckedAttr:function () {
		this.inherited(arguments);
		var button = this.focusNode || this.domNode;
		var newStateClasses = (this.baseClass + " " + this["class"]).split(" ");
		newStateClasses = dojo.map(newStateClasses, function (c) {
			return c + "Checked";
		});
		if (this.checked) {
			dojo.addClass(button, newStateClasses);
		} else {
			dojo.removeClass(button, newStateClasses);
		}
	}});
}

