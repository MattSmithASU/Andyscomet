/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.CellMerge"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.CellMerge"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.CellMerge");
	dojo.require("dojox.grid.enhanced._Plugin");
	dojo.declare("dojox.grid.enhanced.plugins.CellMerge", dojox.grid.enhanced._Plugin, {name:"cellMerge", constructor:function (grid, args) {
		this.grid = grid;
		this._records = [];
		this._merged = {};
		if (args && dojo.isObject(args)) {
			this._setupConfig(args.mergedCells);
		}
		this._initEvents();
		this._mixinGrid();
	}, mergeCells:function (rowTester, startColumnIndex, endColumnIndex, majorColumnIndex) {
		var item = this._createRecord({"row":rowTester, "start":startColumnIndex, "end":endColumnIndex, "major":majorColumnIndex});
		if (item) {
			this._updateRows(item);
		}
		return item;
	}, unmergeCells:function (mergeHandler) {
		var idx;
		if (mergeHandler && (idx = dojo.indexOf(this._records, mergeHandler)) >= 0) {
			this._records.splice(idx, 1);
			this._updateRows(mergeHandler);
		}
	}, getMergedCells:function () {
		var res = [];
		for (var i in this._merged) {
			res = res.concat(this._merged[i]);
		}
		return res;
	}, getMergedCellsByRow:function (rowIndex) {
		return this._merged[rowIndex] || [];
	}, _setupConfig:function (config) {
		dojo.forEach(config, this._createRecord, this);
	}, _initEvents:function () {
		dojo.forEach(this.grid.views.views, function (view) {
			this.connect(view, "onAfterRow", dojo.hitch(this, "_onAfterRow", view.index));
		}, this);
	}, _mixinGrid:function () {
		var g = this.grid;
		g.mergeCells = dojo.hitch(this, "mergeCells");
		g.unmergeCells = dojo.hitch(this, "unmergeCells");
		g.getMergedCells = dojo.hitch(this, "getMergedCells");
		g.getMergedCellsByRow = dojo.hitch(this, "getMergedCellsByRow");
	}, _getWidth:function (colIndex) {
		var node = this.grid.layout.cells[colIndex].getHeaderNode();
		return dojo.position(node).w;
	}, _onAfterRow:function (viewIdx, rowIndex, subrows) {
		try {
			if (rowIndex < 0) {
				return;
			}
			var result = [], i, j, len = this._records.length, cells = this.grid.layout.cells;
			for (i = 0; i < len; ++i) {
				var item = this._records[i];
				var storeItem = this.grid._by_idx[rowIndex];
				if (item.view == viewIdx && item.row(rowIndex, storeItem && storeItem.item, this.grid.store)) {
					var res = {record:item, hiddenCells:[], totalWidth:0, majorNode:cells[item.major].getNode(rowIndex), majorHeaderNode:cells[item.major].getHeaderNode()};
					for (j = item.start; j <= item.end; ++j) {
						var w = this._getWidth(j, rowIndex);
						res.totalWidth += w;
						if (j != item.major) {
							res.hiddenCells.push(cells[j].getNode(rowIndex));
						}
					}
					if (subrows.length != 1 || res.totalWidth > 0) {
						for (j = result.length - 1; j >= 0; --j) {
							var r = result[j].record;
							if ((r.start >= item.start && r.start <= item.end) || (r.end >= item.start && r.end <= item.end)) {
								result.splice(j, 1);
							}
						}
						result.push(res);
					}
				}
			}
			this._merged[rowIndex] = [];
			dojo.forEach(result, function (res) {
				dojo.forEach(res.hiddenCells, function (node) {
					dojo.style(node, "display", "none");
				});
				var pbm = dojo.marginBox(res.majorHeaderNode).w - dojo.contentBox(res.majorHeaderNode).w;
				var tw = res.totalWidth;
				if (!dojo.isWebKit) {
					tw -= pbm;
				}
				dojo.style(res.majorNode, "width", tw + "px");
				dojo.attr(res.majorNode, "colspan", res.hiddenCells.length + 1);
				this._merged[rowIndex].push({"row":rowIndex, "start":res.record.start, "end":res.record.end, "major":res.record.major, "handle":res.record});
			}, this);
		}
		catch (e) {
			console.warn("CellMerge._onAfterRow() error: ", rowIndex, e);
		}
	}, _createRecord:function (item) {
		if (this._isValid(item)) {
			item = {"row":item.row, "start":item.start, "end":item.end, "major":item.major};
			var cells = this.grid.layout.cells;
			item.view = cells[item.start].view.index;
			item.major = typeof item.major == "number" && !isNaN(item.major) ? item.major : item.start;
			if (typeof item.row == "number") {
				var r = item.row;
				item.row = function (rowIndex) {
					return rowIndex === r;
				};
			} else {
				if (typeof item.row == "string") {
					var id = item.row;
					item.row = function (rowIndex, storeItem, store) {
						try {
							if (store && storeItem && store.getFeatures()["dojo.data.api.Identity"]) {
								return store.getIdentity(storeItem) == id;
							}
						}
						catch (e) {
							console.error(e);
						}
						return false;
					};
				}
			}
			if (dojo.isFunction(item.row)) {
				this._records.push(item);
				return item;
			}
		}
		return null;
	}, _isValid:function (item) {
		var cells = this.grid.layout.cells, colCount = cells.length;
		return (dojo.isObject(item) && ("row" in item) && ("start" in item) && ("end" in item) && item.start >= 0 && item.start < colCount && item.end > item.start && item.end < colCount && cells[item.start].view.index == cells[item.end].view.index && cells[item.start].subrow == cells[item.end].subrow && !(typeof item.major == "number" && (item.major < item.start || item.major > item.end)));
	}, _updateRows:function (item) {
		var min = null;
		for (var i = 0, count = this.grid.rowCount; i < count; ++i) {
			var storeItem = this.grid._by_idx[i];
			if (storeItem && item.row(i, storeItem && storeItem.item, this.grid.store)) {
				this.grid.views.updateRow(i);
				if (min === null) {
					min = i;
				}
			}
		}
		if (min >= 0) {
			this.grid.scroller.rowHeightChanged(min);
		}
	}});
	dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.CellMerge);
}

