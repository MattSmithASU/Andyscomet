/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._DateTimeTextBox"]) {
	dojo._hasResource["dijit.form._DateTimeTextBox"] = true;
	dojo.provide("dijit.form._DateTimeTextBox");
	dojo.require("dojo.date");
	dojo.require("dojo.date.locale");
	dojo.require("dojo.date.stamp");
	dojo.require("dijit.form.RangeBoundTextBox");
	dojo.require("dijit._HasDropDown");
	new Date("X");
	dojo.declare("dijit.form._DateTimeTextBox", [dijit.form.RangeBoundTextBox, dijit._HasDropDown], {templateString:dojo.cache("dijit.form", "templates/DropDownBox.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdojoAttachPoint=\"_buttonNode, _popupStateNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" role=\"textbox\" aria-haspopup=\"true\"\n\t/></div\n></div>\n"), hasDownArrow:true, openOnClick:true, regExpGen:dojo.date.locale.regexp, datePackage:"dojo.date", compare:function (val1, val2) {
		var isInvalid1 = this._isInvalidDate(val1);
		var isInvalid2 = this._isInvalidDate(val2);
		return isInvalid1 ? (isInvalid2 ? 0 : -1) : (isInvalid2 ? 1 : dojo.date.compare(val1, val2, this._selector));
	}, forceWidth:true, format:function (value, constraints) {
		if (!value) {
			return "";
		}
		return this.dateLocaleModule.format(value, constraints);
	}, "parse":function (value, constraints) {
		return this.dateLocaleModule.parse(value, constraints) || (this._isEmpty(value) ? null : undefined);
	}, serialize:function (val, options) {
		if (val.toGregorian) {
			val = val.toGregorian();
		}
		return dojo.date.stamp.toISOString(val, options);
	}, dropDownDefaultValue:new Date(), value:new Date(""), _blankValue:null, popupClass:"", _selector:"", constructor:function (args) {
		var dateClass = args.datePackage ? args.datePackage + ".Date" : "Date";
		this.dateClassObj = dojo.getObject(dateClass, false);
		this.value = new this.dateClassObj("");
		this.datePackage = args.datePackage || this.datePackage;
		this.dateLocaleModule = dojo.getObject(this.datePackage + ".locale", false);
		this.regExpGen = this.dateLocaleModule.regexp;
		this._invalidDate = dijit.form._DateTimeTextBox.prototype.value.toString();
	}, buildRendering:function () {
		this.inherited(arguments);
		if (!this.hasDownArrow) {
			this._buttonNode.style.display = "none";
		}
		if (this.openOnClick || !this.hasDownArrow) {
			this._buttonNode = this.domNode;
			this.baseClass += " dijitComboBoxOpenOnClick";
		}
	}, _setConstraintsAttr:function (constraints) {
		constraints.selector = this._selector;
		constraints.fullYear = true;
		var fromISO = dojo.date.stamp.fromISOString;
		if (typeof constraints.min == "string") {
			constraints.min = fromISO(constraints.min);
		}
		if (typeof constraints.max == "string") {
			constraints.max = fromISO(constraints.max);
		}
		this.inherited(arguments);
	}, _isInvalidDate:function (value) {
		return !value || isNaN(value) || typeof value != "object" || value.toString() == this._invalidDate;
	}, _setValueAttr:function (value, priorityChange, formattedValue) {
		if (value !== undefined) {
			if (typeof value == "string") {
				value = dojo.date.stamp.fromISOString(value);
			}
			if (this._isInvalidDate(value)) {
				value = null;
			}
			if (value instanceof Date && !(this.dateClassObj instanceof Date)) {
				value = new this.dateClassObj(value);
			}
		}
		this.inherited(arguments);
		if (this.dropDown) {
			this.dropDown.set("value", value, false);
		}
	}, _set:function (attr, value) {
		if (attr == "value" && this.value instanceof Date && this.compare(value, this.value) == 0) {
			return;
		}
		this.inherited(arguments);
	}, _setDropDownDefaultValueAttr:function (val) {
		if (this._isInvalidDate(val)) {
			val = new this.dateClassObj();
		}
		this.dropDownDefaultValue = val;
	}, openDropDown:function (callback) {
		if (this.dropDown) {
			this.dropDown.destroy();
		}
		var PopupProto = dojo.getObject(this.popupClass, false), textBox = this, value = this.get("value");
		this.dropDown = new PopupProto({onChange:function (value) {
			dijit.form._DateTimeTextBox.superclass._setValueAttr.call(textBox, value, true);
		}, id:this.id + "_popup", dir:textBox.dir, lang:textBox.lang, value:value, currentFocus:!this._isInvalidDate(value) ? value : this.dropDownDefaultValue, constraints:textBox.constraints, filterString:textBox.filterString, datePackage:textBox.datePackage, isDisabledDate:function (date) {
			return !textBox.rangeCheck(date, textBox.constraints);
		}});
		this.inherited(arguments);
	}, _getDisplayedValueAttr:function () {
		return this.textbox.value;
	}, _setDisplayedValueAttr:function (value, priorityChange) {
		this._setValueAttr(this.parse(value, this.constraints), priorityChange, value);
	}});
}

