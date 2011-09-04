/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.plugins.drawing.Grid"]) {
	dojo._hasResource["dojox.drawing.plugins.drawing.Grid"] = true;
	dojo.provide("dojox.drawing.plugins.drawing.Grid");
	dojo.require("dojox.drawing.plugins._Plugin");
	dojox.drawing.plugins.drawing.Grid = dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin, function (options) {
		if (options.gap) {
			this.major = options.gap;
		}
		this.majorColor = options.majorColor || this.majorColor;
		this.minorColor = options.minorColor || this.minorColor;
		this.setGrid();
		dojo.connect(this.canvas, "setZoom", this, "setZoom");
	}, {type:"dojox.drawing.plugins.drawing.Grid", gap:100, major:100, minor:0, majorColor:"#00ffff", minorColor:"#d7ffff", zoom:1, setZoom:function (zoom) {
		this.zoom = zoom;
		this.setGrid();
	}, setGrid:function (options) {
		var mjr = Math.floor(this.major * this.zoom);
		var mnr = this.minor ? Math.floor(this.minor * this.zoom) : mjr;
		this.grid && this.grid.removeShape();
		var x1, x2, y1, y2, i, clr, len;
		var s = this.canvas.underlay.createGroup();
		var w = 2000;
		var h = 1000;
		var b = 1;
		var mj = this.majorColor;
		var mn = this.minorColor;
		var createGridLine = function (x1, y1, x2, y2, c) {
			s.createLine({x1:x1, y1:y1, x2:x2, y2:y2}).setStroke({style:"Solid", width:b, cap:"round", color:c});
		};
		for (i = 1, len = h / mnr; i < len; i++) {
			x1 = 0, x2 = w;
			y1 = mnr * i, y2 = y1;
			clr = y1 % mjr ? mn : mj;
			createGridLine(x1, y1, x2, y2, clr);
		}
		for (i = 1, len = w / mnr; i < len; i++) {
			y1 = 0, y2 = h;
			x1 = mnr * i, x2 = x1;
			clr = x1 % mjr ? mn : mj;
			createGridLine(x1, y1, x2, y2, clr);
		}
		s.moveToBack();
		this.grid = s;
		this.util.attr(s, "id", "grid");
		return s;
	}});
}

