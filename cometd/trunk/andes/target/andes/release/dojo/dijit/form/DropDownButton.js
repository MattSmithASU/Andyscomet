/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.DropDownButton"]) {
	dojo._hasResource["dijit.form.DropDownButton"] = true;
	dojo.provide("dijit.form.DropDownButton");
	dojo.require("dijit.form.Button");
	dojo.require("dijit._Container");
	dojo.require("dijit._HasDropDown");
	dojo.declare("dijit.form.DropDownButton", [dijit.form.Button, dijit._Container, dijit._HasDropDown], {baseClass:"dijitDropDownButton", templateString:dojo.cache("dijit.form", "templates/DropDownButton.html", "<span class=\"dijit dijitReset dijitInline\"\n\t><span class='dijitReset dijitInline dijitButtonNode'\n\t\tdojoAttachEvent=\"ondijitclick:_onClick\" dojoAttachPoint=\"_buttonNode\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"focusNode,titleNode,_arrowWrapperNode\"\n\t\t\trole=\"button\" aria-haspopup=\"true\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\"\n\t\t\t\tdojoAttachPoint=\"iconNode\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tdojoAttachPoint=\"containerNode,_popupStateNode\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\"></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdojoAttachPoint=\"valueNode\"\n/></span>\n"), _fillContent:function () {
		if (this.srcNodeRef) {
			var nodes = dojo.query("*", this.srcNodeRef);
			dijit.form.DropDownButton.superclass._fillContent.call(this, nodes[0]);
			this.dropDownContainer = this.srcNodeRef;
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		if (!this.dropDown && this.dropDownContainer) {
			var dropDownNode = dojo.query("[widgetId]", this.dropDownContainer)[0];
			this.dropDown = dijit.byNode(dropDownNode);
			delete this.dropDownContainer;
		}
		if (this.dropDown) {
			dijit.popup.hide(this.dropDown);
		}
		this.inherited(arguments);
	}, isLoaded:function () {
		var dropDown = this.dropDown;
		return (!!dropDown && (!dropDown.href || dropDown.isLoaded));
	}, loadDropDown:function () {
		var dropDown = this.dropDown;
		if (!dropDown) {
			return;
		}
		if (!this.isLoaded()) {
			var handler = dojo.connect(dropDown, "onLoad", this, function () {
				dojo.disconnect(handler);
				this.openDropDown();
			});
			dropDown.refresh();
		} else {
			this.openDropDown();
		}
	}, isFocusable:function () {
		return this.inherited(arguments) && !this._mouseDown;
	}});
}

