/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.CollapsibleToolbar"]) {
	dojo._hasResource["dojox.editor.plugins.CollapsibleToolbar"] = true;
	dojo.provide("dojox.editor.plugins.CollapsibleToolbar");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.Button");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "CollapsibleToolbar", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dojox.editor.plugins._CollapsibleToolbarButton", [dijit._Widget, dijit._Templated], {templateString:"<div tabindex='0' role='button' title='${title}' class='${buttonClass}' " + "dojoAttachEvent='ondijitclick: onClick'><span class='${textClass}'>${text}</span></div>", title:"", buttonClass:"", text:"", textClass:"", onClick:function (e) {
	}});
	dojo.declare("dojox.editor.plugins.CollapsibleToolbar", dijit._editor._Plugin, {_myWidgets:null, setEditor:function (editor) {
		this.editor = editor;
		this._constructContainer();
	}, _constructContainer:function () {
		var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "CollapsibleToolbar");
		this._myWidgets = [];
		var container = dojo.create("table", {style:{width:"100%"}, tabindex:-1, "class":"dojoxCollapsibleToolbarContainer"});
		var tbody = dojo.create("tbody", {tabindex:-1}, container);
		var row = dojo.create("tr", {tabindex:-1}, tbody);
		var openTd = dojo.create("td", {"class":"dojoxCollapsibleToolbarControl", tabindex:-1}, row);
		var closeTd = dojo.create("td", {"class":"dojoxCollapsibleToolbarControl", tabindex:-1}, row);
		var menuTd = dojo.create("td", {style:{width:"100%"}, tabindex:-1}, row);
		var m = dojo.create("span", {style:{width:"100%"}, tabindex:-1}, menuTd);
		var collapseButton = new dojox.editor.plugins._CollapsibleToolbarButton({buttonClass:"dojoxCollapsibleToolbarCollapse", title:strings.collapse, text:"-", textClass:"dojoxCollapsibleToolbarCollapseText"});
		dojo.place(collapseButton.domNode, openTd);
		var expandButton = new dojox.editor.plugins._CollapsibleToolbarButton({buttonClass:"dojoxCollapsibleToolbarExpand", title:strings.expand, text:"+", textClass:"dojoxCollapsibleToolbarExpandText"});
		dojo.place(expandButton.domNode, closeTd);
		this._myWidgets.push(collapseButton);
		this._myWidgets.push(expandButton);
		dojo.style(closeTd, "display", "none");
		dojo.place(container, this.editor.toolbar.domNode, "after");
		dojo.place(this.editor.toolbar.domNode, m);
		this.openTd = openTd;
		this.closeTd = closeTd;
		this.menu = m;
		this.connect(collapseButton, "onClick", "_onClose");
		this.connect(expandButton, "onClick", "_onOpen");
	}, _onClose:function (e) {
		if (e) {
			dojo.stopEvent(e);
		}
		var size = dojo.marginBox(this.editor.domNode);
		dojo.style(this.openTd, "display", "none");
		dojo.style(this.closeTd, "display", "");
		dojo.style(this.menu, "display", "none");
		this.editor.resize({h:size.h});
		if (dojo.isIE) {
			this.editor.header.className = this.editor.header.className;
			this.editor.footer.className = this.editor.footer.className;
		}
		dijit.focus(this.closeTd.firstChild);
	}, _onOpen:function (e) {
		if (e) {
			dojo.stopEvent(e);
		}
		var size = dojo.marginBox(this.editor.domNode);
		dojo.style(this.closeTd, "display", "none");
		dojo.style(this.openTd, "display", "");
		dojo.style(this.menu, "display", "");
		this.editor.resize({h:size.h});
		if (dojo.isIE) {
			this.editor.header.className = this.editor.header.className;
			this.editor.footer.className = this.editor.footer.className;
		}
		dijit.focus(this.openTd.firstChild);
	}, destroy:function () {
		this.inherited(arguments);
		if (this._myWidgets) {
			while (this._myWidgets.length) {
				this._myWidgets.pop().destroy();
			}
			delete this._myWidgets;
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "collapsibletoolbar") {
			o.plugin = new dojox.editor.plugins.CollapsibleToolbar({});
		}
	});
}

