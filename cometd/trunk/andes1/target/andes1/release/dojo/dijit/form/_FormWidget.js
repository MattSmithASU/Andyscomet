/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._FormWidget"]) {
	dojo._hasResource["dijit.form._FormWidget"] = true;
	dojo.provide("dijit.form._FormWidget");
	dojo.require("dojo.window");
	dojo.require("dijit._Widget");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit._CssStateMixin");
	dojo.require("dijit.form._FormWidgetMixin");
	dojo.declare("dijit.form._FormWidget", [dijit._Widget, dijit._TemplatedMixin, dijit._CssStateMixin, dijit.form._FormWidgetMixin], {setDisabled:function (disabled) {
		dojo.deprecated("setDisabled(" + disabled + ") is deprecated. Use set('disabled'," + disabled + ") instead.", "", "2.0");
		this.set("disabled", disabled);
	}, setValue:function (value) {
		dojo.deprecated("dijit.form._FormWidget:setValue(" + value + ") is deprecated.  Use set('value'," + value + ") instead.", "", "2.0");
		this.set("value", value);
	}, getValue:function () {
		dojo.deprecated(this.declaredClass + "::getValue() is deprecated. Use get('value') instead.", "", "2.0");
		return this.get("value");
	}, postMixInProperties:function () {
		this.nameAttrSetting = this.name ? ("name=\"" + this.name.replace(/'/g, "&quot;") + "\"") : "";
		this.inherited(arguments);
	}, _setTypeAttr:null});
	dojo.declare("dijit.form._FormValueWidget", [dijit.form._FormWidget, dijit.form._FormValueMixin], {_layoutHackIE7:function () {
		if (dojo.isIE == 7) {
			var domNode = this.domNode;
			var parent = domNode.parentNode;
			var pingNode = domNode.firstChild || domNode;
			var origFilter = pingNode.style.filter;
			var _this = this;
			while (parent && parent.clientHeight == 0) {
				(function ping() {
					var disconnectHandle = _this.connect(parent, "onscroll", function (e) {
						_this.disconnect(disconnectHandle);
						pingNode.style.filter = (new Date()).getMilliseconds();
						setTimeout(function () {
							pingNode.style.filter = origFilter;
						}, 0);
					});
				})();
				parent = parent.parentNode;
			}
		}
	}});
}

