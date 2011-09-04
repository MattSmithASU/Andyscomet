/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.ComboBox"]) {
	dojo._hasResource["dojox.mobile.ComboBox"] = true;
	dojo.provide("dojox.mobile.ComboBox");
	dojo.require("dojox.mobile.TextBox");
	dojo.require("dojox.mobile._ComboBoxMenu");
	dojo.require("dijit.form._AutoCompleterMixin");
	dojo.declare("dojox.mobile.ComboBox", [dojox.mobile.TextBox, dijit.form._AutoCompleterMixin], {dropDownClass:"dojox.mobile._ComboBoxMenu", selectOnClick:false, autoComplete:false, _onFocus:function () {
		this.inherited(arguments);
		if (!this._opened) {
			this._startSearchAll();
		}
	}, openDropDown:function () {
		var ret = null;
		if (!this._opened) {
			ret = this.inherited(arguments);
			if (ret.aroundCorner.charAt(0) == "B") {
				this.domNode.scrollIntoView(true);
			}
		}
		return ret;
	}});
}

