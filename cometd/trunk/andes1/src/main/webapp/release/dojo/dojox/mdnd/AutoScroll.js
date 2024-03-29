/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mdnd.AutoScroll"]) {
	dojo._hasResource["dojox.mdnd.AutoScroll"] = true;
	dojo.provide("dojox.mdnd.AutoScroll");
	dojo.declare("dojox.mdnd.AutoScroll", null, {interval:3, recursiveTimer:10, marginMouse:50, constructor:function () {
		this.resizeHandler = dojo.connect(dojo.global, "onresize", this, function () {
			this.getViewport();
		});
		dojo.ready(dojo.hitch(this, "init"));
	}, init:function () {
		this._html = (dojo.isWebKit) ? dojo.body() : dojo.body().parentNode;
		this.getViewport();
	}, getViewport:function () {
		var d = dojo.doc, dd = d.documentElement, w = window, b = dojo.body();
		if (dojo.isMozilla) {
			this._v = {"w":dd.clientWidth, "h":w.innerHeight};
		} else {
			if (!dojo.isOpera && w.innerWidth) {
				this._v = {"w":w.innerWidth, "h":w.innerHeight};
			} else {
				if (!dojo.isOpera && dd && dd.clientWidth) {
					this._v = {"w":dd.clientWidth, "h":dd.clientHeight};
				} else {
					if (b.clientWidth) {
						this._v = {"w":b.clientWidth, "h":b.clientHeight};
					}
				}
			}
		}
	}, setAutoScrollNode:function (node) {
		this._node = node;
	}, setAutoScrollMaxPage:function () {
		this._yMax = this._html.scrollHeight;
		this._xMax = this._html.scrollWidth;
	}, checkAutoScroll:function (e) {
		if (this._autoScrollActive) {
			this.stopAutoScroll();
		}
		this._y = e.pageY;
		this._x = e.pageX;
		if (e.clientX < this.marginMouse) {
			this._autoScrollActive = true;
			this._autoScrollLeft(e);
		} else {
			if (e.clientX > this._v.w - this.marginMouse) {
				this._autoScrollActive = true;
				this._autoScrollRight(e);
			}
		}
		if (e.clientY < this.marginMouse) {
			this._autoScrollActive = true;
			this._autoScrollUp(e);
		} else {
			if (e.clientY > this._v.h - this.marginMouse) {
				this._autoScrollActive = true;
				this._autoScrollDown();
			}
		}
	}, _autoScrollDown:function () {
		if (this._timer) {
			clearTimeout(this._timer);
		}
		if (this._autoScrollActive && this._y + this.marginMouse < this._yMax) {
			this._html.scrollTop += this.interval;
			this._node.style.top = (parseInt(this._node.style.top) + this.interval) + "px";
			this._y += this.interval;
			this._timer = setTimeout(dojo.hitch(this, "_autoScrollDown"), this.recursiveTimer);
		}
	}, _autoScrollUp:function () {
		if (this._timer) {
			clearTimeout(this._timer);
		}
		if (this._autoScrollActive && this._y - this.marginMouse > 0) {
			this._html.scrollTop -= this.interval;
			this._node.style.top = (parseInt(this._node.style.top) - this.interval) + "px";
			this._y -= this.interval;
			this._timer = setTimeout(dojo.hitch(this, "_autoScrollUp"), this.recursiveTimer);
		}
	}, _autoScrollRight:function () {
		if (this._timer) {
			clearTimeout(this._timer);
		}
		if (this._autoScrollActive && this._x + this.marginMouse < this._xMax) {
			this._html.scrollLeft += this.interval;
			this._node.style.left = (parseInt(this._node.style.left) + this.interval) + "px";
			this._x += this.interval;
			this._timer = setTimeout(dojo.hitch(this, "_autoScrollRight"), this.recursiveTimer);
		}
	}, _autoScrollLeft:function (e) {
		if (this._timer) {
			clearTimeout(this._timer);
		}
		if (this._autoScrollActive && this._x - this.marginMouse > 0) {
			this._html.scrollLeft -= this.interval;
			this._node.style.left = (parseInt(this._node.style.left) - this.interval) + "px";
			this._x -= this.interval;
			this._timer = setTimeout(dojo.hitch(this, "_autoScrollLeft"), this.recursiveTimer);
		}
	}, stopAutoScroll:function () {
		if (this._timer) {
			clearTimeout(this._timer);
		}
		this._autoScrollActive = false;
	}, destroy:function () {
		dojo.disconnect(this.resizeHandler);
	}});
	dojox.mdnd.autoScroll = null;
	(function () {
		dojox.mdnd.autoScroll = new dojox.mdnd.AutoScroll();
	}());
}

