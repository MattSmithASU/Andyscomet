/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.BorderContainer"]) {
	dojo._hasResource["dijit.layout.BorderContainer"] = true;
	dojo.provide("dijit.layout.BorderContainer");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.require("dojo.cookie");
	dojo.require("dijit._TemplatedMixin");
	dojo.declare("dijit.layout.BorderContainer", dijit.layout._LayoutWidget, {design:"headline", gutters:true, liveSplitters:true, persist:false, baseClass:"dijitBorderContainer", _splitterClass:"dijit.layout._Splitter", postMixInProperties:function () {
		if (!this.gutters) {
			this.baseClass += "NoGutter";
		}
		this.inherited(arguments);
	}, startup:function () {
		if (this._started) {
			return;
		}
		dojo.forEach(this.getChildren(), this._setupChild, this);
		this.inherited(arguments);
	}, _setupChild:function (child) {
		var region = child.region;
		if (region) {
			this.inherited(arguments);
			dojo.addClass(child.domNode, this.baseClass + "Pane");
			var ltr = this.isLeftToRight();
			if (region == "leading") {
				region = ltr ? "left" : "right";
			}
			if (region == "trailing") {
				region = ltr ? "right" : "left";
			}
			if (region != "center" && (child.splitter || this.gutters) && !child._splitterWidget) {
				var _Splitter = dojo.getObject(child.splitter ? this._splitterClass : "dijit.layout._Gutter");
				var splitter = new _Splitter({id:child.id + "_splitter", container:this, child:child, region:region, live:this.liveSplitters});
				splitter.isSplitter = true;
				child._splitterWidget = splitter;
				dojo.place(splitter.domNode, child.domNode, "after");
				splitter.startup();
			}
			child.region = region;
		}
	}, layout:function () {
		this._layoutChildren();
	}, addChild:function (child, insertIndex) {
		this.inherited(arguments);
		if (this._started) {
			this.layout();
		}
	}, removeChild:function (child) {
		var region = child.region;
		var splitter = child._splitterWidget;
		if (splitter) {
			splitter.destroy();
			delete child._splitterWidget;
		}
		this.inherited(arguments);
		if (this._started) {
			this._layoutChildren();
		}
		dojo.removeClass(child.domNode, this.baseClass + "Pane");
		dojo.style(child.domNode, {top:"auto", bottom:"auto", left:"auto", right:"auto", position:"static"});
		dojo.style(child.domNode, region == "top" || region == "bottom" ? "width" : "height", "auto");
	}, getChildren:function () {
		return dojo.filter(this.inherited(arguments), function (widget) {
			return !widget.isSplitter;
		});
	}, getSplitter:function (region) {
		return dojo.filter(this.getChildren(), function (child) {
			return child.region == region;
		})[0]._splitterWidget;
	}, resize:function (newSize, currentSize) {
		if (!this.cs || !this.pe) {
			var node = this.domNode;
			this.cs = dojo.getComputedStyle(node);
			this.pe = dojo._getPadExtents(node, this.cs);
			this.pe.r = dojo._toPixelValue(node, this.cs.paddingRight);
			this.pe.b = dojo._toPixelValue(node, this.cs.paddingBottom);
			dojo.style(node, "padding", "0px");
		}
		this.inherited(arguments);
	}, _layoutChildren:function (changedChildId, changedChildSize) {
		if (!this._borderBox || !this._borderBox.h) {
			return;
		}
		var wrappers = dojo.map(this.getChildren(), function (child, idx) {
			return {pane:child, weight:[child.region == "center" ? Infinity : 0, child.layoutPriority, (this.design == "sidebar" ? 1 : -1) * (/top|bottom/.test(child.region) ? 1 : -1), idx]};
		}, this);
		wrappers.sort(function (a, b) {
			var aw = a.weight, bw = b.weight;
			for (var i = 0; i < aw.length; i++) {
				if (aw[i] != bw[i]) {
					return aw[i] - bw[i];
				}
			}
			return 0;
		});
		var childrenAndSplitters = [];
		dojo.forEach(wrappers, function (wrapper) {
			var pane = wrapper.pane;
			childrenAndSplitters.push(pane);
			if (pane._splitterWidget) {
				childrenAndSplitters.push(pane._splitterWidget);
			}
		});
		var dim = {l:this.pe.l, t:this.pe.t, w:this._borderBox.w - this.pe.w, h:this._borderBox.h - this.pe.h};
		dijit.layout.layoutChildren(this.domNode, dim, childrenAndSplitters, changedChildId, changedChildSize);
	}, destroyRecursive:function () {
		dojo.forEach(this.getChildren(), function (child) {
			var splitter = child._splitterWidget;
			if (splitter) {
				splitter.destroy();
			}
			delete child._splitterWidget;
		});
		this.inherited(arguments);
	}});
	dojo.extend(dijit._Widget, {region:"", layoutPriority:0, splitter:false, minSize:0, maxSize:Infinity});
	dojo.declare("dijit.layout._Splitter", [dijit._Widget, dijit._TemplatedMixin], {live:true, templateString:"<div class=\"dijitSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse\" tabIndex=\"0\" role=\"separator\"><div class=\"dijitSplitterThumb\"></div></div>", postMixInProperties:function () {
		this.inherited(arguments);
		this.horizontal = /top|bottom/.test(this.region);
		this._factor = /top|left/.test(this.region) ? 1 : -1;
		this._cookieName = this.container.id + "_" + this.region;
	}, buildRendering:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V"));
		if (this.container.persist) {
			var persistSize = dojo.cookie(this._cookieName);
			if (persistSize) {
				this.child.domNode.style[this.horizontal ? "height" : "width"] = persistSize;
			}
		}
	}, _computeMaxSize:function () {
		var dim = this.horizontal ? "h" : "w", childSize = dojo.marginBox(this.child.domNode)[dim], center = dojo.filter(this.container.getChildren(), function (child) {
			return child.region == "center";
		})[0], spaceAvailable = dojo.marginBox(center.domNode)[dim];
		return Math.min(this.child.maxSize, childSize + spaceAvailable);
	}, _startDrag:function (e) {
		if (!this.cover) {
			this.cover = dojo.doc.createElement("div");
			dojo.addClass(this.cover, "dijitSplitterCover");
			dojo.place(this.cover, this.child.domNode, "after");
		}
		dojo.addClass(this.cover, "dijitSplitterCoverActive");
		if (this.fake) {
			dojo.destroy(this.fake);
		}
		if (!(this._resize = this.live)) {
			(this.fake = this.domNode.cloneNode(true)).removeAttribute("id");
			dojo.addClass(this.domNode, "dijitSplitterShadow");
			dojo.place(this.fake, this.domNode, "after");
		}
		dojo.addClass(this.domNode, "dijitSplitterActive dijitSplitter" + (this.horizontal ? "H" : "V") + "Active");
		if (this.fake) {
			dojo.removeClass(this.fake, "dijitSplitterHover dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover");
		}
		var factor = this._factor, isHorizontal = this.horizontal, axis = isHorizontal ? "pageY" : "pageX", pageStart = e[axis], splitterStyle = this.domNode.style, dim = isHorizontal ? "h" : "w", childStart = dojo.marginBox(this.child.domNode)[dim], max = this._computeMaxSize(), min = this.child.minSize || 20, region = this.region, splitterAttr = region == "top" || region == "bottom" ? "top" : "left", splitterStart = parseInt(splitterStyle[splitterAttr], 10), resize = this._resize, layoutFunc = dojo.hitch(this.container, "_layoutChildren", this.child.id), de = dojo.doc;
		this._handlers = (this._handlers || []).concat([dojo.connect(de, "onmousemove", this._drag = function (e, forceResize) {
			var delta = e[axis] - pageStart, childSize = factor * delta + childStart, boundChildSize = Math.max(Math.min(childSize, max), min);
			if (resize || forceResize) {
				layoutFunc(boundChildSize);
			}
			splitterStyle[splitterAttr] = delta + splitterStart + factor * (boundChildSize - childSize) + "px";
		}), dojo.connect(de, "ondragstart", dojo.stopEvent), dojo.connect(dojo.body(), "onselectstart", dojo.stopEvent), dojo.connect(de, "onmouseup", this, "_stopDrag")]);
		dojo.stopEvent(e);
	}, _onMouse:function (e) {
		var o = (e.type == "mouseover" || e.type == "mouseenter");
		dojo.toggleClass(this.domNode, "dijitSplitterHover", o);
		dojo.toggleClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover", o);
	}, _stopDrag:function (e) {
		try {
			if (this.cover) {
				dojo.removeClass(this.cover, "dijitSplitterCoverActive");
			}
			if (this.fake) {
				dojo.destroy(this.fake);
			}
			dojo.removeClass(this.domNode, "dijitSplitterActive dijitSplitter" + (this.horizontal ? "H" : "V") + "Active dijitSplitterShadow");
			this._drag(e);
			this._drag(e, true);
		}
		finally {
			this._cleanupHandlers();
			delete this._drag;
		}
		if (this.container.persist) {
			dojo.cookie(this._cookieName, this.child.domNode.style[this.horizontal ? "height" : "width"], {expires:365});
		}
	}, _cleanupHandlers:function () {
		dojo.forEach(this._handlers, dojo.disconnect);
		delete this._handlers;
	}, _onKeyPress:function (e) {
		this._resize = true;
		var horizontal = this.horizontal;
		var tick = 1;
		var dk = dojo.keys;
		switch (e.charOrCode) {
		  case horizontal ? dk.UP_ARROW : dk.LEFT_ARROW:
			tick *= -1;
		  case horizontal ? dk.DOWN_ARROW : dk.RIGHT_ARROW:
			break;
		  default:
			return;
		}
		var childSize = dojo._getMarginSize(this.child.domNode)[horizontal ? "h" : "w"] + this._factor * tick;
		this.container._layoutChildren(this.child.id, Math.max(Math.min(childSize, this._computeMaxSize()), this.child.minSize));
		dojo.stopEvent(e);
	}, destroy:function () {
		this._cleanupHandlers();
		delete this.child;
		delete this.container;
		delete this.cover;
		delete this.fake;
		this.inherited(arguments);
	}});
	dojo.declare("dijit.layout._Gutter", [dijit._Widget, dijit._TemplatedMixin], {templateString:"<div class=\"dijitGutter\" role=\"presentation\"></div>", postMixInProperties:function () {
		this.inherited(arguments);
		this.horizontal = /top|bottom/.test(this.region);
	}, buildRendering:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "dijitGutter" + (this.horizontal ? "H" : "V"));
	}});
}

