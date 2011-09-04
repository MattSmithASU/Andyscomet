/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.ComboBox"]) {
	dojo._hasResource["dijit.form.ComboBox"] = true;
	dojo.provide("dijit.form.ComboBox");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dijit.form.ComboBoxMixin");
	dojo.declare("dijit.form.ComboBox", [dijit.form.ValidationTextBox, dijit.form.ComboBoxMixin], {});
}

