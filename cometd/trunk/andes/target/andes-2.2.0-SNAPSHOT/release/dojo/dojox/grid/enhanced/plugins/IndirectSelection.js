/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.IndirectSelection"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.IndirectSelection"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.IndirectSelection");
	dojo.require("dojo.string");
	dojo.require("dojox.grid.cells.dijit");
	dojo.require("dojox.grid.enhanced._Plugin");
	dojo.declare("dojox.grid.enhanced.plugins.IndirectSelection", dojox.grid.enhanced._Plugin, {name:"indirectSelection", constructor:function () {
		var layout = this.grid.layout;
		this.connect(layout, "setStructure", dojo.hitch(layout, this.addRowSelectCell, this.option));
	}, addRowSelectCell:function (option) {
		if (!this.grid.indirectSelection || this.grid.selectionMode == "none") {
			return;
		}
		var rowSelectCellAdded = false, inValidFields = ["get", "formatter", "field", "fields"], defaultCellDef = {type:dojox.grid.cells.MultipleRowSelector, name:"", width:"30px", styles:"text-align: center;"};
		if (option.headerSelector) {
			option.name = "";
		}
		if (this.grid.rowSelectCell) {
			this.grid.rowSelectCell.destroy();
		}
		dojo.forEach(this.structure, function (view) {
			var cells = view.cells;
			if (cells && cells.length > 0 && !rowSelectCellAdded) {
				var firstRow = cells[0];
				if (firstRow[0] && firstRow[0].isRowSelector) {
					console.debug("addRowSelectCell() - row selector cells already added, return.");
					rowSelectCellAdded = true;
					return;
				}
				var selectDef, cellType = this.grid.selectionMode == "single" ? dojox.grid.cells.SingleRowSelector : dojox.grid.cells.MultipleRowSelector;
				selectDef = dojo.mixin(defaultCellDef, option, {type:cellType, editable:false, notselectable:true, filterable:false, navigatable:true, nosort:true});
				dojo.forEach(inValidFields, function (field) {
					if (field in selectDef) {
						delete selectDef[field];
					}
				});
				if (cells.length > 1) {
					selectDef.rowSpan = cells.length;
				}
				dojo.forEach(this.cells, function (cell, i) {
					if (cell.index >= 0) {
						cell.index += 1;
					} else {
						console.warn("Error:IndirectSelection.addRowSelectCell()-  cell " + i + " has no index!");
					}
				});
				var rowSelectCell = this.addCellDef(0, 0, selectDef);
				rowSelectCell.index = 0;
				firstRow.unshift(rowSelectCell);
				this.cells.unshift(rowSelectCell);
				this.grid.rowSelectCell = rowSelectCell;
				rowSelectCellAdded = true;
			}
		}, this);
		this.cellCount = this.cells.length;
	}, destroy:function () {
		this.grid.rowSelectCell.destroy();
		delete this.grid.rowSelectCell;
		this.inherited(arguments);
	}});
	dojo.declare("dojox.grid.cells.RowSelector", dojox.grid.cells._Widget, {inputType:"", map:null, disabledMap:null, isRowSelector:true, _connects:null, _subscribes:null, checkedText:"&#8730;", unCheckedText:"O", constructor:function () {
		this.map = {};
		this.disabledMap = {}, this.disabledCount = 0;
		this._connects = [];
		this._subscribes = [];
		this.inA11YMode = dojo.hasClass(dojo.body(), "dijit_a11y");
		this.baseClass = "dojoxGridRowSelector dijitReset dijitInline dijit" + this.inputType;
		this.checkedClass = " dijit" + this.inputType + "Checked";
		this.disabledClass = " dijit" + this.inputType + "Disabled";
		this.checkedDisabledClass = " dijit" + this.inputType + "CheckedDisabled";
		this.statusTextClass = " dojoxGridRowSelectorStatusText";
		this._connects.push(dojo.connect(this.grid, "dokeyup", this, "_dokeyup"));
		this._connects.push(dojo.connect(this.grid.selection, "onSelected", this, "_onSelected"));
		this._connects.push(dojo.connect(this.grid.selection, "onDeselected", this, "_onDeselected"));
		this._connects.push(dojo.connect(this.grid.scroller, "invalidatePageNode", this, "_pageDestroyed"));
		this._connects.push(dojo.connect(this.grid, "onCellClick", this, "_onClick"));
		this._connects.push(dojo.connect(this.grid, "updateRow", this, "_onUpdateRow"));
	}, formatter:function (data, rowIndex) {
		var clazz = this.baseClass;
		var checked = this.getValue(rowIndex);
		var disabled = !!this.disabledMap[rowIndex];
		if (checked) {
			clazz += this.checkedClass;
			if (disabled) {
				clazz += this.checkedDisabledClass;
			}
		} else {
			if (disabled) {
				clazz += this.disabledClass;
			}
		}
		return ["<div tabindex = -1 ", "id = '" + this.grid.id + "_rowSelector_" + rowIndex + "' ", "name = '" + this.grid.id + "_rowSelector' class = '" + clazz + "' ", "role = 'presentation' aria-pressed = '" + checked + "' aria-disabled = '" + disabled + "' aria-label = '" + dojo.string.substitute(this.grid._nls["indirectSelection" + this.inputType], [rowIndex + 1]) + "'>", "<span class = '" + this.statusTextClass + "'>" + (checked ? this.checkedText : this.unCheckedText) + "</span>", "</div>"].join("");
	}, setValue:function (rowIndex, inValue) {
	}, getValue:function (rowIndex) {
		return this.grid.selection.isSelected(rowIndex);
	}, toggleRow:function (index, value) {
		this._nativeSelect(index, value);
	}, setDisabled:function (index, disabled) {
		if (index < 0) {
			return;
		}
		this._toggleDisabledStyle(index, disabled);
	}, disabled:function (index) {
		return !!this.disabledMap[index];
	}, _onClick:function (e) {
		if (e.cell === this) {
			this._selectRow(e);
		}
	}, _dokeyup:function (e) {
		if (e.cellIndex == this.index && e.rowIndex >= 0 && e.keyCode == dojo.keys.SPACE) {
			this._selectRow(e);
		}
	}, focus:function (rowIndex) {
		var selector = this.map[rowIndex];
		if (selector) {
			selector.focus();
		}
	}, _focusEndingCell:function (rowIndex, cellIndex) {
		var cell = this.grid.getCell(cellIndex);
		this.grid.focus.setFocusCell(cell, rowIndex);
	}, _nativeSelect:function (index, value) {
		this.grid.selection[value ? "select" : "deselect"](index);
	}, _onSelected:function (index) {
		this._toggleCheckedStyle(index, true);
	}, _onDeselected:function (index) {
		this._toggleCheckedStyle(index, false);
	}, _onUpdateRow:function (index) {
		delete this.map[index];
	}, _toggleCheckedStyle:function (index, value) {
		var selector = this._getSelector(index);
		if (selector) {
			dojo.toggleClass(selector, this.checkedClass, value);
			if (this.disabledMap[index]) {
				dojo.toggleClass(selector, this.checkedDisabledClass, value);
			}
			dijit.setWaiState(selector, "pressed", value);
			if (this.inA11YMode) {
				dojo.attr(selector.firstChild, "innerHTML", value ? this.checkedText : this.unCheckedText);
			}
		}
	}, _toggleDisabledStyle:function (index, disabled) {
		var selector = this._getSelector(index);
		if (selector) {
			dojo.toggleClass(selector, this.disabledClass, disabled);
			if (this.getValue(index)) {
				dojo.toggleClass(selector, this.checkedDisabledClass, disabled);
			}
			dijit.setWaiState(selector, "disabled", disabled);
		}
		this.disabledMap[index] = disabled;
		if (index >= 0) {
			this.disabledCount += disabled ? 1 : -1;
		}
	}, _getSelector:function (index) {
		var selector = this.map[index];
		if (!selector) {
			var rowNode = this.view.rowNodes[index];
			if (rowNode) {
				selector = dojo.query(".dojoxGridRowSelector", rowNode)[0];
				if (selector) {
					this.map[index] = selector;
				}
			}
		}
		return selector;
	}, _pageDestroyed:function (pageIndex) {
		var rowsPerPage = this.grid.scroller.rowsPerPage;
		var start = pageIndex * rowsPerPage, end = start + rowsPerPage - 1;
		for (var i = start; i <= end; i++) {
			if (!this.map[i]) {
				continue;
			}
			dojo.destroy(this.map[i]);
			delete this.map[i];
		}
	}, destroy:function () {
		for (var i in this.map) {
			dojo.destroy(this.map[i]);
			delete this.map[i];
		}
		for (i in this.disabledMap) {
			delete this.disabledMap[i];
		}
		dojo.forEach(this._connects, dojo.disconnect);
		dojo.forEach(this._subscribes, dojo.unsubscribe);
		delete this._connects;
		delete this._subscribes;
	}});
	dojo.declare("dojox.grid.cells.SingleRowSelector", dojox.grid.cells.RowSelector, {inputType:"Radio", _selectRow:function (e) {
		var index = e.rowIndex;
		if (this.disabledMap[index]) {
			return;
		}
		this._focusEndingCell(index, 0);
		this._nativeSelect(index, !this.grid.selection.selected[index]);
	}});
	dojo.declare("dojox.grid.cells.MultipleRowSelector", dojox.grid.cells.RowSelector, {inputType:"CheckBox", swipeStartRowIndex:-1, swipeMinRowIndex:-1, swipeMaxRowIndex:-1, toSelect:false, lastClickRowIdx:-1, toggleAllTrigerred:false, unCheckedText:"&#9633;", constructor:function () {
		this._connects.push(dojo.connect(dojo.doc, "onmouseup", this, "_domouseup"));
		this._connects.push(dojo.connect(this.grid, "onRowMouseOver", this, "_onRowMouseOver"));
		this._connects.push(dojo.connect(this.grid.focus, "move", this, "_swipeByKey"));
		this._connects.push(dojo.connect(this.grid, "onCellMouseDown", this, "_onMouseDown"));
		if (this.headerSelector) {
			this._connects.push(dojo.connect(this.grid.views, "render", this, "_addHeaderSelector"));
			this._connects.push(dojo.connect(this.grid, "onSelectionChanged", this, "_onSelectionChanged"));
			this._connects.push(dojo.connect(this.grid, "onKeyDown", this, function (e) {
				if (e.rowIndex == -1 && e.cellIndex == this.index && e.keyCode == dojo.keys.SPACE) {
					this._toggletHeader();
				}
			}));
		}
	}, toggleAllSelection:function (checked) {
		var grid = this.grid, selection = grid.selection;
		if (checked) {
			selection.selectRange(0, grid.rowCount - 1);
		} else {
			selection.deselectAll();
		}
		this.toggleAllTrigerred = true;
	}, _onMouseDown:function (e) {
		if (e.cell == this) {
			this._startSelection(e.rowIndex);
			dojo.stopEvent(e);
		}
	}, _onRowMouseOver:function (e) {
		this._updateSelection(e, 0);
	}, _domouseup:function (e) {
		if (dojo.isIE) {
			this.view.content.decorateEvent(e);
		}
		var inSwipeSelection = e.cellIndex >= 0 && this.inSwipeSelection() && !this.grid.edit.isEditRow(e.rowIndex);
		if (inSwipeSelection) {
			this._focusEndingCell(e.rowIndex, e.cellIndex);
		}
		this._finishSelect();
	}, _dokeyup:function (e) {
		this.inherited(arguments);
		if (!e.shiftKey) {
			this._finishSelect();
		}
	}, _startSelection:function (rowIndex) {
		this.swipeStartRowIndex = this.swipeMinRowIndex = this.swipeMaxRowIndex = rowIndex;
		this.toSelect = !this.getValue(rowIndex);
	}, _updateSelection:function (e, delta) {
		if (!this.inSwipeSelection()) {
			return;
		}
		var byKey = delta !== 0;
		var currRow = e.rowIndex, deltaRow = currRow - this.swipeStartRowIndex + delta;
		if (deltaRow > 0 && this.swipeMaxRowIndex < currRow + delta) {
			this.swipeMaxRowIndex = currRow + delta;
		}
		if (deltaRow < 0 && this.swipeMinRowIndex > currRow + delta) {
			this.swipeMinRowIndex = currRow + delta;
		}
		var min = deltaRow > 0 ? this.swipeStartRowIndex : currRow + delta;
		var max = deltaRow > 0 ? currRow + delta : this.swipeStartRowIndex;
		for (var i = this.swipeMinRowIndex; i <= this.swipeMaxRowIndex; i++) {
			if (this.disabledMap[i] || i < 0) {
				continue;
			}
			if (i >= min && i <= max) {
				this._nativeSelect(i, this.toSelect);
			} else {
				if (!byKey) {
					this._nativeSelect(i, !this.toSelect);
				}
			}
		}
	}, _swipeByKey:function (rowOffset, colOffset, e) {
		if (!e || rowOffset === 0 || !e.shiftKey || e.cellIndex != this.index || this.grid.focus.rowIndex < 0) {
			return;
		}
		var rowIndex = e.rowIndex;
		if (this.swipeStartRowIndex < 0) {
			this.swipeStartRowIndex = rowIndex;
			if (rowOffset > 0) {
				this.swipeMaxRowIndex = rowIndex + rowOffset;
				this.swipeMinRowIndex = rowIndex;
			} else {
				this.swipeMinRowIndex = rowIndex + rowOffset;
				this.swipeMaxRowIndex = rowIndex;
			}
			this.toSelect = this.getValue(rowIndex);
		}
		this._updateSelection(e, rowOffset);
	}, _finishSelect:function () {
		this.swipeStartRowIndex = -1;
		this.swipeMinRowIndex = -1;
		this.swipeMaxRowIndex = -1;
		this.toSelect = false;
	}, inSwipeSelection:function () {
		return this.swipeStartRowIndex >= 0;
	}, _nativeSelect:function (index, value) {
		this.grid.selection[value ? "addToSelection" : "deselect"](index);
	}, _selectRow:function (e) {
		var rowIndex = e.rowIndex;
		if (this.disabledMap[rowIndex]) {
			return;
		}
		dojo.stopEvent(e);
		this._focusEndingCell(rowIndex, 0);
		var delta = rowIndex - this.lastClickRowIdx;
		var newValue = !this.grid.selection.selected[rowIndex];
		if (this.lastClickRowIdx >= 0 && !e.ctrlKey && !e.altKey && e.shiftKey) {
			var min = delta > 0 ? this.lastClickRowIdx : rowIndex;
			var max = delta > 0 ? rowIndex : this.lastClickRowIdx;
			for (var i = min; i >= 0 && i <= max; i++) {
				this._nativeSelect(i, newValue);
			}
		} else {
			this._nativeSelect(rowIndex, newValue);
		}
		this.lastClickRowIdx = rowIndex;
	}, getValue:function (rowIndex) {
		if (rowIndex == -1) {
			var g = this.grid;
			return g.rowCount > 0 && g.rowCount <= g.selection.getSelectedCount();
		}
		return this.inherited(arguments);
	}, _addHeaderSelector:function () {
		var headerCellNode = this.view.getHeaderCellNode(this.index);
		if (!headerCellNode) {
			return;
		}
		dojo.empty(headerCellNode);
		var g = this.grid;
		var selector = headerCellNode.appendChild(dojo.create("div", {"tabindex":-1, "id":g.id + "_rowSelector_-1", "class":this.baseClass, "role":"presentation", "innerHTML":"<span class = '" + this.statusTextClass + "'></span><span style='height: 0; width: 0; overflow: hidden; display: block;'>" + g._nls["selectAll"] + "</span>"}));
		this.map[-1] = selector;
		var idx = this._headerSelectorConnectIdx;
		if (idx !== undefined) {
			dojo.disconnect(this._connects[idx]);
			this._connects.splice(idx, 1);
		}
		this._headerSelectorConnectIdx = this._connects.length;
		this._connects.push(dojo.connect(selector, "onclick", this, "_toggletHeader"));
		this._onSelectionChanged();
	}, _toggletHeader:function () {
		if (!!this.disabledMap[-1]) {
			return;
		}
		this.grid._selectingRange = true;
		this.toggleAllSelection(!this.getValue(-1));
		this._onSelectionChanged();
		this.grid._selectingRange = false;
	}, _onSelectionChanged:function () {
		var g = this.grid;
		if (!this.map[-1] || g._selectingRange) {
			return;
		}
		this._toggleCheckedStyle(-1, this.getValue(-1));
	}, _toggleDisabledStyle:function (index, disabled) {
		this.inherited(arguments);
		if (this.headerSelector) {
			var allDisabled = (this.grid.rowCount == this.disabledCount);
			if (allDisabled != !!this.disabledMap[-1]) {
				arguments[0] = -1;
				arguments[1] = allDisabled;
				this.inherited(arguments);
			}
		}
	}});
	dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.IndirectSelection, {"preInit":true});
}
