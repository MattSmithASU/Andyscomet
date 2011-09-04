/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.SimpleTextarea"]) {
	dojo._hasResource["dijit.form.SimpleTextarea"] = true;
	dojo.provide("dijit.form.SimpleTextarea");
	dojo.require("dijit.form.TextBox");
	dojo.declare("dijit.form.SimpleTextarea", dijit.form.TextBox, {baseClass:"dijitTextBox dijitTextArea", rows:"3", cols:"20", templateString:"<textarea ${!nameAttrSetting} dojoAttachPoint='focusNode,containerNode,textbox' autocomplete='off'></textarea>", postMixInProperties:function () {
		if (!this.value && this.srcNodeRef) {
			this.value = this.srcNodeRef.value;
		}
		this.inherited(arguments);
	}, buildRendering:function () {
		this.inherited(arguments);
		if (dojo.isIE && this.cols) {
			dojo.addClass(this.textbox, "dijitTextAreaCols");
		}
	}, filter:function (value) {
		if (value) {
			value = value.replace(/\r/g, "");
		}
		return this.inherited(arguments);
	}, _onInput:function (e) {
		if (this.maxLength) {
			var maxLength = parseInt(this.maxLength);
			var value = this.textbox.value.replace(/\r/g, "");
			var overflow = value.length - maxLength;
			if (overflow > 0) {
				var textarea = this.textbox;
				if (textarea.selectionStart) {
					var pos = textarea.selectionStart;
					var cr = 0;
					if (dojo.isOpera) {
						cr = (this.textbox.value.substring(0, pos).match(/\r/g) || []).length;
					}
					this.textbox.value = value.substring(0, pos - overflow - cr) + value.substring(pos - cr);
					textarea.setSelectionRange(pos - overflow, pos - overflow);
				} else {
					if (dojo.doc.selection) {
						textarea.focus();
						var range = dojo.doc.selection.createRange();
						range.moveStart("character", -overflow);
						range.text = "";
						range.select();
					}
				}
			}
		}
		this.inherited(arguments);
	}});
}

