/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.uploader.Base"]) {
	dojo._hasResource["dojox.form.uploader.Base"] = true;
	dojo.provide("dojox.form.uploader.Base");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dojox.form.uploader.Base", [dijit._Widget, dijit._Templated], {getForm:function () {
		if (!this.form) {
			var n = this.domNode;
			while (n && n.tagName && n !== document.body) {
				if (n.tagName.toLowerCase() == "form") {
					this.form = n;
					break;
				}
				n = n.parentNode;
			}
		}
		return this.form;
	}, getUrl:function () {
		if (this.uploadUrl) {
			this.url = this.uploadUrl;
		}
		if (this.url) {
			return this.url;
		}
		if (this.getForm()) {
			this.url = this.form.action;
		}
		return this.url;
	}, connectForm:function () {
		this.url = this.getUrl();
		if (!this._fcon && !!this.getForm()) {
			this._fcon = true;
			this.connect(this.form, "onsubmit", function (evt) {
				dojo.stopEvent(evt);
				this.submit(dojo.formToObject(this.form));
			});
		}
	}, supports:function (what) {
		if (!this._hascache) {
			this._hascache = {testDiv:dojo.create("div"), testInput:dojo.create("input", {type:"file"}), xhr:!!window.XMLHttpRequest ? new XMLHttpRequest() : {}};
			dojo.style(this._hascache.testDiv, "opacity", 0.7);
		}
		switch (what) {
		  case "FormData":
			return !!window.FormData;
		  case "sendAsBinary":
			return !!this._hascache.xhr.sendAsBinary;
		  case "opacity":
			return dojo.style(this._hascache.testDiv, "opacity") == 0.7;
		  case "multiple":
			if (this.force == "flash" || this.force == "iframe") {
				return false;
			}
			var res = dojo.attr(this._hascache.testInput, "multiple");
			return res === true || res === false;
		}
		return false;
	}, getMimeType:function () {
		return "application/octet-stream";
	}, getFileType:function (name) {
		return name.substring(name.lastIndexOf(".") + 1).toUpperCase();
	}, convertBytes:function (bytes) {
		var kb = Math.round(bytes / 1024 * 100000) / 100000;
		var mb = Math.round(bytes / 1048576 * 100000) / 100000;
		var gb = Math.round(bytes / 1073741824 * 100000) / 100000;
		var value = bytes;
		if (kb > 1) {
			value = kb.toFixed(1) + " kb";
		}
		if (mb > 1) {
			value = mb.toFixed(1) + " mb";
		}
		if (gb > 1) {
			value = gb.toFixed(1) + " gb";
		}
		return {kb:kb, mb:mb, gb:gb, bytes:bytes, value:value};
	}});
}

