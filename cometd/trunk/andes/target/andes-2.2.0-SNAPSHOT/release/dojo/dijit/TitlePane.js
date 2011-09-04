/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.TitlePane"]) {
	dojo._hasResource["dijit.TitlePane"] = true;
	dojo.provide("dijit.TitlePane");
	dojo.require("dojo.fx");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit._CssStateMixin");
	dojo.declare("dijit.TitlePane", [dijit.layout.ContentPane, dijit._TemplatedMixin, dijit._CssStateMixin], {title:"", _setTitleAttr:{node:"titleNode", type:"innerHTML"}, open:true, toggleable:true, tabIndex:"0", duration:dijit.defaultDuration, baseClass:"dijitTitlePane", templateString:dojo.cache("dijit", "templates/TitlePane.html", "<div>\n\t<div dojoAttachEvent=\"onclick:_onTitleClick, onkeypress:_onTitleKey\"\n\t\t\tclass=\"dijitTitlePaneTitle\" dojoAttachPoint=\"titleBarNode\">\n\t\t<div class=\"dijitTitlePaneTitleFocus\" dojoAttachPoint=\"focusNode\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"arrowNode\" class=\"dijitArrowNode\" role=\"presentation\"\n\t\t\t/><span dojoAttachPoint=\"arrowNodeInner\" class=\"dijitArrowNodeInner\"></span\n\t\t\t><span dojoAttachPoint=\"titleNode\" class=\"dijitTitlePaneTextNode\"></span>\n\t\t</div>\n\t</div>\n\t<div class=\"dijitTitlePaneContentOuter\" dojoAttachPoint=\"hideNode\" role=\"presentation\">\n\t\t<div class=\"dijitReset\" dojoAttachPoint=\"wipeNode\" role=\"presentation\">\n\t\t\t<div class=\"dijitTitlePaneContentInner\" dojoAttachPoint=\"containerNode\" role=\"region\" id=\"${id}_pane\">\n\t\t\t\t<!-- nested divs because wipeIn()/wipeOut() doesn't work right on node w/padding etc.  Put padding on inner div. -->\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n"), _setTooltipAttr:{node:"focusNode", type:"attribute", attribute:"title"}, buildRendering:function () {
		this.inherited(arguments);
		dojo.setSelectable(this.titleNode, false);
	}, postCreate:function () {
		this.inherited(arguments);
		if (this.toggleable) {
			this._trackMouseState(this.titleBarNode, "dijitTitlePaneTitle");
		}
		var hideNode = this.hideNode, wipeNode = this.wipeNode;
		this._wipeIn = dojo.fx.wipeIn({node:this.wipeNode, duration:this.duration, beforeBegin:function () {
			hideNode.style.display = "";
		}});
		this._wipeOut = dojo.fx.wipeOut({node:this.wipeNode, duration:this.duration, onEnd:function () {
			hideNode.style.display = "none";
		}});
	}, _setOpenAttr:function (open, animate) {
		dojo.forEach([this._wipeIn, this._wipeOut], function (animation) {
			if (animation && animation.status() == "playing") {
				animation.stop();
			}
		});
		if (animate) {
			var anim = this[open ? "_wipeIn" : "_wipeOut"];
			anim.play();
		} else {
			this.hideNode.style.display = this.wipeNode.style.display = open ? "" : "none";
		}
		if (this._started) {
			if (open) {
				this._onShow();
			} else {
				this.onHide();
			}
		}
		this.arrowNodeInner.innerHTML = open ? "-" : "+";
		dijit.setWaiState(this.containerNode, "hidden", open ? "false" : "true");
		dijit.setWaiState(this.focusNode, "pressed", open ? "true" : "false");
		this._set("open", open);
		this._setCss();
	}, _setToggleableAttr:function (canToggle) {
		dijit.setWaiRole(this.focusNode, canToggle ? "button" : "heading");
		if (canToggle) {
			dijit.setWaiState(this.focusNode, "controls", this.id + "_pane");
			dojo.attr(this.focusNode, "tabIndex", this.tabIndex);
		} else {
			dojo.removeAttr(this.focusNode, "tabIndex");
		}
		this._set("toggleable", canToggle);
		this._setCss();
	}, _setContentAttr:function (content) {
		if (!this.open || !this._wipeOut || this._wipeOut.status() == "playing") {
			this.inherited(arguments);
		} else {
			if (this._wipeIn && this._wipeIn.status() == "playing") {
				this._wipeIn.stop();
			}
			dojo.marginBox(this.wipeNode, {h:dojo.marginBox(this.wipeNode).h});
			this.inherited(arguments);
			if (this._wipeIn) {
				this._wipeIn.play();
			} else {
				this.hideNode.style.display = "";
			}
		}
	}, toggle:function () {
		this._setOpenAttr(!this.open, true);
	}, _setCss:function () {
		var node = this.titleBarNode || this.focusNode;
		var oldCls = this._titleBarClass;
		this._titleBarClass = "dijit" + (this.toggleable ? "" : "Fixed") + (this.open ? "Open" : "Closed");
		dojo.replaceClass(node, this._titleBarClass, oldCls || "");
		this.arrowNodeInner.innerHTML = this.open ? "-" : "+";
	}, _onTitleKey:function (e) {
		if (e.charOrCode == dojo.keys.ENTER || e.charOrCode == " ") {
			if (this.toggleable) {
				this.toggle();
			}
			dojo.stopEvent(e);
		} else {
			if (e.charOrCode == dojo.keys.DOWN_ARROW && this.open) {
				this.containerNode.focus();
				e.preventDefault();
			}
		}
	}, _onTitleClick:function () {
		if (this.toggleable) {
			this.toggle();
		}
	}, setTitle:function (title) {
		dojo.deprecated("dijit.TitlePane.setTitle() is deprecated.  Use set('title', ...) instead.", "", "2.0");
		this.set("title", title);
	}});
}

