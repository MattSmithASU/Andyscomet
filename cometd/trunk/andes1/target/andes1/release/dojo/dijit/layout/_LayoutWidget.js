/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout._LayoutWidget"]) {
	dojo._hasResource["dijit.layout._LayoutWidget"] = true;
	dojo.provide("dijit.layout._LayoutWidget");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Container");
	dojo.require("dijit._Contained");
	dojo.declare("dijit.layout._LayoutWidget", [dijit._Widget, dijit._Container, dijit._Contained], {baseClass:"dijitLayoutContainer", isLayoutContainer:true, buildRendering:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "dijitContainer");
	}, startup:function () {
		if (this._started) {
			return;
		}
		this.inherited(arguments);
		var parent = this.getParent && this.getParent();
		if (!(parent && parent.isLayoutContainer)) {
			this.resize();
			this.connect(dojo.isIE ? this.domNode : dojo.global, "onresize", function () {
				this.resize();
			});
		}
	}, resize:function (changeSize, resultSize) {
		var node = this.domNode;
		if (changeSize) {
			dojo.marginBox(node, changeSize);
			if (changeSize.t) {
				node.style.top = changeSize.t + "px";
			}
			if (changeSize.l) {
				node.style.left = changeSize.l + "px";
			}
		}
		var mb = resultSize || {};
		dojo.mixin(mb, changeSize || {});
		if (!("h" in mb) || !("w" in mb)) {
			mb = dojo.mixin(dojo.marginBox(node), mb);
		}
		var cs = dojo.getComputedStyle(node);
		var me = dojo._getMarginExtents(node, cs);
		var be = dojo._getBorderExtents(node, cs);
		var bb = (this._borderBox = {w:mb.w - (me.w + be.w), h:mb.h - (me.h + be.h)});
		var pe = dojo._getPadExtents(node, cs);
		this._contentBox = {l:dojo._toPixelValue(node, cs.paddingLeft), t:dojo._toPixelValue(node, cs.paddingTop), w:bb.w - pe.w, h:bb.h - pe.h};
		this.layout();
	}, layout:function () {
	}, _setupChild:function (child) {
		var cls = this.baseClass + "-child " + (child.baseClass ? this.baseClass + "-" + child.baseClass : "");
		dojo.addClass(child.domNode, cls);
	}, addChild:function (child, insertIndex) {
		this.inherited(arguments);
		if (this._started) {
			this._setupChild(child);
		}
	}, removeChild:function (child) {
		var cls = this.baseClass + "-child" + (child.baseClass ? " " + this.baseClass + "-" + child.baseClass : "");
		dojo.removeClass(child.domNode, cls);
		this.inherited(arguments);
	}});
	dijit.layout.marginBox2contentBox = function (node, mb) {
		var cs = dojo.getComputedStyle(node);
		var me = dojo._getMarginExtents(node, cs);
		var pb = dojo._getPadBorderExtents(node, cs);
		return {l:dojo._toPixelValue(node, cs.paddingLeft), t:dojo._toPixelValue(node, cs.paddingTop), w:mb.w - (me.w + pb.w), h:mb.h - (me.h + pb.h)};
	};
	(function () {
		var capitalize = function (word) {
			return word.substring(0, 1).toUpperCase() + word.substring(1);
		};
		var size = function (widget, dim) {
			var newSize = widget.resize ? widget.resize(dim) : dojo.marginBox(widget.domNode, dim);
			if (newSize) {
				dojo.mixin(widget, newSize);
			} else {
				dojo.mixin(widget, dojo.marginBox(widget.domNode));
				dojo.mixin(widget, dim);
			}
		};
		dijit.layout.layoutChildren = function (container, dim, children, changedRegionId, changedRegionSize) {
			dim = dojo.mixin({}, dim);
			dojo.addClass(container, "dijitLayoutContainer");
			children = dojo.filter(children, function (item) {
				return item.region != "center" && item.layoutAlign != "client";
			}).concat(dojo.filter(children, function (item) {
				return item.region == "center" || item.layoutAlign == "client";
			}));
			dojo.forEach(children, function (child) {
				var elm = child.domNode, pos = (child.region || child.layoutAlign);
				var elmStyle = elm.style;
				elmStyle.left = dim.l + "px";
				elmStyle.top = dim.t + "px";
				elmStyle.position = "absolute";
				dojo.addClass(elm, "dijitAlign" + capitalize(pos));
				var sizeSetting = {};
				if (changedRegionId && changedRegionId == child.id) {
					sizeSetting[child.region == "top" || child.region == "bottom" ? "h" : "w"] = changedRegionSize;
				}
				if (pos == "top" || pos == "bottom") {
					sizeSetting.w = dim.w;
					size(child, sizeSetting);
					dim.h -= child.h;
					if (pos == "top") {
						dim.t += child.h;
					} else {
						elmStyle.top = dim.t + dim.h + "px";
					}
				} else {
					if (pos == "left" || pos == "right") {
						sizeSetting.h = dim.h;
						size(child, sizeSetting);
						dim.w -= child.w;
						if (pos == "left") {
							dim.l += child.w;
						} else {
							elmStyle.left = dim.l + dim.w + "px";
						}
					} else {
						if (pos == "client" || pos == "center") {
							size(child, dim);
						}
					}
				}
			});
		};
	})();
}

