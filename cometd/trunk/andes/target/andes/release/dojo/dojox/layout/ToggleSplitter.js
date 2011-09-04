/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.ToggleSplitter"]) {
	dojo._hasResource["dojox.layout.ToggleSplitter"] = true;
	dojo.provide("dojox.layout.ToggleSplitter");
	dojo.experimental("dojox.layout.ToggleSplitter");
	dojo.require("dijit.layout.BorderContainer");
	dojo.declare("dojox.layout.ToggleSplitter", [dijit.layout._Splitter], {open:true, closedThreshold:5, openSize:"", _closedSize:"0", templateString:"<div class=\"dijitSplitter dojoxToggleSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onMouseDown\" tabIndex=\"0\" role=\"separator\"><div dojoAttachPoint=\"toggleNode\" class=\"dijitSplitterThumb dojoxToggleSplitterIcon\"></div></div>", postCreate:function () {
		this._started = false;
		this.inherited(arguments);
		var region = this.region;
		dojo.addClass(this.domNode, "dojoxToggleSplitter" + region.charAt(0).toUpperCase() + region.substring(1));
		this.connect(this, "onDblClick", "_toggleMe");
	}, startup:function () {
		this.inherited(arguments);
		var paneNode = this.child.domNode, intPaneSize = dojo.style(paneNode, (this.horizontal ? "height" : "width"));
		dojo.forEach(["toggleSplitterOpen", "toggleSplitterClosedThreshold", "toggleSplitterOpenSize"], function (name) {
			var pname = name.substring("toggleSplitter".length);
			pname = pname.charAt(0).toLowerCase() + pname.substring(1);
			if (name in this.child) {
				this[pname] = this.child[name];
			}
		}, this);
		if (!this.openSize) {
			this.openSize = (this.open) ? intPaneSize + "px" : "75px";
		}
		this._openStyleProps = this._getStyleProps(paneNode, true);
		this._started = true;
		this.set("open", this.open);
		return this;
	}, _onMouseUp:function (evt) {
		dojo.disconnect(this._onMoveHandle);
		dojo.disconnect(this._onUpHandle);
		delete this._onMoveHandle;
		delete this._onUpHandle;
		delete this._startPosn;
	}, _onPrelimMouseMove:function (evt) {
		var startPosn = this._startPosn || 0;
		var dragThreshold = 3;
		var offset = Math.abs(startPosn - (this.horizontal ? evt.clientY : evt.clientX));
		if (offset >= dragThreshold) {
			dojo.disconnect(this._onMoveHandle);
			this._startDrag(evt);
		}
	}, _onMouseDown:function (evt) {
		if (!this.open) {
			return;
		}
		if (!this._onUpHandle) {
			this._onUpHandle = dojo.connect(dojo.body(), "onmouseup", this, "_onMouseUp");
		}
		if (!this._onMoveHandle) {
			this._startPosn = this.horizontal ? evt.clientY : evt.clientX;
			this._onMoveHandle = dojo.connect(dojo.body(), "onmousemove", this, "_onPrelimMouseMove");
		}
	}, _handleOnChange:function () {
		var paneNode = this.child.domNode, openProps, dim = this.horizontal ? "height" : "width";
		if (this.open) {
			var styleProps = dojo.mixin({display:"block", overflow:"auto", visibility:"visible"}, this._openStyleProps);
			styleProps[dim] = (this._openStyleProps && this._openStyleProps[dim]) ? this._openStyleProps[dim] : this.openSize;
			dojo.style(paneNode, styleProps);
			this.connect(this.domNode, "onmousedown", "_onMouseDown");
		} else {
			var paneStyle = dojo.getComputedStyle(paneNode);
			openProps = this._getStyleProps(paneNode, true, paneStyle);
			var closedProps = this._getStyleProps(paneNode, false, paneStyle);
			this._openStyleProps = openProps;
			dojo.style(paneNode, closedProps);
		}
		this._setStateClass();
		if (this.container._started) {
			this.container._layoutChildren(this.region);
		}
	}, _getStyleProps:function (paneNode, open, paneStyle) {
		if (!paneStyle) {
			paneStyle = dojo.getComputedStyle(paneNode);
		}
		var styleProps = {}, dim = this.horizontal ? "height" : "width";
		styleProps["overflow"] = (open) ? paneStyle["overflow"] : "hidden";
		styleProps["visibility"] = (open) ? paneStyle["visibility"] : "hidden";
		styleProps[dim] = (open) ? paneNode.style[dim] || paneStyle[dim] : this._closedSize;
		var edgeNames = ["Top", "Right", "Bottom", "Left"];
		dojo.forEach(["padding", "margin", "border"], function (pname) {
			for (var i = 0; i < edgeNames.length; i++) {
				var fullname = pname + edgeNames[i];
				if (pname == "border") {
					pname += "Width";
				}
				if (undefined !== paneStyle[fullname]) {
					styleProps[fullname] = (open) ? paneStyle[fullname] : 0;
				}
			}
		});
		return styleProps;
	}, _setStateClass:function () {
		if (this.open) {
			dojo.removeClass(this.domNode, "dojoxToggleSplitterClosed");
			dojo.addClass(this.domNode, "dojoxToggleSplitterOpen");
			dojo.removeClass(this.toggleNode, "dojoxToggleSplitterIconClosed");
			dojo.addClass(this.toggleNode, "dojoxToggleSplitterIconOpen");
		} else {
			dojo.addClass(this.domNode, "dojoxToggleSplitterClosed");
			dojo.removeClass(this.domNode, "dojoxToggleSplitterOpen");
			dojo.addClass(this.toggleNode, "dojoxToggleSplitterIconClosed");
			dojo.removeClass(this.toggleNode, "dojoxToggleSplitterIconOpen");
		}
	}, _setOpenAttr:function (value) {
		if (!this._started) {
			return;
		}
		this.open = value;
		this._handleOnChange(value, true);
		var evt = this.open ? "onOpen" : "onClose";
		this[evt](this.child);
	}, onOpen:function () {
	}, onClose:function () {
	}, _toggleMe:function (evt) {
		if (evt) {
			dojo.stopEvent(evt);
		}
		this.set("open", !this.open);
	}, _onKeyPress:function (e) {
		this.inherited(arguments);
	}});
	dojo.extend(dijit._Widget, {toggleSplitterOpen:true, toggleSplitterClosedThreshold:5, toggleSplitterOpenSize:""});
}

