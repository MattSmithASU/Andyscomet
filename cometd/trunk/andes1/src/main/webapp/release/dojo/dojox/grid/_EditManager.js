/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid._EditManager"]) {
	dojo._hasResource["dojox.grid._EditManager"] = true;
	dojo.provide("dojox.grid._EditManager");
	dojo.require("dojox.grid.util");
	dojo.declare("dojox.grid._EditManager", null, {constructor:function (inGrid) {
		this.grid = inGrid;
		if (dojo.isIE) {
			this.connections = [dojo.connect(document.body, "onfocus", dojo.hitch(this, "_boomerangFocus"))];
		} else {
			this.connections = [dojo.connect(this.grid, "onBlur", this, "apply")];
		}
	}, info:{}, destroy:function () {
		dojo.forEach(this.connections, dojo.disconnect);
	}, cellFocus:function (inCell, inRowIndex) {
		if (this.grid.singleClickEdit || this.isEditRow(inRowIndex)) {
			this.setEditCell(inCell, inRowIndex);
		} else {
			this.apply();
		}
		if (this.isEditing() || (inCell && inCell.editable && inCell.alwaysEditing)) {
			this._focusEditor(inCell, inRowIndex);
		}
	}, rowClick:function (e) {
		if (this.isEditing() && !this.isEditRow(e.rowIndex)) {
			this.apply();
		}
	}, styleRow:function (inRow) {
		if (inRow.index == this.info.rowIndex) {
			inRow.customClasses += " dojoxGridRowEditing";
		}
	}, dispatchEvent:function (e) {
		var c = e.cell, ed = (c && c["editable"]) ? c : 0;
		return ed && ed.dispatchEvent(e.dispatch, e);
	}, isEditing:function () {
		return this.info.rowIndex !== undefined;
	}, isEditCell:function (inRowIndex, inCellIndex) {
		return (this.info.rowIndex === inRowIndex) && (this.info.cell.index == inCellIndex);
	}, isEditRow:function (inRowIndex) {
		return this.info.rowIndex === inRowIndex;
	}, setEditCell:function (inCell, inRowIndex) {
		if (!this.isEditCell(inRowIndex, inCell.index) && this.grid.canEdit && this.grid.canEdit(inCell, inRowIndex)) {
			this.start(inCell, inRowIndex, this.isEditRow(inRowIndex) || inCell.editable);
		}
	}, _focusEditor:function (inCell, inRowIndex) {
		dojox.grid.util.fire(inCell, "focus", [inRowIndex]);
	}, focusEditor:function () {
		if (this.isEditing()) {
			this._focusEditor(this.info.cell, this.info.rowIndex);
		}
	}, _boomerangWindow:500, _shouldCatchBoomerang:function () {
		return this._catchBoomerang > new Date().getTime();
	}, _boomerangFocus:function () {
		if (this._shouldCatchBoomerang()) {
			this.grid.focus.focusGrid();
			this.focusEditor();
			this._catchBoomerang = 0;
		}
	}, _doCatchBoomerang:function () {
		if (dojo.isIE) {
			this._catchBoomerang = new Date().getTime() + this._boomerangWindow;
		}
	}, start:function (inCell, inRowIndex, inEditing) {
		this.grid.beginUpdate();
		this.editorApply();
		if (this.isEditing() && !this.isEditRow(inRowIndex)) {
			this.applyRowEdit();
			this.grid.updateRow(inRowIndex);
		}
		if (inEditing) {
			this.info = {cell:inCell, rowIndex:inRowIndex};
			this.grid.doStartEdit(inCell, inRowIndex);
			this.grid.updateRow(inRowIndex);
		} else {
			this.info = {};
		}
		this.grid.endUpdate();
		this.grid.focus.focusGrid();
		this._focusEditor(inCell, inRowIndex);
		this._doCatchBoomerang();
	}, _editorDo:function (inMethod) {
		var c = this.info.cell;
		if (c && c.editable) {
			c[inMethod](this.info.rowIndex);
		}
	}, editorApply:function () {
		this._editorDo("apply");
	}, editorCancel:function () {
		this._editorDo("cancel");
	}, applyCellEdit:function (inValue, inCell, inRowIndex) {
		if (this.grid.canEdit(inCell, inRowIndex)) {
			this.grid.doApplyCellEdit(inValue, inRowIndex, inCell.field);
		}
	}, applyRowEdit:function () {
		this.grid.doApplyEdit(this.info.rowIndex, this.info.cell.field);
	}, apply:function () {
		if (this.isEditing()) {
			this.grid.beginUpdate();
			this.editorApply();
			this.applyRowEdit();
			this.info = {};
			this.grid.endUpdate();
			this.grid.focus.focusGrid();
			this._doCatchBoomerang();
		}
	}, cancel:function () {
		if (this.isEditing()) {
			this.grid.beginUpdate();
			this.editorCancel();
			this.info = {};
			this.grid.endUpdate();
			this.grid.focus.focusGrid();
			this._doCatchBoomerang();
		}
	}, save:function (inRowIndex, inView) {
		var c = this.info.cell;
		if (this.isEditRow(inRowIndex) && (!inView || c.view == inView) && c.editable) {
			c.save(c, this.info.rowIndex);
		}
	}, restore:function (inView, inRowIndex) {
		var c = this.info.cell;
		if (this.isEditRow(inRowIndex) && c.view == inView && c.editable) {
			c.restore(c, this.info.rowIndex);
		}
	}});
}

