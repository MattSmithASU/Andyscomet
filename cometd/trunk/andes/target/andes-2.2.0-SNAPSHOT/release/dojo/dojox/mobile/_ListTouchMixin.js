/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile._ListTouchMixin"]) {
	dojo._hasResource["dojox.mobile._ListTouchMixin"] = true;
	dojo.provide("dojox.mobile._ListTouchMixin");
	dojo.require("dijit.form._ListBase");
	dojo.declare("dojox.mobile._ListTouchMixin", dijit.form._ListBase, {postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, "onclick", "_onClick");
	}, _onClick:function (evt) {
		dojo.stopEvent(evt);
		var target = this._getTarget(evt);
		if (target) {
			this._setSelectedAttr(target);
			this.onClick(target);
		}
	}});
}

