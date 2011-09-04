/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.fx.Toggler"]) {
	dojo._hasResource["dojo.fx.Toggler"] = true;
	dojo.provide("dojo.fx.Toggler");
	dojo.declare("dojo.fx.Toggler", null, {node:null, showFunc:dojo.fadeIn, hideFunc:dojo.fadeOut, showDuration:200, hideDuration:200, constructor:function (args) {
		var _t = this;
		dojo.mixin(_t, args);
		_t.node = args.node;
		_t._showArgs = dojo.mixin({}, args);
		_t._showArgs.node = _t.node;
		_t._showArgs.duration = _t.showDuration;
		_t.showAnim = _t.showFunc(_t._showArgs);
		_t._hideArgs = dojo.mixin({}, args);
		_t._hideArgs.node = _t.node;
		_t._hideArgs.duration = _t.hideDuration;
		_t.hideAnim = _t.hideFunc(_t._hideArgs);
		dojo.connect(_t.showAnim, "beforeBegin", dojo.hitch(_t.hideAnim, "stop", true));
		dojo.connect(_t.hideAnim, "beforeBegin", dojo.hitch(_t.showAnim, "stop", true));
	}, show:function (delay) {
		return this.showAnim.play(delay || 0);
	}, hide:function (delay) {
		return this.hideAnim.play(delay || 0);
	}});
}

