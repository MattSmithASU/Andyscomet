/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.TextColor"]) {
	dojo._hasResource["dijit._editor.plugins.TextColor"] = true;
	dojo.provide("dijit._editor.plugins.TextColor");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.DropDownButton");
	dojo.require("dijit.ColorPalette");
	dojo.declare("dijit._editor.plugins.TextColor", dijit._editor._Plugin, {buttonClass:dijit.form.DropDownButton, useDefaultCommand:false, constructor:function () {
		this.dropDown = new dijit.ColorPalette();
		this.connect(this.dropDown, "onChange", function (color) {
			this.editor.execCommand(this.command, color);
		});
	}, updateState:function () {
		var _e = this.editor;
		var _c = this.command;
		if (!_e || !_e.isLoaded || !_c.length) {
			return;
		}
		if (this.button) {
			var disabled = this.get("disabled");
			this.button.set("disabled", disabled);
			if (disabled) {
				return;
			}
			var value;
			try {
				value = _e.queryCommandValue(_c) || "";
			}
			catch (e) {
				value = "";
			}
		}
		if (value == "") {
			value = "#000000";
		}
		if (value == "transparent") {
			value = "#ffffff";
		}
		if (typeof value == "string") {
			if (value.indexOf("rgb") > -1) {
				value = dojo.colorFromRgb(value).toHex();
			}
		} else {
			value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
			value = value.toString(16);
			value = "#000000".slice(0, 7 - value.length) + value;
		}
		if (value !== this.dropDown.get("value")) {
			this.dropDown.set("value", value, false);
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		switch (o.args.name) {
		  case "foreColor":
		  case "hiliteColor":
			o.plugin = new dijit._editor.plugins.TextColor({command:o.args.name});
		}
	});
}

