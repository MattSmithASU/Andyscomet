/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid._View"]) {
	dojo._hasResource["dojox.grid._View"] = true;
	dojo.provide("dojox.grid._View");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dojox.grid._Builder");
	dojo.require("dojox.html.metrics");
	dojo.require("dojox.grid.util");
	dojo.require("dojo.dnd.Source");
	dojo.require("dojo.dnd.Manager");
	(function () {
		var getStyleText = function (inNode, inStyleText) {
			return inNode.style.cssText == undefined ? inNode.getAttribute("style") : inNode.style.cssText;
		};
		dojo.declare("dojox.grid._View", [dijit._Widget, dijit._Templated], {defaultWidth:"18em", viewWidth:"", templateString:"<div class=\"dojoxGridView\" role=\"presentation\">\n\t<div class=\"dojoxGridHeader\" dojoAttachPoint=\"headerNode\" role=\"presentation\">\n\t\t<div dojoAttachPoint=\"headerNodeContainer\" style=\"width:9000em\" role=\"presentation\">\n\t\t\t<div dojoAttachPoint=\"headerContentNode\" role=\"row\"></div>\n\t\t</div>\n\t</div>\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" dojoAttachPoint=\"hiddenFocusNode\" role=\"presentation\" />\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" role=\"presentation\" />\n\t<div class=\"dojoxGridScrollbox\" dojoAttachPoint=\"scrollboxNode\" role=\"presentation\">\n\t\t<div class=\"dojoxGridContent\" dojoAttachPoint=\"contentNode\" hidefocus=\"hidefocus\" role=\"presentation\"></div>\n\t</div>\n</div>\n", themeable:false, classTag:"dojoxGrid", marginBottom:0, rowPad:2, _togglingColumn:-1, _headerBuilderClass:dojox.grid._HeaderBuilder, _contentBuilderClass:dojox.grid._ContentBuilder, postMixInProperties:function () {
			this.rowNodes = {};
		}, postCreate:function () {
			this.connect(this.scrollboxNode, "onscroll", "doscroll");
			dojox.grid.util.funnelEvents(this.contentNode, this, "doContentEvent", ["mouseover", "mouseout", "click", "dblclick", "contextmenu", "mousedown"]);
			dojox.grid.util.funnelEvents(this.headerNode, this, "doHeaderEvent", ["dblclick", "mouseover", "mouseout", "mousemove", "mousedown", "click", "contextmenu"]);
			this.content = new this._contentBuilderClass(this);
			this.header = new this._headerBuilderClass(this);
			if (!dojo._isBodyLtr()) {
				this.headerNodeContainer.style.width = "";
			}
		}, destroy:function () {
			dojo.destroy(this.headerNode);
			delete this.headerNode;
			for (var i in this.rowNodes) {
				dojo.destroy(this.rowNodes[i]);
			}
			this.rowNodes = {};
			if (this.source) {
				this.source.destroy();
			}
			this.inherited(arguments);
		}, focus:function () {
			if (dojo.isIE || dojo.isWebKit || dojo.isOpera) {
				this.hiddenFocusNode.focus();
			} else {
				this.scrollboxNode.focus();
			}
		}, setStructure:function (inStructure) {
			var vs = (this.structure = inStructure);
			if (vs.width && !isNaN(vs.width)) {
				this.viewWidth = vs.width + "em";
			} else {
				this.viewWidth = vs.width || (vs.noscroll ? "auto" : this.viewWidth);
			}
			this._onBeforeRow = vs.onBeforeRow || function () {
			};
			this._onAfterRow = vs.onAfterRow || function () {
			};
			this.noscroll = vs.noscroll;
			if (this.noscroll) {
				this.scrollboxNode.style.overflow = "hidden";
			}
			this.simpleStructure = Boolean(vs.cells.length == 1);
			this.testFlexCells();
			this.updateStructure();
		}, _cleanupRowWidgets:function (inRowNode) {
			if (inRowNode) {
				dojo.forEach(dojo.query("[widgetId]", inRowNode).map(dijit.byNode), function (w) {
					if (w._destroyOnRemove) {
						w.destroy();
						delete w;
					} else {
						if (w.domNode && w.domNode.parentNode) {
							w.domNode.parentNode.removeChild(w.domNode);
						}
					}
				});
			}
		}, onBeforeRow:function (inRowIndex, cells) {
			this._onBeforeRow(inRowIndex, cells);
			if (inRowIndex >= 0) {
				this._cleanupRowWidgets(this.getRowNode(inRowIndex));
			}
		}, onAfterRow:function (inRowIndex, cells, inRowNode) {
			this._onAfterRow(inRowIndex, cells, inRowNode);
			var g = this.grid;
			dojo.forEach(dojo.query(".dojoxGridStubNode", inRowNode), function (n) {
				if (n && n.parentNode) {
					var lw = n.getAttribute("linkWidget");
					var cellIdx = window.parseInt(dojo.attr(n, "cellIdx"), 10);
					var cellDef = g.getCell(cellIdx);
					var w = dijit.byId(lw);
					if (w) {
						n.parentNode.replaceChild(w.domNode, n);
						if (!w._started) {
							w.startup();
						}
					} else {
						n.innerHTML = "";
					}
				}
			}, this);
		}, testFlexCells:function () {
			this.flexCells = false;
			for (var j = 0, row; (row = this.structure.cells[j]); j++) {
				for (var i = 0, cell; (cell = row[i]); i++) {
					cell.view = this;
					this.flexCells = this.flexCells || cell.isFlex();
				}
			}
			return this.flexCells;
		}, updateStructure:function () {
			this.header.update();
			this.content.update();
		}, getScrollbarWidth:function () {
			var hasScrollSpace = this.hasVScrollbar();
			var overflow = dojo.style(this.scrollboxNode, "overflow");
			if (this.noscroll || !overflow || overflow == "hidden") {
				hasScrollSpace = false;
			} else {
				if (overflow == "scroll") {
					hasScrollSpace = true;
				}
			}
			return (hasScrollSpace ? dojox.html.metrics.getScrollbar().w : 0);
		}, getColumnsWidth:function () {
			var h = this.headerContentNode;
			return h && h.firstChild ? h.firstChild.offsetWidth : 0;
		}, setColumnsWidth:function (width) {
			this.headerContentNode.firstChild.style.width = width + "px";
			if (this.viewWidth) {
				this.viewWidth = width + "px";
			}
		}, getWidth:function () {
			return this.viewWidth || (this.getColumnsWidth() + this.getScrollbarWidth()) + "px";
		}, getContentWidth:function () {
			return Math.max(0, dojo._getContentBox(this.domNode).w - this.getScrollbarWidth()) + "px";
		}, render:function () {
			this.scrollboxNode.style.height = "";
			this.renderHeader();
			if (this._togglingColumn >= 0) {
				this.setColumnsWidth(this.getColumnsWidth() - this._togglingColumn);
				this._togglingColumn = -1;
			}
			var cells = this.grid.layout.cells;
			var getSibling = dojo.hitch(this, function (node, before) {
				!dojo._isBodyLtr() && (before = !before);
				var inc = before ? -1 : 1;
				var idx = this.header.getCellNodeIndex(node) + inc;
				var cell = cells[idx];
				while (cell && cell.getHeaderNode() && cell.getHeaderNode().style.display == "none") {
					idx += inc;
					cell = cells[idx];
				}
				if (cell) {
					return cell.getHeaderNode();
				}
				return null;
			});
			if (this.grid.columnReordering && this.simpleStructure) {
				if (this.source) {
					this.source.destroy();
				}
				var bottomMarkerId = "dojoxGrid_bottomMarker";
				var topMarkerId = "dojoxGrid_topMarker";
				if (this.bottomMarker) {
					dojo.destroy(this.bottomMarker);
				}
				this.bottomMarker = dojo.byId(bottomMarkerId);
				if (this.topMarker) {
					dojo.destroy(this.topMarker);
				}
				this.topMarker = dojo.byId(topMarkerId);
				if (!this.bottomMarker) {
					this.bottomMarker = dojo.create("div", {"id":bottomMarkerId, "class":"dojoxGridColPlaceBottom"}, dojo.body());
					this._hide(this.bottomMarker);
					this.topMarker = dojo.create("div", {"id":topMarkerId, "class":"dojoxGridColPlaceTop"}, dojo.body());
					this._hide(this.topMarker);
				}
				this.arrowDim = dojo.contentBox(this.bottomMarker);
				var headerHeight = dojo.contentBox(this.headerContentNode.firstChild.rows[0]).h;
				this.source = new dojo.dnd.Source(this.headerContentNode.firstChild.rows[0], {horizontal:true, accept:["gridColumn_" + this.grid.id], viewIndex:this.index, generateText:false, onMouseDown:dojo.hitch(this, function (e) {
					this.header.decorateEvent(e);
					if ((this.header.overRightResizeArea(e) || this.header.overLeftResizeArea(e)) && this.header.canResize(e) && !this.header.moveable) {
						this.header.beginColumnResize(e);
					} else {
						if (this.grid.headerMenu) {
							this.grid.headerMenu.onCancel(true);
						}
						if (e.button === (dojo.isIE ? 1 : 0)) {
							dojo.dnd.Source.prototype.onMouseDown.call(this.source, e);
						}
					}
				}), onMouseOver:dojo.hitch(this, function (e) {
					var src = this.source;
					if (src._getChildByEvent(e)) {
						dojo.dnd.Source.prototype.onMouseOver.apply(src, arguments);
					}
				}), _markTargetAnchor:dojo.hitch(this, function (before) {
					var src = this.source;
					if (src.current == src.targetAnchor && src.before == before) {
						return;
					}
					if (src.targetAnchor && getSibling(src.targetAnchor, src.before)) {
						src._removeItemClass(getSibling(src.targetAnchor, src.before), src.before ? "After" : "Before");
					}
					dojo.dnd.Source.prototype._markTargetAnchor.call(src, before);
					var target = before ? src.targetAnchor : getSibling(src.targetAnchor, src.before);
					var endAdd = 0;
					if (!target) {
						target = src.targetAnchor;
						endAdd = dojo.contentBox(target).w + this.arrowDim.w / 2 + 2;
					}
					var pos = (dojo.position || dojo._abs)(target, true);
					var left = Math.floor(pos.x - this.arrowDim.w / 2 + endAdd);
					dojo.style(this.bottomMarker, "visibility", "visible");
					dojo.style(this.topMarker, "visibility", "visible");
					dojo.style(this.bottomMarker, {"left":left + "px", "top":(headerHeight + pos.y) + "px"});
					dojo.style(this.topMarker, {"left":left + "px", "top":(pos.y - this.arrowDim.h) + "px"});
					if (src.targetAnchor && getSibling(src.targetAnchor, src.before)) {
						src._addItemClass(getSibling(src.targetAnchor, src.before), src.before ? "After" : "Before");
					}
				}), _unmarkTargetAnchor:dojo.hitch(this, function () {
					var src = this.source;
					if (!src.targetAnchor) {
						return;
					}
					if (src.targetAnchor && getSibling(src.targetAnchor, src.before)) {
						src._removeItemClass(getSibling(src.targetAnchor, src.before), src.before ? "After" : "Before");
					}
					this._hide(this.bottomMarker);
					this._hide(this.topMarker);
					dojo.dnd.Source.prototype._unmarkTargetAnchor.call(src);
				}), destroy:dojo.hitch(this, function () {
					dojo.disconnect(this._source_conn);
					dojo.unsubscribe(this._source_sub);
					dojo.dnd.Source.prototype.destroy.call(this.source);
					if (this.bottomMarker) {
						dojo.destroy(this.bottomMarker);
						delete this.bottomMarker;
					}
					if (this.topMarker) {
						dojo.destroy(this.topMarker);
						delete this.topMarker;
					}
				}), onDndCancel:dojo.hitch(this, function () {
					dojo.dnd.Source.prototype.onDndCancel.call(this.source);
					this._hide(this.bottomMarker);
					this._hide(this.topMarker);
				})});
				this._source_conn = dojo.connect(this.source, "onDndDrop", this, "_onDndDrop");
				this._source_sub = dojo.subscribe("/dnd/drop/before", this, "_onDndDropBefore");
				this.source.startup();
			}
		}, _hide:function (node) {
			dojo.style(node, {left:"-10000px", top:"-10000px", "visibility":"hidden"});
		}, _onDndDropBefore:function (source, nodes, copy) {
			if (dojo.dnd.manager().target !== this.source) {
				return;
			}
			this.source._targetNode = this.source.targetAnchor;
			this.source._beforeTarget = this.source.before;
			var views = this.grid.views.views;
			var srcView = views[source.viewIndex];
			var tgtView = views[this.index];
			if (tgtView != srcView) {
				srcView.convertColPctToFixed();
				tgtView.convertColPctToFixed();
			}
		}, _onDndDrop:function (source, nodes, copy) {
			if (dojo.dnd.manager().target !== this.source) {
				if (dojo.dnd.manager().source === this.source) {
					this._removingColumn = true;
				}
				return;
			}
			this._hide(this.bottomMarker);
			this._hide(this.topMarker);
			var getIdx = function (n) {
				return n ? dojo.attr(n, "idx") : null;
			};
			var w = dojo.marginBox(nodes[0]).w;
			if (source.viewIndex !== this.index) {
				var views = this.grid.views.views;
				var srcView = views[source.viewIndex];
				var tgtView = views[this.index];
				if (srcView.viewWidth && srcView.viewWidth != "auto") {
					srcView.setColumnsWidth(srcView.getColumnsWidth() - w);
				}
				if (tgtView.viewWidth && tgtView.viewWidth != "auto") {
					tgtView.setColumnsWidth(tgtView.getColumnsWidth());
				}
			}
			var stn = this.source._targetNode;
			var stb = this.source._beforeTarget;
			!dojo._isBodyLtr() && (stb = !stb);
			var layout = this.grid.layout;
			var idx = this.index;
			delete this.source._targetNode;
			delete this.source._beforeTarget;
			layout.moveColumn(source.viewIndex, idx, getIdx(nodes[0]), getIdx(stn), stb);
		}, renderHeader:function () {
			this.headerContentNode.innerHTML = this.header.generateHtml(this._getHeaderContent);
			if (this.flexCells) {
				this.contentWidth = this.getContentWidth();
				this.headerContentNode.firstChild.style.width = this.contentWidth;
			}
			dojox.grid.util.fire(this, "onAfterRow", [-1, this.structure.cells, this.headerContentNode]);
		}, _getHeaderContent:function (inCell) {
			var n = inCell.name || inCell.grid.getCellName(inCell);
			var ret = ["<div class=\"dojoxGridSortNode"];
			if (inCell.index != inCell.grid.getSortIndex()) {
				ret.push("\">");
			} else {
				ret = ret.concat([" ", inCell.grid.sortInfo > 0 ? "dojoxGridSortUp" : "dojoxGridSortDown", "\"><div class=\"dojoxGridArrowButtonChar\">", inCell.grid.sortInfo > 0 ? "&#9650;" : "&#9660;", "</div><div class=\"dojoxGridArrowButtonNode\" role=\"presentation\"></div>", "<div class=\"dojoxGridColCaption\">"]);
			}
			ret = ret.concat([n, "</div></div>"]);
			return ret.join("");
		}, resize:function () {
			this.adaptHeight();
			this.adaptWidth();
		}, hasHScrollbar:function (reset) {
			var hadScroll = this._hasHScroll || false;
			if (this._hasHScroll == undefined || reset) {
				if (this.noscroll) {
					this._hasHScroll = false;
				} else {
					var style = dojo.style(this.scrollboxNode, "overflow");
					if (style == "hidden") {
						this._hasHScroll = false;
					} else {
						if (style == "scroll") {
							this._hasHScroll = true;
						} else {
							this._hasHScroll = (this.scrollboxNode.offsetWidth - this.getScrollbarWidth() < this.contentNode.offsetWidth);
						}
					}
				}
			}
			if (hadScroll !== this._hasHScroll) {
				this.grid.update();
			}
			return this._hasHScroll;
		}, hasVScrollbar:function (reset) {
			var hadScroll = this._hasVScroll || false;
			if (this._hasVScroll == undefined || reset) {
				if (this.noscroll) {
					this._hasVScroll = false;
				} else {
					var style = dojo.style(this.scrollboxNode, "overflow");
					if (style == "hidden") {
						this._hasVScroll = false;
					} else {
						if (style == "scroll") {
							this._hasVScroll = true;
						} else {
							this._hasVScroll = (this.scrollboxNode.scrollHeight > this.scrollboxNode.clientHeight);
						}
					}
				}
			}
			if (hadScroll !== this._hasVScroll) {
				this.grid.update();
			}
			return this._hasVScroll;
		}, convertColPctToFixed:function () {
			var hasPct = false;
			this.grid.initialWidth = "";
			var cellNodes = dojo.query("th", this.headerContentNode);
			var fixedWidths = dojo.map(cellNodes, function (c, vIdx) {
				var w = c.style.width;
				dojo.attr(c, "vIdx", vIdx);
				if (w && w.slice(-1) == "%") {
					hasPct = true;
				} else {
					if (w && w.slice(-2) == "px") {
						return window.parseInt(w, 10);
					}
				}
				return dojo.contentBox(c).w;
			});
			if (hasPct) {
				dojo.forEach(this.grid.layout.cells, function (cell, idx) {
					if (cell.view == this) {
						var cellNode = cell.view.getHeaderCellNode(cell.index);
						if (cellNode && dojo.hasAttr(cellNode, "vIdx")) {
							var vIdx = window.parseInt(dojo.attr(cellNode, "vIdx"));
							this.setColWidth(idx, fixedWidths[vIdx]);
							dojo.removeAttr(cellNode, "vIdx");
						}
					}
				}, this);
				return true;
			}
			return false;
		}, adaptHeight:function (minusScroll) {
			if (!this.grid._autoHeight) {
				var h = (this.domNode.style.height && parseInt(this.domNode.style.height.replace(/px/, ""), 10)) || this.domNode.clientHeight;
				var self = this;
				var checkOtherViewScrollers = function () {
					var v;
					for (var i in self.grid.views.views) {
						v = self.grid.views.views[i];
						if (v !== self && v.hasHScrollbar()) {
							return true;
						}
					}
					return false;
				};
				if (minusScroll || (this.noscroll && checkOtherViewScrollers())) {
					h -= dojox.html.metrics.getScrollbar().h;
				}
				dojox.grid.util.setStyleHeightPx(this.scrollboxNode, h);
			}
			this.hasVScrollbar(true);
		}, adaptWidth:function () {
			if (this.flexCells) {
				this.contentWidth = this.getContentWidth();
				this.headerContentNode.firstChild.style.width = this.contentWidth;
			}
			var w = this.scrollboxNode.offsetWidth - this.getScrollbarWidth();
			if (!this._removingColumn) {
				w = Math.max(w, this.getColumnsWidth()) + "px";
			} else {
				w = Math.min(w, this.getColumnsWidth()) + "px";
				this._removingColumn = false;
			}
			var cn = this.contentNode;
			cn.style.width = w;
			this.hasHScrollbar(true);
		}, setSize:function (w, h) {
			var ds = this.domNode.style;
			var hs = this.headerNode.style;
			if (w) {
				ds.width = w;
				hs.width = w;
			}
			ds.height = (h >= 0 ? h + "px" : "");
		}, renderRow:function (inRowIndex) {
			var rowNode = this.createRowNode(inRowIndex);
			this.buildRow(inRowIndex, rowNode);
			this.grid.edit.restore(this, inRowIndex);
			return rowNode;
		}, createRowNode:function (inRowIndex) {
			var node = document.createElement("div");
			node.className = this.classTag + "Row";
			if (this instanceof dojox.grid._RowSelector) {
				dojo.attr(node, "role", "presentation");
			} else {
				dojo.attr(node, "role", "row");
				if (this.grid.selectionMode != "none") {
					dojo.attr(node, "aria-selected", "false");
				}
			}
			node[dojox.grid.util.gridViewTag] = this.id;
			node[dojox.grid.util.rowIndexTag] = inRowIndex;
			this.rowNodes[inRowIndex] = node;
			return node;
		}, buildRow:function (inRowIndex, inRowNode) {
			this.buildRowContent(inRowIndex, inRowNode);
			this.styleRow(inRowIndex, inRowNode);
		}, buildRowContent:function (inRowIndex, inRowNode) {
			inRowNode.innerHTML = this.content.generateHtml(inRowIndex, inRowIndex);
			if (this.flexCells && this.contentWidth) {
				inRowNode.firstChild.style.width = this.contentWidth;
			}
			dojox.grid.util.fire(this, "onAfterRow", [inRowIndex, this.structure.cells, inRowNode]);
		}, rowRemoved:function (inRowIndex) {
			if (inRowIndex >= 0) {
				this._cleanupRowWidgets(this.getRowNode(inRowIndex));
			}
			this.grid.edit.save(this, inRowIndex);
			delete this.rowNodes[inRowIndex];
		}, getRowNode:function (inRowIndex) {
			return this.rowNodes[inRowIndex];
		}, getCellNode:function (inRowIndex, inCellIndex) {
			var row = this.getRowNode(inRowIndex);
			if (row) {
				return this.content.getCellNode(row, inCellIndex);
			}
		}, getHeaderCellNode:function (inCellIndex) {
			if (this.headerContentNode) {
				return this.header.getCellNode(this.headerContentNode, inCellIndex);
			}
		}, styleRow:function (inRowIndex, inRowNode) {
			inRowNode._style = getStyleText(inRowNode);
			this.styleRowNode(inRowIndex, inRowNode);
		}, styleRowNode:function (inRowIndex, inRowNode) {
			if (inRowNode) {
				this.doStyleRowNode(inRowIndex, inRowNode);
			}
		}, doStyleRowNode:function (inRowIndex, inRowNode) {
			this.grid.styleRowNode(inRowIndex, inRowNode);
		}, updateRow:function (inRowIndex) {
			var rowNode = this.getRowNode(inRowIndex);
			if (rowNode) {
				rowNode.style.height = "";
				this.buildRow(inRowIndex, rowNode);
			}
			return rowNode;
		}, updateRowStyles:function (inRowIndex) {
			this.styleRowNode(inRowIndex, this.getRowNode(inRowIndex));
		}, lastTop:0, firstScroll:0, doscroll:function (inEvent) {
			var isLtr = dojo._isBodyLtr();
			if (this.firstScroll < 2) {
				if ((!isLtr && this.firstScroll == 1) || (isLtr && this.firstScroll === 0)) {
					var s = dojo.marginBox(this.headerNodeContainer);
					if (dojo.isIE) {
						this.headerNodeContainer.style.width = s.w + this.getScrollbarWidth() + "px";
					} else {
						if (dojo.isMoz) {
							this.headerNodeContainer.style.width = s.w - this.getScrollbarWidth() + "px";
							this.scrollboxNode.scrollLeft = isLtr ? this.scrollboxNode.clientWidth - this.scrollboxNode.scrollWidth : this.scrollboxNode.scrollWidth - this.scrollboxNode.clientWidth;
						}
					}
				}
				this.firstScroll++;
			}
			this.headerNode.scrollLeft = this.scrollboxNode.scrollLeft;
			var top = this.scrollboxNode.scrollTop;
			if (top !== this.lastTop) {
				this.grid.scrollTo(top);
			}
		}, setScrollTop:function (inTop) {
			this.lastTop = inTop;
			this.scrollboxNode.scrollTop = inTop;
			return this.scrollboxNode.scrollTop;
		}, doContentEvent:function (e) {
			if (this.content.decorateEvent(e)) {
				this.grid.onContentEvent(e);
			}
		}, doHeaderEvent:function (e) {
			if (this.header.decorateEvent(e)) {
				this.grid.onHeaderEvent(e);
			}
		}, dispatchContentEvent:function (e) {
			return this.content.dispatchEvent(e);
		}, dispatchHeaderEvent:function (e) {
			return this.header.dispatchEvent(e);
		}, setColWidth:function (inIndex, inWidth) {
			this.grid.setCellWidth(inIndex, inWidth + "px");
		}, update:function () {
			if (!this.domNode) {
				return;
			}
			this.content.update();
			this.grid.update();
			var left = this.scrollboxNode.scrollLeft;
			this.scrollboxNode.scrollLeft = left;
			this.headerNode.scrollLeft = left;
		}});
		dojo.declare("dojox.grid._GridAvatar", dojo.dnd.Avatar, {construct:function () {
			var dd = dojo.doc;
			var a = dd.createElement("table");
			a.cellPadding = a.cellSpacing = "0";
			a.className = "dojoxGridDndAvatar";
			a.style.position = "absolute";
			a.style.zIndex = 1999;
			a.style.margin = "0px";
			var b = dd.createElement("tbody");
			var tr = dd.createElement("tr");
			var td = dd.createElement("td");
			var img = dd.createElement("td");
			tr.className = "dojoxGridDndAvatarItem";
			img.className = "dojoxGridDndAvatarItemImage";
			img.style.width = "16px";
			var source = this.manager.source, node;
			if (source.creator) {
				node = source._normalizedCreator(source.getItem(this.manager.nodes[0].id).data, "avatar").node;
			} else {
				node = this.manager.nodes[0].cloneNode(true);
				var table, tbody;
				if (node.tagName.toLowerCase() == "tr") {
					table = dd.createElement("table");
					tbody = dd.createElement("tbody");
					tbody.appendChild(node);
					table.appendChild(tbody);
					node = table;
				} else {
					if (node.tagName.toLowerCase() == "th") {
						table = dd.createElement("table");
						tbody = dd.createElement("tbody");
						var r = dd.createElement("tr");
						table.cellPadding = table.cellSpacing = "0";
						r.appendChild(node);
						tbody.appendChild(r);
						table.appendChild(tbody);
						node = table;
					}
				}
			}
			node.id = "";
			td.appendChild(node);
			tr.appendChild(img);
			tr.appendChild(td);
			dojo.style(tr, "opacity", 0.9);
			b.appendChild(tr);
			a.appendChild(b);
			this.node = a;
			var m = dojo.dnd.manager();
			this.oldOffsetY = m.OFFSET_Y;
			m.OFFSET_Y = 1;
		}, destroy:function () {
			dojo.dnd.manager().OFFSET_Y = this.oldOffsetY;
			this.inherited(arguments);
		}});
		var oldMakeAvatar = dojo.dnd.manager().makeAvatar;
		dojo.dnd.manager().makeAvatar = function () {
			var src = this.source;
			if (src.viewIndex !== undefined && !dojo.hasClass(dojo.body(), "dijit_a11y")) {
				return new dojox.grid._GridAvatar(this);
			}
			return oldMakeAvatar.call(dojo.dnd.manager());
		};
	})();
}

