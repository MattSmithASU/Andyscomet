/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.av.widget.ProgressSlider"]) {
	dojo._hasResource["dojox.av.widget.ProgressSlider"] = true;
	dojo.provide("dojox.av.widget.ProgressSlider");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dojox.av.widget.ProgressSlider", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dojox.av.widget", "resources/ProgressSlider.html", "<div class=\"Progress\" dojoAttachEvent=\"mousedown:startDrag\">\n	\n	<div class=\"ProgressLoaded\" dojoAttachPoint=\"progressLoaded\"></div>\n	<div class=\"ProgressPosition\" dojoAttachPoint=\"progressPosition\"></div>\n\t<div class=\"ProgressHandle\" dojoAttachPoint=\"handle\" dojoAttachEvent=\"mouseover:handleOver, mouseout:handleOut\"></div>\n</div>\n"), postCreate:function () {
		this.seeking = false;
		this.handleWidth = dojo.marginBox(this.handle).w;
		var dim = dojo.coords(this.domNode);
		this.finalWidth = dim.w;
		this.width = dim.w - this.handleWidth;
		this.x = dim.x;
		dojo.setSelectable(this.domNode, false);
		dojo.setSelectable(this.handle, false);
	}, setMedia:function (med, playerWidget) {
		this.playerWidget = playerWidget;
		this.media = med;
		dojo.connect(this.media, "onMetaData", this, function (data) {
			if (data && data.duration) {
				this.duration = data.duration;
			}
		});
		dojo.connect(this.media, "onEnd", this, function () {
			dojo.disconnect(this.posCon);
			this.setHandle(this.duration);
		});
		dojo.connect(this.media, "onStart", this, function () {
			this.posCon = dojo.connect(this.media, "onPosition", this, "setHandle");
		});
		dojo.connect(this.media, "onDownloaded", this, function (percent) {
			this.setLoadedPosition(percent * 0.01);
			this.width = this.finalWidth * 0.01 * percent;
		});
	}, onDrag:function (evt) {
		var x = evt.clientX - this.x;
		if (x < 0) {
			x = 0;
		}
		if (x > this.width - this.handleWidth) {
			x = this.width - this.handleWidth;
		}
		var p = x / this.finalWidth;
		this.media.seek(this.duration * p);
		dojo.style(this.handle, "marginLeft", x + "px");
		dojo.style(this.progressPosition, "width", x + "px");
	}, startDrag:function () {
		dojo.setSelectable(this.playerWidget.domNode, false);
		this.seeking = true;
		this.cmove = dojo.connect(dojo.doc, "mousemove", this, "onDrag");
		this.cup = dojo.connect(dojo.doc, "mouseup", this, "endDrag");
	}, endDrag:function () {
		dojo.setSelectable(this.playerWidget.domNode, true);
		this.seeking = false;
		if (this.cmove) {
			dojo.disconnect(this.cmove);
		}
		if (this.cup) {
			dojo.disconnect(this.cup);
		}
		this.handleOut();
	}, setHandle:function (time) {
		if (!this.seeking) {
			var w = this.width - this.handleWidth;
			var p = time / this.duration;
			var x = p * w;
			dojo.style(this.handle, "marginLeft", x + "px");
			dojo.style(this.progressPosition, "width", x + "px");
		}
	}, setLoadedPosition:function (decimal) {
		dojo.style(this.progressLoaded, "width", (this.finalWidth * decimal) + "px");
	}, handleOver:function () {
		dojo.addClass(this.handle, "over");
	}, handleOut:function () {
		if (!this.seeking) {
			dojo.removeClass(this.handle, "over");
		}
	}, onResize:function (playerDimensions) {
		var dim = dojo.coords(this.domNode);
		this.finalWidth = dim.w;
	}});
}

