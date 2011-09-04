/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.CheckedMultiSelect"]) {
	dojo._hasResource["dojox.form.CheckedMultiSelect"] = true;
	dojo.provide("dojox.form.CheckedMultiSelect");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit.form._FormSelectWidget");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dijit.Tooltip");
	dojo.declare("dojox.form._CheckedMultiSelectItem", [dijit._Widget, dijit._Templated], {widgetsInTemplate:true, templateString:dojo.cache("dojox.form", "resources/_CheckedMultiSelectItem.html", "<div class=\"dijitReset ${baseClass}\"\n\t><input class=\"${baseClass}Box\" dojoType=\"dijit.form.CheckBox\" dojoAttachPoint=\"checkBox\" \n\t\tdojoAttachEvent=\"_onClick:_changeBox\" type=\"${_type.type}\" baseClass=\"${_type.baseClass}\"\n\t/><div class=\"dijitInline ${baseClass}Label\" dojoAttachPoint=\"labelNode\" dojoAttachEvent=\"onclick:_onClick\"></div\n></div>\n"), baseClass:"dojoxMultiSelectItem", option:null, parent:null, disabled:false, readOnly:false, postMixInProperties:function () {
		if (this.parent.multiple) {
			this._type = {type:"checkbox", baseClass:"dijitCheckBox"};
		} else {
			this._type = {type:"radio", baseClass:"dijitRadio"};
		}
		this.disabled = this.option.disabled = this.option.disabled || false;
		this.inherited(arguments);
	}, postCreate:function () {
		this.inherited(arguments);
		this.labelNode.innerHTML = this.option.label;
	}, _changeBox:function () {
		if (this.get("disabled") || this.get("readOnly")) {
			return;
		}
		if (this.parent.multiple) {
			this.option.selected = this.checkBox.get("value") && true;
		} else {
			this.parent.set("value", this.option.value);
		}
		this.parent._updateSelection();
		this.parent.focus();
	}, _onClick:function (e) {
		if (this.get("disabled") || this.get("readOnly")) {
			dojo.stopEvent(e);
		} else {
			this.checkBox._onClick(e);
		}
	}, _updateBox:function () {
		this.checkBox.set("value", this.option.selected);
	}, _setDisabledAttr:function (value) {
		this.disabled = value || this.option.disabled;
		this.checkBox.set("disabled", this.disabled);
		dojo.toggleClass(this.domNode, "dojoxMultiSelectDisabled", this.disabled);
	}, _setReadOnlyAttr:function (value) {
		this.checkBox.set("readOnly", value);
		this.readOnly = value;
	}});
	dojo.declare("dojox.form.CheckedMultiSelect", dijit.form._FormSelectWidget, {templateString:dojo.cache("dojox.form", "resources/CheckedMultiSelect.html", "<div class=\"dijit dijitReset dijitInline\" dojoAttachEvent=\"onmousedown:_onMouseDown,onclick:focus\"\n\t><select class=\"${baseClass}Select\" multiple=\"true\" dojoAttachPoint=\"containerNode,focusNode\"></select\n\t><div dojoAttachPoint=\"wrapperDiv\"></div\n></div>\n"), baseClass:"dojoxMultiSelect", required:false, invalidMessage:"At least one item must be selected.", _message:"", tooltipPosition:[], _onMouseDown:function (e) {
		dojo.stopEvent(e);
	}, validator:function () {
		if (!this.required) {
			return true;
		}
		return dojo.some(this.getOptions(), function (opt) {
			return opt.selected && opt.value != null && opt.value.toString().length != 0;
		});
	}, validate:function (isFocused) {
		dijit.hideTooltip(this.domNode);
		var isValid = this.isValid(isFocused);
		if (!isValid) {
			this.displayMessage(this.invalidMessage);
		}
		return isValid;
	}, isValid:function (isFocused) {
		return this.validator();
	}, getErrorMessage:function (isFocused) {
		return this.invalidMessage;
	}, displayMessage:function (message) {
		dijit.hideTooltip(this.domNode);
		if (message) {
			dijit.showTooltip(message, this.domNode, this.tooltipPosition);
		}
	}, onAfterAddOptionItem:function (item, option) {
	}, _addOptionItem:function (option) {
		var item = new dojox.form._CheckedMultiSelectItem({option:option, parent:this});
		this.wrapperDiv.appendChild(item.domNode);
		this.onAfterAddOptionItem(item, option);
	}, _refreshState:function () {
		this.validate(this._focused);
	}, onChange:function (newValue) {
		this._refreshState();
	}, reset:function () {
		this.inherited(arguments);
		dijit.hideTooltip(this.domNode);
	}, _updateSelection:function () {
		this.inherited(arguments);
		this._handleOnChange(this.value);
		dojo.forEach(this._getChildren(), function (c) {
			c._updateBox();
		});
	}, _getChildren:function () {
		return dojo.map(this.wrapperDiv.childNodes, function (n) {
			return dijit.byNode(n);
		});
	}, invertSelection:function (onChange) {
		dojo.forEach(this.options, function (i) {
			i.selected = !i.selected;
		});
		this._updateSelection();
	}, _setDisabledAttr:function (value) {
		this.inherited(arguments);
		dojo.forEach(this._getChildren(), function (node) {
			if (node && node.set) {
				node.set("disabled", value);
			}
		});
	}, _setReadOnlyAttr:function (value) {
		if ("readOnly" in this.attributeMap) {
			this._attrToDom("readOnly", value);
		}
		this.readOnly = value;
		dojo.forEach(this._getChildren(), function (node) {
			if (node && node.set) {
				node.set("readOnly", value);
			}
		});
	}, uninitialize:function () {
		dijit.hideTooltip(this.domNode);
		dojo.forEach(this._getChildren(), function (child) {
			child.destroyRecursive();
		});
		this.inherited(arguments);
	}});
}

