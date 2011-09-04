/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.PrettyPrint"]) {
	dojo._hasResource["dojox.editor.plugins.PrettyPrint"] = true;
	dojo.provide("dojox.editor.plugins.PrettyPrint");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dojox.html.format");
	dojo.declare("dojox.editor.plugins.PrettyPrint", dijit._editor._Plugin, {indentBy:-1, lineLength:-1, useDefaultCommand:false, entityMap:null, _initButton:function () {
		delete this.command;
	}, setToolbar:function (toolbar) {
	}, setEditor:function (editor) {
		this.inherited(arguments);
		var self = this;
		this.editor.onLoadDeferred.addCallback(function () {
			self.editor._prettyprint_getValue = self.editor.getValue;
			self.editor.getValue = function () {
				var val = self.editor._prettyprint_getValue(arguments);
				return dojox.html.format.prettyPrint(val, self.indentBy, self.lineLength, self.entityMap, self.xhtml);
			};
			self.editor._prettyprint_endEditing = self.editor._endEditing;
			self.editor._prettyprint_onBlur = self.editor._onBlur;
			self.editor._endEditing = function (ignore_caret) {
				var v = self.editor._prettyprint_getValue(true);
				self.editor._undoedSteps = [];
				self.editor._steps.push({text:v, bookmark:self.editor._getBookmark()});
			};
			self.editor._onBlur = function (e) {
				this.inherited("_onBlur", arguments);
				var _c = self.editor._prettyprint_getValue(true);
				if (_c != self.editor.savedContent) {
					self.editor.onChange(_c);
					self.editor.savedContent = _c;
				}
			};
		});
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "prettyprint") {
			o.plugin = new dojox.editor.plugins.PrettyPrint({indentBy:("indentBy" in o.args) ? o.args.indentBy : -1, lineLength:("lineLength" in o.args) ? o.args.lineLength : -1, entityMap:("entityMap" in o.args) ? o.args.entityMap : dojox.html.entities.html.concat([["\xa2", "cent"], ["\xa3", "pound"], ["\u20ac", "euro"], ["\xa5", "yen"], ["\xa9", "copy"], ["\xa7", "sect"], ["\u2026", "hellip"], ["\xae", "reg"]]), xhtml:("xhtml" in o.args) ? o.args.xhtml : false});
		}
	});
}

