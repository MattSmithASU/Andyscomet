/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.AlwaysShowToolbar"]) {
	dojo._hasResource["dijit._editor.plugins.AlwaysShowToolbar"] = true;
	dojo.provide("dijit._editor.plugins.AlwaysShowToolbar");
	dojo.require("dijit._editor._Plugin");
	dojo.declare("dijit._editor.plugins.AlwaysShowToolbar", dijit._editor._Plugin, {_handleScroll:true, setEditor:function (e) {
		if (!e.iframe) {
			console.log("Port AlwaysShowToolbar plugin to work with Editor without iframe");
			return;
		}
		this.editor = e;
		e.onLoadDeferred.addCallback(dojo.hitch(this, this.enable));
	}, enable:function (d) {
		this._updateHeight();
		this.connect(window, "onscroll", "globalOnScrollHandler");
		this.connect(this.editor, "onNormalizedDisplayChanged", "_updateHeight");
		return d;
	}, _updateHeight:function () {
		var e = this.editor;
		if (!e.isLoaded) {
			return;
		}
		if (e.height) {
			return;
		}
		var height = dojo._getMarginSize(e.editNode).h;
		if (dojo.isOpera) {
			height = e.editNode.scrollHeight;
		}
		if (!height) {
			height = dojo._getMarginSize(e.document.body).h;
		}
		if (height == 0) {
			console.debug("Can not figure out the height of the editing area!");
			return;
		}
		if (dojo.isIE <= 7 && this.editor.minHeight) {
			var min = parseInt(this.editor.minHeight);
			if (height < min) {
				height = min;
			}
		}
		if (height != this._lastHeight) {
			this._lastHeight = height;
			dojo.marginBox(e.iframe, {h:this._lastHeight});
		}
	}, _lastHeight:0, globalOnScrollHandler:function () {
		var isIE6 = dojo.isIE < 7;
		if (!this._handleScroll) {
			return;
		}
		var tdn = this.editor.header;
		var db = dojo.body;
		if (!this._scrollSetUp) {
			this._scrollSetUp = true;
			this._scrollThreshold = dojo.position(tdn, true).y;
		}
		var scrollPos = dojo._docScroll().y;
		var s = tdn.style;
		if (scrollPos > this._scrollThreshold && scrollPos < this._scrollThreshold + this._lastHeight) {
			if (!this._fixEnabled) {
				var tdnbox = dojo._getMarginSize(tdn);
				this.editor.iframe.style.marginTop = tdnbox.h + "px";
				if (isIE6) {
					s.left = dojo.position(tdn).x;
					if (tdn.previousSibling) {
						this._IEOriginalPos = ["after", tdn.previousSibling];
					} else {
						if (tdn.nextSibling) {
							this._IEOriginalPos = ["before", tdn.nextSibling];
						} else {
							this._IEOriginalPos = ["last", tdn.parentNode];
						}
					}
					dojo.body().appendChild(tdn);
					dojo.addClass(tdn, "dijitIEFixedToolbar");
				} else {
					s.position = "fixed";
					s.top = "0px";
				}
				dojo.marginBox(tdn, {w:tdnbox.w});
				s.zIndex = 2000;
				this._fixEnabled = true;
			}
			var eHeight = (this.height) ? parseInt(this.editor.height) : this.editor._lastHeight;
			s.display = (scrollPos > this._scrollThreshold + eHeight) ? "none" : "";
		} else {
			if (this._fixEnabled) {
				this.editor.iframe.style.marginTop = "";
				s.position = "";
				s.top = "";
				s.zIndex = "";
				s.display = "";
				if (isIE6) {
					s.left = "";
					dojo.removeClass(tdn, "dijitIEFixedToolbar");
					if (this._IEOriginalPos) {
						dojo.place(tdn, this._IEOriginalPos[1], this._IEOriginalPos[0]);
						this._IEOriginalPos = null;
					} else {
						dojo.place(tdn, this.editor.iframe, "before");
					}
				}
				s.width = "";
				this._fixEnabled = false;
			}
		}
	}, destroy:function () {
		this._IEOriginalPos = null;
		this._handleScroll = false;
		dojo.forEach(this._connects, dojo.disconnect);
		if (dojo.isIE < 7) {
			dojo.removeClass(this.editor.header, "dijitIEFixedToolbar");
		}
	}});
}

