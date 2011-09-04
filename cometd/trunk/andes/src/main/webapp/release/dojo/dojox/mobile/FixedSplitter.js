/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.FixedSplitter"]) {
	dojo._hasResource["dojox.mobile.FixedSplitter"] = true;
	dojo.provide("dojox.mobile.FixedSplitter");
	dojo.require("dijit._WidgetBase");
	dojo.require("dijit._Container");
	dojo.require("dijit._Contained");
	dojo.declare("dojox.mobile.FixedSplitter", [dijit._WidgetBase, dijit._Container, dijit._Contained], {orientation:"H", isContainer:true, buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef ? this.srcNodeRef : dojo.doc.createElement("DIV");
		dojo.addClass(this.domNode, "mblFixedSpliter");
	}, startup:function () {
		if (this._started) {
			return;
		}
		var children = dojo.filter(this.domNode.childNodes, function (node) {
			return node.nodeType == 1;
		});
		dojo.forEach(children, function (node) {
			dojo.addClass(node, "mblFixedSplitterPane" + this.orientation);
		}, this);
		this.inherited(arguments);
		var _this = this;
		setTimeout(function () {
			var parent = _this.getParent && _this.getParent();
			if (!parent || !parent.resize) {
				_this.resize();
			}
		}, 0);
	}, resize:function () {
		this.layout();
	}, layout:function () {
		var sz = this.orientation == "H" ? "w" : "h";
		var children = dojo.filter(this.domNode.childNodes, function (node) {
			return node.nodeType == 1;
		});
		var offset = 0;
		for (var i = 0; i < children.length; i++) {
			dojo.marginBox(children[i], this.orientation == "H" ? {l:offset} : {t:offset});
			if (i < children.length - 1) {
				offset += dojo.marginBox(children[i])[sz];
			}
		}
		var l = dojo.marginBox(this.domNode)[sz] - offset;
		var props = {};
		props[sz] = l;
		dojo.marginBox(children[children.length - 1], props);
		dojo.forEach(this.getChildren(), function (child) {
			if (child.resize) {
				child.resize();
			}
		});
	}});
	dojo.declare("dojox.mobile.FixedSplitterPane", [dijit._WidgetBase, dijit._Container, dijit._Contained], {buildRendering:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "mblFixedSplitterPane");
	}, resize:function () {
		dojo.forEach(this.getChildren(), function (child) {
			if (child.resize) {
				child.resize();
			}
		});
	}});
}

