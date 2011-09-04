/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.ComboBoxMixin"]) {
	dojo._hasResource["dijit.form.ComboBoxMixin"] = true;
	dojo.provide("dijit.form.ComboBoxMixin");
	dojo.require("dijit.form._AutoCompleterMixin");
	dojo.require("dijit.form._ComboBoxMenu");
	dojo.declare("dijit.form.ComboBoxMixin", dijit.form._AutoCompleterMixin, {dropDownClass:"dijit.form._ComboBoxMenu", hasDownArrow:true, templateString:dojo.cache("dijit.form", "templates/DropDownBox.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdojoAttachPoint=\"_buttonNode, _popupStateNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" role=\"textbox\" aria-haspopup=\"true\"\n\t/></div\n></div>\n"), baseClass:"dijitTextBox dijitComboBox", cssStateNodes:{"_buttonNode":"dijitDownArrowButton"}, _setHasDownArrowAttr:function (val) {
		this._set("hasDownArrow", val);
		this._buttonNode.style.display = val ? "" : "none";
	}, _showResultList:function () {
		this.displayMessage("");
		this.inherited(arguments);
	}});
}

