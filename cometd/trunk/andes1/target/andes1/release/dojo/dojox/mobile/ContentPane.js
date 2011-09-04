/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.ContentPane"]) {
	dojo._hasResource["dojox.mobile.ContentPane"] = true;
	dojo.provide("dojox.mobile.ContentPane");
	dojo.require("dijit._WidgetBase");
	dojo.require("dijit._Container");
	dojo.require("dijit._Contained");
	dojo.require("dojo._base.xhr");
	dojo.declare("dojox.mobile.ContentPane", [dijit._WidgetBase, dijit._Container, dijit._Contained], {href:"", content:"", parseOnLoad:true, prog:true, startup:function () {
		if (this._started) {
			return;
		}
		if (this.prog) {
			this._p = dojox.mobile.ProgressIndicator.getInstance();
		}
		if (this.href) {
			this.set("href", this.href);
		} else {
			if (this.content) {
				this.set("content", this.content);
			}
		}
		var parent = this.getParent && this.getParent();
		if (!parent || !parent.resize) {
			this.resize();
		}
		this.inherited(arguments);
	}, resize:function () {
		dojo.forEach(this.getChildren(), function (child) {
			if (child.resize) {
				child.resize();
			}
		});
	}, loadHandler:function (response) {
		this.set("content", response);
	}, errorHandler:function (err) {
		if (p) {
			p.stop();
		}
	}, onLoad:function () {
	}, _setHrefAttr:function (href) {
		var p = this._p;
		if (p) {
			dojo.body().appendChild(p.domNode);
			p.start();
		}
		this.href = href;
		dojo.xhrGet({url:href, handleAs:"text", load:dojo.hitch(this, "loadHandler"), error:dojo.hitch(this, "errorHandler")});
	}, _setContentAttr:function (data) {
		this.destroyDescendants();
		if (typeof data === "object") {
			this.domNode.appendChild(data);
		} else {
			this.domNode.innerHTML = data;
		}
		if (this.parseOnLoad) {
			dojo.parser.parse(this.domNode);
		}
		if (this._p) {
			this._p.stop();
		}
		this.onLoad();
	}});
}

