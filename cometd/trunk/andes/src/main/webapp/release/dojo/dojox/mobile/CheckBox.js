/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.CheckBox"]) {
	dojo._hasResource["dojox.mobile.CheckBox"] = true;
	dojo.provide("dojox.mobile.CheckBox");
	dojo.require("dojox.mobile.ToggleButton");
	dojo.require("dijit.form._CheckBoxMixin");
	dojo.declare("dojox.mobile.CheckBox", [dojox.mobile.ToggleButton, dijit.form._CheckBoxMixin], {baseClass:"mblCheckBox", _setTypeAttr:function () {
	}, buildRendering:function () {
		if (!this.srcNodeRef) {
			this.srcNodeRef = dojo.create("input", {type:this.type});
		}
		this.inherited(arguments);
		this.focusNode = this.domNode;
	}});
}

