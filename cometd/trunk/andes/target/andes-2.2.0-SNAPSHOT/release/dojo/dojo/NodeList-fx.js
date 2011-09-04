/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.NodeList-fx"]) {
	dojo._hasResource["dojo.NodeList-fx"] = true;
	dojo.provide("dojo.NodeList-fx");
	dojo.require("dojo.fx");
	dojo.extend(dojo.NodeList, {_anim:function (obj, method, args) {
		args = args || {};
		var a = dojo.fx.combine(this.map(function (item) {
			var tmpArgs = {node:item};
			dojo.mixin(tmpArgs, args);
			return obj[method](tmpArgs);
		}));
		return args.auto ? a.play() && this : a;
	}, wipeIn:function (args) {
		return this._anim(dojo.fx, "wipeIn", args);
	}, wipeOut:function (args) {
		return this._anim(dojo.fx, "wipeOut", args);
	}, slideTo:function (args) {
		return this._anim(dojo.fx, "slideTo", args);
	}, fadeIn:function (args) {
		return this._anim(dojo, "fadeIn", args);
	}, fadeOut:function (args) {
		return this._anim(dojo, "fadeOut", args);
	}, animateProperty:function (args) {
		return this._anim(dojo, "animateProperty", args);
	}, anim:function (properties, duration, easing, onEnd, delay) {
		var canim = dojo.fx.combine(this.map(function (item) {
			return dojo.animateProperty({node:item, properties:properties, duration:duration || 350, easing:easing});
		}));
		if (onEnd) {
			dojo.connect(canim, "onEnd", onEnd);
		}
		return canim.play(delay || 0);
	}});
}

