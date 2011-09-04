/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout._ContentPaneResizeMixin"]) {
	dojo._hasResource["dijit.layout._ContentPaneResizeMixin"] = true;
	dojo.provide("dijit.layout._ContentPaneResizeMixin");
	dojo.require("dijit._Contained");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.declare("dijit.layout._ContentPaneResizeMixin", null, {doLayout:true, isContainer:true, isLayoutContainer:true, _startChildren:function () {
		dojo.forEach(this.getChildren(), function (child) {
			child.startup();
			child._started = true;
		});
	}, startup:function () {
		if (this._started) {
			return;
		}
		var parent = dijit._Contained.prototype.getParent.call(this);
		this._childOfLayoutWidget = parent && parent.isLayoutContainer;
		this._needLayout = !this._childOfLayoutWidget;
		this.inherited(arguments);
		this._startChildren();
		if (this._isShown()) {
			this._onShow();
		}
		if (!this._childOfLayoutWidget) {
			this.connect(dojo.isIE ? this.domNode : dojo.global, "onresize", function () {
				this._needLayout = !this._childOfLayoutWidget;
				this.resize();
			});
		}
	}, _checkIfSingleChild:function () {
		var childNodes = dojo.query("> *", this.containerNode).filter(function (node) {
			return node.tagName !== "SCRIPT";
		}), childWidgetNodes = childNodes.filter(function (node) {
			return dojo.hasAttr(node, "data-dojo-type") || dojo.hasAttr(node, "dojoType") || dojo.hasAttr(node, "widgetId");
		}), candidateWidgets = dojo.filter(childWidgetNodes.map(dijit.byNode), function (widget) {
			return widget && widget.domNode && widget.resize;
		});
		if (childNodes.length == childWidgetNodes.length && candidateWidgets.length == 1) {
			this._singleChild = candidateWidgets[0];
		} else {
			delete this._singleChild;
		}
		dojo.toggleClass(this.containerNode, this.baseClass + "SingleChild", !!this._singleChild);
	}, resize:function (changeSize, resultSize) {
		if (!this._wasShown && this.open !== false) {
			this._onShow();
		}
		this._resizeCalled = true;
		this._scheduleLayout(changeSize, resultSize);
	}, _scheduleLayout:function (changeSize, resultSize) {
		if (this._isShown()) {
			this._layout(changeSize, resultSize);
		} else {
			this._needLayout = true;
			this._changeSize = changeSize;
			this._resultSize = resultSize;
		}
	}, _layout:function (changeSize, resultSize) {
		if (changeSize) {
			dojo.marginBox(this.domNode, changeSize);
		}
		var cn = this.containerNode;
		if (cn === this.domNode) {
			var mb = resultSize || {};
			dojo.mixin(mb, changeSize || {});
			if (!("h" in mb) || !("w" in mb)) {
				mb = dojo.mixin(dojo.marginBox(cn), mb);
			}
			this._contentBox = dijit.layout.marginBox2contentBox(cn, mb);
		} else {
			this._contentBox = dojo.contentBox(cn);
		}
		this._layoutChildren();
		delete this._needLayout;
	}, _layoutChildren:function () {
		if (this.doLayout) {
			this._checkIfSingleChild();
		}
		if (this._singleChild && this._singleChild.resize) {
			var cb = this._contentBox || dojo.contentBox(this.containerNode);
			this._singleChild.resize({w:cb.w, h:cb.h});
		} else {
			dojo.forEach(this.getChildren(), function (widget) {
				if (widget.resize) {
					widget.resize();
				}
			});
		}
	}, _isShown:function () {
		if (this._childOfLayoutWidget) {
			if (this._resizeCalled && "open" in this) {
				return this.open;
			}
			return this._resizeCalled;
		} else {
			if ("open" in this) {
				return this.open;
			} else {
				var node = this.domNode, parent = this.domNode.parentNode;
				return (node.style.display != "none") && (node.style.visibility != "hidden") && !dojo.hasClass(node, "dijitHidden") && parent && parent.style && (parent.style.display != "none");
			}
		}
	}, _onShow:function () {
		if (this._needLayout) {
			this._layout(this._changeSize, this._resultSize);
		}
		this.inherited(arguments);
		this._wasShown = true;
	}});
}

