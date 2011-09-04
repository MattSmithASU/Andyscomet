/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.manager._DisplayMixin"]) {
	dojo._hasResource["dojox.form.manager._DisplayMixin"] = true;
	dojo.provide("dojox.form.manager._DisplayMixin");
	dojo.declare("dojox.form.manager._DisplayMixin", null, {gatherDisplayState:function (names) {
		var result = this.inspectAttachedPoints(function (name, node) {
			return dojo.style(node, "display") != "none";
		}, names);
		return result;
	}, show:function (state, defaultState) {
		if (arguments.length < 2) {
			defaultState = true;
		}
		this.inspectAttachedPoints(function (name, node, value) {
			dojo.style(node, "display", value ? "" : "none");
		}, state, defaultState);
		return this;
	}, hide:function (state) {
		return this.show(state, false);
	}});
}

