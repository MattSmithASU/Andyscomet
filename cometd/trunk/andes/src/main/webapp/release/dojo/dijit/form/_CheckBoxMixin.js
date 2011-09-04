/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._CheckBoxMixin"]) {
	dojo._hasResource["dijit.form._CheckBoxMixin"] = true;
	dojo.provide("dijit.form._CheckBoxMixin");
	dojo.declare("dijit.form._CheckBoxMixin", null, {type:"checkbox", value:"on", readOnly:false, _setReadOnlyAttr:function (value) {
		this._set("readOnly", value);
		dojo.attr(this.focusNode, "readOnly", value);
		this.focusNode.setAttribute("aria-readonly", value);
	}, _setLabelAttr:undefined, postMixInProperties:function () {
		if (this.value == "") {
			this.value = "on";
		}
		this.inherited(arguments);
	}, reset:function () {
		this.inherited(arguments);
		this._set("value", this.params.value || "on");
		dojo.attr(this.focusNode, "value", this.value);
	}, _onClick:function (e) {
		if (this.readOnly) {
			dojo.stopEvent(e);
			return false;
		}
		return this.inherited(arguments);
	}});
}

