/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.ToggleButton"]) {
	dojo._hasResource["dijit.form.ToggleButton"] = true;
	dojo.provide("dijit.form.ToggleButton");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form._ToggleButtonMixin");
	dojo.declare("dijit.form.ToggleButton", [dijit.form.Button, dijit.form._ToggleButtonMixin], {baseClass:"dijitToggleButton", setChecked:function (checked) {
		dojo.deprecated("setChecked(" + checked + ") is deprecated. Use set('checked'," + checked + ") instead.", "", "2.0");
		this.set("checked", checked);
	}});
}

