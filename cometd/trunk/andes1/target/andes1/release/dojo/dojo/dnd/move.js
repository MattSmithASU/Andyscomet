/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.move"]) {
	dojo._hasResource["dojo.dnd.move"] = true;
	dojo.provide("dojo.dnd.move");
	dojo.require("dojo.dnd.Mover");
	dojo.require("dojo.dnd.Moveable");
	dojo.declare("dojo.dnd.move.constrainedMoveable", dojo.dnd.Moveable, {constraints:function () {
	}, within:false, markupFactory:function (params, node) {
		return new dojo.dnd.move.constrainedMoveable(node, params);
	}, constructor:function (node, params) {
		if (!params) {
			params = {};
		}
		this.constraints = params.constraints;
		this.within = params.within;
	}, onFirstMove:function (mover) {
		var c = this.constraintBox = this.constraints.call(this, mover);
		c.r = c.l + c.w;
		c.b = c.t + c.h;
		if (this.within) {
			var mb = dojo._getMarginSize(mover.node);
			c.r -= mb.w;
			c.b -= mb.h;
		}
	}, onMove:function (mover, leftTop) {
		var c = this.constraintBox, s = mover.node.style;
		this.onMoving(mover, leftTop);
		leftTop.l = leftTop.l < c.l ? c.l : c.r < leftTop.l ? c.r : leftTop.l;
		leftTop.t = leftTop.t < c.t ? c.t : c.b < leftTop.t ? c.b : leftTop.t;
		s.left = leftTop.l + "px";
		s.top = leftTop.t + "px";
		this.onMoved(mover, leftTop);
	}});
	dojo.declare("dojo.dnd.move.boxConstrainedMoveable", dojo.dnd.move.constrainedMoveable, {box:{}, markupFactory:function (params, node) {
		return new dojo.dnd.move.boxConstrainedMoveable(node, params);
	}, constructor:function (node, params) {
		var box = params && params.box;
		this.constraints = function () {
			return box;
		};
	}});
	dojo.declare("dojo.dnd.move.parentConstrainedMoveable", dojo.dnd.move.constrainedMoveable, {area:"content", markupFactory:function (params, node) {
		return new dojo.dnd.move.parentConstrainedMoveable(node, params);
	}, constructor:function (node, params) {
		var area = params && params.area;
		this.constraints = function () {
			var n = this.node.parentNode, s = dojo.getComputedStyle(n), mb = dojo._getMarginBox(n, s);
			if (area == "margin") {
				return mb;
			}
			var t = dojo._getMarginExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			if (area == "border") {
				return mb;
			}
			t = dojo._getBorderExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			if (area == "padding") {
				return mb;
			}
			t = dojo._getPadExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			return mb;
		};
	}});
	dojo.dnd.constrainedMover = dojo.dnd.move.constrainedMover;
	dojo.dnd.boxConstrainedMover = dojo.dnd.move.boxConstrainedMover;
	dojo.dnd.parentConstrainedMover = dojo.dnd.move.parentConstrainedMover;
}

