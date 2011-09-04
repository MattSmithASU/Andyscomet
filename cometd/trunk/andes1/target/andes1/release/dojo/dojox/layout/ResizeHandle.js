/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.ResizeHandle"]) {
	dojo._hasResource["dojox.layout.ResizeHandle"] = true;
	dojo.provide("dojox.layout.ResizeHandle");
	dojo.experimental("dojox.layout.ResizeHandle");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dojo.fx");
	dojo.require("dojo.window");
	dojo.declare("dojox.layout.ResizeHandle", [dijit._Widget, dijit._Templated], {targetId:"", targetContainer:null, resizeAxis:"xy", activeResize:false, activeResizeClass:"dojoxResizeHandleClone", animateSizing:true, animateMethod:"chain", animateDuration:225, minHeight:100, minWidth:100, constrainMax:false, maxHeight:0, maxWidth:0, fixedAspect:false, intermediateChanges:false, startTopic:"/dojo/resize/start", endTopic:"/dojo/resize/stop", templateString:"<div dojoAttachPoint=\"resizeHandle\" class=\"dojoxResizeHandle\"><div></div></div>", postCreate:function () {
		this.connect(this.resizeHandle, "onmousedown", "_beginSizing");
		if (!this.activeResize) {
			this._resizeHelper = dijit.byId("dojoxGlobalResizeHelper");
			if (!this._resizeHelper) {
				this._resizeHelper = new dojox.layout._ResizeHelper({id:"dojoxGlobalResizeHelper"}).placeAt(dojo.body());
				dojo.addClass(this._resizeHelper.domNode, this.activeResizeClass);
			}
		} else {
			this.animateSizing = false;
		}
		if (!this.minSize) {
			this.minSize = {w:this.minWidth, h:this.minHeight};
		}
		if (this.constrainMax) {
			this.maxSize = {w:this.maxWidth, h:this.maxHeight};
		}
		this._resizeX = this._resizeY = false;
		var addClass = dojo.partial(dojo.addClass, this.resizeHandle);
		switch (this.resizeAxis.toLowerCase()) {
		  case "xy":
			this._resizeX = this._resizeY = true;
			addClass("dojoxResizeNW");
			break;
		  case "x":
			this._resizeX = true;
			addClass("dojoxResizeW");
			break;
		  case "y":
			this._resizeY = true;
			addClass("dojoxResizeN");
			break;
		}
	}, _beginSizing:function (e) {
		if (this._isSizing) {
			return false;
		}
		dojo.publish(this.startTopic, [this]);
		this.targetWidget = dijit.byId(this.targetId);
		this.targetDomNode = this.targetWidget ? this.targetWidget.domNode : dojo.byId(this.targetId);
		if (this.targetContainer) {
			this.targetDomNode = this.targetContainer;
		}
		if (!this.targetDomNode) {
			return false;
		}
		if (!this.activeResize) {
			var c = dojo.position(this.targetDomNode, true);
			console.log(c);
			console.log(dojo.window.getBox());
			this._resizeHelper.resize({l:c.x, t:c.y, w:c.w, h:c.h});
			this._resizeHelper.show();
		}
		this._isSizing = true;
		this.startPoint = {x:e.clientX, y:e.clientY};
		var mb = this.targetWidget ? dojo.marginBox(this.targetDomNode) : dojo.contentBox(this.targetDomNode);
		this.startSize = {w:mb.w, h:mb.h};
		if (this.fixedAspect) {
			var max, val;
			if (mb.w > mb.h) {
				max = "w";
				val = mb.w / mb.h;
			} else {
				max = "h";
				val = mb.h / mb.w;
			}
			this._aspect = {prop:max};
			this._aspect[max] = val;
		}
		this._pconnects = [];
		this._pconnects.push(dojo.connect(dojo.doc, "onmousemove", this, "_updateSizing"));
		this._pconnects.push(dojo.connect(dojo.doc, "onmouseup", this, "_endSizing"));
		dojo.stopEvent(e);
	}, _updateSizing:function (e) {
		if (this.activeResize) {
			this._changeSizing(e);
		} else {
			var tmp = this._getNewCoords(e);
			if (tmp === false) {
				return;
			}
			this._resizeHelper.resize(tmp);
		}
		e.preventDefault();
	}, _getNewCoords:function (e) {
		try {
			if (!e.clientX || !e.clientY) {
				return false;
			}
		}
		catch (e) {
			return false;
		}
		this._activeResizeLastEvent = e;
		var dx = (this.isLeftToRight() ? this.startPoint.x - e.clientX : e.clientX - this.startPoint.x), dy = this.startPoint.y - e.clientY, newW = this.startSize.w - (this._resizeX ? dx : 0), newH = this.startSize.h - (this._resizeY ? dy : 0);
		return this._checkConstraints(newW, newH);
	}, _checkConstraints:function (newW, newH) {
		if (this.minSize) {
			var tm = this.minSize;
			if (newW < tm.w) {
				newW = tm.w;
			}
			if (newH < tm.h) {
				newH = tm.h;
			}
		}
		if (this.constrainMax && this.maxSize) {
			var ms = this.maxSize;
			if (newW > ms.w) {
				newW = ms.w;
			}
			if (newH > ms.h) {
				newH = ms.h;
			}
		}
		if (this.fixedAspect) {
			var ta = this._aspect[this._aspect.prop];
			if (newW < newH) {
				newH = newW * ta;
			} else {
				if (newH < newW) {
					newW = newH * ta;
				}
			}
		}
		return {w:newW, h:newH};
	}, _changeSizing:function (e) {
		var tmp = this._getNewCoords(e);
		if (tmp === false) {
			return;
		}
		if (this.targetWidget && dojo.isFunction(this.targetWidget.resize)) {
			this.targetWidget.resize(tmp);
		} else {
			if (this.animateSizing) {
				var anim = dojo.fx[this.animateMethod]([dojo.animateProperty({node:this.targetDomNode, properties:{width:{start:this.startSize.w, end:tmp.w}}, duration:this.animateDuration}), dojo.animateProperty({node:this.targetDomNode, properties:{height:{start:this.startSize.h, end:tmp.h}}, duration:this.animateDuration})]);
				anim.play();
			} else {
				dojo.style(this.targetDomNode, {width:tmp.w + "px", height:tmp.h + "px"});
			}
		}
		if (this.intermediateChanges) {
			this.onResize(e);
		}
	}, _endSizing:function (e) {
		dojo.forEach(this._pconnects, dojo.disconnect);
		var pub = dojo.partial(dojo.publish, this.endTopic, [this]);
		if (!this.activeResize) {
			this._resizeHelper.hide();
			this._changeSizing(e);
			setTimeout(pub, this.animateDuration + 15);
		} else {
			pub();
		}
		this._isSizing = false;
		this.onResize(e);
	}, onResize:function (e) {
	}});
	dojo.declare("dojox.layout._ResizeHelper", dijit._Widget, {show:function () {
		dojo.fadeIn({node:this.domNode, duration:120, beforeBegin:function (n) {
			dojo.style(n, "display", "");
		}}).play();
	}, hide:function () {
		dojo.fadeOut({node:this.domNode, duration:250, onEnd:function (n) {
			dojo.style(n, "display", "none");
		}}).play();
	}, resize:function (dim) {
		dojo.marginBox(this.domNode, dim);
	}});
}

