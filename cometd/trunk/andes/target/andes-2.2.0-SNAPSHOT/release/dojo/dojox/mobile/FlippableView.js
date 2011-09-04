/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.FlippableView"]) {
	dojo._hasResource["dojox.mobile.FlippableView"] = true;
	dojo.provide("dojox.mobile.FlippableView");
	dojo.require("dojox.mobile.SwapView");
	dojo.deprecated("dojox.mobile.FlippableView is deprecated", "dojox.mobile.FlippableView moved to dojox.mobile.SwapView", 1.7);
	dojox.mobile.FlippableView = dojox.mobile.SwapView;
}

