/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor._Plugin"]) {
	dojo._hasResource["dijit._editor._Plugin"] = true;
	dojo.provide("dijit._editor._Plugin");
	dojo.require("dijit._Widget");
	dojo.require("dijit.form.Button");
	dojo.declare("dijit._editor._Plugin", null, {constructor:function (args, node) {
		this.params = args || {};
		dojo.mixin(this, this.params);
		this._connects = [];
		this._attrPairNames = {};
	}, editor:null, iconClassPrefix:"dijitEditorIcon", button:null, command:"", useDefaultCommand:true, buttonClass:dijit.form.Button, disabled:false, getLabel:function (key) {
		return this.editor.commands[key];
	}, _initButton:function () {
		if (this.command.length) {
			var label = this.getLabel(this.command), editor = this.editor, className = this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1);
			if (!this.button) {
				var props = dojo.mixin({label:label, dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:className, dropDown:this.dropDown, tabIndex:"-1"}, this.params || {});
				this.button = new this.buttonClass(props);
			}
		}
		if (this.get("disabled") && this.button) {
			this.button.set("disabled", this.get("disabled"));
		}
	}, destroy:function () {
		dojo.forEach(this._connects, dojo.disconnect);
		if (this.dropDown) {
			this.dropDown.destroyRecursive();
		}
	}, connect:function (o, f, tf) {
		this._connects.push(dojo.connect(o, f, this, tf));
	}, updateState:function () {
		var e = this.editor, c = this.command, checked, enabled;
		if (!e || !e.isLoaded || !c.length) {
			return;
		}
		var disabled = this.get("disabled");
		if (this.button) {
			try {
				enabled = !disabled && e.queryCommandEnabled(c);
				if (this.enabled !== enabled) {
					this.enabled = enabled;
					this.button.set("disabled", !enabled);
				}
				if (typeof this.button.checked == "boolean") {
					checked = e.queryCommandState(c);
					if (this.checked !== checked) {
						this.checked = checked;
						this.button.set("checked", e.queryCommandState(c));
					}
				}
			}
			catch (e) {
				console.log(e);
			}
		}
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		if (this.button && this.useDefaultCommand) {
			if (this.editor.queryCommandAvailable(this.command)) {
				this.connect(this.button, "onClick", dojo.hitch(this.editor, "execCommand", this.command, this.commandArg));
			} else {
				this.button.domNode.style.display = "none";
			}
		}
		this.connect(this.editor, "onNormalizedDisplayChanged", "updateState");
	}, setToolbar:function (toolbar) {
		if (this.button) {
			toolbar.addChild(this.button);
		}
	}, set:function (name, value) {
		if (typeof name === "object") {
			for (var x in name) {
				this.set(x, name[x]);
			}
			return this;
		}
		var names = this._getAttrNames(name);
		if (this[names.s]) {
			var result = this[names.s].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			this._set(name, value);
		}
		return result || this;
	}, get:function (name) {
		var names = this._getAttrNames(name);
		return this[names.g] ? this[names.g]() : this[name];
	}, _setDisabledAttr:function (disabled) {
		this.disabled = disabled;
		this.updateState();
	}, _getAttrNames:function (name) {
		var apn = this._attrPairNames;
		if (apn[name]) {
			return apn[name];
		}
		var uc = name.charAt(0).toUpperCase() + name.substr(1);
		return (apn[name] = {s:"_set" + uc + "Attr", g:"_get" + uc + "Attr"});
	}, _set:function (name, value) {
		var oldValue = this[name];
		this[name] = value;
	}});
}

