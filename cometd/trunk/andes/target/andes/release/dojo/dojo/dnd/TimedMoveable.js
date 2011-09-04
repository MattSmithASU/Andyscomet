/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.TimedMoveable"]) {
	dojo._hasResource["dojo.dnd.TimedMoveable"] = true;
	dojo.provide("dojo.dnd.TimedMoveable");
	dojo.require("dojo.dnd.Moveable");
	(function () {
		var oldOnMove = dojo.dnd.Moveable.prototype.onMove;
		dojo.declare("dojo.dnd.TimedMoveable", dojo.dnd.Moveable, {timeout:40, constructor:function (node, params) {
			if (!params) {
				params = {};
			}
			if (params.timeout && typeof params.timeout == "number" && params.timeout >= 0) {
				this.timeout = params.timeout;
			}
		}, markupFactory:function (params, node) {
			return new dojo.dnd.TimedMoveable(node, params);
		}, onMoveStop:function (mover) {
			if (mover._timer) {
				clearTimeout(mover._timer);
				oldOnMove.call(this, mover, mover._leftTop);
			}
			dojo.dnd.Moveable.prototype.onMoveStop.apply(this, arguments);
		}, onMove:function (mover, leftTop) {
			mover._leftTop = leftTop;
			if (!mover._timer) {
				var _t = this;
				mover._timer = setTimeout(function () {
					mover._timer = null;
					oldOnMove.call(_t, mover, mover._leftTop);
				}, this.timeout);
			}
		}});
	})();
}

