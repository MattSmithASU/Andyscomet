/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx._arg"]) {
	dojo._hasResource["dojox.fx._arg"] = true;
	dojo.provide("dojox.fx._arg");
	dojox.fx._arg.StyleArgs = function (args) {
		this.node = args.node;
		this.cssClass = args.cssClass;
	};
	dojox.fx._arg.ShadowResizeArgs = function (args) {
		this.x = args.x;
		this.y = args.y;
	};
}

