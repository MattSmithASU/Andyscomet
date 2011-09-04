/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.RadioButton"]) {
	dojo._hasResource["dojox.mobile.RadioButton"] = true;
	dojo.provide("dojox.mobile.RadioButton");
	dojo.require("dojox.mobile.CheckBox");
	dojo.require("dijit.form._RadioButtonMixin");
	dojo.declare("dojox.mobile.RadioButton", [dojox.mobile.CheckBox, dijit.form._RadioButtonMixin], {baseClass:"mblRadioButton"});
}

