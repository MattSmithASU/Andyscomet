/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.exporter._ExportWriter"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.exporter._ExportWriter"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.exporter._ExportWriter");
	dojo.require("dojox.grid.enhanced.plugins.Exporter");
	dojo.declare("dojox.grid.enhanced.plugins.exporter._ExportWriter", null, {constructor:function (writerArgs) {
	}, _getExportDataForCell:function (rowIndex, rowItem, cell, grid) {
		var data = (cell.get || grid.get).call(cell, rowIndex, rowItem);
		if (this.formatter) {
			return this.formatter(data, cell, rowIndex, rowItem);
		} else {
			return data;
		}
	}, beforeHeader:function (grid) {
		return true;
	}, afterHeader:function () {
	}, beforeContent:function (items) {
		return true;
	}, afterContent:function () {
	}, beforeContentRow:function (argObj) {
		return true;
	}, afterContentRow:function (argObj) {
	}, beforeView:function (argObj) {
		return true;
	}, afterView:function (argObj) {
	}, beforeSubrow:function (argObj) {
		return true;
	}, afterSubrow:function (argObj) {
	}, handleCell:function (argObj) {
	}, toString:function () {
		return "";
	}});
}

