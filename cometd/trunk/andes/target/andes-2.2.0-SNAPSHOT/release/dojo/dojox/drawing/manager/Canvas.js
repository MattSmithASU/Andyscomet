/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.manager.Canvas"]) {
	dojo._hasResource["dojox.drawing.manager.Canvas"] = true;
	dojo.provide("dojox.drawing.manager.Canvas");
	(function () {
		dojox.drawing.manager.Canvas = dojox.drawing.util.oo.declare(function (options) {
			dojo.mixin(this, options);
			var dim = dojo.contentBox(this.srcRefNode);
			this.height = this.parentHeight = dim.h;
			this.width = this.parentWidth = dim.w;
			this.domNode = dojo.create("div", {id:"canvasNode"}, this.srcRefNode);
			dojo.style(this.domNode, {width:this.width, height:"auto"});
			dojo.setSelectable(this.domNode, false);
			this.id = this.id || this.util.uid("surface");
			console.info("create canvas");
			this.gfxSurface = dojox.gfx.createSurface(this.domNode, this.width, this.height);
			this.gfxSurface.whenLoaded(this, function () {
				setTimeout(dojo.hitch(this, function () {
					this.surfaceReady = true;
					if (dojo.isIE) {
					} else {
						if (dojox.gfx.renderer == "silverlight") {
							this.id = this.domNode.firstChild.id;
						} else {
						}
					}
					this.underlay = this.gfxSurface.createGroup();
					this.surface = this.gfxSurface.createGroup();
					this.overlay = this.gfxSurface.createGroup();
					this.surface.setTransform({dx:0, dy:0, xx:1, yy:1});
					this.gfxSurface.getDimensions = dojo.hitch(this.gfxSurface, "getDimensions");
					if (options.callback) {
						options.callback(this.domNode);
					}
				}), 500);
			});
			this._mouseHandle = this.mouse.register(this);
		}, {zoom:1, useScrollbars:true, baseClass:"drawingCanvas", resize:function (width, height) {
			this.parentWidth = width;
			this.parentHeight = height;
			this.setDimensions(width, height);
		}, setDimensions:function (width, height, scrollx, scrolly) {
			var sw = this.getScrollWidth();
			this.width = Math.max(width, this.parentWidth);
			this.height = Math.max(height, this.parentHeight);
			if (this.height > this.parentHeight) {
				this.width -= sw;
			}
			if (this.width > this.parentWidth) {
				this.height -= sw;
			}
			this.mouse.resize(this.width, this.height);
			this.gfxSurface.setDimensions(this.width, this.height);
			this.domNode.parentNode.scrollTop = scrolly || 0;
			this.domNode.parentNode.scrollLeft = scrollx || 0;
			if (this.useScrollbars) {
				dojo.style(this.domNode.parentNode, {overflowY:this.height > this.parentHeight ? "scroll" : "hidden", overflowX:this.width > this.parentWidth ? "scroll" : "hidden"});
			} else {
				dojo.style(this.domNode.parentNode, {overflowY:"hidden", overflowX:"hidden"});
			}
		}, setZoom:function (zoom) {
			this.zoom = zoom;
			this.surface.setTransform({xx:zoom, yy:zoom});
			this.setDimensions(this.width * zoom, this.height * zoom);
		}, onScroll:function () {
		}, getScrollOffset:function () {
			return {top:this.domNode.parentNode.scrollTop, left:this.domNode.parentNode.scrollLeft};
		}, getScrollWidth:function () {
			var p = dojo.create("div");
			p.innerHTML = "<div style=\"width:50px;height:50px;overflow:hidden;position:absolute;top:0;left:-1000px;\"><div style=\"height:100px;\"></div>";
			var div = p.firstChild;
			dojo.body().appendChild(div);
			var noscroll = dojo.contentBox(div).h;
			dojo.style(div, "overflow", "scroll");
			var scrollWidth = noscroll - dojo.contentBox(div).h;
			dojo.destroy(div);
			this.getScrollWidth = function () {
				return scrollWidth;
			};
			return scrollWidth;
		}});
	})();
}

