/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.dnd.Avatar"]) {
	dojo._hasResource["dojox.layout.dnd.Avatar"] = true;
	dojo.provide("dojox.layout.dnd.Avatar");
	dojo.require("dojo.dnd.Avatar");
	dojo.require("dojo.dnd.common");
	dojo.declare("dojox.layout.dnd.Avatar", dojo.dnd.Avatar, {constructor:function (manager, opacity) {
		this.opacity = opacity || 0.9;
	}, construct:function () {
		var source = this.manager.source, node = source.creator ? source._normalizedCreator(source.getItem(this.manager.nodes[0].id).data, "avatar").node : this.manager.nodes[0].cloneNode(true);
		dojo.addClass(node, "dojoDndAvatar");
		node.id = dojo.dnd.getUniqueId();
		node.style.position = "absolute";
		node.style.zIndex = 1999;
		node.style.margin = "0px";
		node.style.width = dojo.marginBox(source.node).w + "px";
		dojo.style(node, "opacity", this.opacity);
		this.node = node;
	}, update:function () {
		dojo.toggleClass(this.node, "dojoDndAvatarCanDrop", this.manager.canDropFlag);
	}, _generateText:function () {
	}});
}

