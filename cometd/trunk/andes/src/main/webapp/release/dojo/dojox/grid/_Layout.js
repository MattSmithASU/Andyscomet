/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid._Layout"]) {
	dojo._hasResource["dojox.grid._Layout"] = true;
	dojo.provide("dojox.grid._Layout");
	dojo.require("dojox.grid.cells");
	dojo.require("dojox.grid._RowSelector");
	dojo.declare("dojox.grid._Layout", null, {constructor:function (inGrid) {
		this.grid = inGrid;
	}, cells:[], structure:null, defaultWidth:"6em", moveColumn:function (sourceViewIndex, destViewIndex, cellIndex, targetIndex, before) {
		var source_cells = this.structure[sourceViewIndex].cells[0];
		var dest_cells = this.structure[destViewIndex].cells[0];
		var cell = null;
		var cell_ri = 0;
		var target_ri = 0;
		for (var i = 0, c; c = source_cells[i]; i++) {
			if (c.index == cellIndex) {
				cell_ri = i;
				break;
			}
		}
		cell = source_cells.splice(cell_ri, 1)[0];
		cell.view = this.grid.views.views[destViewIndex];
		for (i = 0, c = null; c = dest_cells[i]; i++) {
			if (c.index == targetIndex) {
				target_ri = i;
				break;
			}
		}
		if (!before) {
			target_ri += 1;
		}
		dest_cells.splice(target_ri, 0, cell);
		var sortedCell = this.grid.getCell(this.grid.getSortIndex());
		if (sortedCell) {
			sortedCell._currentlySorted = this.grid.getSortAsc();
		}
		this.cells = [];
		cellIndex = 0;
		var v;
		for (i = 0; v = this.structure[i]; i++) {
			for (var j = 0, cs; cs = v.cells[j]; j++) {
				for (var k = 0; c = cs[k]; k++) {
					c.index = cellIndex;
					this.cells.push(c);
					if ("_currentlySorted" in c) {
						var si = cellIndex + 1;
						si *= c._currentlySorted ? 1 : -1;
						this.grid.sortInfo = si;
						delete c._currentlySorted;
					}
					cellIndex++;
				}
			}
		}
		dojo.forEach(this.cells, function (c) {
			var marks = c.markup[2].split(" ");
			var oldIdx = parseInt(marks[1].substring(5));
			if (oldIdx != c.index) {
				marks[1] = "idx=\"" + c.index + "\"";
				c.markup[2] = marks.join(" ");
			}
		});
		this.grid.setupHeaderMenu();
	}, setColumnVisibility:function (columnIndex, visible) {
		var cell = this.cells[columnIndex];
		if (cell.hidden == visible) {
			cell.hidden = !visible;
			var v = cell.view, w = v.viewWidth;
			if (w && w != "auto") {
				v._togglingColumn = dojo.marginBox(cell.getHeaderNode()).w || 0;
			}
			v.update();
			return true;
		} else {
			return false;
		}
	}, addCellDef:function (inRowIndex, inCellIndex, inDef) {
		var self = this;
		var getCellWidth = function (inDef) {
			var w = 0;
			if (inDef.colSpan > 1) {
				w = 0;
			} else {
				w = inDef.width || self._defaultCellProps.width || self.defaultWidth;
				if (!isNaN(w)) {
					w = w + "em";
				}
			}
			return w;
		};
		var props = {grid:this.grid, subrow:inRowIndex, layoutIndex:inCellIndex, index:this.cells.length};
		if (inDef && inDef instanceof dojox.grid.cells._Base) {
			var new_cell = dojo.clone(inDef);
			props.unitWidth = getCellWidth(new_cell._props);
			new_cell = dojo.mixin(new_cell, this._defaultCellProps, inDef._props, props);
			return new_cell;
		}
		var cell_type = inDef.type || inDef.cellType || this._defaultCellProps.type || this._defaultCellProps.cellType || dojox.grid.cells.Cell;
		props.unitWidth = getCellWidth(inDef);
		return new cell_type(dojo.mixin({}, this._defaultCellProps, inDef, props));
	}, addRowDef:function (inRowIndex, inDef) {
		var result = [];
		var relSum = 0, pctSum = 0, doRel = true;
		for (var i = 0, def, cell; (def = inDef[i]); i++) {
			cell = this.addCellDef(inRowIndex, i, def);
			result.push(cell);
			this.cells.push(cell);
			if (doRel && cell.relWidth) {
				relSum += cell.relWidth;
			} else {
				if (cell.width) {
					var w = cell.width;
					if (typeof w == "string" && w.slice(-1) == "%") {
						pctSum += window.parseInt(w, 10);
					} else {
						if (w == "auto") {
							doRel = false;
						}
					}
				}
			}
		}
		if (relSum && doRel) {
			dojo.forEach(result, function (cell) {
				if (cell.relWidth) {
					cell.width = cell.unitWidth = ((cell.relWidth / relSum) * (100 - pctSum)) + "%";
				}
			});
		}
		return result;
	}, addRowsDef:function (inDef) {
		var result = [];
		if (dojo.isArray(inDef)) {
			if (dojo.isArray(inDef[0])) {
				for (var i = 0, row; inDef && (row = inDef[i]); i++) {
					result.push(this.addRowDef(i, row));
				}
			} else {
				result.push(this.addRowDef(0, inDef));
			}
		}
		return result;
	}, addViewDef:function (inDef) {
		this._defaultCellProps = inDef.defaultCell || {};
		if (inDef.width && inDef.width == "auto") {
			delete inDef.width;
		}
		return dojo.mixin({}, inDef, {cells:this.addRowsDef(inDef.rows || inDef.cells)});
	}, setStructure:function (inStructure) {
		this.fieldIndex = 0;
		this.cells = [];
		var s = this.structure = [];
		if (this.grid.rowSelector) {
			var sel = {type:dojox._scopeName + ".grid._RowSelector"};
			if (dojo.isString(this.grid.rowSelector)) {
				var width = this.grid.rowSelector;
				if (width == "false") {
					sel = null;
				} else {
					if (width != "true") {
						sel["width"] = width;
					}
				}
			} else {
				if (!this.grid.rowSelector) {
					sel = null;
				}
			}
			if (sel) {
				s.push(this.addViewDef(sel));
			}
		}
		var isCell = function (def) {
			return ("name" in def || "field" in def || "get" in def);
		};
		var isRowDef = function (def) {
			if (dojo.isArray(def)) {
				if (dojo.isArray(def[0]) || isCell(def[0])) {
					return true;
				}
			}
			return false;
		};
		var isView = function (def) {
			return (def !== null && dojo.isObject(def) && ("cells" in def || "rows" in def || ("type" in def && !isCell(def))));
		};
		if (dojo.isArray(inStructure)) {
			var hasViews = false;
			for (var i = 0, st; (st = inStructure[i]); i++) {
				if (isView(st)) {
					hasViews = true;
					break;
				}
			}
			if (!hasViews) {
				s.push(this.addViewDef({cells:inStructure}));
			} else {
				for (i = 0; (st = inStructure[i]); i++) {
					if (isRowDef(st)) {
						s.push(this.addViewDef({cells:st}));
					} else {
						if (isView(st)) {
							s.push(this.addViewDef(st));
						}
					}
				}
			}
		} else {
			if (isView(inStructure)) {
				s.push(this.addViewDef(inStructure));
			}
		}
		this.cellCount = this.cells.length;
		this.grid.setupHeaderMenu();
	}});
}

