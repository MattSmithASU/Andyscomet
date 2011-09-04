/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.ScrollableView"]) {
	dojo._hasResource["dojox.mobile.ScrollableView"] = true;
	dojo.provide("dojox.mobile.ScrollableView");
	dojo.require("dijit._WidgetBase");
	dojo.require("dojox.mobile");
	dojo.require("dojox.mobile._ScrollableMixin");
	dojo.declare("dojox.mobile.ScrollableView", [dojox.mobile.View, dojox.mobile._ScrollableMixin], {scrollableParams:{noResize:true}, buildRendering:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "mblScrollableView");
		this.domNode.style.overflow = "hidden";
		this.domNode.style.top = "0px";
		this.containerNode = dojo.create("DIV", {className:"mblScrollableViewContainer"}, this.domNode);
		this.containerNode.style.position = "absolute";
		this.containerNode.style.top = "0px";
		if (this.scrollDir === "v") {
			this.containerNode.style.width = "100%";
		}
		this.reparent();
		this.findAppBars();
	}, resize:function () {
		this.inherited(arguments);
		dojo.forEach(this.getChildren(), function (child) {
			if (child.resize) {
				child.resize();
			}
		});
	}, isTopLevel:function (e) {
		var parent = this.getParent && this.getParent();
		return (!parent || !parent.resize);
	}, addChild:function (widget) {
		var c = widget.domNode;
		var fixed = this._checkFixedBar(c, true);
		if (fixed) {
			this.domNode.appendChild(c);
			if (fixed === "top") {
				this.fixedHeaderHeight = c.offsetHeight;
				this.isLocalHeader = true;
				this.containerNode.style.paddingTop = this.fixedHeaderHeight + "px";
			} else {
				if (fixed === "bottom") {
					this.fixedFooterHeight = c.offsetHeight;
					this.isLocalFooter = true;
					c.style.bottom = "0px";
				}
			}
			this.resize();
		} else {
			this.containerNode.appendChild(c);
		}
		if (this._started && !widget._started) {
			widget.startup();
		}
	}, reparent:function () {
		var i, idx, len, c;
		for (i = 0, idx = 0, len = this.domNode.childNodes.length; i < len; i++) {
			c = this.domNode.childNodes[idx];
			if (c === this.containerNode || this._checkFixedBar(c, true)) {
				idx++;
				continue;
			}
			this.containerNode.appendChild(this.domNode.removeChild(c));
		}
	}, findAppBars:function () {
		var i, len, c;
		for (i = 0, len = dojo.body().childNodes.length; i < len; i++) {
			c = dojo.body().childNodes[i];
			this._checkFixedBar(c, false);
		}
		if (this.domNode.parentNode) {
			for (i = 0, len = this.domNode.parentNode.childNodes.length; i < len; i++) {
				c = this.domNode.parentNode.childNodes[i];
				this._checkFixedBar(c, false);
			}
		}
		this.fixedFooterHeight = this.fixedFooter ? this.fixedFooter.offsetHeight : 0;
	}, _checkFixedBar:function (node, local) {
		if (node.nodeType === 1) {
			var fixed = node.getAttribute("fixed") || (dijit.byNode(node) && dijit.byNode(node).fixed);
			if (fixed === "top") {
				if (local) {
					node.style.top = "0px";
					this.fixedHeader = node;
				}
				return fixed;
			} else {
				if (fixed === "bottom") {
					node.style.position = "absolute";
					this.fixedFooter = node;
					return fixed;
				}
			}
		}
		return null;
	}, onAfterTransitionIn:function (moveTo, dir, transition, context, method) {
		this.flashScrollBar();
	}, getChildren:function () {
		var children = this.inherited(arguments);
		if (this.fixedHeader && this.fixedHeader.parentNode === this.domNode) {
			children.push(dijit.byNode(this.fixedHeader));
		}
		if (this.fixedFooter && this.fixedFooter.parentNode === this.domNode) {
			children.push(dijit.byNode(this.fixedFooter));
		}
		return children;
	}});
}
