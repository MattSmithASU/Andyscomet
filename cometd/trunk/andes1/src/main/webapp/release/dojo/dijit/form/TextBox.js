/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.TextBox"]) {
	dojo._hasResource["dijit.form.TextBox"] = true;
	dojo.provide("dijit.form.TextBox");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dijit.form._TextBoxMixin");
	dojo.declare("dijit.form.TextBox", [dijit.form._FormValueWidget, dijit.form._TextBoxMixin], {templateString:dojo.cache("dijit.form", "templates/TextBox.html", "<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n"), _singleNodeTemplate:"<input class=\"dijit dijitReset dijitLeft dijitInputField\" dojoAttachPoint=\"textbox,focusNode\" autocomplete=\"off\" type=\"${type}\" ${!nameAttrSetting} />", _buttonInputDisabled:dojo.isIE ? "disabled" : "", baseClass:"dijitTextBox", postMixInProperties:function () {
		var type = this.type.toLowerCase();
		if (this.templateString && this.templateString.toLowerCase() == "input" || ((type == "hidden" || type == "file") && this.templateString == dijit.form.TextBox.prototype.templateString)) {
			this.templateString = this._singleNodeTemplate;
		}
		this.inherited(arguments);
	}, _onInput:function (e) {
		this.inherited(arguments);
		if (this.intermediateChanges) {
			var _this = this;
			setTimeout(function () {
				_this._handleOnChange(_this.get("value"), false);
			}, 0);
		}
	}, _setPlaceHolderAttr:function (v) {
		this._set("placeHolder", v);
		if (!this._phspan) {
			this._attachPoints.push("_phspan");
			this._phspan = dojo.create("span", {className:"dijitPlaceHolder dijitInputField"}, this.textbox, "after");
		}
		this._phspan.innerHTML = "";
		this._phspan.appendChild(document.createTextNode(v));
		this._updatePlaceHolder();
	}, _updatePlaceHolder:function () {
		if (this._phspan) {
			this._phspan.style.display = (this.placeHolder && !this._focused && !this.textbox.value) ? "" : "none";
		}
	}, _setValueAttr:function (value, priorityChange, formattedValue) {
		this.inherited(arguments);
		this._updatePlaceHolder();
	}, getDisplayedValue:function () {
		dojo.deprecated(this.declaredClass + "::getDisplayedValue() is deprecated. Use set('displayedValue') instead.", "", "2.0");
		return this.get("displayedValue");
	}, setDisplayedValue:function (value) {
		dojo.deprecated(this.declaredClass + "::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.", "", "2.0");
		this.set("displayedValue", value);
	}, _onBlur:function (e) {
		if (this.disabled) {
			return;
		}
		this.inherited(arguments);
		this._updatePlaceHolder();
	}, _onFocus:function (by) {
		if (this.disabled || this.readOnly) {
			return;
		}
		this.inherited(arguments);
		this._updatePlaceHolder();
	}});
	if (dojo.isIE) {
		dijit.form.TextBox = dojo.declare(dijit.form.TextBox, {_isTextSelected:function () {
			var range = dojo.doc.selection.createRange();
			var parent = range.parentElement();
			return parent == this.textbox && range.text.length == 0;
		}, postCreate:function () {
			this.inherited(arguments);
			setTimeout(dojo.hitch(this, function () {
				var s = dojo.getComputedStyle(this.domNode);
				if (s) {
					var ff = s.fontFamily;
					if (ff) {
						var inputs = this.domNode.getElementsByTagName("INPUT");
						if (inputs) {
							for (var i = 0; i < inputs.length; i++) {
								inputs[i].style.fontFamily = ff;
							}
						}
					}
				}
			}), 0);
		}});
		dijit._setSelectionRange = function (element, start, stop) {
			if (element.createTextRange) {
				var r = element.createTextRange();
				r.collapse(true);
				r.moveStart("character", -99999);
				r.moveStart("character", start);
				r.moveEnd("character", stop - start);
				r.select();
			}
		};
	}
	if (dojo.isMoz) {
		dijit.form.TextBox = dojo.declare(dijit.form.TextBox, {_onBlur:function (e) {
			this.inherited(arguments);
			if (this.selectOnClick) {
				this.textbox.selectionStart = this.textbox.selectionEnd = undefined;
			}
		}});
	}
}

