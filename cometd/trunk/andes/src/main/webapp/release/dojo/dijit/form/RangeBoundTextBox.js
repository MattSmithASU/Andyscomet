/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.RangeBoundTextBox"]) {
	dojo._hasResource["dijit.form.RangeBoundTextBox"] = true;
	dojo.provide("dijit.form.RangeBoundTextBox");
	dojo.require("dijit.form.MappedTextBox");
	dojo.declare("dijit.form.RangeBoundTextBox", dijit.form.MappedTextBox, {rangeMessage:"", rangeCheck:function (primitive, constraints) {
		return ("min" in constraints ? (this.compare(primitive, constraints.min) >= 0) : true) && ("max" in constraints ? (this.compare(primitive, constraints.max) <= 0) : true);
	}, isInRange:function (isFocused) {
		return this.rangeCheck(this.get("value"), this.constraints);
	}, _isDefinitelyOutOfRange:function () {
		var val = this.get("value");
		var isTooLittle = false;
		var isTooMuch = false;
		if ("min" in this.constraints) {
			var min = this.constraints.min;
			min = this.compare(val, ((typeof min == "number") && min >= 0 && val != 0) ? 0 : min);
			isTooLittle = (typeof min == "number") && min < 0;
		}
		if ("max" in this.constraints) {
			var max = this.constraints.max;
			max = this.compare(val, ((typeof max != "number") || max > 0) ? max : 0);
			isTooMuch = (typeof max == "number") && max > 0;
		}
		return isTooLittle || isTooMuch;
	}, _isValidSubset:function () {
		return this.inherited(arguments) && !this._isDefinitelyOutOfRange();
	}, isValid:function (isFocused) {
		return this.inherited(arguments) && ((this._isEmpty(this.textbox.value) && !this.required) || this.isInRange(isFocused));
	}, getErrorMessage:function (isFocused) {
		var v = this.get("value");
		if (v !== null && v !== "" && v !== undefined && (typeof v != "number" || !isNaN(v)) && !this.isInRange(isFocused)) {
			return this.rangeMessage;
		}
		return this.inherited(arguments);
	}, postMixInProperties:function () {
		this.inherited(arguments);
		if (!this.rangeMessage) {
			this.messages = dojo.i18n.getLocalization("dijit.form", "validate", this.lang);
			this.rangeMessage = this.messages.rangeMessage;
		}
	}, _setConstraintsAttr:function (constraints) {
		this.inherited(arguments);
		if (this.focusNode) {
			if (this.constraints.min !== undefined) {
				dijit.setWaiState(this.focusNode, "valuemin", this.constraints.min);
			} else {
				dijit.removeWaiState(this.focusNode, "valuemin");
			}
			if (this.constraints.max !== undefined) {
				dijit.setWaiState(this.focusNode, "valuemax", this.constraints.max);
			} else {
				dijit.removeWaiState(this.focusNode, "valuemax");
			}
		}
	}, _setValueAttr:function (value, priorityChange) {
		dijit.setWaiState(this.focusNode, "valuenow", value);
		this.inherited(arguments);
	}, applyTextDir:function (element, text) {
	}});
}

