/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.MultiComboBox"]) {
	dojo._hasResource["dojox.form.MultiComboBox"] = true;
	dojo.provide("dojox.form.MultiComboBox");
	dojo.experimental("dojox.form.MultiComboBox");
	dojo.require("dijit.form.ComboBox");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.declare("dojox.form.MultiComboBox", [dijit.form.ValidationTextBox, dijit.form.ComboBoxMixin], {delimiter:",", _previousMatches:false, _setValueAttr:function (value) {
		if (this.delimiter && value.length != 0) {
			value = value + this.delimiter + " ";
			arguments[0] = this._addPreviousMatches(value);
		}
		this.inherited(arguments);
	}, _addPreviousMatches:function (text) {
		if (this._previousMatches) {
			if (!text.match(new RegExp("^" + this._previousMatches))) {
				text = this._previousMatches + text;
			}
			text = this._cleanupDelimiters(text);
		}
		return text;
	}, _cleanupDelimiters:function (text) {
		if (this.delimiter) {
			text = text.replace(new RegExp("  +"), " ");
			text = text.replace(new RegExp("^ *" + this.delimiter + "* *"), "");
			text = text.replace(new RegExp(this.delimiter + " *" + this.delimiter), this.delimiter);
		}
		return text;
	}, _autoCompleteText:function (text) {
		arguments[0] = this._addPreviousMatches(text);
		this.inherited(arguments);
	}, _startSearch:function (text) {
		text = this._cleanupDelimiters(text);
		var re = new RegExp("^.*" + this.delimiter + " *");
		if ((this._previousMatches = text.match(re))) {
			arguments[0] = text.replace(re, "");
		}
		this.inherited(arguments);
	}});
}

