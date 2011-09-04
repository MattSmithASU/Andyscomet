/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.rotator.Fade"]) {
	dojo._hasResource["dojox.widget.rotator.Fade"] = true;
	dojo.provide("dojox.widget.rotator.Fade");
	dojo.require("dojo.fx");
	(function (d) {
		function _fade(args, action) {
			var n = args.next.node;
			d.style(n, {display:"", opacity:0});
			args.node = args.current.node;
			return d.fx[action]([d.fadeOut(args), d.fadeIn(d.mixin(args, {node:n}))]);
		}
		d.mixin(dojox.widget.rotator, {fade:function (args) {
			return _fade(args, "chain");
		}, crossFade:function (args) {
			return _fade(args, "combine");
		}});
	})(dojo);
}

