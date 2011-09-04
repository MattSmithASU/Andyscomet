/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Textarea"]) {
	dojo._hasResource["dijit.form.Textarea"] = true;
	dojo.provide("dijit.form.Textarea");
	dojo.require("dijit.form.SimpleTextarea");
	dojo.require("dijit.form._ExpandingTextAreaMixin");
	dojo.declare("dijit.form.Textarea", [dijit.form.SimpleTextarea, dijit.form._ExpandingTextAreaMixin], {baseClass:"dijitTextBox dijitTextArea dijitExpandingTextArea", cols:"", buildRendering:function () {
		this.inherited(arguments);
		dojo.style(this.textbox, {overflowY:"hidden", overflowX:"auto", boxSizing:"border-box", MsBoxSizing:"border-box", WebkitBoxSizing:"border-box", MozBoxSizing:"border-box"});
	}});
}

