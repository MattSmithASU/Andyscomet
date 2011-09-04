/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.Manager"]) {
	dojo._hasResource["dojo.dnd.Manager"] = true;
	dojo.provide("dojo.dnd.Manager");
	dojo.require("dojo.dnd.common");
	dojo.require("dojo.dnd.autoscroll");
	dojo.require("dojo.dnd.Avatar");
	dojo.declare("dojo.dnd.Manager", null, {constructor:function () {
		this.avatar = null;
		this.source = null;
		this.nodes = [];
		this.copy = true;
		this.target = null;
		this.canDropFlag = false;
		this.events = [];
	}, OFFSET_X:16, OFFSET_Y:16, overSource:function (source) {
		if (this.avatar) {
			this.target = (source && source.targetState != "Disabled") ? source : null;
			this.canDropFlag = Boolean(this.target);
			this.avatar.update();
		}
		dojo.publish("/dnd/source/over", [source]);
	}, outSource:function (source) {
		if (this.avatar) {
			if (this.target == source) {
				this.target = null;
				this.canDropFlag = false;
				this.avatar.update();
				dojo.publish("/dnd/source/over", [null]);
			}
		} else {
			dojo.publish("/dnd/source/over", [null]);
		}
	}, startDrag:function (source, nodes, copy) {
		this.source = source;
		this.nodes = nodes;
		this.copy = Boolean(copy);
		this.avatar = this.makeAvatar();
		dojo.body().appendChild(this.avatar.node);
		dojo.publish("/dnd/start", [source, nodes, this.copy]);
		this.events = [dojo.connect(dojo.doc, "onmousemove", this, "onMouseMove"), dojo.connect(dojo.doc, "onmouseup", this, "onMouseUp"), dojo.connect(dojo.doc, "onkeydown", this, "onKeyDown"), dojo.connect(dojo.doc, "onkeyup", this, "onKeyUp"), dojo.connect(dojo.doc, "ondragstart", dojo.stopEvent), dojo.connect(dojo.body(), "onselectstart", dojo.stopEvent)];
		var c = "dojoDnd" + (copy ? "Copy" : "Move");
		dojo.addClass(dojo.body(), c);
	}, canDrop:function (flag) {
		var canDropFlag = Boolean(this.target && flag);
		if (this.canDropFlag != canDropFlag) {
			this.canDropFlag = canDropFlag;
			this.avatar.update();
		}
	}, stopDrag:function () {
		dojo.removeClass(dojo.body(), ["dojoDndCopy", "dojoDndMove"]);
		dojo.forEach(this.events, dojo.disconnect);
		this.events = [];
		this.avatar.destroy();
		this.avatar = null;
		this.source = this.target = null;
		this.nodes = [];
	}, makeAvatar:function () {
		return new dojo.dnd.Avatar(this);
	}, updateAvatar:function () {
		this.avatar.update();
	}, onMouseMove:function (e) {
		var a = this.avatar;
		if (a) {
			dojo.dnd.autoScrollNodes(e);
			var s = a.node.style;
			s.left = (e.pageX + this.OFFSET_X) + "px";
			s.top = (e.pageY + this.OFFSET_Y) + "px";
			var copy = Boolean(this.source.copyState(dojo.isCopyKey(e)));
			if (this.copy != copy) {
				this._setCopyStatus(copy);
			}
		}
	}, onMouseUp:function (e) {
		if (this.avatar) {
			if (this.target && this.canDropFlag) {
				var copy = Boolean(this.source.copyState(dojo.isCopyKey(e))), params = [this.source, this.nodes, copy, this.target, e];
				dojo.publish("/dnd/drop/before", params);
				dojo.publish("/dnd/drop", params);
			} else {
				dojo.publish("/dnd/cancel");
			}
			this.stopDrag();
		}
	}, onKeyDown:function (e) {
		if (this.avatar) {
			switch (e.keyCode) {
			  case dojo.keys.CTRL:
				var copy = Boolean(this.source.copyState(true));
				if (this.copy != copy) {
					this._setCopyStatus(copy);
				}
				break;
			  case dojo.keys.ESCAPE:
				dojo.publish("/dnd/cancel");
				this.stopDrag();
				break;
			}
		}
	}, onKeyUp:function (e) {
		if (this.avatar && e.keyCode == dojo.keys.CTRL) {
			var copy = Boolean(this.source.copyState(false));
			if (this.copy != copy) {
				this._setCopyStatus(copy);
			}
		}
	}, _setCopyStatus:function (copy) {
		this.copy = copy;
		this.source._markDndStatus(this.copy);
		this.updateAvatar();
		dojo.replaceClass(dojo.body(), "dojoDnd" + (this.copy ? "Copy" : "Move"), "dojoDnd" + (this.copy ? "Move" : "Copy"));
	}});
	dojo.dnd._manager = null;
	dojo.dnd.manager = function () {
		if (!dojo.dnd._manager) {
			dojo.dnd._manager = new dojo.dnd.Manager();
		}
		return dojo.dnd._manager;
	};
}

