/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.RadioGroup"]) {
	dojo._hasResource["dojox.layout.RadioGroup"] = true;
	dojo.provide("dojox.layout.RadioGroup");
	dojo.experimental("dojox.layout.RadioGroup");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Contained");
	dojo.require("dijit.layout.StackContainer");
	dojo.require("dojo.fx.easing");
	dojo.declare("dojox.layout.RadioGroup", [dijit.layout.StackContainer, dijit._Templated], {duration:750, hasButtons:false, buttonClass:"dojox.layout._RadioButton", templateString:"<div class=\"dojoxRadioGroup\">" + " \t<div dojoAttachPoint=\"buttonHolder\" style=\"display:none;\">" + "\t\t<table class=\"dojoxRadioButtons\"><tbody><tr class=\"dojoxRadioButtonRow\" dojoAttachPoint=\"buttonNode\"></tr></tbody></table>" + "\t</div>" + "\t<div class=\"dojoxRadioView\" dojoAttachPoint=\"containerNode\"></div>" + "</div>", startup:function () {
		this.inherited(arguments);
		this._children = this.getChildren();
		this._buttons = this._children.length;
		this._size = dojo.coords(this.containerNode);
		if (this.hasButtons) {
			dojo.style(this.buttonHolder, "display", "block");
		}
	}, _setupChild:function (child) {
		dojo.style(child.domNode, "position", "absolute");
		if (this.hasButtons) {
			var tmp = this.buttonNode.appendChild(dojo.create("td"));
			var n = dojo.create("div", null, tmp), _Button = dojo.getObject(this.buttonClass), tmpw = new _Button({label:child.title, page:child}, n);
			dojo.mixin(child, {_radioButton:tmpw});
			tmpw.startup();
		}
		child.domNode.style.display = "none";
	}, removeChild:function (child) {
		if (this.hasButtons && child._radioButton) {
			child._radioButton.destroy();
			delete child._radioButton;
		}
		this.inherited(arguments);
	}, _transition:function (newWidget, oldWidget) {
		this._showChild(newWidget);
		if (oldWidget) {
			this._hideChild(oldWidget);
		}
		if (this.doLayout && newWidget.resize) {
			newWidget.resize(this._containerContentBox || this._contentBox);
		}
	}, _showChild:function (page) {
		var children = this.getChildren();
		page.isFirstChild = (page == children[0]);
		page.isLastChild = (page == children[children.length - 1]);
		page.selected = true;
		page.domNode.style.display = "";
		if (page._onShow) {
			page._onShow();
		} else {
			if (page.onShow) {
				page.onShow();
			}
		}
	}, _hideChild:function (page) {
		page.selected = false;
		page.domNode.style.display = "none";
		if (page.onHide) {
			page.onHide();
		}
	}});
	dojo.declare("dojox.layout.RadioGroupFade", dojox.layout.RadioGroup, {_hideChild:function (page) {
		dojo.fadeOut({node:page.domNode, duration:this.duration, onEnd:dojo.hitch(this, "inherited", arguments, arguments)}).play();
	}, _showChild:function (page) {
		this.inherited(arguments);
		dojo.style(page.domNode, "opacity", 0);
		dojo.fadeIn({node:page.domNode, duration:this.duration}).play();
	}});
	dojo.declare("dojox.layout.RadioGroupSlide", dojox.layout.RadioGroup, {easing:"dojo.fx.easing.backOut", zTop:99, constructor:function () {
		if (dojo.isString(this.easing)) {
			this.easing = dojo.getObject(this.easing);
		}
	}, _positionChild:function (page) {
		if (!this._size) {
			return;
		}
		var rA = true, rB = true;
		switch (page.slideFrom) {
		  case "bottom":
			rB = !rB;
			break;
		  case "right":
			rA = !rA;
			rB = !rB;
			break;
		  case "top":
			break;
		  case "left":
			rA = !rA;
			break;
		  default:
			rA = Math.round(Math.random());
			rB = Math.round(Math.random());
			break;
		}
		var prop = rA ? "top" : "left", val = (rB ? "-" : "") + (this._size[rA ? "h" : "w"] + 20) + "px";
		dojo.style(page.domNode, prop, val);
	}, _showChild:function (page) {
		var children = this.getChildren();
		page.isFirstChild = (page == children[0]);
		page.isLastChild = (page == children[children.length - 1]);
		page.selected = true;
		dojo.style(page.domNode, {zIndex:this.zTop, display:""});
		if (this._anim && this._anim.status() == "playing") {
			this._anim.gotoPercent(100, true);
		}
		this._anim = dojo.animateProperty({node:page.domNode, properties:{left:0, top:0}, duration:this.duration, easing:this.easing, onEnd:dojo.hitch(page, function () {
			if (this.onShow) {
				this.onShow();
			}
			if (this._onShow) {
				this._onShow();
			}
		}), beforeBegin:dojo.hitch(this, "_positionChild", page)});
		this._anim.play();
	}, _hideChild:function (page) {
		page.selected = false;
		page.domNode.style.zIndex = this.zTop - 1;
		if (page.onHide) {
			page.onHide();
		}
	}});
	dojo.declare("dojox.layout._RadioButton", [dijit._Widget, dijit._Templated, dijit._Contained], {label:"", page:null, templateString:"<div dojoAttachPoint=\"focusNode\" class=\"dojoxRadioButton\"><span dojoAttachPoint=\"titleNode\" class=\"dojoxRadioButtonLabel\">${label}</span></div>", startup:function () {
		this.connect(this.domNode, "onmouseenter", "_onMouse");
	}, _onMouse:function (e) {
		this.getParent().selectChild(this.page);
		this._clearSelected();
		dojo.addClass(this.domNode, "dojoxRadioButtonSelected");
	}, _clearSelected:function () {
		dojo.query(".dojoxRadioButtonSelected", this.domNode.parentNode.parentNode).removeClass("dojoxRadioButtonSelected");
	}});
	dojo.extend(dijit._Widget, {slideFrom:"random"});
}

