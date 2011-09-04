/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Select"]) {
	dojo._hasResource["dijit.form.Select"] = true;
	dojo.provide("dijit.form.Select");
	dojo.require("dijit.form._FormSelectWidget");
	dojo.require("dijit._HasDropDown");
	dojo.require("dijit.Menu");
	dojo.require("dijit.Tooltip");
	dojo.requireLocalization("dijit.form", "validate", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.form._SelectMenu", dijit.Menu, {buildRendering:function () {
		this.inherited(arguments);
		var o = (this.menuTableNode = this.domNode);
		var n = (this.domNode = dojo.create("div", {style:{overflowX:"hidden", overflowY:"scroll"}}));
		if (o.parentNode) {
			o.parentNode.replaceChild(n, o);
		}
		dojo.removeClass(o, "dijitMenuTable");
		n.className = o.className + " dijitSelectMenu";
		o.className = "dijitReset dijitMenuTable";
		dijit.setWaiRole(o, "listbox");
		dijit.setWaiRole(n, "presentation");
		n.appendChild(o);
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, "onmousemove", dojo.stopEvent);
	}, resize:function (mb) {
		if (mb) {
			dojo.marginBox(this.domNode, mb);
			if ("w" in mb) {
				this.menuTableNode.style.width = "100%";
			}
		}
	}});
	dojo.declare("dijit.form.Select", [dijit.form._FormSelectWidget, dijit._HasDropDown], {baseClass:"dijitSelect", templateString:dojo.cache("dijit.form", "templates/Select.html", "<table class=\"dijit dijitReset dijitInline dijitLeft\"\n\tdojoAttachPoint=\"_buttonNode,tableNode,focusNode\" cellspacing='0' cellpadding='0'\n\trole=\"combobox\" aria-haspopup=\"true\"\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonContents dijitButtonNode\" role=\"presentation\"\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"  dojoAttachPoint=\"containerNode,_popupStateNode\"></span\n\t\t\t><input type=\"hidden\" ${!nameAttrSetting} dojoAttachPoint=\"valueNode\" value=\"${value}\" aria-hidden=\"true\"\n\t\t/></td><td class=\"dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton\"\n\t\t\t\tdojoAttachPoint=\"titleNode\" role=\"presentation\"\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" role=\"presentation\">&#9660;</div\n\t\t></td\n\t></tr></tbody\n></table>\n"), required:false, state:"", message:"", tooltipPosition:[], emptyLabel:"&nbsp;", _isLoaded:false, _childrenLoaded:false, _fillContent:function () {
		this.inherited(arguments);
		if (this.options.length && !this.value && this.srcNodeRef) {
			var si = this.srcNodeRef.selectedIndex || 0;
			this.value = this.options[si >= 0 ? si : 0].value;
		}
		this.dropDown = new dijit.form._SelectMenu({id:this.id + "_menu"});
		dojo.addClass(this.dropDown.domNode, this.baseClass + "Menu");
	}, _getMenuItemForOption:function (option) {
		if (!option.value && !option.label) {
			return new dijit.MenuSeparator();
		} else {
			var click = dojo.hitch(this, "_setValueAttr", option);
			var item = new dijit.MenuItem({option:option, label:option.label || this.emptyLabel, onClick:click, disabled:option.disabled || false});
			dijit.setWaiRole(item.focusNode, "listitem");
			return item;
		}
	}, _addOptionItem:function (option) {
		if (this.dropDown) {
			this.dropDown.addChild(this._getMenuItemForOption(option));
		}
	}, _getChildren:function () {
		if (!this.dropDown) {
			return [];
		}
		return this.dropDown.getChildren();
	}, _loadChildren:function (loadMenuItems) {
		if (loadMenuItems === true) {
			if (this.dropDown) {
				delete this.dropDown.focusedChild;
			}
			if (this.options.length) {
				this.inherited(arguments);
			} else {
				dojo.forEach(this._getChildren(), function (child) {
					child.destroyRecursive();
				});
				var item = new dijit.MenuItem({label:"&nbsp;"});
				this.dropDown.addChild(item);
			}
		} else {
			this._updateSelection();
		}
		this._isLoaded = false;
		this._childrenLoaded = true;
		if (!this._loadingStore) {
			this._setValueAttr(this.value);
		}
	}, _setValueAttr:function (value) {
		this.inherited(arguments);
		dojo.attr(this.valueNode, "value", this.get("value"));
	}, _setDisplay:function (newDisplay) {
		var lbl = newDisplay || this.emptyLabel;
		this.containerNode.innerHTML = "<span class=\"dijitReset dijitInline " + this.baseClass + "Label\">" + lbl + "</span>";
		dijit.setWaiState(this.focusNode, "valuetext", lbl);
	}, validate:function (isFocused) {
		var isValid = this.isValid(isFocused);
		this._set("state", isValid ? "" : "Error");
		dijit.setWaiState(this.focusNode, "invalid", isValid ? "false" : "true");
		var message = isValid ? "" : this._missingMsg;
		if (this.message !== message) {
			this._set("message", message);
			dijit.hideTooltip(this.domNode);
			if (message) {
				dijit.showTooltip(message, this.domNode, this.tooltipPosition, !this.isLeftToRight());
			}
		}
		return isValid;
	}, isValid:function (isFocused) {
		return (!this.required || this.value === 0 || !(/^\s*$/.test(this.value || "")));
	}, reset:function () {
		this.inherited(arguments);
		dijit.hideTooltip(this.domNode);
		this._set("state", "");
		this._set("message", "");
	}, postMixInProperties:function () {
		this.inherited(arguments);
		this._missingMsg = dojo.i18n.getLocalization("dijit.form", "validate", this.lang).missingMessage;
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, "onmousemove", dojo.stopEvent);
	}, _setStyleAttr:function (value) {
		this.inherited(arguments);
		dojo.toggleClass(this.domNode, this.baseClass + "FixedWidth", !!this.domNode.style.width);
	}, isLoaded:function () {
		return this._isLoaded;
	}, loadDropDown:function (loadCallback) {
		this._loadChildren(true);
		this._isLoaded = true;
		loadCallback();
	}, closeDropDown:function () {
		this.inherited(arguments);
		if (this.dropDown && this.dropDown.menuTableNode) {
			this.dropDown.menuTableNode.style.width = "";
		}
	}, uninitialize:function (preserveDom) {
		if (this.dropDown && !this.dropDown._destroyed) {
			this.dropDown.destroyRecursive(preserveDom);
			delete this.dropDown;
		}
		this.inherited(arguments);
	}});
}

