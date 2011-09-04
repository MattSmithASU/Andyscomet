/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.SafePaste"]) {
	dojo._hasResource["dojox.editor.plugins.SafePaste"] = true;
	dojo.provide("dojox.editor.plugins.SafePaste");
	dojo.require("dojox.editor.plugins.PasteFromWord");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "SafePaste", null, "ROOT");
	dojo.declare("dojox.editor.plugins.SafePaste", [dojox.editor.plugins.PasteFromWord], {_initButton:function () {
		var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "SafePaste");
		this._uId = dijit.getUniqueId(this.editor.id);
		strings.uId = this._uId;
		strings.width = this.width || "400px";
		strings.height = this.height || "300px";
		this._dialog = new dijit.Dialog({title:strings["paste"]}).placeAt(dojo.body());
		this._dialog.set("content", dojo.string.substitute(this._template, strings));
		dojo.style(dojo.byId(this._uId + "_rte"), "opacity", 0.001);
		this.connect(dijit.byId(this._uId + "_paste"), "onClick", "_paste");
		this.connect(dijit.byId(this._uId + "_cancel"), "onClick", "_cancel");
		this.connect(this._dialog, "onHide", "_clearDialog");
	}, updateState:function () {
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			var spFunc = dojo.hitch(this, function (e) {
				if (e) {
					dojo.stopEvent(e);
				}
				this._openDialog();
				return true;
			});
			this.connect(this.editor.editNode, "onpaste", spFunc);
			this.editor._pasteImpl = spFunc;
		}));
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "safepaste") {
			o.plugin = new dojox.editor.plugins.SafePaste({width:("width" in o.args) ? o.args.width : "400px", height:("height" in o.args) ? o.args.width : "300px"});
		}
	});
}

