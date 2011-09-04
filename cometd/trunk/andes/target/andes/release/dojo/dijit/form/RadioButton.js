/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.RadioButton"]) {
	dojo._hasResource["dijit.form.RadioButton"] = true;
	dojo.provide("dijit.form.RadioButton");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dijit.form._RadioButtonMixin");
	dojo.declare("dijit.form.RadioButton", [dijit.form.CheckBox, dijit.form._RadioButtonMixin], {baseClass:"dijitRadio"});
}

