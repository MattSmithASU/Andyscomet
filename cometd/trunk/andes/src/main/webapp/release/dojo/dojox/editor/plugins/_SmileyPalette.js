/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins._SmileyPalette"]) {
	dojo._hasResource["dojox.editor.plugins._SmileyPalette"] = true;
	dojo.provide("dojox.editor.plugins._SmileyPalette");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._PaletteMixin");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "Smiley", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.experimental("dojox.editor.plugins._SmileyPalette");
	dojo.declare("dojox.editor.plugins._SmileyPalette", [dijit._Widget, dijit._Templated, dijit._PaletteMixin], {templateString:"<table class=\"dijitInline dijitEditorSmileyPalette dijitPaletteTable\"" + " cellSpacing=0 cellPadding=0><tbody dojoAttachPoint=\"gridNode\"></tbody></table>", baseClass:"dijitEditorSmileyPalette", _palette:[["smile", "laughing", "wink", "grin"], ["cool", "angry", "half", "eyebrow"], ["frown", "shy", "goofy", "oops"], ["tongue", "idea", "angel", "happy"], ["yes", "no", "crying", ""]], dyeClass:"dojox.editor.plugins.Emoticon", buildRendering:function () {
		this.inherited(arguments);
		var i18n = dojo.i18n.getLocalization("dojox.editor.plugins", "Smiley");
		var emoticonI18n = {};
		for (var name in i18n) {
			if (name.substr(0, 8) == "emoticon") {
				emoticonI18n[name.substr(8).toLowerCase()] = i18n[name];
			}
		}
		this._preparePalette(this._palette, emoticonI18n);
	}});
	dojo.declare("dojox.editor.plugins.Emoticon", null, {constructor:function (id) {
		this.id = id;
	}, getValue:function () {
		return dojox.editor.plugins.Emoticon.ascii[this.id];
	}, imgHtml:function (clazz) {
		var eId = "emoticon" + this.id.substr(0, 1).toUpperCase() + this.id.substr(1), src = dojo.moduleUrl("dojox.editor.plugins", "resources/emoticons/" + eId + ".gif"), label = dojo.i18n.getLocalization("dojox.editor.plugins", "Smiley")[eId], html = ["<img src=\"", src, "\" class=\"", clazz, "\" alt=\"", this.getValue(), "\" title=\"", label, "\">"];
		return html.join("");
	}, fillCell:function (cell, blankGif) {
		dojo.place(this.imgHtml("dijitPaletteImg"), cell);
	}});
	dojox.editor.plugins.Emoticon.ascii = {smile:":-)", laughing:"lol", wink:";-)", grin:":-D", cool:"8-)", angry:":-@", half:":-/", eyebrow:"/:)", frown:":-(", shy:":-$", goofy:":-S", oops:":-O", tongue:":-P", idea:"(i)", yes:"(y)", no:"(n)", angel:"0:-)", crying:":'(", happy:"=)"};
	dojox.editor.plugins.Emoticon.fromAscii = function (str) {
		var ascii = dojox.editor.plugins.Emoticon.ascii;
		for (var i in ascii) {
			if (str == ascii[i]) {
				return new dojox.editor.plugins.Emoticon(i);
			}
		}
		return null;
	};
}

