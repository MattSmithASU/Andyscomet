/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins._SelectionPreserver"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins._SelectionPreserver"] = true;
	dojo.provide("dojox.grid.enhanced.plugins._SelectionPreserver");
	dojo.declare("dojox.grid.enhanced.plugins._SelectionPreserver", null, {_connects:[], constructor:function (selection) {
		this.selection = selection;
		var grid = this.grid = selection.grid;
		grid.onSelectedById = this.onSelectedById;
		this.reset();
		var oldClearData = grid._clearData;
		var _this = this;
		grid._clearData = function () {
			_this._updateMapping(!grid._noInternalMapping);
			_this._trustSelection = [];
			oldClearData.apply(grid, arguments);
		};
		this.connect(grid, "_setStore", "reset");
		this.connect(grid, "_addItem", "_reSelectById");
		this.connect(selection, "addToSelection", dojo.hitch(this, "_selectById", true));
		this.connect(selection, "deselect", dojo.hitch(this, "_selectById", false));
		this.connect(selection, "selectRange", dojo.hitch(this, "_updateMapping", true, true, false));
		this.connect(selection, "deselectRange", dojo.hitch(this, "_updateMapping", true, false, false));
		this.connect(selection, "deselectAll", dojo.hitch(this, "_updateMapping", true, false, true));
	}, destroy:function () {
		this.reset();
		dojo.forEach(this._connects, dojo.disconnect);
		delete this._connects;
	}, connect:function (obj, event, method) {
		var conn = dojo.connect(obj, event, this, method);
		this._connects.push(conn);
		return conn;
	}, reset:function () {
		this._idMap = [];
		this._selectedById = {};
		this._trustSelection = [];
		this._defaultSelected = false;
	}, _reSelectById:function (item, index) {
		var s = this.selection, g = this.grid;
		if (item && g._hasIdentity) {
			var id = g.store.getIdentity(item);
			if (this._selectedById[id] === undefined) {
				if (!this._trustSelection[index]) {
					s.selected[index] = this._defaultSelected;
				}
			} else {
				s.selected[index] = this._selectedById[id];
			}
			this._idMap.push(id);
			g.onSelectedById(id, index, s.selected[index]);
		}
	}, _selectById:function (toSelect, inItemOrIndex) {
		if (this.selection.mode == "none" || !this.grid._hasIdentity) {
			return;
		}
		var item = inItemOrIndex;
		if (typeof inItemOrIndex == "number" || typeof inItemOrIndex == "string") {
			var entry = this.grid._by_idx[inItemOrIndex];
			item = entry && entry.item;
		}
		if (item) {
			var id = this.grid.store.getIdentity(item);
			this._selectedById[id] = !!toSelect;
		} else {
			this._trustSelection[inItemOrIndex] = true;
		}
	}, onSelectedById:function (id, rowIndex, value) {
	}, _updateMapping:function (trustSelection, isSelect, isForAll, from, to) {
		var s = this.selection, g = this.grid, flag = 0, unloaded = 0, i, id;
		for (i = g.rowCount - 1; i >= 0; --i) {
			if (!g._by_idx[i]) {
				++unloaded;
				flag += s.selected[i] ? 1 : -1;
			} else {
				id = g._by_idx[i].idty;
				if (id && (trustSelection || this._selectedById[id] === undefined)) {
					this._selectedById[id] = !!s.selected[i];
				}
			}
		}
		if (unloaded) {
			this._defaultSelected = flag > 0;
		}
		if (!isForAll && from !== undefined && to !== undefined) {
			isForAll = !g.usingPagination && Math.abs(to - from + 1) === g.rowCount;
		}
		if (isForAll && !g.usingPagination) {
			for (i = this._idMap.length; i >= 0; --i) {
				this._selectedById[this._idMap[i]] = isSelect;
			}
		}
	}});
}

