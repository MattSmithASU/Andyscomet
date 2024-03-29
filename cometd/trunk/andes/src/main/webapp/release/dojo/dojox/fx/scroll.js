/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx.scroll"]) {
	dojo._hasResource["dojox.fx.scroll"] = true;
	dojo.provide("dojox.fx.scroll");
	dojo.experimental("dojox.fx.scroll");
	dojo.require("dojox.fx._core");
	dojox.fx.smoothScroll = function (args) {
		if (!args.target) {
			args.target = dojo.position(args.node);
		}
		var isWindow = dojo[(dojo.isIE ? "isObject" : "isFunction")](args["win"].scrollTo), delta = {x:args.target.x, y:args.target.y};
		if (!isWindow) {
			var winPos = dojo.position(args.win);
			delta.x -= winPos.x;
			delta.y -= winPos.y;
		}
		var _anim = (isWindow) ? (function (val) {
			args.win.scrollTo(val[0], val[1]);
		}) : (function (val) {
			args.win.scrollLeft = val[0];
			args.win.scrollTop = val[1];
		});
		var anim = new dojo.Animation(dojo.mixin({beforeBegin:function () {
			if (this.curve) {
				delete this.curve;
			}
			var current = isWindow ? dojo._docScroll() : {x:args.win.scrollLeft, y:args.win.scrollTop};
			anim.curve = new dojox.fx._Line([current.x, current.y], [current.x + delta.x, current.y + delta.y]);
		}, onAnimate:_anim}, args));
		return anim;
	};
}

