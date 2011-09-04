/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mdnd.PureSource"]) {
	dojo._hasResource["dojox.mdnd.PureSource"] = true;
	dojo.provide("dojox.mdnd.PureSource");
	dojo.require("dojo.dnd.Selector");
	dojo.require("dojo.dnd.Manager");
	dojo.declare("dojox.mdnd.PureSource", dojo.dnd.Selector, {horizontal:false, copyOnly:true, skipForm:false, withHandles:false, isSource:true, targetState:"Disabled", generateText:true, constructor:function (node, params) {
		dojo.mixin(this, dojo.mixin({}, params));
		var type = this.accept;
		this.isDragging = false;
		this.mouseDown = false;
		this.sourceState = "";
		dojo.addClass(this.node, "dojoDndSource");
		if (this.horizontal) {
			dojo.addClass(this.node, "dojoDndHorizontal");
		}
		this.topics = [dojo.subscribe("/dnd/cancel", this, "onDndCancel"), dojo.subscribe("/dnd/drop", this, "onDndCancel")];
	}, onDndCancel:function () {
		this.isDragging = false;
		this.mouseDown = false;
		delete this.mouseButton;
	}, copyState:function (keyPressed) {
		return this.copyOnly || keyPressed;
	}, destroy:function () {
		dojox.mdnd.PureSource.superclass.destroy.call(this);
		dojo.forEach(this.topics, dojo.unsubscribe);
		this.targetAnchor = null;
	}, markupFactory:function (params, node) {
		params._skipStartup = true;
		return new dojox.mdnd.PureSource(node, params);
	}, onMouseMove:function (e) {
		if (this.isDragging) {
			return;
		}
		dojox.mdnd.PureSource.superclass.onMouseMove.call(this, e);
		var m = dojo.dnd.manager();
		if (this.mouseDown && !this.isDragging && this.isSource) {
			var nodes = this.getSelectedNodes();
			if (nodes.length) {
				m.startDrag(this, nodes, this.copyState(dojo.isCopyKey(e)));
				this.isDragging = true;
			}
		}
	}, onMouseDown:function (e) {
		if (this._legalMouseDown(e) && (!this.skipForm || !dojo.dnd.isFormElement(e))) {
			this.mouseDown = true;
			this.mouseButton = e.button;
			dojox.mdnd.PureSource.superclass.onMouseDown.call(this, e);
		}
	}, onMouseUp:function (e) {
		if (this.mouseDown) {
			this.mouseDown = false;
			dojox.mdnd.PureSource.superclass.onMouseUp.call(this, e);
		}
	}, onOverEvent:function () {
		dojox.mdnd.PureSource.superclass.onOverEvent.call(this);
		dojo.dnd.manager().overSource(this);
	}, onOutEvent:function () {
		dojox.mdnd.PureSource.superclass.onOutEvent.call(this);
		dojo.dnd.manager().outSource(this);
	}, _markDndStatus:function (copy) {
		this._changeState("Source", copy ? "Copied" : "Moved");
	}, _legalMouseDown:function (e) {
		if (!this.withHandles) {
			return true;
		}
		for (var node = e.target; node && !dojo.hasClass(node, "dojoDndItem"); node = node.parentNode) {
			if (dojo.hasClass(node, "dojoDndHandle")) {
				return true;
			}
		}
		return false;
	}});
}

