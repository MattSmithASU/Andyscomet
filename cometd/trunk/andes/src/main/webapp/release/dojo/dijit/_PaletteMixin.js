/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._PaletteMixin"]) {
	dojo._hasResource["dijit._PaletteMixin"] = true;
	dojo.provide("dijit._PaletteMixin");
	dojo.require("dijit._CssStateMixin");
	dojo.declare("dijit._PaletteMixin", [dijit._CssStateMixin], {defaultTimeout:500, timeoutChangeRate:0.9, value:null, _selectedCell:-1, tabIndex:"0", cellClass:"dijitPaletteCell", dyeClass:"", _preparePalette:function (choices, titles, dyeClassObj) {
		this._cells = [];
		var url = this._blankGif;
		dyeClassObj = dyeClassObj || dojo.getObject(this.dyeClass);
		for (var row = 0; row < choices.length; row++) {
			var rowNode = dojo.create("tr", {tabIndex:"-1"}, this.gridNode);
			for (var col = 0; col < choices[row].length; col++) {
				var value = choices[row][col];
				if (value) {
					var cellObject = new dyeClassObj(value, row, col);
					var cellNode = dojo.create("td", {"class":this.cellClass, tabIndex:"-1", title:titles[value]});
					cellObject.fillCell(cellNode, url);
					this.connect(cellNode, "ondijitclick", "_onCellClick");
					this._trackMouseState(cellNode, this.cellClass);
					dojo.place(cellNode, rowNode);
					cellNode.index = this._cells.length;
					this._cells.push({node:cellNode, dye:cellObject});
				}
			}
		}
		this._xDim = choices[0].length;
		this._yDim = choices.length;
		var keyIncrementMap = {UP_ARROW:-this._xDim, DOWN_ARROW:this._xDim, RIGHT_ARROW:this.isLeftToRight() ? 1 : -1, LEFT_ARROW:this.isLeftToRight() ? -1 : 1};
		for (var key in keyIncrementMap) {
			this._connects.push(dijit.typematic.addKeyListener(this.domNode, {charOrCode:dojo.keys[key], ctrlKey:false, altKey:false, shiftKey:false}, this, function () {
				var increment = keyIncrementMap[key];
				return function (count) {
					this._navigateByKey(increment, count);
				};
			}(), this.timeoutChangeRate, this.defaultTimeout));
		}
	}, postCreate:function () {
		this.inherited(arguments);
		this._setCurrent(this._cells[0].node);
	}, focus:function () {
		dijit.focus(this._currentFocus);
	}, _onCellClick:function (evt) {
		var target = evt.currentTarget, value = this._getDye(target).getValue();
		this._setCurrent(target);
		setTimeout(dojo.hitch(this, function () {
			dijit.focus(target);
			this._setValueAttr(value, true);
		}));
		dojo.removeClass(target, "dijitPaletteCellHover");
		dojo.stopEvent(evt);
	}, _setCurrent:function (node) {
		if ("_currentFocus" in this) {
			dojo.attr(this._currentFocus, "tabIndex", "-1");
		}
		this._currentFocus = node;
		if (node) {
			dojo.attr(node, "tabIndex", this.tabIndex);
		}
	}, _setValueAttr:function (value, priorityChange) {
		if (this._selectedCell >= 0) {
			dojo.removeClass(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
		}
		this._selectedCell = -1;
		if (value) {
			for (var i = 0; i < this._cells.length; i++) {
				if (value == this._cells[i].dye.getValue()) {
					this._selectedCell = i;
					dojo.addClass(this._cells[i].node, "dijitPaletteCellSelected");
					break;
				}
			}
		}
		this._set("value", this._selectedCell >= 0 ? value : null);
		if (priorityChange || priorityChange === undefined) {
			this.onChange(value);
		}
	}, onChange:function (value) {
	}, _navigateByKey:function (increment, typeCount) {
		if (typeCount == -1) {
			return;
		}
		var newFocusIndex = this._currentFocus.index + increment;
		if (newFocusIndex < this._cells.length && newFocusIndex > -1) {
			var focusNode = this._cells[newFocusIndex].node;
			this._setCurrent(focusNode);
			setTimeout(dojo.hitch(dijit, "focus", focusNode), 0);
		}
	}, _getDye:function (cell) {
		return this._cells[cell.index].dye;
	}});
}

