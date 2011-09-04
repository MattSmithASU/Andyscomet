/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.exporter.TableWriter"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.exporter.TableWriter"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.exporter.TableWriter");
	dojo.require("dojox.grid.enhanced.plugins.exporter._ExportWriter");
	dojox.grid.enhanced.plugins.Exporter.registerWriter("table", "dojox.grid.enhanced.plugins.exporter.TableWriter");
	dojo.declare("dojox.grid.enhanced.plugins.exporter.TableWriter", dojox.grid.enhanced.plugins.exporter._ExportWriter, {constructor:function (writerArgs) {
		this._viewTables = [];
		this._tableAttrs = writerArgs || {};
	}, _getTableAttrs:function (tagName) {
		var attrs = this._tableAttrs[tagName] || "";
		if (attrs && attrs[0] != " ") {
			attrs = " " + attrs;
		}
		return attrs;
	}, _getRowClass:function (arg_obj) {
		return arg_obj.isHeader ? " grid_header" : [" grid_row grid_row_", arg_obj.rowIdx + 1, arg_obj.rowIdx % 2 ? " grid_even_row" : " grid_odd_row"].join("");
	}, _getColumnClass:function (arg_obj) {
		var col_idx = arg_obj.cell.index + arg_obj.colOffset + 1;
		return [" grid_column_", col_idx, col_idx % 2 ? " grid_odd_column" : " grid_even_column"].join("");
	}, beforeView:function (arg_obj) {
		var viewIdx = arg_obj.viewIdx, table = this._viewTables[viewIdx], tagName, height, width = dojo.marginBox(arg_obj.view.contentNode).w;
		if (!table) {
			var left = 0;
			for (var i = 0; i < viewIdx; ++i) {
				left += this._viewTables[i]._width;
			}
			table = this._viewTables[viewIdx] = ["<table class=\"grid_view\" style=\"position: absolute; top: 0; left:", left, "px;\"", this._getTableAttrs("table"), ">"];
		}
		table._width = width;
		if (arg_obj.isHeader) {
			tagName = "thead";
			height = dojo.contentBox(arg_obj.view.headerContentNode).h;
		} else {
			tagName = "tbody";
			var rowNode = arg_obj.grid.getRowNode(arg_obj.rowIdx);
			if (rowNode) {
				height = dojo.contentBox(rowNode).h;
			} else {
				height = arg_obj.grid.scroller.averageRowHeight;
			}
		}
		table.push("<", tagName, " style=\"height:", height, "px; width:", width, "px;\"", " class=\"", this._getRowClass(arg_obj), "\"", this._getTableAttrs(tagName), ">");
		return true;
	}, afterView:function (arg_obj) {
		this._viewTables[arg_obj.viewIdx].push(arg_obj.isHeader ? "</thead>" : "</tbody>");
	}, beforeSubrow:function (arg_obj) {
		this._viewTables[arg_obj.viewIdx].push("<tr", this._getTableAttrs("tr"), ">");
		return true;
	}, afterSubrow:function (arg_obj) {
		this._viewTables[arg_obj.viewIdx].push("</tr>");
	}, handleCell:function (arg_obj) {
		var cell = arg_obj.cell;
		if (cell.hidden || dojo.indexOf(arg_obj.spCols, cell.index) >= 0) {
			return;
		}
		var cellTagName = arg_obj.isHeader ? "th" : "td", attrs = [cell.colSpan ? " colspan=\"" + cell.colSpan + "\"" : "", cell.rowSpan ? " rowspan=\"" + cell.rowSpan + "\"" : "", " style=\"width: ", dojo.contentBox(cell.getHeaderNode()).w, "px;\"", this._getTableAttrs(cellTagName), " class=\"", this._getColumnClass(arg_obj), "\""].join(""), table = this._viewTables[arg_obj.viewIdx];
		table.push("<", cellTagName, attrs, ">");
		if (arg_obj.isHeader) {
			table.push(cell.name || cell.field);
		} else {
			table.push(this._getExportDataForCell(arg_obj.rowIdx, arg_obj.row, cell, arg_obj.grid));
		}
		table.push("</", cellTagName, ">");
	}, afterContent:function () {
		dojo.forEach(this._viewTables, function (table) {
			table.push("</table>");
		});
	}, toString:function () {
		var viewsHTML = dojo.map(this._viewTables, function (table) {
			return table.join("");
		}).join("");
		return ["<div style=\"position: relative;\">", viewsHTML, "</div>"].join("");
	}});
}

