/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid._RowSelector"]) {
	dojo._hasResource["dojox.grid._RowSelector"] = true;
	dojo.provide("dojox.grid._RowSelector");
	dojo.require("dojox.grid._View");
	dojo.declare("dojox.grid._RowSelector", dojox.grid._View, {defaultWidth:"2em", noscroll:true, padBorderWidth:2, buildRendering:function () {
		this.inherited("buildRendering", arguments);
		this.scrollboxNode.style.overflow = "hidden";
		this.headerNode.style.visibility = "hidden";
	}, getWidth:function () {
		return this.viewWidth || this.defaultWidth;
	}, buildRowContent:function (inRowIndex, inRowNode) {
		var w = this.contentWidth || 0;
		inRowNode.innerHTML = "<table class=\"dojoxGridRowbarTable\" style=\"width:" + w + "px;height:1px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"><tr><td class=\"dojoxGridRowbarInner\">&nbsp;</td></tr></table>";
	}, renderHeader:function () {
	}, updateRow:function () {
	}, resize:function () {
		this.adaptHeight();
	}, adaptWidth:function () {
		if (!("contentWidth" in this) && this.contentNode) {
			this.contentWidth = this.contentNode.offsetWidth - this.padBorderWidth;
		}
	}, doStyleRowNode:function (inRowIndex, inRowNode) {
		var n = ["dojoxGridRowbar dojoxGridNonNormalizedCell"];
		if (this.grid.rows.isOver(inRowIndex)) {
			n.push("dojoxGridRowbarOver");
		}
		if (this.grid.selection.isSelected(inRowIndex)) {
			n.push("dojoxGridRowbarSelected");
		}
		inRowNode.className = n.join(" ");
	}, domouseover:function (e) {
		this.grid.onMouseOverRow(e);
	}, domouseout:function (e) {
		if (!this.isIntraRowEvent(e)) {
			this.grid.onMouseOutRow(e);
		}
	}});
}

