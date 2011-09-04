/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._Container"]) {
	dojo._hasResource["dijit._Container"] = true;
	dojo.provide("dijit._Container");
	dojo.declare("dijit._Container", null, {isContainer:true, buildRendering:function () {
		this.inherited(arguments);
		if (!this.containerNode) {
			this.containerNode = this.domNode;
		}
	}, addChild:function (widget, insertIndex) {
		var refNode = this.containerNode;
		if (insertIndex && typeof insertIndex == "number") {
			var children = this.getChildren();
			if (children && children.length >= insertIndex) {
				refNode = children[insertIndex - 1].domNode;
				insertIndex = "after";
			}
		}
		dojo.place(widget.domNode, refNode, insertIndex);
		if (this._started && !widget._started) {
			widget.startup();
		}
	}, removeChild:function (widget) {
		if (typeof widget == "number") {
			widget = this.getChildren()[widget];
		}
		if (widget) {
			var node = widget.domNode;
			if (node && node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}
	}, hasChildren:function () {
		return this.getChildren().length > 0;
	}, destroyDescendants:function (preserveDom) {
		dojo.forEach(this.getChildren(), function (child) {
			child.destroyRecursive(preserveDom);
		});
	}, _getSiblingOfChild:function (child, dir) {
		var node = child.domNode, which = (dir > 0 ? "nextSibling" : "previousSibling");
		do {
			node = node[which];
		} while (node && (node.nodeType != 1 || !dijit.byNode(node)));
		return node && dijit.byNode(node);
	}, getIndexOfChild:function (child) {
		return dojo.indexOf(this.getChildren(), child);
	}, startup:function () {
		if (this._started) {
			return;
		}
		dojo.forEach(this.getChildren(), function (child) {
			child.startup();
		});
		this.inherited(arguments);
	}});
}

