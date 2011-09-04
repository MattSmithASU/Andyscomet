/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._RadioButtonMixin"]) {
	dojo._hasResource["dijit.form._RadioButtonMixin"] = true;
	dojo.provide("dijit.form._RadioButtonMixin");
	dojo.declare("dijit.form._RadioButtonMixin", null, {type:"radio", _getRelatedWidgets:function () {
		var ary = [];
		dojo.query("INPUT[type=radio]", this.focusNode.form || dojo.doc).forEach(dojo.hitch(this, function (inputNode) {
			if (inputNode.name == this.name && inputNode.form == this.focusNode.form) {
				var widget = dijit.getEnclosingWidget(inputNode);
				if (widget) {
					ary.push(widget);
				}
			}
		}));
		return ary;
	}, _setCheckedAttr:function (value) {
		this.inherited(arguments);
		if (!this._created) {
			return;
		}
		if (value) {
			dojo.forEach(this._getRelatedWidgets(), dojo.hitch(this, function (widget) {
				if (widget != this && widget.checked) {
					widget.set("checked", false);
				}
			}));
		}
	}, _onClick:function (e) {
		if (this.checked || this.disabled) {
			dojo.stopEvent(e);
			return false;
		}
		if (this.readOnly) {
			dojo.stopEvent(e);
			dojo.forEach(this._getRelatedWidgets(), dojo.hitch(this, function (widget) {
				dojo.attr(this.focusNode || this.domNode, "checked", widget.checked);
			}));
			return false;
		}
		return this.inherited(arguments);
	}});
}

