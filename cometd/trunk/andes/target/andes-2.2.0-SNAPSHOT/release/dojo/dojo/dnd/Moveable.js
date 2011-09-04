/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.Moveable"]) {
	dojo._hasResource["dojo.dnd.Moveable"] = true;
	dojo.provide("dojo.dnd.Moveable");
	dojo.require("dojo.dnd.Mover");
	dojo.declare("dojo.dnd.Moveable", null, {handle:"", delay:0, skip:false, constructor:function (node, params) {
		this.node = dojo.byId(node);
		if (!params) {
			params = {};
		}
		this.handle = params.handle ? dojo.byId(params.handle) : null;
		if (!this.handle) {
			this.handle = this.node;
		}
		this.delay = params.delay > 0 ? params.delay : 0;
		this.skip = params.skip;
		this.mover = params.mover ? params.mover : dojo.dnd.Mover;
		this.events = [dojo.connect(this.handle, "onmousedown", this, "onMouseDown"), dojo.connect(this.handle, "ontouchstart", this, "onMouseDown"), dojo.connect(this.handle, "ondragstart", this, "onSelectStart"), dojo.connect(this.handle, "onselectstart", this, "onSelectStart")];
	}, markupFactory:function (params, node) {
		return new dojo.dnd.Moveable(node, params);
	}, destroy:function () {
		dojo.forEach(this.events, dojo.disconnect);
		this.events = this.node = this.handle = null;
	}, onMouseDown:function (e) {
		if (this.skip && dojo.dnd.isFormElement(e)) {
			return;
		}
		if (this.delay) {
			this.events.push(dojo.connect(this.handle, "onmousemove", this, "onMouseMove"), dojo.connect(this.handle, "ontouchmove", this, "onMouseMove"), dojo.connect(this.handle, "onmouseup", this, "onMouseUp"), dojo.connect(this.handle, "ontouchend", this, "onMouseUp"));
			var pos = e.touches ? e.touches[0] : e;
			this._lastX = pos.pageX;
			this._lastY = pos.pageY;
		} else {
			this.onDragDetected(e);
		}
		dojo.stopEvent(e);
	}, onMouseMove:function (e) {
		var pos = e.touches ? e.touches[0] : e;
		if (Math.abs(pos.pageX - this._lastX) > this.delay || Math.abs(pos.pageY - this._lastY) > this.delay) {
			this.onMouseUp(e);
			this.onDragDetected(e);
		}
		dojo.stopEvent(e);
	}, onMouseUp:function (e) {
		for (var i = 0; i < 2; ++i) {
			dojo.disconnect(this.events.pop());
		}
		dojo.stopEvent(e);
	}, onSelectStart:function (e) {
		if (!this.skip || !dojo.dnd.isFormElement(e)) {
			dojo.stopEvent(e);
		}
	}, onDragDetected:function (e) {
		new this.mover(this.node, e, this);
	}, onMoveStart:function (mover) {
		dojo.publish("/dnd/move/start", [mover]);
		dojo.addClass(dojo.body(), "dojoMove");
		dojo.addClass(this.node, "dojoMoveItem");
	}, onMoveStop:function (mover) {
		dojo.publish("/dnd/move/stop", [mover]);
		dojo.removeClass(dojo.body(), "dojoMove");
		dojo.removeClass(this.node, "dojoMoveItem");
	}, onFirstMove:function (mover, e) {
	}, onMove:function (mover, leftTop, e) {
		this.onMoving(mover, leftTop);
		var s = mover.node.style;
		s.left = leftTop.l + "px";
		s.top = leftTop.t + "px";
		this.onMoved(mover, leftTop);
	}, onMoving:function (mover, leftTop) {
	}, onMoved:function (mover, leftTop) {
	}});
}

