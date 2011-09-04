/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx.ext-dojo.NodeList"]) {
	dojo._hasResource["dojox.fx.ext-dojo.NodeList"] = true;
	dojo.provide("dojox.fx.ext-dojo.NodeList");
	dojo.experimental("dojox.fx.ext-dojo.NodeList");
	dojo.require("dojo.NodeList-fx");
	dojo.require("dojox.fx");
	dojo.extend(dojo.NodeList, {sizeTo:function (args) {
		return this._anim(dojox.fx, "sizeTo", args);
	}, slideBy:function (args) {
		return this._anim(dojox.fx, "slideBy", args);
	}, highlight:function (args) {
		return this._anim(dojox.fx, "highlight", args);
	}, fadeTo:function (args) {
		return this._anim(dojo, "_fade", args);
	}, wipeTo:function (args) {
		return this._anim(dojox.fx, "wipeTo", args);
	}});
}

