/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.FisheyeList"]) {
	dojo._hasResource["dojox.widget.FisheyeList"] = true;
	dojo.provide("dojox.widget.FisheyeList");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Container");
	dojo.require("dijit._Contained");
	dojo.declare("dojox.widget.FisheyeList", [dijit._Widget, dijit._Templated, dijit._Container], {constructor:function () {
		this.pos = {"x":-1, "y":-1};
		this.timerScale = 1;
	}, EDGE:{CENTER:0, LEFT:1, RIGHT:2, TOP:3, BOTTOM:4}, templateString:"<div class=\"dojoxFisheyeListBar\" dojoAttachPoint=\"containerNode\"></div>", snarfChildDomOutput:true, itemWidth:40, itemHeight:40, itemMaxWidth:150, itemMaxHeight:150, imgNode:null, orientation:"horizontal", isFixed:false, conservativeTrigger:false, effectUnits:2, itemPadding:10, attachEdge:"center", labelEdge:"bottom", postCreate:function () {
		var e = this.EDGE;
		dojo.setSelectable(this.domNode, false);
		var isHorizontal = this.isHorizontal = (this.orientation == "horizontal");
		this.selectedNode = -1;
		this.isOver = false;
		this.hitX1 = -1;
		this.hitY1 = -1;
		this.hitX2 = -1;
		this.hitY2 = -1;
		this.anchorEdge = this._toEdge(this.attachEdge, e.CENTER);
		this.labelEdge = this._toEdge(this.labelEdge, e.TOP);
		if (this.labelEdge == e.CENTER) {
			this.labelEdge = e.TOP;
		}
		if (isHorizontal) {
			if (this.anchorEdge == e.LEFT) {
				this.anchorEdge = e.CENTER;
			}
			if (this.anchorEdge == e.RIGHT) {
				this.anchorEdge = e.CENTER;
			}
			if (this.labelEdge == e.LEFT) {
				this.labelEdge = e.TOP;
			}
			if (this.labelEdge == e.RIGHT) {
				this.labelEdge = e.TOP;
			}
		} else {
			if (this.anchorEdge == e.TOP) {
				this.anchorEdge = e.CENTER;
			}
			if (this.anchorEdge == e.BOTTOM) {
				this.anchorEdge = e.CENTER;
			}
			if (this.labelEdge == e.TOP) {
				this.labelEdge = e.LEFT;
			}
			if (this.labelEdge == e.BOTTOM) {
				this.labelEdge = e.LEFT;
			}
		}
		var effectUnits = this.effectUnits;
		this.proximityLeft = this.itemWidth * (effectUnits - 0.5);
		this.proximityRight = this.itemWidth * (effectUnits - 0.5);
		this.proximityTop = this.itemHeight * (effectUnits - 0.5);
		this.proximityBottom = this.itemHeight * (effectUnits - 0.5);
		if (this.anchorEdge == e.LEFT) {
			this.proximityLeft = 0;
		}
		if (this.anchorEdge == e.RIGHT) {
			this.proximityRight = 0;
		}
		if (this.anchorEdge == e.TOP) {
			this.proximityTop = 0;
		}
		if (this.anchorEdge == e.BOTTOM) {
			this.proximityBottom = 0;
		}
		if (this.anchorEdge == e.CENTER) {
			this.proximityLeft /= 2;
			this.proximityRight /= 2;
			this.proximityTop /= 2;
			this.proximityBottom /= 2;
		}
	}, startup:function () {
		this.children = this.getChildren();
		this._initializePositioning();
		if (!this.conservativeTrigger) {
			this._onMouseMoveHandle = dojo.connect(document.documentElement, "onmousemove", this, "_onMouseMove");
		}
		if (this.isFixed) {
			this._onScrollHandle = dojo.connect(document, "onscroll", this, "_onScroll");
		}
		this._onMouseOutHandle = dojo.connect(document.documentElement, "onmouseout", this, "_onBodyOut");
		this._addChildHandle = dojo.connect(this, "addChild", this, "_initializePositioning");
		this._onResizeHandle = dojo.connect(window, "onresize", this, "_initializePositioning");
	}, _initializePositioning:function () {
		this.itemCount = this.children.length;
		this.barWidth = (this.isHorizontal ? this.itemCount : 1) * this.itemWidth;
		this.barHeight = (this.isHorizontal ? 1 : this.itemCount) * this.itemHeight;
		this.totalWidth = this.proximityLeft + this.proximityRight + this.barWidth;
		this.totalHeight = this.proximityTop + this.proximityBottom + this.barHeight;
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].posX = this.itemWidth * (this.isHorizontal ? i : 0);
			this.children[i].posY = this.itemHeight * (this.isHorizontal ? 0 : i);
			this.children[i].cenX = this.children[i].posX + (this.itemWidth / 2);
			this.children[i].cenY = this.children[i].posY + (this.itemHeight / 2);
			var isz = this.isHorizontal ? this.itemWidth : this.itemHeight;
			var r = this.effectUnits * isz;
			var c = this.isHorizontal ? this.children[i].cenX : this.children[i].cenY;
			var lhs = this.isHorizontal ? this.proximityLeft : this.proximityTop;
			var rhs = this.isHorizontal ? this.proximityRight : this.proximityBottom;
			var siz = this.isHorizontal ? this.barWidth : this.barHeight;
			var range_lhs = r;
			var range_rhs = r;
			if (range_lhs > c + lhs) {
				range_lhs = c + lhs;
			}
			if (range_rhs > (siz - c + rhs)) {
				range_rhs = siz - c + rhs;
			}
			this.children[i].effectRangeLeft = range_lhs / isz;
			this.children[i].effectRangeRght = range_rhs / isz;
		}
		this.domNode.style.width = this.barWidth + "px";
		this.domNode.style.height = this.barHeight + "px";
		for (i = 0; i < this.children.length; i++) {
			var itm = this.children[i];
			var elm = itm.domNode;
			elm.style.left = itm.posX + "px";
			elm.style.top = itm.posY + "px";
			elm.style.width = this.itemWidth + "px";
			elm.style.height = this.itemHeight + "px";
			itm.imgNode.style.left = this.itemPadding + "%";
			itm.imgNode.style.top = this.itemPadding + "%";
			itm.imgNode.style.width = (100 - 2 * this.itemPadding) + "%";
			itm.imgNode.style.height = (100 - 2 * this.itemPadding) + "%";
		}
		this._calcHitGrid();
	}, _overElement:function (node, e) {
		node = dojo.byId(node);
		var mouse = {x:e.pageX, y:e.pageY};
		var bb = dojo._getBorderBox(node);
		var absolute = dojo.coords(node, true);
		var top = absolute.y;
		var bottom = top + bb.h;
		var left = absolute.x;
		var right = left + bb.w;
		return (mouse.x >= left && mouse.x <= right && mouse.y >= top && mouse.y <= bottom);
	}, _onBodyOut:function (e) {
		if (this._overElement(dojo.body(), e)) {
			return;
		}
		this._setDormant(e);
	}, _setDormant:function (e) {
		if (!this.isOver) {
			return;
		}
		this.isOver = false;
		if (this.conservativeTrigger) {
			dojo.disconnect(this._onMouseMoveHandle);
		}
		this._onGridMouseMove(-1, -1);
	}, _setActive:function (e) {
		if (this.isOver) {
			return;
		}
		this.isOver = true;
		if (this.conservativeTrigger) {
			this._onMouseMoveHandle = dojo.connect(document.documentElement, "onmousemove", this, "_onMouseMove");
			this.timerScale = 0;
			this._onMouseMove(e);
			this._expandSlowly();
		}
	}, _onMouseMove:function (e) {
		if ((e.pageX >= this.hitX1) && (e.pageX <= this.hitX2) && (e.pageY >= this.hitY1) && (e.pageY <= this.hitY2)) {
			if (!this.isOver) {
				this._setActive(e);
			}
			this._onGridMouseMove(e.pageX - this.hitX1, e.pageY - this.hitY1);
		} else {
			if (this.isOver) {
				this._setDormant(e);
			}
		}
	}, _onScroll:function () {
		this._calcHitGrid();
	}, onResized:function () {
		this._calcHitGrid();
	}, _onGridMouseMove:function (x, y) {
		this.pos = {x:x, y:y};
		this._paint();
	}, _paint:function () {
		var x = this.pos.x;
		var y = this.pos.y;
		if (this.itemCount <= 0) {
			return;
		}
		var pos = this.isHorizontal ? x : y;
		var prx = this.isHorizontal ? this.proximityLeft : this.proximityTop;
		var siz = this.isHorizontal ? this.itemWidth : this.itemHeight;
		var sim = this.isHorizontal ? (1 - this.timerScale) * this.itemWidth + this.timerScale * this.itemMaxWidth : (1 - this.timerScale) * this.itemHeight + this.timerScale * this.itemMaxHeight;
		var cen = ((pos - prx) / siz) - 0.5;
		var max_off_cen = (sim / siz) - 0.5;
		if (max_off_cen > this.effectUnits) {
			max_off_cen = this.effectUnits;
		}
		var off_weight = 0, cen2;
		if (this.anchorEdge == this.EDGE.BOTTOM) {
			cen2 = (y - this.proximityTop) / this.itemHeight;
			off_weight = (cen2 > 0.5) ? 1 : y / (this.proximityTop + (this.itemHeight / 2));
		}
		if (this.anchorEdge == this.EDGE.TOP) {
			cen2 = (y - this.proximityTop) / this.itemHeight;
			off_weight = (cen2 < 0.5) ? 1 : (this.totalHeight - y) / (this.proximityBottom + (this.itemHeight / 2));
		}
		if (this.anchorEdge == this.EDGE.RIGHT) {
			cen2 = (x - this.proximityLeft) / this.itemWidth;
			off_weight = (cen2 > 0.5) ? 1 : x / (this.proximityLeft + (this.itemWidth / 2));
		}
		if (this.anchorEdge == this.EDGE.LEFT) {
			cen2 = (x - this.proximityLeft) / this.itemWidth;
			off_weight = (cen2 < 0.5) ? 1 : (this.totalWidth - x) / (this.proximityRight + (this.itemWidth / 2));
		}
		if (this.anchorEdge == this.EDGE.CENTER) {
			if (this.isHorizontal) {
				off_weight = y / (this.totalHeight);
			} else {
				off_weight = x / (this.totalWidth);
			}
			if (off_weight > 0.5) {
				off_weight = 1 - off_weight;
			}
			off_weight *= 2;
		}
		for (var i = 0; i < this.itemCount; i++) {
			var weight = this._weighAt(cen, i);
			if (weight < 0) {
				weight = 0;
			}
			this._setItemSize(i, weight * off_weight);
		}
		var main_p = Math.round(cen);
		var offset = 0;
		if (cen < 0) {
			main_p = 0;
		} else {
			if (cen > this.itemCount - 1) {
				main_p = this.itemCount - 1;
			} else {
				offset = (cen - main_p) * ((this.isHorizontal ? this.itemWidth : this.itemHeight) - this.children[main_p].sizeMain);
			}
		}
		this._positionElementsFrom(main_p, offset);
	}, _weighAt:function (cen, i) {
		var dist = Math.abs(cen - i);
		var limit = ((cen - i) > 0) ? this.children[i].effectRangeRght : this.children[i].effectRangeLeft;
		return (dist > limit) ? 0 : (1 - dist / limit);
	}, _setItemSize:function (p, scale) {
		if (this.children[p].scale == scale) {
			return;
		}
		this.children[p].scale = scale;
		scale *= this.timerScale;
		var w = Math.round(this.itemWidth + ((this.itemMaxWidth - this.itemWidth) * scale));
		var h = Math.round(this.itemHeight + ((this.itemMaxHeight - this.itemHeight) * scale));
		if (this.isHorizontal) {
			this.children[p].sizeW = w;
			this.children[p].sizeH = h;
			this.children[p].sizeMain = w;
			this.children[p].sizeOff = h;
			var y = 0;
			if (this.anchorEdge == this.EDGE.TOP) {
				y = (this.children[p].cenY - (this.itemHeight / 2));
			} else {
				if (this.anchorEdge == this.EDGE.BOTTOM) {
					y = (this.children[p].cenY - (h - (this.itemHeight / 2)));
				} else {
					y = (this.children[p].cenY - (h / 2));
				}
			}
			this.children[p].usualX = Math.round(this.children[p].cenX - (w / 2));
			this.children[p].domNode.style.top = y + "px";
			this.children[p].domNode.style.left = this.children[p].usualX + "px";
		} else {
			this.children[p].sizeW = w;
			this.children[p].sizeH = h;
			this.children[p].sizeOff = w;
			this.children[p].sizeMain = h;
			var x = 0;
			if (this.anchorEdge == this.EDGE.LEFT) {
				x = this.children[p].cenX - (this.itemWidth / 2);
			} else {
				if (this.anchorEdge == this.EDGE.RIGHT) {
					x = this.children[p].cenX - (w - (this.itemWidth / 2));
				} else {
					x = this.children[p].cenX - (w / 2);
				}
			}
			this.children[p].domNode.style.left = x + "px";
			this.children[p].usualY = Math.round(this.children[p].cenY - (h / 2));
			this.children[p].domNode.style.top = this.children[p].usualY + "px";
		}
		this.children[p].domNode.style.width = w + "px";
		this.children[p].domNode.style.height = h + "px";
		if (this.children[p].svgNode) {
			this.children[p].svgNode.setSize(w, h);
		}
	}, _positionElementsFrom:function (p, offset) {
		var pos = 0;
		var usual, start;
		if (this.isHorizontal) {
			usual = "usualX";
			start = "left";
		} else {
			usual = "usualY";
			start = "top";
		}
		pos = Math.round(this.children[p][usual] + offset);
		if (this.children[p].domNode.style[start] != (pos + "px")) {
			this.children[p].domNode.style[start] = pos + "px";
			this._positionLabel(this.children[p]);
		}
		var bpos = pos;
		for (var i = p - 1; i >= 0; i--) {
			bpos -= this.children[i].sizeMain;
			if (this.children[p].domNode.style[start] != (bpos + "px")) {
				this.children[i].domNode.style[start] = bpos + "px";
				this._positionLabel(this.children[i]);
			}
		}
		var apos = pos;
		for (i = p + 1; i < this.itemCount; i++) {
			apos += this.children[i - 1].sizeMain;
			if (this.children[p].domNode.style[start] != (apos + "px")) {
				this.children[i].domNode.style[start] = apos + "px";
				this._positionLabel(this.children[i]);
			}
		}
	}, _positionLabel:function (itm) {
		var x = 0;
		var y = 0;
		var mb = dojo.marginBox(itm.lblNode);
		if (this.labelEdge == this.EDGE.TOP) {
			x = Math.round((itm.sizeW / 2) - (mb.w / 2));
			y = -mb.h;
		}
		if (this.labelEdge == this.EDGE.BOTTOM) {
			x = Math.round((itm.sizeW / 2) - (mb.w / 2));
			y = itm.sizeH;
		}
		if (this.labelEdge == this.EDGE.LEFT) {
			x = -mb.w;
			y = Math.round((itm.sizeH / 2) - (mb.h / 2));
		}
		if (this.labelEdge == this.EDGE.RIGHT) {
			x = itm.sizeW;
			y = Math.round((itm.sizeH / 2) - (mb.h / 2));
		}
		itm.lblNode.style.left = x + "px";
		itm.lblNode.style.top = y + "px";
	}, _calcHitGrid:function () {
		var pos = dojo.coords(this.domNode, true);
		this.hitX1 = pos.x - this.proximityLeft;
		this.hitY1 = pos.y - this.proximityTop;
		this.hitX2 = this.hitX1 + this.totalWidth;
		this.hitY2 = this.hitY1 + this.totalHeight;
	}, _toEdge:function (inp, def) {
		return this.EDGE[inp.toUpperCase()] || def;
	}, _expandSlowly:function () {
		if (!this.isOver) {
			return;
		}
		this.timerScale += 0.2;
		this._paint();
		if (this.timerScale < 1) {
			setTimeout(dojo.hitch(this, "_expandSlowly"), 10);
		}
	}, destroyRecursive:function () {
		dojo.disconnect(this._onMouseOutHandle);
		dojo.disconnect(this._onMouseMoveHandle);
		dojo.disconnect(this._addChildHandle);
		if (this.isFixed) {
			dojo.disconnect(this._onScrollHandle);
		}
		dojo.disconnect(this._onResizeHandle);
		this.inherited("destroyRecursive", arguments);
	}});
	dojo.declare("dojox.widget.FisheyeListItem", [dijit._Widget, dijit._Templated, dijit._Contained], {iconSrc:"", label:"", id:"", templateString:"<div class=\"dojoxFisheyeListItem\">" + "  <img class=\"dojoxFisheyeListItemImage\" dojoAttachPoint=\"imgNode\" dojoAttachEvent=\"onmouseover:onMouseOver,onmouseout:onMouseOut,onclick:onClick\">" + "  <div class=\"dojoxFisheyeListItemLabel\" dojoAttachPoint=\"lblNode\"></div>" + "</div>", _isNode:function (wh) {
		if (typeof Element == "function") {
			try {
				return wh instanceof Element;
			}
			catch (e) {
			}
		} else {
			return wh && !isNaN(wh.nodeType);
		}
		return false;
	}, _hasParent:function (node) {
		return Boolean(node && node.parentNode && this._isNode(node.parentNode));
	}, postCreate:function () {
		var parent;
		if ((this.iconSrc.toLowerCase().substring(this.iconSrc.length - 4) == ".png") && dojo.isIE < 7) {
			if (this._hasParent(this.imgNode) && this.id != "") {
				parent = this.imgNode.parentNode;
				parent.setAttribute("id", this.id);
			}
			this.imgNode.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + this.iconSrc + "', sizingMethod='scale')";
			this.imgNode.src = this._blankGif.toString();
		} else {
			if (this._hasParent(this.imgNode) && this.id != "") {
				parent = this.imgNode.parentNode;
				parent.setAttribute("id", this.id);
			}
			this.imgNode.src = this.iconSrc;
		}
		if (this.lblNode) {
			this.lblNode.appendChild(document.createTextNode(this.label));
		}
		dojo.setSelectable(this.domNode, false);
		this.startup();
	}, startup:function () {
		this.parent = this.getParent();
	}, onMouseOver:function (e) {
		if (!this.parent.isOver) {
			this.parent._setActive(e);
		}
		if (this.label != "") {
			dojo.addClass(this.lblNode, "dojoxFishSelected");
			this.parent._positionLabel(this);
		}
	}, onMouseOut:function (e) {
		dojo.removeClass(this.lblNode, "dojoxFishSelected");
	}, onClick:function (e) {
	}});
}

