/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid._ViewManager"]) {
	dojo._hasResource["dojox.grid._ViewManager"] = true;
	dojo.provide("dojox.grid._ViewManager");
	dojo.declare("dojox.grid._ViewManager", null, {constructor:function (inGrid) {
		this.grid = inGrid;
	}, defaultWidth:200, views:[], resize:function () {
		this.onEach("resize");
	}, render:function () {
		this.onEach("render");
	}, addView:function (inView) {
		inView.idx = this.views.length;
		this.views.push(inView);
	}, destroyViews:function () {
		for (var i = 0, v; v = this.views[i]; i++) {
			v.destroy();
		}
		this.views = [];
	}, getContentNodes:function () {
		var nodes = [];
		for (var i = 0, v; v = this.views[i]; i++) {
			nodes.push(v.contentNode);
		}
		return nodes;
	}, forEach:function (inCallback) {
		for (var i = 0, v; v = this.views[i]; i++) {
			inCallback(v, i);
		}
	}, onEach:function (inMethod, inArgs) {
		inArgs = inArgs || [];
		for (var i = 0, v; v = this.views[i]; i++) {
			if (inMethod in v) {
				v[inMethod].apply(v, inArgs);
			}
		}
	}, normalizeHeaderNodeHeight:function () {
		var rowNodes = [];
		for (var i = 0, v; (v = this.views[i]); i++) {
			if (v.headerContentNode.firstChild) {
				rowNodes.push(v.headerContentNode);
			}
		}
		this.normalizeRowNodeHeights(rowNodes);
	}, normalizeRowNodeHeights:function (inRowNodes) {
		var h = 0;
		var currHeights = [];
		if (this.grid.rowHeight) {
			h = this.grid.rowHeight;
		} else {
			if (inRowNodes.length <= 1) {
				return;
			}
			for (var i = 0, n; (n = inRowNodes[i]); i++) {
				if (!dojo.hasClass(n, "dojoxGridNonNormalizedCell")) {
					currHeights[i] = n.firstChild.offsetHeight;
					h = Math.max(h, currHeights[i]);
				}
			}
			h = (h >= 0 ? h : 0);
			if (dojo.isMoz && h) {
				h++;
			}
		}
		for (i = 0; (n = inRowNodes[i]); i++) {
			if (currHeights[i] != h) {
				n.firstChild.style.height = h + "px";
			}
		}
	}, resetHeaderNodeHeight:function () {
		for (var i = 0, v, n; (v = this.views[i]); i++) {
			n = v.headerContentNode.firstChild;
			if (n) {
				n.style.height = "";
			}
		}
	}, renormalizeRow:function (inRowIndex) {
		var rowNodes = [];
		for (var i = 0, v, n; (v = this.views[i]) && (n = v.getRowNode(inRowIndex)); i++) {
			n.firstChild.style.height = "";
			rowNodes.push(n);
		}
		this.normalizeRowNodeHeights(rowNodes);
	}, getViewWidth:function (inIndex) {
		return this.views[inIndex].getWidth() || this.defaultWidth;
	}, measureHeader:function () {
		this.resetHeaderNodeHeight();
		this.forEach(function (inView) {
			inView.headerContentNode.style.height = "";
		});
		var h = 0;
		this.forEach(function (inView) {
			h = Math.max(inView.headerNode.offsetHeight, h);
		});
		return h;
	}, measureContent:function () {
		var h = 0;
		this.forEach(function (inView) {
			h = Math.max(inView.domNode.offsetHeight, h);
		});
		return h;
	}, findClient:function (inAutoWidth) {
		var c = this.grid.elasticView || -1;
		if (c < 0) {
			for (var i = 1, v; (v = this.views[i]); i++) {
				if (v.viewWidth) {
					for (i = 1; (v = this.views[i]); i++) {
						if (!v.viewWidth) {
							c = i;
							break;
						}
					}
					break;
				}
			}
		}
		if (c < 0) {
			c = Math.floor(this.views.length / 2);
		}
		return c;
	}, arrange:function (l, w) {
		var i, v, vw, len = this.views.length;
		var c = (w <= 0 ? len : this.findClient());
		var setPosition = function (v, l) {
			var ds = v.domNode.style;
			var hs = v.headerNode.style;
			if (!dojo._isBodyLtr()) {
				ds.right = l + "px";
				if (dojo.isMoz) {
					hs.right = l + v.getScrollbarWidth() + "px";
					hs.width = parseInt(hs.width, 10) - v.getScrollbarWidth() + "px";
				} else {
					hs.right = l + "px";
				}
			} else {
				ds.left = l + "px";
				hs.left = l + "px";
			}
			ds.top = 0 + "px";
			hs.top = 0;
		};
		for (i = 0; (v = this.views[i]) && (i < c); i++) {
			vw = this.getViewWidth(i);
			v.setSize(vw, 0);
			setPosition(v, l);
			if (v.headerContentNode && v.headerContentNode.firstChild) {
				vw = v.getColumnsWidth() + v.getScrollbarWidth();
			} else {
				vw = v.domNode.offsetWidth;
			}
			l += vw;
		}
		i++;
		var r = w;
		for (var j = len - 1; (v = this.views[j]) && (i <= j); j--) {
			vw = this.getViewWidth(j);
			v.setSize(vw, 0);
			vw = v.domNode.offsetWidth;
			r -= vw;
			setPosition(v, r);
		}
		if (c < len) {
			v = this.views[c];
			vw = Math.max(1, r - l);
			v.setSize(vw + "px", 0);
			setPosition(v, l);
		}
		return l;
	}, renderRow:function (inRowIndex, inNodes, skipRenorm) {
		var rowNodes = [];
		for (var i = 0, v, n, rowNode; (v = this.views[i]) && (n = inNodes[i]); i++) {
			rowNode = v.renderRow(inRowIndex);
			n.appendChild(rowNode);
			rowNodes.push(rowNode);
		}
		if (!skipRenorm) {
			this.normalizeRowNodeHeights(rowNodes);
		}
	}, rowRemoved:function (inRowIndex) {
		this.onEach("rowRemoved", [inRowIndex]);
	}, updateRow:function (inRowIndex, skipRenorm) {
		for (var i = 0, v; v = this.views[i]; i++) {
			v.updateRow(inRowIndex);
		}
		if (!skipRenorm) {
			this.renormalizeRow(inRowIndex);
		}
	}, updateRowStyles:function (inRowIndex) {
		this.onEach("updateRowStyles", [inRowIndex]);
	}, setScrollTop:function (inTop) {
		var top = inTop;
		for (var i = 0, v; v = this.views[i]; i++) {
			top = v.setScrollTop(inTop);
			if (dojo.isIE && v.headerNode && v.scrollboxNode) {
				v.headerNode.scrollLeft = v.scrollboxNode.scrollLeft;
			}
		}
		return top;
	}, getFirstScrollingView:function () {
		for (var i = 0, v; (v = this.views[i]); i++) {
			if (v.hasHScrollbar() || v.hasVScrollbar()) {
				return v;
			}
		}
		return null;
	}});
}

