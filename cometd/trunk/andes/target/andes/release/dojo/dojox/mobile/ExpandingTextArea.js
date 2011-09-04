/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.ExpandingTextArea"]) {
	dojo._hasResource["dojox.mobile.ExpandingTextArea"] = true;
	dojo.provide("dojox.mobile.ExpandingTextArea");
	dojo.require("dojox.mobile.TextArea");
	dojo.require("dijit.form._ExpandingTextAreaMixin");
	dojo.declare("dojox.mobile.ExpandingTextArea", [dojox.mobile.TextArea, dijit.form._ExpandingTextAreaMixin], {baseClass:"mblTextArea mblExpandingTextArea"});
}

