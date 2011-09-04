/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.ToggleDir"]) {
	dojo._hasResource["dijit._editor.plugins.ToggleDir"] = true;
	dojo.provide("dijit._editor.plugins.ToggleDir");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.ToggleButton");
	dojo.experimental("dijit._editor.plugins.ToggleDir");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.ToggleButton");
	dojo.declare("dijit._editor.plugins.ToggleDir", dijit._editor._Plugin, {useDefaultCommand:false, command:"toggleDir", buttonClass:dijit.form.ToggleButton, _initButton:function () {
		this.inherited(arguments);
		this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			var editDoc = this.editor.editorObject.contentWindow.document.documentElement;
			editDoc = editDoc.getElementsByTagName("body")[0];
			var isLtr = dojo.getComputedStyle(editDoc).direction == "ltr";
			this.button.set("checked", !isLtr);
			this.connect(this.button, "onChange", "_setRtl");
		}));
	}, updateState:function () {
		this.button.set("disabled", this.get("disabled"));
	}, _setRtl:function (rtl) {
		var dir = "ltr";
		if (rtl) {
			dir = "rtl";
		}
		var editDoc = this.editor.editorObject.contentWindow.document.documentElement;
		editDoc = editDoc.getElementsByTagName("body")[0];
		editDoc.dir = dir;
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		switch (o.args.name) {
		  case "toggleDir":
			o.plugin = new dijit._editor.plugins.ToggleDir({command:o.args.name});
		}
	});
}

