/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._ButtonMixin"]) {
	dojo._hasResource["dijit.form._ButtonMixin"] = true;
	dojo.provide("dijit.form._ButtonMixin");
	dojo.declare("dijit.form._ButtonMixin", null, {label:"", type:"button", _onClick:function (e) {
		if (this.disabled) {
			dojo.stopEvent(e);
			return false;
		}
		var preventDefault = this.onClick(e) === false;
		if (!preventDefault && this.type == "submit" && !(this.valueNode || this.focusNode).form) {
			for (var node = this.domNode; node.parentNode; node = node.parentNode) {
				var widget = dijit.byNode(node);
				if (widget && typeof widget._onSubmit == "function") {
					widget._onSubmit(e);
					preventDefault = true;
					break;
				}
			}
		}
		if (preventDefault) {
			e.preventDefault();
		}
		return !preventDefault;
	}, postCreate:function () {
		this.inherited(arguments);
		dojo.setSelectable(this.focusNode, false);
	}, onClick:function (e) {
		return true;
	}, _setLabelAttr:function (content) {
		this._set("label", content);
		(this.containerNode || this.focusNode).innerHTML = content;
	}});
}

