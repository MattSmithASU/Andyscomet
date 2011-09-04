/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mdnd.LazyManager"]) {
	dojo._hasResource["dojox.mdnd.LazyManager"] = true;
	dojo.provide("dojox.mdnd.LazyManager");
	dojo.require("dojo.dnd.Manager");
	dojo.require("dojox.mdnd.PureSource");
	dojo.declare("dojox.mdnd.LazyManager", null, {constructor:function () {
		this._registry = {};
		this._fakeSource = new dojox.mdnd.PureSource(dojo.create("div"), {"copyOnly":false});
		this._fakeSource.startup();
		dojo.addOnUnload(dojo.hitch(this, "destroy"));
		this.manager = dojo.dnd.manager();
	}, getItem:function (draggedNode) {
		var type = draggedNode.getAttribute("dndType");
		return {"data":draggedNode.getAttribute("dndData") || draggedNode.innerHTML, "type":type ? type.split(/\s*,\s*/) : ["text"]};
	}, startDrag:function (e, draggedNode) {
		draggedNode = draggedNode || e.target;
		if (draggedNode) {
			var m = this.manager, object = this.getItem(draggedNode);
			if (draggedNode.id == "") {
				dojo.attr(draggedNode, "id", dojo.dnd.getUniqueId());
			}
			dojo.addClass(draggedNode, "dojoDndItem");
			this._fakeSource.setItem(draggedNode.id, object);
			m.startDrag(this._fakeSource, [draggedNode], false);
			m.onMouseMove(e);
		}
	}, cancelDrag:function () {
		var m = this.manager;
		m.target = null;
		m.onMouseUp();
	}, destroy:function () {
		this._fakeSource.destroy();
	}});
}

