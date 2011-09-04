/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.CheckBox"]) {
	dojo._hasResource["dijit.form.CheckBox"] = true;
	dojo.provide("dijit.form.CheckBox");
	dojo.require("dijit.form.ToggleButton");
	dojo.require("dijit.form._CheckBoxMixin");
	dojo.declare("dijit.form.CheckBox", [dijit.form.ToggleButton, dijit.form._CheckBoxMixin], {templateString:dojo.cache("dijit.form", "templates/CheckBox.html", "<div class=\"dijit dijitReset dijitInline\" role=\"presentation\"\n\t><input\n\t \t${!nameAttrSetting} type=\"${type}\" ${checkedAttrSetting}\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\n\t\tdojoAttachPoint=\"focusNode\"\n\t \tdojoAttachEvent=\"onclick:_onClick\"\n/></div>\n"), baseClass:"dijitCheckBox", _setValueAttr:function (newValue, priorityChange) {
		if (typeof newValue == "string") {
			this._set("value", newValue);
			dojo.attr(this.focusNode, "value", newValue);
			newValue = true;
		}
		if (this._created) {
			this.set("checked", newValue, priorityChange);
		}
	}, _getValueAttr:function () {
		return (this.checked ? this.value : false);
	}, postMixInProperties:function () {
		this.inherited(arguments);
		this.checkedAttrSetting = this.checked ? "checked" : "";
	}, _fillContent:function (source) {
	}, _onFocus:function () {
		if (this.id) {
			dojo.query("label[for='" + this.id + "']").addClass("dijitFocusedLabel");
		}
		this.inherited(arguments);
	}, _onBlur:function () {
		if (this.id) {
			dojo.query("label[for='" + this.id + "']").removeClass("dijitFocusedLabel");
		}
		this.inherited(arguments);
	}});
}

