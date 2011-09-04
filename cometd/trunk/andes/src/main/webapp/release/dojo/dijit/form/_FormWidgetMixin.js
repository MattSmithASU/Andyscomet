/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._FormWidgetMixin"]) {
	dojo._hasResource["dijit.form._FormWidgetMixin"] = true;
	dojo.provide("dijit.form._FormWidgetMixin");
	dojo.require("dojo.window");
	dojo.declare("dijit.form._FormWidgetMixin", null, {name:"", alt:"", value:"", type:"text", tabIndex:"0", _setTabIndexAttr:"focusNode", disabled:false, intermediateChanges:false, scrollOnFocus:true, _setIdAttr:"focusNode", postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, "onmousedown", "_onMouseDown");
	}, _setDisabledAttr:function (value) {
		this._set("disabled", value);
		dojo.attr(this.focusNode, "disabled", value);
		if (this.valueNode) {
			dojo.attr(this.valueNode, "disabled", value);
		}
		this.focusNode.setAttribute("aria-disabled", value);
		if (value) {
			this._set("hovering", false);
			this._set("active", false);
			var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex : ("_setTabIndexAttr" in this) ? this._setTabIndexAttr : "focusNode";
			dojo.forEach(dojo.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function (attachPointName) {
				var node = this[attachPointName];
				if (dojo.isWebKit || dijit.hasDefaultTabStop(node)) {
					node.setAttribute("tabIndex", "-1");
				} else {
					node.removeAttribute("tabIndex");
				}
			}, this);
		} else {
			if (this.tabIndex != "") {
				this.focusNode.setAttribute("tabIndex", this.tabIndex);
			}
		}
	}, _onFocus:function (e) {
		if (this.scrollOnFocus) {
			dojo.window.scrollIntoView(this.domNode);
		}
		this.inherited(arguments);
	}, isFocusable:function () {
		return !this.disabled && this.focusNode && (dojo.style(this.domNode, "display") != "none");
	}, focus:function () {
		if (!this.disabled && this.focusNode.focus) {
			try {
				this.focusNode.focus();
			}
			catch (e) {
			}
		}
	}, compare:function (val1, val2) {
		if (typeof val1 == "number" && typeof val2 == "number") {
			return (isNaN(val1) && isNaN(val2)) ? 0 : val1 - val2;
		} else {
			if (val1 > val2) {
				return 1;
			} else {
				if (val1 < val2) {
					return -1;
				} else {
					return 0;
				}
			}
		}
	}, onChange:function (newValue) {
	}, _onChangeActive:false, _handleOnChange:function (newValue, priorityChange) {
		if (this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)) {
			this._resetValue = this._lastValueReported = newValue;
		}
		this._pendingOnChange = this._pendingOnChange || (typeof newValue != typeof this._lastValueReported) || (this.compare(newValue, this._lastValueReported) != 0);
		if ((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange) {
			this._lastValueReported = newValue;
			this._pendingOnChange = false;
			if (this._onChangeActive) {
				if (this._onChangeHandle) {
					clearTimeout(this._onChangeHandle);
				}
				this._onChangeHandle = setTimeout(dojo.hitch(this, function () {
					this._onChangeHandle = null;
					this.onChange(newValue);
				}), 0);
			}
		}
	}, create:function () {
		this.inherited(arguments);
		this._onChangeActive = true;
	}, destroy:function () {
		if (this._onChangeHandle) {
			clearTimeout(this._onChangeHandle);
			this.onChange(this._lastValueReported);
		}
		this.inherited(arguments);
	}, _onMouseDown:function (e) {
		if (!e.ctrlKey && dojo.mouseButtons.isLeft(e) && this.isFocusable()) {
			var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function () {
				if (this.isFocusable()) {
					this.focus();
				}
				this.disconnect(mouseUpConnector);
			});
		}
	}});
	dojo.declare("dijit.form._FormValueMixin", dijit.form._FormWidgetMixin, {readOnly:false, _setReadOnlyAttr:function (value) {
		dojo.attr(this.focusNode, "readOnly", value);
		this.focusNode.setAttribute("aria-readonly", value);
		this._set("readOnly", value);
	}, postCreate:function () {
		this.inherited(arguments);
		if (dojo.isIE) {
			this.connect(this.focusNode || this.domNode, "onkeydown", this._onKeyDown);
		}
		if (this._resetValue === undefined) {
			this._lastValueReported = this._resetValue = this.value;
		}
	}, _setValueAttr:function (newValue, priorityChange) {
		this._handleOnChange(newValue, priorityChange);
	}, _handleOnChange:function (newValue, priorityChange) {
		this._set("value", newValue);
		this.inherited(arguments);
	}, undo:function () {
		this._setValueAttr(this._lastValueReported, false);
	}, reset:function () {
		this._hasBeenBlurred = false;
		this._setValueAttr(this._resetValue, true);
	}, _onKeyDown:function (e) {
		if (e.keyCode == dojo.keys.ESCAPE && !(e.ctrlKey || e.altKey || e.metaKey)) {
			var te;
			if (dojo.isIE < 9 || (dojo.isIE && dojo.isQuirks)) {
				e.preventDefault();
				te = document.createEventObject();
				te.keyCode = dojo.keys.ESCAPE;
				te.shiftKey = e.shiftKey;
				e.srcElement.fireEvent("onkeypress", te);
			}
		}
	}});
}

