/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.app.SceneAssistant"]) {
	dojo._hasResource["dojox.mobile.app.SceneAssistant"] = true;
	dojo.provide("dojox.mobile.app.SceneAssistant");
	dojo.experimental("dojox.mobile.app.SceneAssistant");
	dojo.declare("dojox.mobile.app.SceneAssistant", null, {constructor:function () {
	}, setup:function () {
	}, activate:function (params) {
	}, deactivate:function () {
	}, destroy:function () {
		var children = dojo.query("> [widgetId]", this.containerNode).map(dijit.byNode);
		dojo.forEach(children, function (child) {
			child.destroyRecursive();
		});
		this.disconnect();
	}, connect:function (obj, method, callback) {
		if (!this._connects) {
			this._connects = [];
		}
		this._connects.push(dojo.connect(obj, method, callback));
	}, disconnect:function () {
		dojo.forEach(this._connects, dojo.disconnect);
		this._connects = [];
	}});
}

