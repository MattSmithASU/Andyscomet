/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot3d.Base"]) {
	dojo._hasResource["dojox.charting.plot3d.Base"] = true;
	dojo.provide("dojox.charting.plot3d.Base");
	dojo.require("dojox.charting.Chart3D");
	dojo.declare("dojox.charting.plot3d.Base", null, {constructor:function (width, height, kwArgs) {
		this.width = width;
		this.height = height;
	}, setData:function (data) {
		this.data = data ? data : [];
		return this;
	}, getDepth:function () {
		return this.depth;
	}, generate:function (chart, creator) {
	}});
}
