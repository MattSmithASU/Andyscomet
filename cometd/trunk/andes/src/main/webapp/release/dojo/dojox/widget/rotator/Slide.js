/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.rotator.Slide"]) {
	dojo._hasResource["dojox.widget.rotator.Slide"] = true;
	dojo.provide("dojox.widget.rotator.Slide");
	(function (d) {
		var DOWN = 0, RIGHT = 1, UP = 2, LEFT = 3;
		function _slide(type, args) {
			var node = args.node = args.next.node, r = args.rotatorBox, m = type % 2, s = (m ? r.w : r.h) * (type < 2 ? -1 : 1);
			d.style(node, {display:"", zIndex:(d.style(args.current.node, "zIndex") || 1) + 1});
			if (!args.properties) {
				args.properties = {};
			}
			args.properties[m ? "left" : "top"] = {start:s, end:0};
			return d.animateProperty(args);
		}
		d.mixin(dojox.widget.rotator, {slideDown:function (args) {
			return _slide(DOWN, args);
		}, slideRight:function (args) {
			return _slide(RIGHT, args);
		}, slideUp:function (args) {
			return _slide(UP, args);
		}, slideLeft:function (args) {
			return _slide(LEFT, args);
		}});
	})(dojo);
}

