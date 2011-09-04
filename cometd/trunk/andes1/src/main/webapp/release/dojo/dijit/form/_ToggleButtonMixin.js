/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._ToggleButtonMixin"]) {
	dojo._hasResource["dijit.form._ToggleButtonMixin"] = true;
	dojo.provide("dijit.form._ToggleButtonMixin");
	dojo.declare("dijit.form._ToggleButtonMixin", null, {checked:false, _onClick:function (evt) {
		var ret = this.inherited(arguments);
		if (ret) {
			this.set("checked", !this.checked);
		}
	}, _setCheckedAttr:function (value, priorityChange) {
		this._set("checked", value);
		dojo.attr(this.focusNode || this.domNode, "checked", value);
		(this.focusNode || this.domNode).setAttribute("aria-pressed", value);
		this._handleOnChange(value, priorityChange);
	}, reset:function () {
		this._hasBeenBlurred = false;
		this.set("checked", this.params.checked || false);
	}});
}

