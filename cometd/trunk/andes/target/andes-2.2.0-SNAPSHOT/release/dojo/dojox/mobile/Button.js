/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.Button"]) {
	dojo._hasResource["dojox.mobile.Button"] = true;
	dojo.provide("dojox.mobile.Button");
	dojo.require("dijit._WidgetBase");
	dojo.require("dijit.form._FormWidgetMixin");
	dojo.require("dijit.form._ButtonMixin");
	dojo.declare("dojox.mobile.Button", [dijit._WidgetBase, dijit.form._FormWidgetMixin, dijit.form._ButtonMixin], {baseClass:"mblButton", duration:1000, _onClick:function (e) {
		var ret = this.inherited(arguments);
		if (ret && this.duration >= 0) {
			var button = this.focusNode || this.domNode;
			var newStateClasses = (this.baseClass + " " + this["class"]).split(" ");
			newStateClasses = dojo.map(newStateClasses, function (c) {
				return c + "Selected";
			});
			dojo.addClass(button, newStateClasses);
			setTimeout(function () {
				dojo.removeClass(button, newStateClasses);
			}, this.duration);
		}
		return ret;
	}, buildRendering:function () {
		if (!this.srcNodeRef) {
			this.srcNodeRef = dojo.create("button", {"type":this.type});
		}
		this.inherited(arguments);
		this.focusNode = this.domNode;
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, "onclick", "_onClick");
	}});
}

