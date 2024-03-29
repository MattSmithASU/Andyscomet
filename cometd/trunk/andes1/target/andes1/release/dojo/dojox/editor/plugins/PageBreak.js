/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.PageBreak"]) {
	dojo._hasResource["dojox.editor.plugins.PageBreak"] = true;
	dojo.provide("dojox.editor.plugins.PageBreak");
	dojo.require("dijit._editor.html");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "PageBreak", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dojox.editor.plugins.PageBreak", dijit._editor._Plugin, {useDefaultCommand:false, iconClassPrefix:"dijitAdditionalEditorIcon", _unbreakableNodes:["li", "ul", "ol"], _pbContent:"<hr style='page-break-after: always;' class='dijitEditorPageBreak'>", _initButton:function () {
		var ed = this.editor;
		var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "PageBreak");
		this.button = new dijit.form.Button({label:strings["pageBreak"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "PageBreak", tabIndex:"-1", onClick:dojo.hitch(this, "_insertPageBreak")});
		ed.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			ed.addKeyHandler(dojo.keys.ENTER, true, true, dojo.hitch(this, this._insertPageBreak));
			if (dojo.isWebKit || dojo.isOpera) {
				this.connect(this.editor, "onKeyDown", dojo.hitch(this, function (e) {
					if ((e.keyCode === dojo.keys.ENTER) && e.ctrlKey && e.shiftKey) {
						this._insertPageBreak();
					}
				}));
			}
		}));
	}, updateState:function () {
		this.button.set("disabled", this.get("disabled"));
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
	}, _style:function () {
		if (!this._styled) {
			this._styled = true;
			var doc = this.editor.document;
			var style = ".dijitEditorPageBreak {\n" + "\tborder-top-style: solid;\n" + "\tborder-top-width: 3px;\n" + "\tborder-top-color: #585858;\n" + "\tborder-bottom-style: solid;\n" + "\tborder-bottom-width: 1px;\n" + "\tborder-bottom-color: #585858;\n" + "\tborder-left-style: solid;\n" + "\tborder-left-width: 1px;\n" + "\tborder-left-color: #585858;\n" + "\tborder-right-style: solid;\n" + "\tborder-right-width: 1px;\n" + "\tborder-right-color: #585858;\n" + "\tcolor: #A4A4A4;\n" + "\tbackground-color: #A4A4A4;\n" + "\theight: 10px;\n" + "\tpage-break-after: always;\n" + "\tpadding: 0px 0px 0px 0px;\n" + "}\n\n" + "@media print {\n" + "\t.dijitEditorPageBreak { page-break-after: always; " + "background-color: rgba(0,0,0,0); color: rgba(0,0,0,0); " + "border: 0px none rgba(0,0,0,0); display: hidden; " + "width: 0px; height: 0px;}\n" + "}";
			if (!dojo.isIE) {
				var sNode = doc.createElement("style");
				sNode.appendChild(doc.createTextNode(style));
				doc.getElementsByTagName("head")[0].appendChild(sNode);
			} else {
				var ss = doc.createStyleSheet("");
				ss.cssText = style;
			}
		}
	}, _insertPageBreak:function () {
		try {
			if (!this._styled) {
				this._style();
			}
			if (this._allowBreak()) {
				this.editor.execCommand("inserthtml", this._pbContent);
			}
		}
		catch (e) {
			console.warn(e);
		}
	}, _allowBreak:function () {
		var ed = this.editor;
		var doc = ed.document;
		var node = ed._sCall("getSelectedElement", null) || ed._sCall("getParentElement", null);
		while (node && node !== doc.body && node !== doc.html) {
			if (ed._sCall("isTag", [node, this._unbreakableNodes])) {
				return false;
			}
			node = node.parentNode;
		}
		return true;
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "pagebreak") {
			o.plugin = new dojox.editor.plugins.PageBreak({});
		}
	});
}

