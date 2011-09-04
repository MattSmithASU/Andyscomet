/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._DialogMixin"]) {
	dojo._hasResource["dijit._DialogMixin"] = true;
	dojo.provide("dijit._DialogMixin");
	dojo.require("dijit._Widget");
	dojo.declare("dijit._DialogMixin", null, {execute:function (formContents) {
	}, onCancel:function () {
	}, onExecute:function () {
	}, _onSubmit:function () {
		this.onExecute();
		this.execute(this.get("value"));
	}, _getFocusItems:function () {
		var elems = dijit._getTabNavigable(this.containerNode);
		this._firstFocusItem = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
		this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
	}});
}

