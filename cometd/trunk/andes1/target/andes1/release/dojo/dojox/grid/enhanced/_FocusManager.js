/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced._FocusManager"]) {
	dojo._hasResource["dojox.grid.enhanced._FocusManager"] = true;
	dojo.provide("dojox.grid.enhanced._FocusManager");
	dojo.declare("dojox.grid.enhanced._FocusArea", null, {constructor:function (area, focusManager) {
		this._fm = focusManager;
		this._evtStack = [area.name];
		var dummy = function () {
			return true;
		};
		area.onFocus = area.onFocus || dummy;
		area.onBlur = area.onBlur || dummy;
		area.onMove = area.onMove || dummy;
		area.onKeyUp = area.onKeyUp || dummy;
		area.onKeyDown = area.onKeyDown || dummy;
		dojo.mixin(this, area);
	}, move:function (rowStep, colStep, evt) {
		if (this.name) {
			var i, len = this._evtStack.length;
			for (i = len - 1; i >= 0; --i) {
				if (this._fm._areas[this._evtStack[i]].onMove(rowStep, colStep, evt) === false) {
					return false;
				}
			}
		}
		return true;
	}, _onKeyEvent:function (evt, funcName) {
		if (this.name) {
			var i, len = this._evtStack.length;
			for (i = len - 1; i >= 0; --i) {
				if (this._fm._areas[this._evtStack[i]][funcName](evt, false) === false) {
					return false;
				}
			}
			for (i = 0; i < len; ++i) {
				if (this._fm._areas[this._evtStack[i]][funcName](evt, true) === false) {
					return false;
				}
			}
		}
		return true;
	}, keydown:function (evt) {
		return this._onKeyEvent(evt, "onKeyDown");
	}, keyup:function (evt) {
		return this._onKeyEvent(evt, "onKeyUp");
	}, contentMouseEventPlanner:function () {
		return 0;
	}, headerMouseEventPlanner:function () {
		return 0;
	}});
	dojo.declare("dojox.grid.enhanced._FocusManager", dojox.grid._FocusManager, {_stopEvent:function (evt) {
		try {
			if (evt && evt.preventDefault) {
				dojo.stopEvent(evt);
			}
		}
		catch (e) {
		}
	}, constructor:function (grid) {
		this.grid = grid;
		this._areas = {};
		this._areaQueue = [];
		this._contentMouseEventHandlers = [];
		this._headerMouseEventHandlers = [];
		this._currentAreaIdx = -1;
		this._gridBlured = true;
		this._connects.push(dojo.connect(grid, "onBlur", this, "_doBlur"));
		this._connects.push(dojo.connect(grid.scroller, "renderPage", this, "_delayedCellFocus"));
		this.addArea({name:"header", onFocus:dojo.hitch(this, this.focusHeader), onBlur:dojo.hitch(this, this._blurHeader), onMove:dojo.hitch(this, this._navHeader), getRegions:dojo.hitch(this, this._findHeaderCells), onRegionFocus:dojo.hitch(this, this.doColHeaderFocus), onRegionBlur:dojo.hitch(this, this.doColHeaderBlur), onKeyDown:dojo.hitch(this, this._onHeaderKeyDown)});
		this.addArea({name:"content", onFocus:dojo.hitch(this, this._focusContent), onBlur:dojo.hitch(this, this._blurContent), onMove:dojo.hitch(this, this._navContent), onKeyDown:dojo.hitch(this, this._onContentKeyDown)});
		this.addArea({name:"editableCell", onFocus:dojo.hitch(this, this._focusEditableCell), onBlur:dojo.hitch(this, this._blurEditableCell), onKeyDown:dojo.hitch(this, this._onEditableCellKeyDown), onContentMouseEvent:dojo.hitch(this, this._onEditableCellMouseEvent), contentMouseEventPlanner:function (evt, areas) {
			return -1;
		}});
		this.placeArea("header");
		this.placeArea("content");
		this.placeArea("editableCell");
		this.placeArea("editableCell", "above", "content");
	}, destroy:function () {
		for (var name in this._areas) {
			var area = this._areas[name];
			dojo.forEach(area._connects, dojo.disconnect);
			area._connects = null;
			if (area.uninitialize) {
				area.uninitialize();
			}
		}
		this.inherited(arguments);
	}, addArea:function (area) {
		if (area.name && dojo.isString(area.name)) {
			if (this._areas[area.name]) {
				dojo.forEach(area._connects, dojo.disconnect);
			}
			this._areas[area.name] = new dojox.grid.enhanced._FocusArea(area, this);
			if (area.onHeaderMouseEvent) {
				this._headerMouseEventHandlers.push(area.name);
			}
			if (area.onContentMouseEvent) {
				this._contentMouseEventHandlers.push(area.name);
			}
		}
	}, getArea:function (areaName) {
		return this._areas[areaName];
	}, _bindAreaEvents:function () {
		var area, hdl, areas = this._areas;
		dojo.forEach(this._areaQueue, function (name) {
			area = areas[name];
			if (!area._initialized && dojo.isFunction(area.initialize)) {
				area.initialize();
				area._initialized = true;
			}
			if (area.getRegions) {
				area._regions = area.getRegions() || [];
				dojo.forEach(area._connects || [], dojo.disconnect);
				area._connects = [];
				dojo.forEach(area._regions, function (r) {
					if (area.onRegionFocus) {
						hdl = dojo.connect(r, "onfocus", area.onRegionFocus);
						area._connects.push(hdl);
					}
					if (area.onRegionBlur) {
						hdl = dojo.connect(r, "onblur", area.onRegionBlur);
						area._connects.push(hdl);
					}
				});
			}
		});
	}, removeArea:function (areaName) {
		var area = this._areas[areaName];
		if (area) {
			this.ignoreArea(areaName);
			var i = dojo.indexOf(this._contentMouseEventHandlers, areaName);
			if (i >= 0) {
				this._contentMouseEventHandlers.splice(i, 1);
			}
			i = dojo.indexOf(this._headerMouseEventHandlers, areaName);
			if (i >= 0) {
				this._headerMouseEventHandlers.splice(i, 1);
			}
			dojo.forEach(area._connects, dojo.disconnect);
			if (area.uninitialize) {
				area.uninitialize();
			}
			delete this._areas[areaName];
		}
	}, currentArea:function (areaName, toBlurOld) {
		var idx, cai = this._currentAreaIdx;
		if (dojo.isString(areaName) && (idx = dojo.indexOf(this._areaQueue, areaName)) >= 0) {
			if (cai != idx) {
				this.tabbingOut = false;
				if (toBlurOld && cai >= 0 && cai < this._areaQueue.length) {
					this._areas[this._areaQueue[cai]].onBlur();
				}
				this._currentAreaIdx = idx;
			}
		} else {
			return (cai < 0 || cai >= this._areaQueue.length) ? new dojox.grid.enhanced._FocusArea({}, this) : this._areas[this._areaQueue[this._currentAreaIdx]];
		}
		return null;
	}, placeArea:function (name, pos, otherAreaName) {
		if (!this._areas[name]) {
			return;
		}
		var idx = dojo.indexOf(this._areaQueue, otherAreaName);
		switch (pos) {
		  case "after":
			if (idx >= 0) {
				++idx;
			}
		  case "before":
			if (idx >= 0) {
				this._areaQueue.splice(idx, 0, name);
				break;
			}
		  default:
			this._areaQueue.push(name);
			break;
		  case "above":
			var isAbove = true;
		  case "below":
			var otherArea = this._areas[otherAreaName];
			if (otherArea) {
				if (isAbove) {
					otherArea._evtStack.push(name);
				} else {
					otherArea._evtStack.splice(0, 0, name);
				}
			}
		}
	}, ignoreArea:function (name) {
		this._areaQueue = dojo.filter(this._areaQueue, function (areaName) {
			return areaName != name;
		});
	}, focusArea:function (areaId, evt) {
		var idx;
		if (typeof areaId == "number") {
			idx = areaId < 0 ? this._areaQueue.length + areaId : areaId;
		} else {
			idx = dojo.indexOf(this._areaQueue, dojo.isString(areaId) ? areaId : (areaId && areaId.name));
		}
		if (idx < 0) {
			idx = 0;
		}
		var step = idx - this._currentAreaIdx;
		this._gridBlured = false;
		if (step) {
			this.tab(step, evt);
		} else {
			this.currentArea().onFocus(evt, step);
		}
	}, tab:function (step, evt) {
		this._gridBlured = false;
		this.tabbingOut = false;
		if (step === 0) {
			return;
		}
		var cai = this._currentAreaIdx;
		var dir = step > 0 ? 1 : -1;
		if (cai < 0 || cai >= this._areaQueue.length) {
			cai = (this._currentAreaIdx += step);
		} else {
			var nextArea = this._areas[this._areaQueue[cai]].onBlur(evt, step);
			if (nextArea === true) {
				cai = (this._currentAreaIdx += step);
			} else {
				if (dojo.isString(nextArea) && this._areas[nextArea]) {
					cai = this._currentAreaIdx = dojo.indexOf(this._areaQueue, nextArea);
				}
			}
		}
		for (; cai >= 0 && cai < this._areaQueue.length; cai += dir) {
			this._currentAreaIdx = cai;
			if (this._areaQueue[cai] && this._areas[this._areaQueue[cai]].onFocus(evt, step)) {
				return;
			}
		}
		this.tabbingOut = true;
		if (step < 0) {
			this._currentAreaIdx = -1;
			dijit.focus(this.grid.domNode);
		} else {
			this._currentAreaIdx = this._areaQueue.length;
			dijit.focus(this.grid.lastFocusNode);
		}
	}, _onMouseEvent:function (type, evt) {
		var lowercase = type.toLowerCase(), handlers = this["_" + lowercase + "MouseEventHandlers"], res = dojo.map(handlers, function (areaName) {
			return {"area":areaName, "idx":this._areas[areaName][lowercase + "MouseEventPlanner"](evt, handlers)};
		}, this).sort(function (a, b) {
			return b.idx - a.idx;
		}), resHandlers = dojo.map(res, function (handler) {
			return res.area;
		}), i = res.length;
		while (--i >= 0) {
			if (this._areas[res[i].area]["on" + type + "MouseEvent"](evt, resHandlers) === false) {
				return;
			}
		}
	}, contentMouseEvent:function (evt) {
		this._onMouseEvent("Content", evt);
	}, headerMouseEvent:function (evt) {
		this._onMouseEvent("Header", evt);
	}, initFocusView:function () {
		this.focusView = this.grid.views.getFirstScrollingView() || this.focusView || this.grid.views.views[0];
		this._bindAreaEvents();
	}, isNavHeader:function () {
		return this._areaQueue[this._currentAreaIdx] == "header";
	}, previousKey:function (e) {
		this.tab(-1, e);
	}, nextKey:function (e) {
		this.tab(1, e);
	}, setFocusCell:function (inCell, inRowIndex) {
		if (inCell) {
			this.currentArea(this.grid.edit.isEditing() ? "editableCell" : "content", true);
			this._focusifyCellNode(false);
			this.cell = inCell;
			this.rowIndex = inRowIndex;
			this._focusifyCellNode(true);
		}
		this.grid.onCellFocus(this.cell, this.rowIndex);
	}, doFocus:function (e) {
		if (e && e.target == e.currentTarget && !this.tabbingOut) {
			if (this._gridBlured) {
				this._gridBlured = false;
				if (this._currentAreaIdx < 0 || this._currentAreaIdx >= this._areaQueue.length) {
					this.focusArea(0, e);
				} else {
					this.focusArea(this._currentAreaIdx, e);
				}
			}
		} else {
			this.tabbingOut = false;
		}
		dojo.stopEvent(e);
	}, _doBlur:function () {
		this._gridBlured = true;
	}, doLastNodeFocus:function (e) {
		if (this.tabbingOut) {
			this.tabbingOut = false;
		} else {
			this.focusArea(-1, e);
		}
	}, _delayedHeaderFocus:function () {
		if (this.isNavHeader()) {
			this.focusHeader();
		}
	}, _delayedCellFocus:function () {
		this.currentArea("header", true);
		this.focusArea(this._currentAreaIdx);
	}, _changeMenuBindNode:function (oldBindNode, newBindNode) {
		var hm = this.grid.headerMenu;
		if (hm && this._contextMenuBindNode == oldBindNode) {
			hm.unBindDomNode(oldBindNode);
			hm.bindDomNode(newBindNode);
			this._contextMenuBindNode = newBindNode;
		}
	}, focusHeader:function (evt, step) {
		var didFocus = false;
		this.inherited(arguments);
		if (this._colHeadNode && dojo.style(this._colHeadNode, "display") != "none") {
			dijit.focus(this._colHeadNode);
			this._stopEvent(evt);
			didFocus = true;
		}
		return didFocus;
	}, _blurHeader:function (evt, step) {
		if (this._colHeadNode) {
			dojo.removeClass(this._colHeadNode, this.focusClass);
		}
		dojo.removeAttr(this.grid.domNode, "aria-activedescendant");
		this._changeMenuBindNode(this.grid.domNode, this.grid.viewsHeaderNode);
		this._colHeadNode = this._colHeadFocusIdx = null;
		return true;
	}, _navHeader:function (rowStep, colStep, evt) {
		var colDir = colStep < 0 ? -1 : 1, savedIdx = dojo.indexOf(this._findHeaderCells(), this._colHeadNode);
		if (savedIdx >= 0 && (evt.shiftKey && evt.ctrlKey)) {
			this.colSizeAdjust(evt, savedIdx, colDir * 5);
			return;
		}
		this.move(rowStep, colStep);
	}, _onHeaderKeyDown:function (e, isBubble) {
		if (isBubble) {
			var dk = dojo.keys;
			switch (e.keyCode) {
			  case dk.ENTER:
			  case dk.SPACE:
				var colIdx = this.getHeaderIndex();
				if (colIdx >= 0 && !this.grid.pluginMgr.isFixedCell(e.cell)) {
					this.grid.setSortIndex(colIdx, null, e);
					dojo.stopEvent(e);
				}
				break;
			}
		}
		return true;
	}, _setActiveColHeader:function () {
		this.inherited(arguments);
		dijit.focus(this._colHeadNode);
	}, findAndFocusGridCell:function () {
		this._focusContent();
	}, _focusContent:function (evt, step) {
		var didFocus = true;
		var isEmpty = (this.grid.rowCount === 0);
		if (this.isNoFocusCell() && !isEmpty) {
			for (var i = 0, cell = this.grid.getCell(0); cell && cell.hidden; cell = this.grid.getCell(++i)) {
			}
			this.setFocusIndex(0, cell ? i : 0);
		} else {
			if (this.cell && !isEmpty) {
				if (this.focusView && !this.focusView.rowNodes[this.rowIndex]) {
					this.grid.scrollToRow(this.rowIndex);
					this.focusGrid();
				} else {
					this.setFocusIndex(this.rowIndex, this.cell.index);
				}
			} else {
				didFocus = false;
			}
		}
		if (didFocus) {
			this._stopEvent(evt);
		}
		return didFocus;
	}, _blurContent:function (evt, step) {
		this._focusifyCellNode(false);
		return true;
	}, _navContent:function (rowStep, colStep, evt) {
		if ((this.rowIndex === 0 && rowStep < 0) || (this.rowIndex === this.grid.rowCount - 1 && rowStep > 0)) {
			return;
		}
		this._colHeadNode = null;
		this.move(rowStep, colStep, evt);
		if (evt) {
			dojo.stopEvent(evt);
		}
	}, _onContentKeyDown:function (e, isBubble) {
		if (isBubble) {
			var dk = dojo.keys, s = this.grid.scroller;
			switch (e.keyCode) {
			  case dk.ENTER:
			  case dk.SPACE:
				var g = this.grid;
				if (g.indirectSelection) {
					break;
				}
				g.selection.clickSelect(this.rowIndex, dojo.isCopyKey(e), e.shiftKey);
				g.onRowClick(e);
				dojo.stopEvent(e);
				break;
			  case dk.PAGE_UP:
				if (this.rowIndex !== 0) {
					if (this.rowIndex != s.firstVisibleRow + 1) {
						this._navContent(s.firstVisibleRow - this.rowIndex, 0);
					} else {
						this.grid.setScrollTop(s.findScrollTop(this.rowIndex - 1));
						this._navContent(s.firstVisibleRow - s.lastVisibleRow + 1, 0);
					}
					dojo.stopEvent(e);
				}
				break;
			  case dk.PAGE_DOWN:
				if (this.rowIndex + 1 != this.grid.rowCount) {
					dojo.stopEvent(e);
					if (this.rowIndex != s.lastVisibleRow - 1) {
						this._navContent(s.lastVisibleRow - this.rowIndex - 1, 0);
					} else {
						this.grid.setScrollTop(s.findScrollTop(this.rowIndex + 1));
						this._navContent(s.lastVisibleRow - s.firstVisibleRow - 1, 0);
					}
					dojo.stopEvent(e);
				}
				break;
			}
		}
		return true;
	}, _blurFromEditableCell:false, _isNavigating:false, _navElems:null, _focusEditableCell:function (evt, step) {
		var didFocus = false;
		if (this._isNavigating) {
			didFocus = true;
		} else {
			if (this.grid.edit.isEditing() && this.cell) {
				if (this._blurFromEditableCell || !this._blurEditableCell(evt, step)) {
					this.setFocusIndex(this.rowIndex, this.cell.index);
					didFocus = true;
				}
				this._stopEvent(evt);
			}
		}
		return didFocus;
	}, _applyEditableCell:function () {
		try {
			this.grid.edit.apply();
		}
		catch (e) {
			console.warn("_FocusManager._applyEditableCell() error:", e);
		}
	}, _blurEditableCell:function (evt, step) {
		this._blurFromEditableCell = false;
		if (this._isNavigating) {
			var toBlur = true;
			if (evt) {
				var elems = this._navElems;
				var firstElem = elems.lowest || elems.first;
				var lastElem = elems.last || elems.highest || firstElem;
				var target = dojo.isIE ? evt.srcElement : evt.target;
				toBlur = target == (step > 0 ? lastElem : firstElem);
			}
			if (toBlur) {
				this._isNavigating = false;
				return "content";
			}
			return false;
		} else {
			if (this.grid.edit.isEditing() && this.cell) {
				if (!step || typeof step != "number") {
					return false;
				}
				var dir = step > 0 ? 1 : -1;
				var cc = this.grid.layout.cellCount;
				for (var cell, col = this.cell.index + dir; col >= 0 && col < cc; col += dir) {
					cell = this.grid.getCell(col);
					if (cell.editable) {
						this.cell = cell;
						this._blurFromEditableCell = true;
						return false;
					}
				}
				if ((this.rowIndex > 0 || dir == 1) && (this.rowIndex < this.grid.rowCount || dir == -1)) {
					this.rowIndex += dir;
					for (col = dir > 0 ? 0 : cc - 1; col >= 0 && col < cc; col += dir) {
						cell = this.grid.getCell(col);
						if (cell.editable) {
							this.cell = cell;
							break;
						}
					}
					this._applyEditableCell();
					return "content";
				}
			}
		}
		return true;
	}, _initNavigatableElems:function () {
		this._navElems = dijit._getTabNavigable(this.cell.getNode(this.rowIndex));
	}, _onEditableCellKeyDown:function (e, isBubble) {
		var dk = dojo.keys, g = this.grid, edit = g.edit, editApplied = false, toPropagate = true;
		switch (e.keyCode) {
		  case dk.ENTER:
			if (isBubble && edit.isEditing()) {
				this._applyEditableCell();
				editApplied = true;
				dojo.stopEvent(e);
			}
		  case dk.SPACE:
			if (!isBubble && this._isNavigating) {
				toPropagate = false;
				break;
			}
			if (isBubble) {
				if (!this.cell.editable && this.cell.navigatable) {
					this._initNavigatableElems();
					var toFocus = this._navElems.lowest || this._navElems.first;
					if (toFocus) {
						this._isNavigating = true;
						dijit.focus(toFocus);
						dojo.stopEvent(e);
						this.currentArea("editableCell", true);
						break;
					}
				}
				if (!editApplied && !edit.isEditing() && !g.pluginMgr.isFixedCell(this.cell)) {
					edit.setEditCell(this.cell, this.rowIndex);
				}
				if (editApplied) {
					this.currentArea("content", true);
				} else {
					if (this.cell.editable && g.canEdit()) {
						this.currentArea("editableCell", true);
					}
				}
			}
			break;
		  case dk.PAGE_UP:
		  case dk.PAGE_DOWN:
			if (!isBubble && edit.isEditing()) {
				toPropagate = false;
			}
			break;
		  case dk.ESCAPE:
			if (!isBubble) {
				edit.cancel();
				this.currentArea("content", true);
			}
		}
		return toPropagate;
	}, _onEditableCellMouseEvent:function (evt) {
		if (evt.type == "click") {
			var cell = this.cell || evt.cell;
			if (cell && !cell.editable && cell.navigatable) {
				this._initNavigatableElems();
				if (this._navElems.lowest || this._navElems.first) {
					var target = dojo.isIE ? evt.srcElement : evt.target;
					if (target != cell.getNode(evt.rowIndex)) {
						this._isNavigating = true;
						this.focusArea("editableCell", evt);
						dijit.focus(target);
						return false;
					}
				}
			} else {
				if (this.grid.singleClickEdit) {
					this.currentArea("editableCell");
					return false;
				}
			}
		}
		return true;
	}});
}
