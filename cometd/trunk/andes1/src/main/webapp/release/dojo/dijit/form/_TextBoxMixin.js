/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._TextBoxMixin"]) {
	dojo._hasResource["dijit.form._TextBoxMixin"] = true;
	dojo.provide("dijit.form._TextBoxMixin");
	dojo.declare("dijit.form._TextBoxMixin", null, {trim:false, uppercase:false, lowercase:false, propercase:false, maxLength:"", selectOnClick:false, placeHolder:"", _getValueAttr:function () {
		return this.parse(this.get("displayedValue"), this.constraints);
	}, _setValueAttr:function (value, priorityChange, formattedValue) {
		var filteredValue;
		if (value !== undefined) {
			filteredValue = this.filter(value);
			if (typeof formattedValue != "string") {
				if (filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))) {
					formattedValue = this.filter(this.format(filteredValue, this.constraints));
				} else {
					formattedValue = "";
				}
			}
		}
		if (formattedValue != null && formattedValue != undefined && ((typeof formattedValue) != "number" || !isNaN(formattedValue)) && this.textbox.value != formattedValue) {
			this.textbox.value = formattedValue;
			this._set("displayedValue", this.get("displayedValue"));
		}
		if (this.textDir == "auto") {
			this.applyTextDir(this.focusNode, formattedValue);
		}
		this.inherited(arguments, [filteredValue, priorityChange]);
	}, displayedValue:"", _getDisplayedValueAttr:function () {
		return this.filter(this.textbox.value);
	}, _setDisplayedValueAttr:function (value) {
		if (value === null || value === undefined) {
			value = "";
		} else {
			if (typeof value != "string") {
				value = String(value);
			}
		}
		this.textbox.value = value;
		this._setValueAttr(this.get("value"), undefined);
		this._set("displayedValue", this.get("displayedValue"));
		if (this.textDir == "auto") {
			this.applyTextDir(this.focusNode, value);
		}
	}, format:function (value, constraints) {
		return ((value == null || value == undefined) ? "" : (value.toString ? value.toString() : value));
	}, parse:function (value, constraints) {
		return value;
	}, _refreshState:function () {
	}, onInput:function () {
	}, __skipInputEvent:false, _onInput:function (e) {
		if (this.textDir == "auto") {
			this.applyTextDir(this.focusNode, this.focusNode.value);
		}
		this._refreshState();
		this._set("displayedValue", this.get("displayedValue"));
	}, postCreate:function () {
		this.textbox.setAttribute("value", this.textbox.value);
		this.inherited(arguments);
		var handleEvent = function (e) {
			var charCode = e.charOrCode || e.keyCode || 229;
			if (e.type == "keydown") {
				switch (charCode) {
				  case dojo.keys.SHIFT:
				  case dojo.keys.ALT:
				  case dojo.keys.CTRL:
				  case dojo.keys.META:
				  case dojo.keys.CAPSLOCK:
					return;
				  default:
					if (charCode >= 65 && charCode <= 90) {
						return;
					}
				}
			}
			if (e.type == "keypress" && typeof charCode != "string") {
				return;
			}
			if (e.type == "input") {
				if (this.__skipInputEvent) {
					this.__skipInputEvent = false;
					return;
				}
			} else {
				this.__skipInputEvent = true;
			}
			var faux = dojo.mixin({}, e, {charOrCode:charCode, wasConsumed:false, preventDefault:function () {
				faux.wasConsumed = true;
				e.preventDefault();
			}, stopPropagation:function () {
				e.stopPropagation();
			}});
			if (this.onInput(faux) === false) {
				dojo.stopEvent(faux);
			}
			if (faux.wasConsumed) {
				return;
			}
			setTimeout(dojo.hitch(this, "_onInput", faux), 0);
		};
		dojo.forEach(["onkeydown", "onkeypress", "onpaste", "oncut", "oninput"], function (event) {
			this.connect(this.textbox, event, handleEvent);
		}, this);
	}, _blankValue:"", filter:function (val) {
		if (val === null) {
			return this._blankValue;
		}
		if (typeof val != "string") {
			return val;
		}
		if (this.trim) {
			val = dojo.trim(val);
		}
		if (this.uppercase) {
			val = val.toUpperCase();
		}
		if (this.lowercase) {
			val = val.toLowerCase();
		}
		if (this.propercase) {
			val = val.replace(/[^\s]+/g, function (word) {
				return word.substring(0, 1).toUpperCase() + word.substring(1);
			});
		}
		return val;
	}, _setBlurValue:function () {
		this._setValueAttr(this.get("value"), true);
	}, _onBlur:function (e) {
		if (this.disabled) {
			return;
		}
		this._setBlurValue();
		this.inherited(arguments);
		if (this._selectOnClickHandle) {
			this.disconnect(this._selectOnClickHandle);
		}
	}, _isTextSelected:function () {
		return this.textbox.selectionStart == this.textbox.selectionEnd;
	}, _onFocus:function (by) {
		if (this.disabled || this.readOnly) {
			return;
		}
		if (this.selectOnClick && by == "mouse") {
			this._selectOnClickHandle = this.connect(this.domNode, "onmouseup", function () {
				this.disconnect(this._selectOnClickHandle);
				if (this._isTextSelected()) {
					dijit.selectInputText(this.textbox);
				}
			});
		}
		this.inherited(arguments);
		this._refreshState();
	}, reset:function () {
		this.textbox.value = "";
		this.inherited(arguments);
	}, _setTextDirAttr:function (textDir) {
		if (!this._created || this.textDir != textDir) {
			this._set("textDir", textDir);
			this.applyTextDir(this.focusNode, this.focusNode.value);
		}
	}});
	dijit._setSelectionRange = function (element, start, stop) {
		if (element.setSelectionRange) {
			element.setSelectionRange(start, stop);
		}
	};
	dijit.selectInputText = function (element, start, stop) {
		var _window = dojo.global;
		var _document = dojo.doc;
		element = dojo.byId(element);
		if (isNaN(start)) {
			start = 0;
		}
		if (isNaN(stop)) {
			stop = element.value ? element.value.length : 0;
		}
		try {
			element.focus();
			dijit._setSelectionRange(element, start, stop);
		}
		catch (e) {
		}
	};
}

