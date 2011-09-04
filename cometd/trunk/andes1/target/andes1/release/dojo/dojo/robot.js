/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.robot"]) {
	dojo._hasResource["dojo.robot"] = true;
	dojo.provide("dojo.robot");
	dojo.require("doh.robot");
	dojo.require("dojo.window");
	dojo.experimental("dojo.robot");
	(function () {
		dojo.mixin(doh.robot, {_resolveNode:function (n) {
			if (typeof n == "function") {
				n = n();
			}
			return n ? dojo.byId(n) : null;
		}, _scrollIntoView:function (n) {
			var d = dojo, dr = doh.robot, p = null;
			d.forEach(dr._getWindowChain(n), function (w) {
				d.withGlobal(w, function () {
					var p2 = d.position(n, false), b = d._getPadBorderExtents(n), oldp = null;
					if (!p) {
						p = p2;
					} else {
						oldp = p;
						p = {x:p.x + p2.x + b.l, y:p.y + p2.y + b.t, w:p.w, h:p.h};
					}
					dojo.window.scrollIntoView(n, p);
					p2 = d.position(n, false);
					if (!oldp) {
						p = p2;
					} else {
						p = {x:oldp.x + p2.x + b.l, y:oldp.y + p2.y + b.t, w:p.w, h:p.h};
					}
					n = w.frameElement;
				});
			});
		}, _position:function (n) {
			var d = dojo, p = null, M = Math.max, m = Math.min;
			d.forEach(doh.robot._getWindowChain(n), function (w) {
				d.withGlobal(w, function () {
					var p2 = d.position(n, false), b = d._getPadBorderExtents(n);
					if (!p) {
						p = p2;
					} else {
						var view;
						d.withGlobal(n.contentWindow, function () {
							view = dojo.window.getBox();
						});
						p2.r = p2.x + view.w;
						p2.b = p2.y + view.h;
						p = {x:M(p.x + p2.x, p2.x) + b.l, y:M(p.y + p2.y, p2.y) + b.t, r:m(p.x + p2.x + p.w, p2.r) + b.l, b:m(p.y + p2.y + p.h, p2.b) + b.t};
						p.w = p.r - p.x;
						p.h = p.b - p.y;
					}
					n = w.frameElement;
				});
			});
			return p;
		}, _getWindowChain:function (n) {
			var cW = dojo.window.get(n.ownerDocument);
			var arr = [cW];
			var f = cW.frameElement;
			return (cW == dojo.global || f == null) ? arr : arr.concat(doh.robot._getWindowChain(f));
		}, scrollIntoView:function (node, delay) {
			doh.robot.sequence(function () {
				doh.robot._scrollIntoView(doh.robot._resolveNode(node));
			}, delay);
		}, mouseMoveAt:function (node, delay, duration, offsetX, offsetY) {
			doh.robot._assertRobot();
			duration = duration || 100;
			this.sequence(function () {
				node = doh.robot._resolveNode(node);
				doh.robot._scrollIntoView(node);
				var pos = doh.robot._position(node);
				if (offsetY === undefined) {
					offsetX = pos.w / 2;
					offsetY = pos.h / 2;
				}
				var x = pos.x + offsetX;
				var y = pos.y + offsetY;
				doh.robot._mouseMove(x, y, false, duration);
			}, delay, duration);
		}});
	})();
}

