/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.StatusBar"]) {
	dojo._hasResource["dojox.editor.plugins.StatusBar"] = true;
	dojo.provide("dojox.editor.plugins.StatusBar");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dojox.layout.ResizeHandle");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "StatusBar", null, "");
	dojo.experimental("dojox.editor.plugins.StatusBar");
	dojo.declare("dojox.editor.plugins._StatusBar", [dijit._Widget, dijit._Templated], {templateString:"<div class=\"dojoxEditorStatusBar\">" + "<table><tbody><tr>" + "<td class=\"dojoxEditorStatusBarText\" tabindex=\"-1\" aria-role=\"presentation\" aria-live=\"aggressive\"><span dojoAttachPoint=\"barContent\">&nbsp;</span></td>" + "<td><span dojoAttachPoint=\"handle\"></span></td>" + "</tr></tbody><table>" + "</div>", _getValueAttr:function () {
		return this.barContent.innerHTML;
	}, _setValueAttr:function (str) {
		if (str) {
			str = dojo.trim(str);
			if (!str) {
				str = "&nbsp;";
			}
		} else {
			str = "&nbsp;";
		}
		this.barContent.innerHTML = str;
	}});
	dojo.declare("dojox.editor.plugins.StatusBar", dijit._editor._Plugin, {statusBar:null, resizer:true, setEditor:function (editor) {
		this.editor = editor;
		this.statusBar = new dojox.editor.plugins._StatusBar();
		if (this.resizer) {
			this.resizeHandle = new dojox.layout.ResizeHandle({targetId:this.editor, activeResize:true}, this.statusBar.handle);
			this.resizeHandle.startup();
		} else {
			dojo.style(this.statusBar.handle.parentNode, "display", "none");
		}
		var pos = null;
		if (editor.footer.lastChild) {
			pos = "after";
		}
		dojo.place(this.statusBar.domNode, editor.footer.lastChild || editor.footer, pos);
		this.statusBar.startup();
		this.editor.statusBar = this;
		this._msgListener = dojo.subscribe(this.editor.id + "_statusBar", dojo.hitch(this, this._setValueAttr));
	}, _getValueAttr:function () {
		return this.statusBar.get("value");
	}, _setValueAttr:function (str) {
		this.statusBar.set("value", str);
	}, set:function (attr, val) {
		if (attr) {
			var fName = "_set" + attr.charAt(0).toUpperCase() + attr.substring(1, attr.length) + "Attr";
			if (dojo.isFunction(this[fName])) {
				this[fName](val);
			} else {
				this[attr] = val;
			}
		}
	}, get:function (attr) {
		if (attr) {
			var fName = "_get" + attr.charAt(0).toUpperCase() + attr.substring(1, attr.length) + "Attr";
			var f = this[fName];
			if (dojo.isFunction(f)) {
				return this[fName]();
			} else {
				return this[attr];
			}
		}
		return null;
	}, destroy:function () {
		if (this.statusBar) {
			this.statusBar.destroy();
			delete this.statusBar;
		}
		if (this.resizeHandle) {
			this.resizeHandle.destroy();
			delete this.resizeHandle;
		}
		if (this._msgListener) {
			dojo.unsubscribe(this._msgListener);
			delete this._msgListener;
		}
		delete this.editor.statusBar;
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "statusbar") {
			var resizer = ("resizer" in o.args) ? o.args.resizer : true;
			o.plugin = new dojox.editor.plugins.StatusBar({resizer:resizer});
		}
	});
}

