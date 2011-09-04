/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.Moveable"]) {
	dojo._hasResource["dojox.gfx.Moveable"] = true;
	dojo.provide("dojox.gfx.Moveable");
	dojo.require("dojox.gfx.Mover");
	dojo.declare("dojox.gfx.Moveable", null, {constructor:function (shape, params) {
		this.shape = shape;
		this.delay = (params && params.delay > 0) ? params.delay : 0;
		this.mover = (params && params.mover) ? params.mover : dojox.gfx.Mover;
		this.events = [this.shape.connect("onmousedown", this, "onMouseDown")];
	}, destroy:function () {
		dojo.forEach(this.events, this.shape.disconnect, this.shape);
		this.events = this.shape = null;
	}, onMouseDown:function (e) {
		if (this.delay) {
			this.events.push(this.shape.connect("onmousemove", this, "onMouseMove"), this.shape.connect("onmouseup", this, "onMouseUp"));
			this._lastX = e.clientX;
			this._lastY = e.clientY;
		} else {
			new this.mover(this.shape, e, this);
		}
		dojo.stopEvent(e);
	}, onMouseMove:function (e) {
		if (Math.abs(e.clientX - this._lastX) > this.delay || Math.abs(e.clientY - this._lastY) > this.delay) {
			this.onMouseUp(e);
			new this.mover(this.shape, e, this);
		}
		dojo.stopEvent(e);
	}, onMouseUp:function (e) {
		this.shape.disconnect(this.events.pop());
		this.shape.disconnect(this.events.pop());
	}, onMoveStart:function (mover) {
		dojo.publish("/gfx/move/start", [mover]);
		dojo.addClass(dojo.body(), "dojoMove");
	}, onMoveStop:function (mover) {
		dojo.publish("/gfx/move/stop", [mover]);
		dojo.removeClass(dojo.body(), "dojoMove");
	}, onFirstMove:function (mover) {
	}, onMove:function (mover, shift) {
		this.onMoving(mover, shift);
		this.shape.applyLeftTransform(shift);
		this.onMoved(mover, shift);
	}, onMoving:function (mover, shift) {
	}, onMoved:function (mover, shift) {
	}});
}

