/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.SwapView"]) {
	dojo._hasResource["dojox.mobile.SwapView"] = true;
	dojo.provide("dojox.mobile.SwapView");
	dojo.require("dijit._WidgetBase");
	dojo.require("dojox.mobile");
	dojo.require("dojox.mobile._ScrollableMixin");
	dojo.declare("dojox.mobile.SwapView", [dojox.mobile.View, dojox.mobile._ScrollableMixin], {scrollDir:"f", weight:1.2, buildRendering:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "mblSwapView");
		this.containerNode = this.domNode;
		this.containerNode.style.position = "absolute";
	}, onTouchStart:function (e) {
		var nextView = this._nextView(this.domNode);
		if (nextView) {
			nextView.stopAnimation();
		}
		var prevView = this._previousView(this.domNode);
		if (prevView) {
			prevView.stopAnimation();
		}
		this.inherited(arguments);
	}, _nextView:function (node) {
		for (var n = node.nextSibling; n; n = n.nextSibling) {
			if (n.nodeType == 1) {
				return dijit.byNode(n);
			}
		}
		return null;
	}, _previousView:function (node) {
		for (var n = node.previousSibling; n; n = n.previousSibling) {
			if (n.nodeType == 1) {
				return dijit.byNode(n);
			}
		}
		return null;
	}, scrollTo:function (to) {
		if (!this._beingFlipped) {
			var newView, x;
			if (to.x < 0) {
				newView = this._nextView(this.domNode);
				x = to.x + this.domNode.offsetWidth;
			} else {
				newView = this._previousView(this.domNode);
				x = to.x - this.domNode.offsetWidth;
			}
			if (newView) {
				newView.domNode.style.display = "";
				newView._beingFlipped = true;
				newView.scrollTo({x:x});
				newView._beingFlipped = false;
			}
		}
		this.inherited(arguments);
	}, slideTo:function (to, duration, easing) {
		if (!this._beingFlipped) {
			var w = this.domNode.offsetWidth;
			var pos = this.getPos();
			var newView, newX;
			if (pos.x < 0) {
				newView = this._nextView(this.domNode);
				if (pos.x < -w / 4) {
					if (newView) {
						to.x = -w;
						newX = 0;
					}
				} else {
					if (newView) {
						newX = w;
					}
				}
			} else {
				newView = this._previousView(this.domNode);
				if (pos.x > w / 4) {
					if (newView) {
						to.x = w;
						newX = 0;
					}
				} else {
					if (newView) {
						newX = -w;
					}
				}
			}
			if (newView) {
				newView._beingFlipped = true;
				newView.slideTo({x:newX}, duration, easing);
				newView._beingFlipped = false;
				if (newX === 0) {
					dojox.mobile.currentView = newView;
				}
			}
		}
		this.inherited(arguments);
	}, onFlickAnimationEnd:function (e) {
		var children = this.domNode.parentNode.childNodes;
		for (var i = 0; i < children.length; i++) {
			var c = children[i];
			if (c.nodeType == 1 && c != dojox.mobile.currentView.domNode) {
				c.style.display = "none";
			}
		}
		this.inherited(arguments);
	}});
}

