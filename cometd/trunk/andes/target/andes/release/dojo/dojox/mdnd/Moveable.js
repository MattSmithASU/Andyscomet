/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mdnd.Moveable"]) {
	dojo._hasResource["dojox.mdnd.Moveable"] = true;
	dojo.provide("dojox.mdnd.Moveable");
	dojo.declare("dojox.mdnd.Moveable", null, {handle:null, skip:true, dragDistance:3, constructor:function (params, node) {
		this.node = dojo.byId(node);
		this.d = this.node.ownerDocument;
		if (!params) {
			params = {};
		}
		this.handle = params.handle ? dojo.byId(params.handle) : null;
		if (!this.handle) {
			this.handle = this.node;
		}
		this.skip = params.skip;
		this.events = [dojo.connect(this.handle, "onmousedown", this, "onMouseDown")];
		if (dojox.mdnd.autoScroll) {
			this.autoScroll = dojox.mdnd.autoScroll;
		}
	}, isFormElement:function (e) {
		var t = e.target;
		if (t.nodeType == 3) {
			t = t.parentNode;
		}
		return " a button textarea input select option ".indexOf(" " + t.tagName.toLowerCase() + " ") >= 0;
	}, onMouseDown:function (e) {
		if (this._isDragging) {
			return;
		}
		var isLeftButton = dojo.isIE ? (e.button == 1) : (e.which == 1);
		if (!isLeftButton) {
			return;
		}
		if (this.skip && this.isFormElement(e)) {
			return;
		}
		if (this.autoScroll) {
			this.autoScroll.setAutoScrollNode(this.node);
			this.autoScroll.setAutoScrollMaxPage();
		}
		this.events.push(dojo.connect(this.d, "onmouseup", this, "onMouseUp"));
		this.events.push(dojo.connect(this.d, "onmousemove", this, "onFirstMove"));
		this._selectStart = dojo.connect(dojo.body(), "onselectstart", dojo.stopEvent);
		this._firstX = e.clientX;
		this._firstY = e.clientY;
		dojo.stopEvent(e);
	}, onFirstMove:function (e) {
		dojo.stopEvent(e);
		var d = (this._firstX - e.clientX) * (this._firstX - e.clientX) + (this._firstY - e.clientY) * (this._firstY - e.clientY);
		if (d > this.dragDistance * this.dragDistance) {
			this._isDragging = true;
			dojo.disconnect(this.events.pop());
			dojo.style(this.node, "width", dojo.contentBox(this.node).w + "px");
			this.initOffsetDrag(e);
			this.events.push(dojo.connect(this.d, "onmousemove", this, "onMove"));
		}
	}, initOffsetDrag:function (e) {
		this.offsetDrag = {"l":e.pageX, "t":e.pageY};
		var s = this.node.style;
		var position = dojo.position(this.node, true);
		this.offsetDrag.l = position.x - this.offsetDrag.l;
		this.offsetDrag.t = position.y - this.offsetDrag.t;
		var coords = {"x":position.x, "y":position.y};
		this.size = {"w":position.w, "h":position.h};
		this.onDragStart(this.node, coords, this.size);
	}, onMove:function (e) {
		dojo.stopEvent(e);
		if (dojo.isIE == 8 && new Date() - this.date < 20) {
			return;
		}
		if (this.autoScroll) {
			this.autoScroll.checkAutoScroll(e);
		}
		var coords = {"x":this.offsetDrag.l + e.pageX, "y":this.offsetDrag.t + e.pageY};
		var s = this.node.style;
		s.left = coords.x + "px";
		s.top = coords.y + "px";
		this.onDrag(this.node, coords, this.size, {"x":e.pageX, "y":e.pageY});
		if (dojo.isIE == 8) {
			this.date = new Date();
		}
	}, onMouseUp:function (e) {
		if (this._isDragging) {
			dojo.stopEvent(e);
			this._isDragging = false;
			if (this.autoScroll) {
				this.autoScroll.stopAutoScroll();
			}
			delete this.onMove;
			this.onDragEnd(this.node);
			this.node.focus();
		}
		dojo.disconnect(this.events.pop());
		dojo.disconnect(this.events.pop());
	}, onDragStart:function (node, coords, size) {
	}, onDragEnd:function (node) {
	}, onDrag:function (node, coords, size, mousePosition) {
	}, destroy:function () {
		dojo.forEach(this.events, dojo.disconnect);
		this.events = this.node = null;
	}});
}

