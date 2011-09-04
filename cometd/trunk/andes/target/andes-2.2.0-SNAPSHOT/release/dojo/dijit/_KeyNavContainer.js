/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._KeyNavContainer"]) {
	dojo._hasResource["dijit._KeyNavContainer"] = true;
	dojo.provide("dijit._KeyNavContainer");
	dojo.require("dijit._Container");
	dojo.declare("dijit._KeyNavContainer", dijit._Container, {tabIndex:"0", _keyNavCodes:{}, connectKeyNavHandlers:function (prevKeyCodes, nextKeyCodes) {
		var keyCodes = (this._keyNavCodes = {});
		var prev = dojo.hitch(this, this.focusPrev);
		var next = dojo.hitch(this, this.focusNext);
		dojo.forEach(prevKeyCodes, function (code) {
			keyCodes[code] = prev;
		});
		dojo.forEach(nextKeyCodes, function (code) {
			keyCodes[code] = next;
		});
		keyCodes[dojo.keys.HOME] = dojo.hitch(this, "focusFirstChild");
		keyCodes[dojo.keys.END] = dojo.hitch(this, "focusLastChild");
		this.connect(this.domNode, "onkeypress", "_onContainerKeypress");
		this.connect(this.domNode, "onfocus", "_onContainerFocus");
	}, startupKeyNavChildren:function () {
		dojo.forEach(this.getChildren(), dojo.hitch(this, "_startupChild"));
	}, addChild:function (widget, insertIndex) {
		dijit._KeyNavContainer.superclass.addChild.apply(this, arguments);
		this._startupChild(widget);
	}, focus:function () {
		this.focusFirstChild();
	}, focusFirstChild:function () {
		var child = this._getFirstFocusableChild();
		if (child) {
			this.focusChild(child);
		}
	}, focusLastChild:function () {
		var child = this._getLastFocusableChild();
		if (child) {
			this.focusChild(child);
		}
	}, focusNext:function () {
		var child = this._getNextFocusableChild(this.focusedChild, 1);
		this.focusChild(child);
	}, focusPrev:function () {
		var child = this._getNextFocusableChild(this.focusedChild, -1);
		this.focusChild(child, true);
	}, focusChild:function (widget, last) {
		if (this.focusedChild && widget !== this.focusedChild) {
			this._onChildBlur(this.focusedChild);
		}
		widget.set("tabIndex", this.tabIndex);
		widget.focus(last ? "end" : "start");
		this._set("focusedChild", widget);
	}, _startupChild:function (widget) {
		widget.set("tabIndex", "-1");
		this.connect(widget, "_onFocus", function () {
			widget.set("tabIndex", this.tabIndex);
		});
		this.connect(widget, "_onBlur", function () {
			widget.set("tabIndex", "-1");
		});
	}, _onContainerFocus:function (evt) {
		if (evt.target !== this.domNode) {
			return;
		}
		this.focusFirstChild();
		dojo.attr(this.domNode, "tabIndex", "-1");
	}, _onBlur:function (evt) {
		if (this.tabIndex) {
			dojo.attr(this.domNode, "tabIndex", this.tabIndex);
		}
		this.inherited(arguments);
	}, _onContainerKeypress:function (evt) {
		if (evt.ctrlKey || evt.altKey) {
			return;
		}
		var func = this._keyNavCodes[evt.charOrCode];
		if (func) {
			func();
			dojo.stopEvent(evt);
		}
	}, _onChildBlur:function (widget) {
	}, _getFirstFocusableChild:function () {
		return this._getNextFocusableChild(null, 1);
	}, _getLastFocusableChild:function () {
		return this._getNextFocusableChild(null, -1);
	}, _getNextFocusableChild:function (child, dir) {
		if (child) {
			child = this._getSiblingOfChild(child, dir);
		}
		var children = this.getChildren();
		for (var i = 0; i < children.length; i++) {
			if (!child) {
				child = children[(dir > 0) ? 0 : (children.length - 1)];
			}
			if (child.isFocusable()) {
				return child;
			}
			child = this._getSiblingOfChild(child, dir);
		}
		return null;
	}});
}

