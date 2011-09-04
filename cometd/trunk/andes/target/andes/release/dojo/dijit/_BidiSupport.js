/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._BidiSupport"]) {
	dojo._hasResource["dijit._BidiSupport"] = true;
	dojo.provide("dijit._BidiSupport");
	dojo.require("dijit._WidgetBase");
	dojo.extend(dijit._WidgetBase, {getTextDir:function (text) {
		return this.textDir == "auto" ? this._checkContextual(text) : this.textDir;
	}, _checkContextual:function (text) {
		var fdc = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(text);
		return fdc ? (fdc[0] <= "z" ? "ltr" : "rtl") : this.dir ? this.dir : this.isLeftToRight() ? "ltr" : "rtl";
	}, applyTextDir:function (element, text) {
		var textDir = this.textDir == "auto" ? this._checkContextual(text) : this.textDir;
		if (element.dir != textDir) {
			element.dir = textDir;
		}
	}});
}

