/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.plugins.drawing.GreekPalette"]) {
	dojo._hasResource["dojox.drawing.plugins.drawing.GreekPalette"] = true;
	dojo.provide("dojox.drawing.plugins.drawing.GreekPalette");
	dojo.require("dojox.drawing.library.greek");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._PaletteMixin");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "latinEntities", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dojox.drawing.plugins.drawing.GreekPalette", [dijit._Widget, dijit._Templated, dijit._PaletteMixin], {postMixInProperties:function () {
		var choices = dojox.drawing.library.greek;
		var numChoices = 0;
		var entityKey;
		for (entityKey in choices) {
			numChoices++;
		}
		var choicesPerRow = Math.floor(Math.sqrt(numChoices));
		var numRows = choicesPerRow;
		var currChoiceIdx = 0;
		var rows = [];
		var row = [];
		for (entityKey in choices) {
			currChoiceIdx++;
			row.push(entityKey);
			if (currChoiceIdx % numRows === 0) {
				rows.push(row);
				row = [];
			}
		}
		if (row.length > 0) {
			rows.push(row);
		}
		this._palette = rows;
	}, onChange:function (val) {
		var textBlock = this._textBlock;
		dijit.popup.close(this);
		textBlock.insertText(this._pushChangeTo, val);
		textBlock._dropMode = false;
	}, onCancel:function (closeAll) {
		dijit.popup.close(this);
		this._textBlock._dropMode = false;
	}, id:"dropdown", templateString:"<div class=\"dojoxEntityPalette\">\n" + "\t<table>\n" + "\t\t<tbody>\n" + "\t\t\t<tr>\n" + "\t\t\t\t<td>\n" + "\t\t\t\t\t<table class=\"dijitPaletteTable\">\n" + "\t\t\t\t\t\t<tbody dojoAttachPoint=\"gridNode\"></tbody>\n" + "\t\t\t\t   </table>\n" + "\t\t\t\t</td>\n" + "\t\t\t</tr>\n" + "\t\t\t<tr>\n" + "\t\t\t\t<td>\n" + "\t\t\t\t\t<table dojoAttachPoint=\"previewPane\" class=\"dojoxEntityPalettePreviewTable\">\n" + "\t\t\t\t\t\t<tbody>\n" + "\t\t\t\t\t\t\t<tr>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetailEntity\">Type: <span class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"previewNode\"></span></td>\n" + "\t\t\t\t\t\t\t</tr>\n" + "\t\t\t\t\t\t</tbody>\n" + "\t\t\t\t\t</table>\n" + "\t\t\t\t</td>\n" + "\t\t\t</tr>\n" + "\t\t</tbody>\n" + "\t</table>\n" + "</div>", baseClass:"dojoxEntityPalette", showPreview:true, dyeClass:"dojox.drawing.plugins.Greeks", paletteClass:"editorLatinEntityPalette", cellClass:"dojoxEntityPaletteCell", buildRendering:function () {
		this.inherited(arguments);
		var i18n = dojo.i18n.getLocalization("dojox.editor.plugins", "latinEntities");
		this._preparePalette(this._palette, i18n);
		var cells = dojo.query(".dojoxEntityPaletteCell", this.gridNode);
		dojo.forEach(cells, function (cellNode) {
			this.connect(cellNode, "onmouseenter", "_onCellMouseEnter");
		}, this);
	}, _onCellMouseEnter:function (e) {
		if (this.showPreview) {
			this._displayDetails(e.target);
		}
	}, _onCellClick:function (evt) {
		var target = evt.type == "click" ? evt.currentTarget : this._currentFocus, value = this._getDye(target).getValue();
		this._setCurrent(target);
		setTimeout(dojo.hitch(this, function () {
			dijit.focus(target);
			this._setValueAttr(value, true);
		}));
		dojo.removeClass(target, "dijitPaletteCellHover");
		dojo.stopEvent(evt);
	}, postCreate:function () {
		this.inherited(arguments);
		if (!this.showPreview) {
			dojo.style(this.previewNode, "display", "none");
		}
	}, _setCurrent:function (node) {
		if ("_currentFocus" in this) {
			dojo.attr(this._currentFocus, "tabIndex", "-1");
			dojo.removeClass(this._currentFocus, "dojoxEntityPaletteCellHover");
		}
		this._currentFocus = node;
		if (node) {
			dojo.attr(node, "tabIndex", this.tabIndex);
			dojo.addClass(this._currentFocus, "dojoxEntityPaletteCellHover");
		}
		if (this.showPreview) {
			this._displayDetails(node);
		}
	}, _displayDetails:function (cell) {
		var dye = this._getDye(cell);
		if (dye) {
			var ehtml = dye.getValue();
			var ename = dye._alias;
			this.previewNode.innerHTML = ehtml;
		} else {
			this.previewNode.innerHTML = "";
			this.descNode.innerHTML = "";
		}
	}, _preparePalette:function (choices, titles) {
		this._cells = [];
		var url = this._blankGif;
		var dyeClassObj = dojo.getObject(this.dyeClass);
		for (var row = 0; row < choices.length; row++) {
			var rowNode = dojo.create("tr", {tabIndex:"-1"}, this.gridNode);
			for (var col = 0; col < choices[row].length; col++) {
				var value = choices[row][col];
				if (value) {
					var cellObject = new dyeClassObj(value);
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
	}, _navigateByArrow:function (evt) {
		var keyIncrementMap = {38:-this._xDim, 40:this._xDim, 39:this.isLeftToRight() ? 1 : -1, 37:this.isLeftToRight() ? -1 : 1};
		var increment = keyIncrementMap[evt.keyCode];
		var newFocusIndex = this._currentFocus.index + increment;
		if (newFocusIndex < this._cells.length && newFocusIndex > -1) {
			var focusNode = this._cells[newFocusIndex].node;
			this._setCurrent(focusNode);
		}
	}});
	dojo.declare("dojox.drawing.plugins.Greeks", null, {constructor:function (alias) {
		this._alias = alias;
	}, getValue:function () {
		return this._alias;
	}, fillCell:function (cell) {
		cell.innerHTML = "&" + this._alias + ";";
	}});
}

