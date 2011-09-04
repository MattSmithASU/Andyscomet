/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx.ext-dojo.NodeList-style"]) {
	dojo._hasResource["dojox.fx.ext-dojo.NodeList-style"] = true;
	dojo.provide("dojox.fx.ext-dojo.NodeList-style");
	dojo.experimental("dojox.fx.ext-dojo.NodeList-style");
	dojo.require("dojo.NodeList-fx");
	dojo.require("dojox.fx.style");
	dojo.extend(dojo.NodeList, {addClassFx:function (cssClass, args) {
		return dojo.fx.combine(this.map(function (n) {
			return dojox.fx.addClass(n, cssClass, args);
		}));
	}, removeClassFx:function (cssClass, args) {
		return dojo.fx.combine(this.map(function (n) {
			return dojox.fx.removeClass(n, cssClass, args);
		}));
	}, toggleClassFx:function (cssClass, force, args) {
		return dojo.fx.combine(this.map(function (n) {
			return dojox.fx.toggleClass(n, cssClass, force, args);
		}));
	}});
}

