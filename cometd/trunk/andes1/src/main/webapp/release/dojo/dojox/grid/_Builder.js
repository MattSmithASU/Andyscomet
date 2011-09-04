/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid._Builder"]) {
	dojo._hasResource["dojox.grid._Builder"] = true;
	dojo.provide("dojox.grid._Builder");
	dojo.require("dojox.grid.util");
	dojo.require("dojo.dnd.Moveable");
	(function () {
		var dg = dojox.grid;
		var getTdIndex = function (td) {
			return td.cellIndex >= 0 ? td.cellIndex : dojo.indexOf(td.parentNode.cells, td);
		};
		var getTrIndex = function (tr) {
			return tr.rowIndex >= 0 ? tr.rowIndex : dojo.indexOf(tr.parentNode.childNodes, tr);
		};
		var getTr = function (rowOwner, index) {
			return rowOwner && ((rowOwner.rows || 0)[index] || rowOwner.childNodes[index]);
		};
		var findTable = function (node) {
			for (var n = node; n && n.tagName != "TABLE"; n = n.parentNode) {
			}
			return n;
		};
		var ascendDom = function (inNode, inWhile) {
			for (var n = inNode; n && inWhile(n); n = n.parentNode) {
			}
			return n;
		};
		var makeNotTagName = function (inTagName) {
			var name = inTagName.toUpperCase();
			return function (node) {
				return node.tagName != name;
			};
		};
		var rowIndexTag = dojox.grid.util.rowIndexTag;
		var gridViewTag = dojox.grid.util.gridViewTag;
		dg._Builder = dojo.extend(function (view) {
			if (view) {
				this.view = view;
				this.grid = view.grid;
			}
		}, {view:null, _table:"<table class=\"dojoxGridRowTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"", getTableArray:function () {
			var html = [this._table];
			if (this.view.viewWidth) {
				html.push([" style=\"width:", this.view.viewWidth, ";\""].join(""));
			}
			html.push(">");
			return html;
		}, generateCellMarkup:function (inCell, inMoreStyles, inMoreClasses, isHeader) {
			var result = [], html;
			if (isHeader) {
				var sortInfo = inCell.index != inCell.grid.getSortIndex() ? "" : inCell.grid.sortInfo > 0 ? "aria-sort=\"ascending\"" : "aria-sort=\"descending\"";
				if (!inCell.id) {
					inCell.id = this.grid.id + "Hdr" + inCell.index;
				}
				html = ["<th tabIndex=\"-1\" aria-readonly=\"true\" role=\"columnheader\"", sortInfo, "id=\"", inCell.id, "\""];
			} else {
				var editInfo = this.grid.editable && !inCell.editable ? "aria-readonly=\"true\"" : "";
				html = ["<td tabIndex=\"-1\" role=\"gridcell\"", editInfo];
			}
			if (inCell.colSpan) {
				html.push(" colspan=\"", inCell.colSpan, "\"");
			}
			if (inCell.rowSpan) {
				html.push(" rowspan=\"", inCell.rowSpan, "\"");
			}
			html.push(" class=\"dojoxGridCell ");
			if (inCell.classes) {
				html.push(inCell.classes, " ");
			}
			if (inMoreClasses) {
				html.push(inMoreClasses, " ");
			}
			result.push(html.join(""));
			result.push("");
			html = ["\" idx=\"", inCell.index, "\" style=\""];
			if (inMoreStyles && inMoreStyles[inMoreStyles.length - 1] != ";") {
				inMoreStyles += ";";
			}
			html.push(inCell.styles, inMoreStyles || "", inCell.hidden ? "display:none;" : "");
			if (inCell.unitWidth) {
				html.push("width:", inCell.unitWidth, ";");
			}
			result.push(html.join(""));
			result.push("");
			html = ["\""];
			if (inCell.attrs) {
				html.push(" ", inCell.attrs);
			}
			html.push(">");
			result.push(html.join(""));
			result.push("");
			result.push(isHeader ? "</th>" : "</td>");
			return result;
		}, isCellNode:function (inNode) {
			return Boolean(inNode && inNode != dojo.doc && dojo.attr(inNode, "idx"));
		}, getCellNodeIndex:function (inCellNode) {
			return inCellNode ? Number(dojo.attr(inCellNode, "idx")) : -1;
		}, getCellNode:function (inRowNode, inCellIndex) {
			for (var i = 0, row; ((row = getTr(inRowNode.firstChild, i)) && row.cells); i++) {
				for (var j = 0, cell; (cell = row.cells[j]); j++) {
					if (this.getCellNodeIndex(cell) == inCellIndex) {
						return cell;
					}
				}
			}
			return null;
		}, findCellTarget:function (inSourceNode, inTopNode) {
			var n = inSourceNode;
			while (n && (!this.isCellNode(n) || (n.offsetParent && gridViewTag in n.offsetParent.parentNode && n.offsetParent.parentNode[gridViewTag] != this.view.id)) && (n != inTopNode)) {
				n = n.parentNode;
			}
			return n != inTopNode ? n : null;
		}, baseDecorateEvent:function (e) {
			e.dispatch = "do" + e.type;
			e.grid = this.grid;
			e.sourceView = this.view;
			e.cellNode = this.findCellTarget(e.target, e.rowNode);
			e.cellIndex = this.getCellNodeIndex(e.cellNode);
			e.cell = (e.cellIndex >= 0 ? this.grid.getCell(e.cellIndex) : null);
		}, findTarget:function (inSource, inTag) {
			var n = inSource;
			while (n && (n != this.domNode) && (!(inTag in n) || (gridViewTag in n && n[gridViewTag] != this.view.id))) {
				n = n.parentNode;
			}
			return (n != this.domNode) ? n : null;
		}, findRowTarget:function (inSource) {
			return this.findTarget(inSource, rowIndexTag);
		}, isIntraNodeEvent:function (e) {
			try {
				return (e.cellNode && e.relatedTarget && dojo.isDescendant(e.relatedTarget, e.cellNode));
			}
			catch (x) {
				return false;
			}
		}, isIntraRowEvent:function (e) {
			try {
				var row = e.relatedTarget && this.findRowTarget(e.relatedTarget);
				return !row && (e.rowIndex == -1) || row && (e.rowIndex == row.gridRowIndex);
			}
			catch (x) {
				return false;
			}
		}, dispatchEvent:function (e) {
			if (e.dispatch in this) {
				return this[e.dispatch](e);
			}
			return false;
		}, domouseover:function (e) {
			if (e.cellNode && (e.cellNode != this.lastOverCellNode)) {
				this.lastOverCellNode = e.cellNode;
				this.grid.onMouseOver(e);
			}
			this.grid.onMouseOverRow(e);
		}, domouseout:function (e) {
			if (e.cellNode && (e.cellNode == this.lastOverCellNode) && !this.isIntraNodeEvent(e, this.lastOverCellNode)) {
				this.lastOverCellNode = null;
				this.grid.onMouseOut(e);
				if (!this.isIntraRowEvent(e)) {
					this.grid.onMouseOutRow(e);
				}
			}
		}, domousedown:function (e) {
			if (e.cellNode) {
				this.grid.onMouseDown(e);
			}
			this.grid.onMouseDownRow(e);
		}});
		dg._ContentBuilder = dojo.extend(function (view) {
			dg._Builder.call(this, view);
		}, dg._Builder.prototype, {update:function () {
			this.prepareHtml();
		}, prepareHtml:function () {
			var defaultGet = this.grid.get, cells = this.view.structure.cells;
			for (var j = 0, row; (row = cells[j]); j++) {
				for (var i = 0, cell; (cell = row[i]); i++) {
					cell.get = cell.get || (cell.value == undefined) && defaultGet;
					cell.markup = this.generateCellMarkup(cell, cell.cellStyles, cell.cellClasses, false);
					if (!this.grid.editable && cell.editable) {
						this.grid.editable = true;
					}
				}
			}
		}, generateHtml:function (inDataIndex, inRowIndex) {
			var html = this.getTableArray(), v = this.view, cells = v.structure.cells, item = this.grid.getItem(inRowIndex);
			dojox.grid.util.fire(this.view, "onBeforeRow", [inRowIndex, cells]);
			for (var j = 0, row; (row = cells[j]); j++) {
				if (row.hidden || row.header) {
					continue;
				}
				html.push(!row.invisible ? "<tr>" : "<tr class=\"dojoxGridInvisible\">");
				for (var i = 0, cell, m, cc, cs; (cell = row[i]); i++) {
					m = cell.markup;
					cc = cell.customClasses = [];
					cs = cell.customStyles = [];
					m[5] = cell.format(inRowIndex, item);
					m[1] = cc.join(" ");
					m[3] = cs.join(";");
					html.push.apply(html, m);
				}
				html.push("</tr>");
			}
			html.push("</table>");
			return html.join("");
		}, decorateEvent:function (e) {
			e.rowNode = this.findRowTarget(e.target);
			if (!e.rowNode) {
				return false;
			}
			e.rowIndex = e.rowNode[rowIndexTag];
			this.baseDecorateEvent(e);
			e.cell = this.grid.getCell(e.cellIndex);
			return true;
		}});
		dg._HeaderBuilder = dojo.extend(function (view) {
			this.moveable = null;
			dg._Builder.call(this, view);
		}, dg._Builder.prototype, {_skipBogusClicks:false, overResizeWidth:4, minColWidth:1, update:function () {
			if (this.tableMap) {
				this.tableMap.mapRows(this.view.structure.cells);
			} else {
				this.tableMap = new dg._TableMap(this.view.structure.cells);
			}
		}, generateHtml:function (inGetValue, inValue) {
			var html = this.getTableArray(), cells = this.view.structure.cells;
			dojox.grid.util.fire(this.view, "onBeforeRow", [-1, cells]);
			for (var j = 0, row; (row = cells[j]); j++) {
				if (row.hidden) {
					continue;
				}
				html.push(!row.invisible ? "<tr>" : "<tr class=\"dojoxGridInvisible\">");
				for (var i = 0, cell, markup; (cell = row[i]); i++) {
					cell.customClasses = [];
					cell.customStyles = [];
					if (this.view.simpleStructure) {
						if (cell.draggable) {
							if (cell.headerClasses) {
								if (cell.headerClasses.indexOf("dojoDndItem") == -1) {
									cell.headerClasses += " dojoDndItem";
								}
							} else {
								cell.headerClasses = "dojoDndItem";
							}
						}
						if (cell.attrs) {
							if (cell.attrs.indexOf("dndType='gridColumn_") == -1) {
								cell.attrs += " dndType='gridColumn_" + this.grid.id + "'";
							}
						} else {
							cell.attrs = "dndType='gridColumn_" + this.grid.id + "'";
						}
					}
					markup = this.generateCellMarkup(cell, cell.headerStyles, cell.headerClasses, true);
					markup[5] = (inValue != undefined ? inValue : inGetValue(cell));
					markup[3] = cell.customStyles.join(";");
					markup[1] = cell.customClasses.join(" ");
					html.push(markup.join(""));
				}
				html.push("</tr>");
			}
			html.push("</table>");
			return html.join("");
		}, getCellX:function (e) {
			var n, x = e.layerX;
			if (dojo.isMoz) {
				n = ascendDom(e.target, makeNotTagName("th"));
				x -= (n && n.offsetLeft) || 0;
				var t = e.sourceView.getScrollbarWidth();
				if (!dojo._isBodyLtr()) {
					table = ascendDom(n, makeNotTagName("table"));
					x -= (table && table.offsetLeft) || 0;
				}
			}
			n = ascendDom(e.target, function () {
				if (!n || n == e.cellNode) {
					return false;
				}
				x += (n.offsetLeft < 0 ? 0 : n.offsetLeft);
				return true;
			});
			return x;
		}, decorateEvent:function (e) {
			this.baseDecorateEvent(e);
			e.rowIndex = -1;
			e.cellX = this.getCellX(e);
			return true;
		}, prepareResize:function (e, mod) {
			do {
				var i = getTdIndex(e.cellNode);
				e.cellNode = (i ? e.cellNode.parentNode.cells[i + mod] : null);
				e.cellIndex = (e.cellNode ? this.getCellNodeIndex(e.cellNode) : -1);
			} while (e.cellNode && e.cellNode.style.display == "none");
			return Boolean(e.cellNode);
		}, canResize:function (e) {
			if (!e.cellNode || e.cellNode.colSpan > 1) {
				return false;
			}
			var cell = this.grid.getCell(e.cellIndex);
			return !cell.noresize && cell.canResize();
		}, overLeftResizeArea:function (e) {
			if (dojo.hasClass(dojo.body(), "dojoDndMove")) {
				return false;
			}
			if (dojo.isIE) {
				var tN = e.target;
				if (dojo.hasClass(tN, "dojoxGridArrowButtonNode") || dojo.hasClass(tN, "dojoxGridArrowButtonChar")) {
					return false;
				}
			}
			if (dojo._isBodyLtr()) {
				return (e.cellIndex > 0) && (e.cellX > 0 && e.cellX < this.overResizeWidth) && this.prepareResize(e, -1);
			}
			var t = e.cellNode && (e.cellX > 0 && e.cellX < this.overResizeWidth);
			return t;
		}, overRightResizeArea:function (e) {
			if (dojo.hasClass(dojo.body(), "dojoDndMove")) {
				return false;
			}
			if (dojo.isIE) {
				var tN = e.target;
				if (dojo.hasClass(tN, "dojoxGridArrowButtonNode") || dojo.hasClass(tN, "dojoxGridArrowButtonChar")) {
					return false;
				}
			}
			if (dojo._isBodyLtr()) {
				return e.cellNode && (e.cellX >= e.cellNode.offsetWidth - this.overResizeWidth);
			}
			return (e.cellIndex > 0) && (e.cellX >= e.cellNode.offsetWidth - this.overResizeWidth) && this.prepareResize(e, -1);
		}, domousemove:function (e) {
			if (!this.moveable) {
				var c = (this.overRightResizeArea(e) ? "dojoxGridColResize" : (this.overLeftResizeArea(e) ? "dojoxGridColResize" : ""));
				if (c && !this.canResize(e)) {
					c = "dojoxGridColNoResize";
				}
				dojo.toggleClass(e.sourceView.headerNode, "dojoxGridColNoResize", (c == "dojoxGridColNoResize"));
				dojo.toggleClass(e.sourceView.headerNode, "dojoxGridColResize", (c == "dojoxGridColResize"));
				if (dojo.isIE) {
					var t = e.sourceView.headerNode.scrollLeft;
					e.sourceView.headerNode.scrollLeft = t;
				}
				if (c) {
					dojo.stopEvent(e);
				}
			}
		}, domousedown:function (e) {
			if (!this.moveable) {
				if ((this.overRightResizeArea(e) || this.overLeftResizeArea(e)) && this.canResize(e)) {
					this.beginColumnResize(e);
				} else {
					this.grid.onMouseDown(e);
					this.grid.onMouseOverRow(e);
				}
			}
		}, doclick:function (e) {
			if (this._skipBogusClicks) {
				dojo.stopEvent(e);
				return true;
			}
			return false;
		}, colResizeSetup:function (e, isMouse) {
			var headContentBox = dojo.contentBox(e.sourceView.headerNode);
			if (isMouse) {
				this.lineDiv = document.createElement("div");
				var vw = (dojo.position || dojo._abs)(e.sourceView.headerNode, true);
				var bodyContentBox = dojo.contentBox(e.sourceView.domNode);
				var l = e.pageX;
				if (!dojo._isBodyLtr() && dojo.isIE < 8) {
					l -= dojox.html.metrics.getScrollbar().w;
				}
				dojo.style(this.lineDiv, {top:vw.y + "px", left:l + "px", height:(bodyContentBox.h + headContentBox.h) + "px"});
				dojo.addClass(this.lineDiv, "dojoxGridResizeColLine");
				this.lineDiv._origLeft = l;
				dojo.body().appendChild(this.lineDiv);
			}
			var spanners = [], nodes = this.tableMap.findOverlappingNodes(e.cellNode);
			for (var i = 0, cell; (cell = nodes[i]); i++) {
				spanners.push({node:cell, index:this.getCellNodeIndex(cell), width:cell.offsetWidth});
			}
			var view = e.sourceView;
			var adj = dojo._isBodyLtr() ? 1 : -1;
			var views = e.grid.views.views;
			var followers = [];
			for (var j = view.idx + adj, cView; (cView = views[j]); j = j + adj) {
				followers.push({node:cView.headerNode, left:window.parseInt(cView.headerNode.style.left)});
			}
			var table = view.headerContentNode.firstChild;
			var drag = {scrollLeft:e.sourceView.headerNode.scrollLeft, view:view, node:e.cellNode, index:e.cellIndex, w:dojo.contentBox(e.cellNode).w, vw:headContentBox.w, table:table, tw:dojo.contentBox(table).w, spanners:spanners, followers:followers};
			return drag;
		}, beginColumnResize:function (e) {
			this.moverDiv = document.createElement("div");
			dojo.style(this.moverDiv, {position:"absolute", left:0});
			dojo.body().appendChild(this.moverDiv);
			dojo.addClass(this.grid.domNode, "dojoxGridColumnResizing");
			var m = (this.moveable = new dojo.dnd.Moveable(this.moverDiv));
			var drag = this.colResizeSetup(e, true);
			m.onMove = dojo.hitch(this, "doResizeColumn", drag);
			dojo.connect(m, "onMoveStop", dojo.hitch(this, function () {
				this.endResizeColumn(drag);
				if (drag.node.releaseCapture) {
					drag.node.releaseCapture();
				}
				this.moveable.destroy();
				delete this.moveable;
				this.moveable = null;
				dojo.removeClass(this.grid.domNode, "dojoxGridColumnResizing");
			}));
			if (e.cellNode.setCapture) {
				e.cellNode.setCapture();
			}
			m.onMouseDown(e);
		}, doResizeColumn:function (inDrag, mover, leftTop) {
			var changeX = leftTop.l;
			var data = {deltaX:changeX, w:inDrag.w + (dojo._isBodyLtr() ? changeX : -changeX), vw:inDrag.vw + changeX, tw:inDrag.tw + changeX};
			this.dragRecord = {inDrag:inDrag, mover:mover, leftTop:leftTop};
			if (data.w >= this.minColWidth) {
				if (!mover) {
					this.doResizeNow(inDrag, data);
				} else {
					dojo.style(this.lineDiv, "left", (this.lineDiv._origLeft + data.deltaX) + "px");
				}
			}
		}, endResizeColumn:function (inDrag) {
			if (this.dragRecord) {
				var leftTop = this.dragRecord.leftTop;
				var changeX = dojo._isBodyLtr() ? leftTop.l : -leftTop.l;
				changeX += Math.max(inDrag.w + changeX, this.minColWidth) - (inDrag.w + changeX);
				if (dojo.isWebKit && inDrag.spanners.length) {
					changeX += dojo._getPadBorderExtents(inDrag.spanners[0].node).w;
				}
				var data = {deltaX:changeX, w:inDrag.w + changeX, vw:inDrag.vw + changeX, tw:inDrag.tw + changeX};
				this.doResizeNow(inDrag, data);
				delete this.dragRecord;
			}
			dojo.destroy(this.lineDiv);
			dojo.destroy(this.moverDiv);
			dojo.destroy(this.moverDiv);
			delete this.moverDiv;
			this._skipBogusClicks = true;
			inDrag.view.update();
			this._skipBogusClicks = false;
			this.grid.onResizeColumn(inDrag.index);
		}, doResizeNow:function (inDrag, data) {
			inDrag.view.convertColPctToFixed();
			if (inDrag.view.flexCells && !inDrag.view.testFlexCells()) {
				var t = findTable(inDrag.node);
				if (t) {
					(t.style.width = "");
				}
			}
			var i, s, sw, f, fl;
			for (i = 0; (s = inDrag.spanners[i]); i++) {
				sw = s.width + data.deltaX;
				if (sw > 0) {
					s.node.style.width = sw + "px";
					inDrag.view.setColWidth(s.index, sw);
				}
			}
			if (dojo._isBodyLtr() || !dojo.isIE) {
				for (i = 0; (f = inDrag.followers[i]); i++) {
					fl = f.left + data.deltaX;
					f.node.style.left = fl + "px";
				}
			}
			inDrag.node.style.width = data.w + "px";
			inDrag.view.setColWidth(inDrag.index, data.w);
			inDrag.view.headerNode.style.width = data.vw + "px";
			inDrag.view.setColumnsWidth(data.tw);
			if (!dojo._isBodyLtr()) {
				inDrag.view.headerNode.scrollLeft = inDrag.scrollLeft + data.deltaX;
			}
		}});
		dg._TableMap = dojo.extend(function (rows) {
			this.mapRows(rows);
		}, {map:null, mapRows:function (inRows) {
			var rowCount = inRows.length;
			if (!rowCount) {
				return;
			}
			this.map = [];
			var row;
			for (var k = 0; (row = inRows[k]); k++) {
				this.map[k] = [];
			}
			for (var j = 0; (row = inRows[j]); j++) {
				for (var i = 0, x = 0, cell, colSpan, rowSpan; (cell = row[i]); i++) {
					while (this.map[j][x]) {
						x++;
					}
					this.map[j][x] = {c:i, r:j};
					rowSpan = cell.rowSpan || 1;
					colSpan = cell.colSpan || 1;
					for (var y = 0; y < rowSpan; y++) {
						for (var s = 0; s < colSpan; s++) {
							this.map[j + y][x + s] = this.map[j][x];
						}
					}
					x += colSpan;
				}
			}
		}, dumpMap:function () {
			for (var j = 0, row, h = ""; (row = this.map[j]); j++, h = "") {
				for (var i = 0, cell; (cell = row[i]); i++) {
					h += cell.r + "," + cell.c + "   ";
				}
			}
		}, getMapCoords:function (inRow, inCol) {
			for (var j = 0, row; (row = this.map[j]); j++) {
				for (var i = 0, cell; (cell = row[i]); i++) {
					if (cell.c == inCol && cell.r == inRow) {
						return {j:j, i:i};
					}
				}
			}
			return {j:-1, i:-1};
		}, getNode:function (inTable, inRow, inCol) {
			var row = inTable && inTable.rows[inRow];
			return row && row.cells[inCol];
		}, _findOverlappingNodes:function (inTable, inRow, inCol) {
			var nodes = [];
			var m = this.getMapCoords(inRow, inCol);
			for (var j = 0, row; (row = this.map[j]); j++) {
				if (j == m.j) {
					continue;
				}
				var rw = row[m.i];
				var n = (rw ? this.getNode(inTable, rw.r, rw.c) : null);
				if (n) {
					nodes.push(n);
				}
			}
			return nodes;
		}, findOverlappingNodes:function (inNode) {
			return this._findOverlappingNodes(findTable(inNode), getTrIndex(inNode.parentNode), getTdIndex(inNode));
		}});
	})();
}

