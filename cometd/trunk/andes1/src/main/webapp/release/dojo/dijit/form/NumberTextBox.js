/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.NumberTextBox"]) {
	dojo._hasResource["dijit.form.NumberTextBox"] = true;
	dojo.provide("dijit.form.NumberTextBox");
	dojo.require("dijit.form.RangeBoundTextBox");
	dojo.require("dojo.number");
	dojo.declare("dijit.form.NumberTextBoxMixin", null, {regExpGen:dojo.number.regexp, value:NaN, editOptions:{pattern:"#.######"}, _formatter:dojo.number.format, _setConstraintsAttr:function (constraints) {
		var places = typeof constraints.places == "number" ? constraints.places : 0;
		if (places) {
			places++;
		}
		if (typeof constraints.max != "number") {
			constraints.max = 9 * Math.pow(10, 15 - places);
		}
		if (typeof constraints.min != "number") {
			constraints.min = -9 * Math.pow(10, 15 - places);
		}
		this.inherited(arguments, [constraints]);
		if (this.focusNode && this.focusNode.value && !isNaN(this.value)) {
			this.set("value", this.value);
		}
	}, _onFocus:function () {
		if (this.disabled) {
			return;
		}
		var val = this.get("value");
		if (typeof val == "number" && !isNaN(val)) {
			var formattedValue = this.format(val, this.constraints);
			if (formattedValue !== undefined) {
				this.textbox.value = formattedValue;
			}
		}
		this.inherited(arguments);
	}, format:function (value, constraints) {
		var formattedValue = String(value);
		if (typeof value != "number") {
			return formattedValue;
		}
		if (isNaN(value)) {
			return "";
		}
		if (!("rangeCheck" in this && this.rangeCheck(value, constraints)) && constraints.exponent !== false && /\de[-+]?\d/i.test(formattedValue)) {
			return formattedValue;
		}
		if (this.editOptions && this._focused) {
			constraints = dojo.mixin({}, constraints, this.editOptions);
		}
		return this._formatter(value, constraints);
	}, _parser:dojo.number.parse, parse:function (value, constraints) {
		var v = this._parser(value, dojo.mixin({}, constraints, (this.editOptions && this._focused) ? this.editOptions : {}));
		if (this.editOptions && this._focused && isNaN(v)) {
			v = this._parser(value, constraints);
		}
		return v;
	}, _getDisplayedValueAttr:function () {
		var v = this.inherited(arguments);
		return isNaN(v) ? this.textbox.value : v;
	}, filter:function (value) {
		return (value === null || value === "" || value === undefined) ? NaN : this.inherited(arguments);
	}, serialize:function (value, options) {
		return (typeof value != "number" || isNaN(value)) ? "" : this.inherited(arguments);
	}, _setBlurValue:function () {
		var val = dojo.hitch(dojo.mixin({}, this, {_focused:true}), "get")("value");
		this._setValueAttr(val, true);
	}, _setValueAttr:function (value, priorityChange, formattedValue) {
		if (value !== undefined && formattedValue === undefined) {
			formattedValue = String(value);
			if (typeof value == "number") {
				if (isNaN(value)) {
					formattedValue = "";
				} else {
					if (("rangeCheck" in this && this.rangeCheck(value, this.constraints)) || this.constraints.exponent === false || !/\de[-+]?\d/i.test(formattedValue)) {
						formattedValue = undefined;
					}
				}
			} else {
				if (!value) {
					formattedValue = "";
					value = NaN;
				} else {
					value = undefined;
				}
			}
		}
		this.inherited(arguments, [value, priorityChange, formattedValue]);
	}, _getValueAttr:function () {
		var v = this.inherited(arguments);
		if (isNaN(v) && this.textbox.value !== "") {
			if (this.constraints.exponent !== false && /\de[-+]?\d/i.test(this.textbox.value) && (new RegExp("^" + dojo.number._realNumberRegexp(dojo.mixin({}, this.constraints)) + "$").test(this.textbox.value))) {
				var n = Number(this.textbox.value);
				return isNaN(n) ? undefined : n;
			} else {
				return undefined;
			}
		} else {
			return v;
		}
	}, isValid:function (isFocused) {
		if (!this._focused || this._isEmpty(this.textbox.value)) {
			return this.inherited(arguments);
		} else {
			var v = this.get("value");
			if (!isNaN(v) && this.rangeCheck(v, this.constraints)) {
				if (this.constraints.exponent !== false && /\de[-+]?\d/i.test(this.textbox.value)) {
					return true;
				} else {
					return this.inherited(arguments);
				}
			} else {
				return false;
			}
		}
	}});
	dojo.declare("dijit.form.NumberTextBox", [dijit.form.RangeBoundTextBox, dijit.form.NumberTextBoxMixin], {baseClass:"dijitTextBox dijitNumberTextBox"});
}

