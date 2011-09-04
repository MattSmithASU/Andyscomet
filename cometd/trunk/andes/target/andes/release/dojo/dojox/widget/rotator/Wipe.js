/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.rotator.Wipe"]) {
	dojo._hasResource["dojox.widget.rotator.Wipe"] = true;
	dojo.provide("dojox.widget.rotator.Wipe");
	(function (d) {
		var DOWN = 2, RIGHT = 3, UP = 0, LEFT = 1;
		function _clipArray(type, w, h, x) {
			var a = [0, w, 0, 0];
			if (type == RIGHT) {
				a = [0, w, h, w];
			} else {
				if (type == UP) {
					a = [h, w, h, 0];
				} else {
					if (type == LEFT) {
						a = [0, 0, h, 0];
					}
				}
			}
			if (x != null) {
				a[type] = type == DOWN || type == LEFT ? x : (type % 2 ? w : h) - x;
			}
			return a;
		}
		function _setClip(n, type, w, h, x) {
			d.style(n, "clip", type == null ? "auto" : "rect(" + _clipArray(type, w, h, x).join("px,") + "px)");
		}
		function _wipe(type, args) {
			var node = args.next.node, w = args.rotatorBox.w, h = args.rotatorBox.h;
			d.style(node, {display:"", zIndex:(d.style(args.current.node, "zIndex") || 1) + 1});
			_setClip(node, type, w, h);
			return new d.Animation(d.mixin({node:node, curve:[0, type % 2 ? w : h], onAnimate:function (x) {
				_setClip(node, type, w, h, parseInt(x));
			}}, args));
		}
		d.mixin(dojox.widget.rotator, {wipeDown:function (args) {
			return _wipe(DOWN, args);
		}, wipeRight:function (args) {
			return _wipe(RIGHT, args);
		}, wipeUp:function (args) {
			return _wipe(UP, args);
		}, wipeLeft:function (args) {
			return _wipe(LEFT, args);
		}});
	})(dojo);
}

