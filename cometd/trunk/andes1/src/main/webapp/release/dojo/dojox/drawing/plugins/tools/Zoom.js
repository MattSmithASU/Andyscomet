/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.plugins.tools.Zoom"]) {
	dojo._hasResource["dojox.drawing.plugins.tools.Zoom"] = true;
	dojo.provide("dojox.drawing.plugins.tools.Zoom");
	dojo.require("dojox.drawing.plugins._Plugin");
	(function () {
		var zoomInc = Math.pow(2, 0.25), maxZoom = 10, minZoom = 0.1, zoomFactor = 1, dt = dojox.drawing.plugins.tools;
		dt.ZoomIn = dojox.drawing.util.oo.declare(function (options) {
		}, {});
		dt.ZoomIn = dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin, function (options) {
		}, {type:"dojox.drawing.plugins.tools.ZoomIn", onZoomIn:function () {
			zoomFactor *= zoomInc;
			zoomFactor = Math.min(zoomFactor, maxZoom);
			this.canvas.setZoom(zoomFactor);
			this.mouse.setZoom(zoomFactor);
		}, onClick:function () {
			this.onZoomIn();
		}});
		dt.Zoom100 = dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin, function (options) {
		}, {type:"dojox.drawing.plugins.tools.Zoom100", onZoom100:function () {
			zoomFactor = 1;
			this.canvas.setZoom(zoomFactor);
			this.mouse.setZoom(zoomFactor);
		}, onClick:function () {
			this.onZoom100();
		}});
		dt.ZoomOut = dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin, function (options) {
		}, {type:"dojox.drawing.plugins.tools.ZoomOut", onZoomOut:function () {
			zoomFactor /= zoomInc;
			zoomFactor = Math.max(zoomFactor, minZoom);
			this.canvas.setZoom(zoomFactor);
			this.mouse.setZoom(zoomFactor);
		}, onClick:function () {
			this.onZoomOut();
		}});
		dt.ZoomIn.setup = {name:"dojox.drawing.plugins.tools.ZoomIn", tooltip:"Zoom In"};
		dojox.drawing.register(dt.ZoomIn.setup, "plugin");
		dt.Zoom100.setup = {name:"dojox.drawing.plugins.tools.Zoom100", tooltip:"Zoom to 100%"};
		dojox.drawing.register(dt.Zoom100.setup, "plugin");
		dt.ZoomOut.setup = {name:"dojox.drawing.plugins.tools.ZoomOut", tooltip:"Zoom In"};
		dojox.drawing.register(dt.ZoomOut.setup, "plugin");
	})();
}

