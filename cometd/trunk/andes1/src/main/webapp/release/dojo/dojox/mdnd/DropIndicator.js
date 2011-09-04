/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mdnd.DropIndicator"]) {
	dojo._hasResource["dojox.mdnd.DropIndicator"] = true;
	dojo.provide("dojox.mdnd.DropIndicator");
	dojo.require("dojox.mdnd.AreaManager");
	dojo.declare("dojox.mdnd.DropIndicator", null, {node:null, constructor:function () {
		var dropIndicator = document.createElement("div");
		var subDropIndicator = document.createElement("div");
		dropIndicator.appendChild(subDropIndicator);
		dojo.addClass(dropIndicator, "dropIndicator");
		this.node = dropIndicator;
	}, place:function (area, nodeRef, size) {
		if (size) {
			this.node.style.height = size.h + "px";
		}
		try {
			if (nodeRef) {
				area.insertBefore(this.node, nodeRef);
			} else {
				area.appendChild(this.node);
			}
			return this.node;
		}
		catch (e) {
			return null;
		}
	}, remove:function () {
		if (this.node) {
			this.node.style.height = "";
			if (this.node.parentNode) {
				this.node.parentNode.removeChild(this.node);
			}
		}
	}, destroy:function () {
		if (this.node) {
			if (this.node.parentNode) {
				this.node.parentNode.removeChild(this.node);
			}
			dojo._destroyElement(this.node);
			delete this.node;
		}
	}});
	(function () {
		dojox.mdnd.areaManager()._dropIndicator = new dojox.mdnd.DropIndicator();
	}());
}

