/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.MappedTextBox"]) {
	dojo._hasResource["dijit.form.MappedTextBox"] = true;
	dojo.provide("dijit.form.MappedTextBox");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.declare("dijit.form.MappedTextBox", dijit.form.ValidationTextBox, {postMixInProperties:function () {
		this.inherited(arguments);
		this.nameAttrSetting = "";
	}, _setNameAttr:null, serialize:function (val, options) {
		return val.toString ? val.toString() : "";
	}, toString:function () {
		var val = this.filter(this.get("value"));
		return val != null ? (typeof val == "string" ? val : this.serialize(val, this.constraints)) : "";
	}, validate:function () {
		this.valueNode.value = this.toString();
		return this.inherited(arguments);
	}, buildRendering:function () {
		this.inherited(arguments);
		this.valueNode = dojo.place("<input type='hidden'" + (this.name ? " name='" + this.name.replace(/'/g, "&quot;") + "'" : "") + "/>", this.textbox, "after");
	}, reset:function () {
		this.valueNode.value = "";
		this.inherited(arguments);
	}});
}

