/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.widget.ExpandoPane"]) {
	dojo._hasResource["andes.widget.ExpandoPane"] = true;
	dojo.provide("andes.widget.ExpandoPane");
	dojo.require("dojox.layout.ExpandoPane");
	dojo.declare("andes.widget.ExpandoPane", dojox.layout.ExpandoPane, {minSize:160, rememberState:true, startup:function () {
		this.inherited(arguments);
		this.openButtonNode = dojo.create("div", {id:"helpPaneOpenButton", innerHTML:"&nbsp;"});
		dojo.style(this.openButtonNode, "display", "none");
		dojo.place(this.openButtonNode, dojo.byId("drawing"), "last");
		dojo.connect(this.openButtonNode, "onclick", this, "openHelp");
		if (dojo.isIE) {
			dojo.addClass(this.iconNode, "IEHelpIconFix");
			dojo.addClass(this.titleNode, "IEHelpTileFix");
			dojo.style(this.titleWrapper, "height", "30px");
		}
		var scoreContainerNode = dojo.create("div", {className:"helpScore", innerHTML:"Score: <span>0</span>%"}, this.titleWrapper, "last");
		this.scoreNode = dojo.query("span", scoreContainerNode)[0];
		if (this.rememberState) {
			dojo.connect(this, "toggle", this, function (arg) {
				this._setCookie();
			});
		}
		dojo.addOnLoad(this, "initLayout");
	}, _setCookie:function () {
		var _isOpen = this._showing ? "open" : "closed";
		dojo.cookie("helpPane", _isOpen, {expires:999});
	}, initLayout:function () {
		var ck = dojo.cookie("helpPane");
		if (ck && ck == "open") {
			this.toggle();
		}
		dojo.connect(dijit.byId("helpInput"), "onKeyUp", this, function (evt) {
			if (evt.keyCode == 13) {
				dijit.byId("helpSubmit").onClick();
			}
		});
		dojo.connect(this, "resize", this, function () {
			if (this._contentBox.w && this._contentBox.w > 52) {
				dojo.style(dijit.byId("helpInput").domNode, "width", this._contentBox.w - 52 + "px");
			}
		});
	}, _setupAnims:function () {
		this._closedSize = 0;
		this.inherited(arguments);
	}, _showEnd:function () {
		dojo.style(this.openButtonNode, "display", "none");
		this.inherited(arguments);
	}, _hideEnd:function () {
		this.inherited(arguments);
		dojo.style(this.openButtonNode, {display:"block", opacity:0});
		dojo.fadeIn({node:this.openButtonNode}).play();
	}, score:function (value) {
		if (typeof value != "undefined") {
			this.scoreNode.innerHTML = value;
		}
		return this.scoreNode.innerHTML;
	}, open:function () {
		if (!this._showing) {
			this.toggle();
		}
	}, openHelp:function () {
		dijit.byId("helpInput").attr("value", "");
		if (dijit.byId("helpContentPane").attr("content").length == 0) {
			dijit.byId("helpSubmit").onClick();
		}
		this.toggle();
	}});
}

