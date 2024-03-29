/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.image.Magnifier"]) {
	dojo._hasResource["dojox.image.Magnifier"] = true;
	dojo.provide("dojox.image.Magnifier");
	dojo.require("dojox.gfx");
	dojo.require("dojox.image.MagnifierLite");
	dojo.declare("dojox.image.Magnifier", dojox.image.MagnifierLite, {_createGlass:function () {
		this.glassNode = dojo.create("div", {style:{height:this.glassSize + "px", width:this.glassSize + "px"}, "className":"glassNode"}, dojo.body());
		this.surfaceNode = dojo.create("div", null, this.glassNode);
		this.surface = dojox.gfx.createSurface(this.surfaceNode, this.glassSize, this.glassSize);
		this.img = this.surface.createImage({src:this.domNode.src, width:this._zoomSize.w, height:this._zoomSize.h});
	}, _placeGlass:function (e) {
		var x = e.pageX - 2, y = e.pageY - 2, xMax = this.offset.x + this.offset.w + 2, yMax = this.offset.y + this.offset.h + 2;
		if (x < this.offset.x || y < this.offset.y || x > xMax || y > yMax) {
			this._hideGlass();
		} else {
			this.inherited(arguments);
		}
	}, _setImage:function (e) {
		var xOff = (e.pageX - this.offset.l) / this.offset.w, yOff = (e.pageY - this.offset.t) / this.offset.h, x = (this._zoomSize.w * xOff * -1) + (this.glassSize * xOff), y = (this._zoomSize.h * yOff * -1) + (this.glassSize * yOff);
		this.img.setShape({x:x, y:y});
	}});
}

