/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile._ScrollableMixin"]) {
	dojo._hasResource["dojox.mobile._ScrollableMixin"] = true;
	dojo.provide("dojox.mobile._ScrollableMixin");
	dojo.require("dijit._WidgetBase");
	dojo.require("dojox.mobile.scrollable");
	dojo.declare("dojox.mobile._ScrollableMixin", null, {fixedHeader:"", fixedFooter:"", scrollableParams:{}, destroy:function () {
		this.cleanup();
		this.inherited(arguments);
	}, startup:function () {
		if (this._started) {
			return;
		}
		var params = this.scrollableParams;
		if (this.fixedHeader) {
			var node = dojo.byId(this.fixedHeader);
			if (node.parentNode == this.domNode) {
				this.isLocalHeader = true;
			}
			params.fixedHeaderHeight = node.offsetHeight;
		}
		if (this.fixedFooter) {
			var node = dojo.byId(this.fixedFooter);
			if (node.parentNode == this.domNode) {
				this.isLocalFooter = true;
				node.style.bottom = "0px";
			}
			params.fixedFooterHeight = node.offsetHeight;
		}
		this.init(params);
		this.inherited(arguments);
	}});
	(function () {
		var obj = new dojox.mobile.scrollable(dojo, dojox);
		dojo.extend(dojox.mobile._ScrollableMixin, obj);
		if (dojo.version.major == 1 && dojo.version.minor == 4) {
			dojo.mixin(dojox.mobile._ScrollableMixin._meta.hidden, obj);
		}
	})();
}

