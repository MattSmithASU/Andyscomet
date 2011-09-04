/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile._ComboBoxMenu"]) {
	dojo._hasResource["dojox.mobile._ComboBoxMenu"] = true;
	dojo.provide("dojox.mobile._ComboBoxMenu");
	dojo.require("dijit.form._ComboBoxMenuMixin");
	dojo.require("dijit._WidgetBase");
	dojo.require("dojox.mobile._ListTouchMixin");
	dojo.require("dojox.mobile.scrollable");
	dojo.declare("dojox.mobile._ComboBoxMenu", [dijit._WidgetBase, dojox.mobile._ListTouchMixin, dijit.form._ComboBoxMenuMixin], {baseClass:"mblComboBoxMenu", buildRendering:function () {
		this.focusNode = this.domNode = dojo.create("div", {style:{overflow:"hidden"}, "class":"mblReset"});
		this.containerNode = dojo.create("div", {}, this.domNode, "last");
		this.previousButton = dojo.create("div", {"class":"mblComboBoxMenuItem mblComboBoxMenuPreviousButton", role:"option"}, this.containerNode, "last");
		this.nextButton = dojo.create("div", {"class":"mblComboBoxMenuItem mblComboBoxMenuNextButton", role:"option"}, this.containerNode, "last");
		this.inherited(arguments);
	}, _createMenuItem:function () {
		return dojo.create("div", {"class":"mblReset mblComboBoxMenuItem" + (this.isLeftToRight() ? "" : " mblComboBoxMenuItemRtl"), role:"option"});
	}, onSelect:function (node) {
		dojo.addClass(node, "mblComboBoxMenuItemSelected");
	}, onDeselect:function (node) {
		dojo.removeClass(node, "mblComboBoxMenuItemSelected");
	}, onOpen:function () {
		this.scrollable.init({domNode:this.domNode, containerNode:this.domNode.firstChild});
		this.scrollable.scrollTo({x:0, y:0});
	}, postCreate:function () {
		this.inherited(arguments);
		this.scrollable = new dojox.mobile.scrollable();
		this.scrollable.resize = dojo.hitch(this, "onClose", null);
	}});
}

