/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.Print"]) {
	dojo._hasResource["dijit._editor.plugins.Print"] = true;
	dojo.provide("dijit._editor.plugins.Print");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.Button");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dijit._editor", "commands", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit._editor.plugins.Print", dijit._editor._Plugin, {_initButton:function () {
		var strings = dojo.i18n.getLocalization("dijit._editor", "commands"), editor = this.editor;
		this.button = new dijit.form.Button({label:strings["print"], dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "Print", tabIndex:"-1", onClick:dojo.hitch(this, "_print")});
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			if (!this.editor.iframe.contentWindow["print"]) {
				this.button.set("disabled", true);
			}
		}));
	}, updateState:function () {
		var disabled = this.get("disabled");
		if (!this.editor.iframe.contentWindow["print"]) {
			disabled = true;
		}
		this.button.set("disabled", disabled);
	}, _print:function () {
		var edFrame = this.editor.iframe;
		if (edFrame.contentWindow["print"]) {
			if (!dojo.isOpera && !dojo.isChrome) {
				dijit.focus(edFrame);
				edFrame.contentWindow.print();
			} else {
				var edDoc = this.editor.document;
				var content = this.editor.get("value");
				content = "<html><head><meta http-equiv='Content-Type' " + "content='text/html; charset='UTF-8'></head><body>" + content + "</body></html>";
				var win = window.open("javascript: ''", "", "status=0,menubar=0,location=0,toolbar=0," + "width=1,height=1,resizable=0,scrollbars=0");
				win.document.open();
				win.document.write(content);
				win.document.close();
				var styles = [];
				var styleNodes = edDoc.getElementsByTagName("style");
				if (styleNodes) {
					var i;
					for (i = 0; i < styleNodes.length; i++) {
						var style = styleNodes[i].innerHTML;
						var sNode = win.document.createElement("style");
						sNode.appendChild(win.document.createTextNode(style));
						win.document.getElementsByTagName("head")[0].appendChild(sNode);
					}
				}
				win.print();
				win.close();
			}
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "print") {
			o.plugin = new dijit._editor.plugins.Print({command:"print"});
		}
	});
}

