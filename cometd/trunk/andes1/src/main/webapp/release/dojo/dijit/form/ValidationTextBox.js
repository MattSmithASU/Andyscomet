/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.ValidationTextBox"]) {
	dojo._hasResource["dijit.form.ValidationTextBox"] = true;
	dojo.provide("dijit.form.ValidationTextBox");
	dojo.require("dojo.i18n");
	dojo.require("dijit.form.TextBox");
	dojo.require("dijit.Tooltip");
	dojo.requireLocalization("dijit.form", "validate", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.form.ValidationTextBox", dijit.form.TextBox, {templateString:dojo.cache("dijit.form", "templates/ValidationTextBox.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\" role=\"presentation\"\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n"), baseClass:"dijitTextBox dijitValidationTextBox", required:false, promptMessage:"", invalidMessage:"$_unset_$", missingMessage:"$_unset_$", message:"", constraints:{}, regExp:".*", regExpGen:function (constraints) {
		return this.regExp;
	}, state:"", tooltipPosition:[], _setValueAttr:function () {
		this.inherited(arguments);
		this.validate(this._focused);
	}, validator:function (value, constraints) {
		return (new RegExp("^(?:" + this.regExpGen(constraints) + ")" + (this.required ? "" : "?") + "$")).test(value) && (!this.required || !this._isEmpty(value)) && (this._isEmpty(value) || this.parse(value, constraints) !== undefined);
	}, _isValidSubset:function () {
		return this.textbox.value.search(this._partialre) == 0;
	}, isValid:function (isFocused) {
		return this.validator(this.textbox.value, this.constraints);
	}, _isEmpty:function (value) {
		return (this.trim ? /^\s*$/ : /^$/).test(value);
	}, getErrorMessage:function (isFocused) {
		return (this.required && this._isEmpty(this.textbox.value)) ? this.missingMessage : this.invalidMessage;
	}, getPromptMessage:function (isFocused) {
		return this.promptMessage;
	}, _maskValidSubsetError:true, validate:function (isFocused) {
		var message = "";
		var isValid = this.disabled || this.isValid(isFocused);
		if (isValid) {
			this._maskValidSubsetError = true;
		}
		var isEmpty = this._isEmpty(this.textbox.value);
		var isValidSubset = !isValid && isFocused && this._isValidSubset();
		this._set("state", isValid ? "" : (((((!this._hasBeenBlurred || isFocused) && isEmpty) || isValidSubset) && this._maskValidSubsetError) ? "Incomplete" : "Error"));
		dijit.setWaiState(this.focusNode, "invalid", isValid ? "false" : "true");
		if (this.state == "Error") {
			this._maskValidSubsetError = isFocused && isValidSubset;
			message = this.getErrorMessage(isFocused);
		} else {
			if (this.state == "Incomplete") {
				message = this.getPromptMessage(isFocused);
				this._maskValidSubsetError = !this._hasBeenBlurred || isFocused;
			} else {
				if (isEmpty) {
					message = this.getPromptMessage(isFocused);
				}
			}
		}
		this.set("message", message);
		return isValid;
	}, displayMessage:function (message) {
		dijit.hideTooltip(this.domNode);
		if (message && this._focused) {
			dijit.showTooltip(message, this.domNode, this.tooltipPosition, !this.isLeftToRight());
		}
	}, _refreshState:function () {
		this.validate(this._focused);
		this.inherited(arguments);
	}, constructor:function () {
		this.constraints = {};
	}, _setConstraintsAttr:function (constraints) {
		if (!constraints.locale && this.lang) {
			constraints.locale = this.lang;
		}
		this._set("constraints", constraints);
		this._computePartialRE();
	}, _computePartialRE:function () {
		var p = this.regExpGen(this.constraints);
		this.regExp = p;
		var partialre = "";
		if (p != ".*") {
			this.regExp.replace(/\\.|\[\]|\[.*?[^\\]{1}\]|\{.*?\}|\(\?[=:!]|./g, function (re) {
				switch (re.charAt(0)) {
				  case "{":
				  case "+":
				  case "?":
				  case "*":
				  case "^":
				  case "$":
				  case "|":
				  case "(":
					partialre += re;
					break;
				  case ")":
					partialre += "|$)";
					break;
				  default:
					partialre += "(?:" + re + "|$)";
					break;
				}
			});
		}
		try {
			"".search(partialre);
		}
		catch (e) {
			partialre = this.regExp;
			console.warn("RegExp error in " + this.declaredClass + ": " + this.regExp);
		}
		this._partialre = "^(?:" + partialre + ")$";
	}, postMixInProperties:function () {
		this.inherited(arguments);
		this.messages = dojo.i18n.getLocalization("dijit.form", "validate", this.lang);
		if (this.invalidMessage == "$_unset_$") {
			this.invalidMessage = this.messages.invalidMessage;
		}
		if (!this.invalidMessage) {
			this.invalidMessage = this.promptMessage;
		}
		if (this.missingMessage == "$_unset_$") {
			this.missingMessage = this.messages.missingMessage;
		}
		if (!this.missingMessage) {
			this.missingMessage = this.invalidMessage;
		}
		this._setConstraintsAttr(this.constraints);
	}, _setDisabledAttr:function (value) {
		this.inherited(arguments);
		this._refreshState();
	}, _setRequiredAttr:function (value) {
		this._set("required", value);
		dijit.setWaiState(this.focusNode, "required", value);
		this._refreshState();
	}, _setMessageAttr:function (message) {
		this._set("message", message);
		this.displayMessage(message);
	}, reset:function () {
		this._maskValidSubsetError = true;
		this.inherited(arguments);
	}, _onBlur:function () {
		this.displayMessage("");
		this.inherited(arguments);
	}});
}

