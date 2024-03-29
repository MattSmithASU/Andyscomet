/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.ExpandoPane"]) {
	dojo._hasResource["dojox.layout.ExpandoPane"] = true;
	dojo.provide("dojox.layout.ExpandoPane");
	dojo.experimental("dojox.layout.ExpandoPane");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Contained");
	dojo.declare("dojox.layout.ExpandoPane", [dijit.layout.ContentPane, dijit._Templated, dijit._Contained, dijit._Container], {attributeMap:dojo.delegate(dijit.layout.ContentPane.prototype.attributeMap, {title:{node:"titleNode", type:"innerHTML"}}), templateString:dojo.cache("dojox.layout", "resources/ExpandoPane.html", "<div class=\"dojoxExpandoPane\">\n\t<div dojoAttachPoint=\"titleWrapper\" class=\"dojoxExpandoTitle\">\n\t\t<div class=\"dojoxExpandoIcon\" dojoAttachPoint=\"iconNode\" dojoAttachEvent=\"onclick:toggle\"><span class=\"a11yNode\">X</span></div>\t\t\t\n\t\t<span class=\"dojoxExpandoTitleNode\" dojoAttachPoint=\"titleNode\">${title}</span>\n\t</div>\n\t<div class=\"dojoxExpandoWrapper\" dojoAttachPoint=\"cwrapper\" dojoAttachEvent=\"ondblclick:_trap\">\n\t\t<div class=\"dojoxExpandoContent\" dojoAttachPoint=\"containerNode\"></div>\n\t</div>\n</div>\n"), easeOut:"dojo._DefaultEasing", easeIn:"dojo._DefaultEasing", duration:420, startExpanded:true, previewOpacity:0.75, previewOnDblClick:false, baseClass:"dijitExpandoPane", postCreate:function () {
		this.inherited(arguments);
		this._animConnects = [];
		this._isHorizontal = true;
		if (dojo.isString(this.easeOut)) {
			this.easeOut = dojo.getObject(this.easeOut);
		}
		if (dojo.isString(this.easeIn)) {
			this.easeIn = dojo.getObject(this.easeIn);
		}
		var thisClass = "", rtl = !this.isLeftToRight();
		if (this.region) {
			switch (this.region) {
			  case "trailing":
			  case "right":
				thisClass = rtl ? "Left" : "Right";
				break;
			  case "leading":
			  case "left":
				thisClass = rtl ? "Right" : "Left";
				break;
			  case "top":
				thisClass = "Top";
				break;
			  case "bottom":
				thisClass = "Bottom";
				break;
			}
			dojo.addClass(this.domNode, "dojoxExpando" + thisClass);
			dojo.addClass(this.iconNode, "dojoxExpandoIcon" + thisClass);
			this._isHorizontal = /top|bottom/.test(this.region);
		}
		dojo.style(this.domNode, {overflow:"hidden", padding:0});
		this.connect(this.domNode, "ondblclick", this.previewOnDblClick ? "preview" : "toggle");
		if (this.previewOnDblClick) {
			this.connect(this.getParent(), "_layoutChildren", dojo.hitch(this, function () {
				this._isonlypreview = false;
			}));
		}
	}, _startupSizes:function () {
		this._container = this.getParent();
		this._closedSize = this._titleHeight = dojo.marginBox(this.titleWrapper).h;
		if (this.splitter) {
			var myid = this.id;
			dijit.registry.filter(function (w) {
				return w && w.child && w.child.id == myid;
			}).forEach(dojo.hitch(this, function (w) {
				this.connect(w, "_stopDrag", "_afterResize");
			}));
		}
		this._currentSize = dojo.contentBox(this.domNode);
		this._showSize = this._currentSize[(this._isHorizontal ? "h" : "w")];
		this._setupAnims();
		if (this.startExpanded) {
			this._showing = true;
		} else {
			this._showing = false;
			this._hideWrapper();
			this._hideAnim.gotoPercent(99, true);
		}
		this._hasSizes = true;
	}, _afterResize:function (e) {
		var tmp = this._currentSize;
		this._currentSize = dojo.marginBox(this.domNode);
		var n = this._currentSize[(this._isHorizontal ? "h" : "w")];
		if (n > this._titleHeight) {
			if (!this._showing) {
				this._showing = !this._showing;
				this._showEnd();
			}
			this._showSize = n;
			this._setupAnims();
		} else {
			this._showSize = tmp[(this._isHorizontal ? "h" : "w")];
			this._showing = false;
			this._hideWrapper();
			this._hideAnim.gotoPercent(89, true);
		}
	}, _setupAnims:function () {
		dojo.forEach(this._animConnects, dojo.disconnect);
		var _common = {node:this.domNode, duration:this.duration}, isHorizontal = this._isHorizontal, showProps = {}, hideProps = {}, dimension = isHorizontal ? "height" : "width";
		showProps[dimension] = {end:this._showSize};
		hideProps[dimension] = {end:this._closedSize};
		this._showAnim = dojo.animateProperty(dojo.mixin(_common, {easing:this.easeIn, properties:showProps}));
		this._hideAnim = dojo.animateProperty(dojo.mixin(_common, {easing:this.easeOut, properties:hideProps}));
		this._animConnects = [dojo.connect(this._showAnim, "onEnd", this, "_showEnd"), dojo.connect(this._hideAnim, "onEnd", this, "_hideEnd")];
	}, preview:function () {
		if (!this._showing) {
			this._isonlypreview = !this._isonlypreview;
		}
		this.toggle();
	}, toggle:function () {
		if (this._showing) {
			this._hideWrapper();
			this._showAnim && this._showAnim.stop();
			this._hideAnim.play();
		} else {
			this._hideAnim && this._hideAnim.stop();
			this._showAnim.play();
		}
		this._showing = !this._showing;
	}, _hideWrapper:function () {
		dojo.addClass(this.domNode, "dojoxExpandoClosed");
		dojo.style(this.cwrapper, {visibility:"hidden", opacity:"0", overflow:"hidden"});
	}, _showEnd:function () {
		dojo.style(this.cwrapper, {opacity:0, visibility:"visible"});
		dojo.anim(this.cwrapper, {opacity:this._isonlypreview ? this.previewOpacity : 1}, 227);
		dojo.removeClass(this.domNode, "dojoxExpandoClosed");
		if (!this._isonlypreview) {
			setTimeout(dojo.hitch(this._container, "layout"), 15);
		} else {
			this._previewShowing = true;
			this.resize();
		}
	}, _hideEnd:function () {
		if (!this._isonlypreview) {
			setTimeout(dojo.hitch(this._container, "layout"), 25);
		} else {
			this._previewShowing = false;
		}
		this._isonlypreview = false;
	}, resize:function (newSize) {
		if (!this._hasSizes) {
			this._startupSizes(newSize);
		}
		var currentSize = dojo.marginBox(this.domNode);
		this._contentBox = {w:newSize && "w" in newSize ? newSize.w : currentSize.w, h:(newSize && "h" in newSize ? newSize.h : currentSize.h) - this._titleHeight};
		dojo.style(this.containerNode, "height", this._contentBox.h + "px");
		if (newSize) {
			dojo.marginBox(this.domNode, newSize);
		}
		this._layoutChildren();
	}, _trap:function (e) {
		dojo.stopEvent(e);
	}});
}

