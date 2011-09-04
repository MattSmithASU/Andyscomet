/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.Exporter"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.Exporter"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.Exporter");
	dojo.require("dojox.grid.enhanced._Plugin");
	dojo.require("dojox.grid._RowSelector");
	dojo.declare("dojox.grid.enhanced.plugins.Exporter", dojox.grid.enhanced._Plugin, {name:"exporter", constructor:function (grid, args) {
		this.grid = grid;
		this.formatter = (args && dojo.isObject(args)) && args.exportFormatter;
		this._mixinGrid();
	}, _mixinGrid:function () {
		var g = this.grid;
		g.exportTo = dojo.hitch(this, this.exportTo);
		g.exportGrid = dojo.hitch(this, this.exportGrid);
		g.exportSelected = dojo.hitch(this, this.exportSelected);
		g.setExportFormatter = dojo.hitch(this, this.setExportFormatter);
	}, setExportFormatter:function (formatter) {
		this.formatter = formatter;
	}, exportGrid:function (type, args, onExported) {
		if (dojo.isFunction(args)) {
			onExported = args;
			args = {};
		}
		if (!dojo.isString(type) || !dojo.isFunction(onExported)) {
			return;
		}
		args = args || {};
		var g = this.grid, _this = this, writer = this._getExportWriter(type, args.writerArgs), fetchArgs = (args.fetchArgs && dojo.isObject(args.fetchArgs)) ? args.fetchArgs : {}, oldFunc = fetchArgs.onComplete;
		if (g.store) {
			fetchArgs.onComplete = function (items, request) {
				if (oldFunc) {
					oldFunc(items, request);
				}
				onExported(_this._goThroughGridData(items, writer));
			};
			fetchArgs.sort = fetchArgs.sort || g.getSortProps();
			g._storeLayerFetch(fetchArgs);
		} else {
			var start = fetchArgs.start || 0, count = fetchArgs.count || -1, items = [];
			for (var i = start; i != start + count && i < g.rowCount; ++i) {
				items.push(g.getItem(i));
			}
			onExported(this._goThroughGridData(items, writer));
		}
	}, exportSelected:function (type, writerArgs) {
		if (!dojo.isString(type)) {
			return "";
		}
		var writer = this._getExportWriter(type, writerArgs);
		return this._goThroughGridData(this.grid.selection.getSelected(), writer);
	}, _buildRow:function (arg_obj, writer) {
		var _this = this;
		dojo.forEach(arg_obj._views, function (view, vIdx) {
			arg_obj.view = view;
			arg_obj.viewIdx = vIdx;
			if (writer.beforeView(arg_obj)) {
				dojo.forEach(view.structure.cells, function (subrow, srIdx) {
					arg_obj.subrow = subrow;
					arg_obj.subrowIdx = srIdx;
					if (writer.beforeSubrow(arg_obj)) {
						dojo.forEach(subrow, function (cell, cIdx) {
							if (arg_obj.isHeader && _this._isSpecialCol(cell)) {
								arg_obj.spCols.push(cell.index);
							}
							arg_obj.cell = cell;
							arg_obj.cellIdx = cIdx;
							writer.handleCell(arg_obj);
						});
						writer.afterSubrow(arg_obj);
					}
				});
				writer.afterView(arg_obj);
			}
		});
	}, _goThroughGridData:function (items, writer) {
		var grid = this.grid, views = dojo.filter(grid.views.views, function (view) {
			return !(view instanceof dojox.grid._RowSelector);
		}), arg_obj = {"grid":grid, "isHeader":true, "spCols":[], "_views":views, "colOffset":(views.length < grid.views.views.length ? -1 : 0)};
		if (writer.beforeHeader(grid)) {
			this._buildRow(arg_obj, writer);
			writer.afterHeader();
		}
		arg_obj.isHeader = false;
		if (writer.beforeContent(items)) {
			dojo.forEach(items, function (item, rIdx) {
				arg_obj.row = item;
				arg_obj.rowIdx = rIdx;
				if (writer.beforeContentRow(arg_obj)) {
					this._buildRow(arg_obj, writer);
					writer.afterContentRow(arg_obj);
				}
			}, this);
			writer.afterContent();
		}
		return writer.toString();
	}, _isSpecialCol:function (header_cell) {
		return header_cell.isRowSelector || header_cell instanceof dojox.grid.cells.RowIndex;
	}, _getExportWriter:function (fileType, writerArgs) {
		var writerName, cls, expCls = dojox.grid.enhanced.plugins.Exporter;
		if (expCls.writerNames) {
			writerName = expCls.writerNames[fileType.toLowerCase()];
			cls = dojo.getObject(writerName);
			if (cls) {
				var writer = new cls(writerArgs);
				writer.formatter = this.formatter;
				return writer;
			} else {
				throw new Error("Please make sure class \"" + writerName + "\" is required.");
			}
		}
		throw new Error("The writer for \"" + fileType + "\" has not been registered.");
	}});
	dojox.grid.enhanced.plugins.Exporter.registerWriter = function (fileType, writerClsName) {
		var expCls = dojox.grid.enhanced.plugins.Exporter;
		expCls.writerNames = expCls.writerNames || {};
		expCls.writerNames[fileType] = writerClsName;
	};
	dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Exporter);
}

