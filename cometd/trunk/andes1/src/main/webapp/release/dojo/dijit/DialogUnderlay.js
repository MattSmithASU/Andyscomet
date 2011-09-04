/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.DialogUnderlay"]) {
	dojo._hasResource["dijit.DialogUnderlay"] = true;
	dojo.provide("dijit.DialogUnderlay");
	dojo.require("dojo.window");
	dojo.require("dijit._Widget");
	dojo.require("dijit._TemplatedMixin");
	dojo.declare("dijit.DialogUnderlay", [dijit._Widget, dijit._TemplatedMixin], {templateString:"<div class='dijitDialogUnderlayWrapper'><div class='dijitDialogUnderlay' dojoAttachPoint='node'></div></div>", dialogId:"", "class":"", _setDialogIdAttr:function (id) {
		dojo.attr(this.node, "id", id + "_underlay");
		this._set("dialogId", id);
	}, _setClassAttr:function (clazz) {
		this.node.className = "dijitDialogUnderlay " + clazz;
		this._set("class", clazz);
	}, postCreate:function () {
		dojo.body().appendChild(this.domNode);
	}, layout:function () {
		var is = this.node.style, os = this.domNode.style;
		os.display = "none";
		var viewport = dojo.window.getBox();
		os.top = viewport.t + "px";
		os.left = viewport.l + "px";
		is.width = viewport.w + "px";
		is.height = viewport.h + "px";
		os.display = "block";
	}, show:function () {
		this.domNode.style.display = "block";
		this.layout();
		this.bgIframe = new dijit.BackgroundIframe(this.domNode);
	}, hide:function () {
		this.bgIframe.destroy();
		delete this.bgIframe;
		this.domNode.style.display = "none";
	}});
}

