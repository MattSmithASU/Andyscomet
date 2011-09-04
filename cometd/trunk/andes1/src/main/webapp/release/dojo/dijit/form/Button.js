/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Button"]) {
	dojo._hasResource["dijit.form.Button"] = true;
	dojo.provide("dijit.form.Button");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dijit.form._ButtonMixin");
	dojo.require("dijit._Container");
	dojo.require("dijit._HasDropDown");
	dojo.declare("dijit.form.Button", [dijit.form._FormWidget, dijit.form._ButtonMixin], {showLabel:true, iconClass:"", baseClass:"dijitButton", templateString:dojo.cache("dijit.form", "templates/Button.html", "<span class=\"dijit dijitReset dijitInline\"\n\t><span class=\"dijitReset dijitInline dijitButtonNode\"\n\t\tdojoAttachEvent=\"ondijitclick:_onClick\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"titleNode,focusNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\"></span\n\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#x25CF;</span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t\tdojoAttachPoint=\"containerNode\"\n\t\t\t></span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdojoAttachPoint=\"valueNode\"\n/></span>\n"), _setValueAttr:"valueNode", _onClick:function (e) {
		var ok = this.inherited(arguments);
		if (ok) {
			if (this.valueNode) {
				this.valueNode.click();
				e.preventDefault();
			}
		}
		return ok;
	}, _fillContent:function (source) {
		if (source && (!this.params || !("label" in this.params))) {
			this.set("label", source.innerHTML);
		}
	}, _setShowLabelAttr:function (val) {
		if (this.containerNode) {
			dojo.toggleClass(this.containerNode, "dijitDisplayNone", !val);
		}
		this._set("showLabel", val);
	}, setLabel:function (content) {
		dojo.deprecated("dijit.form.Button.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
		this.set("label", content);
	}, _setLabelAttr:function (content) {
		this.inherited(arguments);
		if (this.showLabel == false && !("title" in this.params)) {
			this.titleNode.title = dojo.trim(this.containerNode.innerText || this.containerNode.textContent || "");
		}
	}, _setIconClassAttr:function (val) {
		var oldVal = this.iconClass || "dijitNoIcon", newVal = val || "dijitNoIcon";
		dojo.replaceClass(this.iconNode, newVal, oldVal);
		this._set("iconClass", val);
	}});
}

