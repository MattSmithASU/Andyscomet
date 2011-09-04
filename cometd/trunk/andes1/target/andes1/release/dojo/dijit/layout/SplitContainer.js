/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.SplitContainer"]) {
	dojo._hasResource["dijit.layout.SplitContainer"] = true;
	dojo.provide("dijit.layout.SplitContainer");
	dojo.require("dojo.cookie");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.declare("dijit.layout.SplitContainer", dijit.layout._LayoutWidget, {constructor:function () {
		dojo.deprecated("dijit.layout.SplitContainer is deprecated", "use BorderContainer with splitter instead", 2);
	}, activeSizing:false, sizerWidth:7, orientation:"horizontal", persist:true, baseClass:"dijitSplitContainer", postMixInProperties:function () {
		this.inherited("postMixInProperties", arguments);
		this.isHorizontal = (this.orientation == "horizontal");
	}, postCreate:function () {
		this.inherited(arguments);
		this.sizers = [];
		if (dojo.isMozilla) {
			this.domNode.style.overflow = "-moz-scrollbars-none";
		}
		if (typeof this.sizerWidth == "object") {
			try {
				this.sizerWidth = parseInt(this.sizerWidth.toString());
			}
			catch (e) {
				this.sizerWidth = 7;
			}
		}
		var sizer = dojo.doc.createElement("div");
		this.virtualSizer = sizer;
		sizer.style.position = "relative";
		sizer.style.zIndex = 10;
		sizer.className = this.isHorizontal ? "dijitSplitContainerVirtualSizerH" : "dijitSplitContainerVirtualSizerV";
		this.domNode.appendChild(sizer);
		dojo.setSelectable(sizer, false);
	}, destroy:function () {
		delete this.virtualSizer;
		dojo.forEach(this._ownconnects, dojo.disconnect);
		this.inherited(arguments);
	}, startup:function () {
		if (this._started) {
			return;
		}
		dojo.forEach(this.getChildren(), function (child, i, children) {
			this._setupChild(child);
			if (i < children.length - 1) {
				this._addSizer();
			}
		}, this);
		if (this.persist) {
			this._restoreState();
		}
		this.inherited(arguments);
	}, _setupChild:function (child) {
		this.inherited(arguments);
		child.domNode.style.position = "absolute";
		dojo.addClass(child.domNode, "dijitSplitPane");
	}, _onSizerMouseDown:function (e) {
		if (e.target.id) {
			for (var i = 0; i < this.sizers.length; i++) {
				if (this.sizers[i].id == e.target.id) {
					break;
				}
			}
			if (i < this.sizers.length) {
				this.beginSizing(e, i);
			}
		}
	}, _addSizer:function (index) {
		index = index === undefined ? this.sizers.length : index;
		var sizer = dojo.doc.createElement("div");
		sizer.id = dijit.getUniqueId("dijit_layout_SplitterContainer_Splitter");
		this.sizers.splice(index, 0, sizer);
		this.domNode.appendChild(sizer);
		sizer.className = this.isHorizontal ? "dijitSplitContainerSizerH" : "dijitSplitContainerSizerV";
		var thumb = dojo.doc.createElement("div");
		thumb.className = "thumb";
		sizer.appendChild(thumb);
		this.connect(sizer, "onmousedown", "_onSizerMouseDown");
		dojo.setSelectable(sizer, false);
	}, removeChild:function (widget) {
		if (this.sizers.length) {
			var i = dojo.indexOf(this.getChildren(), widget);
			if (i != -1) {
				if (i == this.sizers.length) {
					i--;
				}
				dojo.destroy(this.sizers[i]);
				this.sizers.splice(i, 1);
			}
		}
		this.inherited(arguments);
		if (this._started) {
			this.layout();
		}
	}, addChild:function (child, insertIndex) {
		this.inherited(arguments);
		if (this._started) {
			var children = this.getChildren();
			if (children.length > 1) {
				this._addSizer(insertIndex);
			}
			this.layout();
		}
	}, layout:function () {
		this.paneWidth = this._contentBox.w;
		this.paneHeight = this._contentBox.h;
		var children = this.getChildren();
		if (!children.length) {
			return;
		}
		var space = this.isHorizontal ? this.paneWidth : this.paneHeight;
		if (children.length > 1) {
			space -= this.sizerWidth * (children.length - 1);
		}
		var outOf = 0;
		dojo.forEach(children, function (child) {
			outOf += child.sizeShare;
		});
		var pixPerUnit = space / outOf;
		var totalSize = 0;
		dojo.forEach(children.slice(0, children.length - 1), function (child) {
			var size = Math.round(pixPerUnit * child.sizeShare);
			child.sizeActual = size;
			totalSize += size;
		});
		children[children.length - 1].sizeActual = space - totalSize;
		this._checkSizes();
		var pos = 0;
		var size = children[0].sizeActual;
		this._movePanel(children[0], pos, size);
		children[0].position = pos;
		pos += size;
		if (!this.sizers) {
			return;
		}
		dojo.some(children.slice(1), function (child, i) {
			if (!this.sizers[i]) {
				return true;
			}
			this._moveSlider(this.sizers[i], pos, this.sizerWidth);
			this.sizers[i].position = pos;
			pos += this.sizerWidth;
			size = child.sizeActual;
			this._movePanel(child, pos, size);
			child.position = pos;
			pos += size;
		}, this);
	}, _movePanel:function (panel, pos, size) {
		if (this.isHorizontal) {
			panel.domNode.style.left = pos + "px";
			panel.domNode.style.top = 0;
			var box = {w:size, h:this.paneHeight};
			if (panel.resize) {
				panel.resize(box);
			} else {
				dojo.marginBox(panel.domNode, box);
			}
		} else {
			panel.domNode.style.left = 0;
			panel.domNode.style.top = pos + "px";
			var box = {w:this.paneWidth, h:size};
			if (panel.resize) {
				panel.resize(box);
			} else {
				dojo.marginBox(panel.domNode, box);
			}
		}
	}, _moveSlider:function (slider, pos, size) {
		if (this.isHorizontal) {
			slider.style.left = pos + "px";
			slider.style.top = 0;
			dojo.marginBox(slider, {w:size, h:this.paneHeight});
		} else {
			slider.style.left = 0;
			slider.style.top = pos + "px";
			dojo.marginBox(slider, {w:this.paneWidth, h:size});
		}
	}, _growPane:function (growth, pane) {
		if (growth > 0) {
			if (pane.sizeActual > pane.sizeMin) {
				if ((pane.sizeActual - pane.sizeMin) > growth) {
					pane.sizeActual = pane.sizeActual - growth;
					growth = 0;
				} else {
					growth -= pane.sizeActual - pane.sizeMin;
					pane.sizeActual = pane.sizeMin;
				}
			}
		}
		return growth;
	}, _checkSizes:function () {
		var totalMinSize = 0;
		var totalSize = 0;
		var children = this.getChildren();
		dojo.forEach(children, function (child) {
			totalSize += child.sizeActual;
			totalMinSize += child.sizeMin;
		});
		if (totalMinSize <= totalSize) {
			var growth = 0;
			dojo.forEach(children, function (child) {
				if (child.sizeActual < child.sizeMin) {
					growth += child.sizeMin - child.sizeActual;
					child.sizeActual = child.sizeMin;
				}
			});
			if (growth > 0) {
				var list = this.isDraggingLeft ? children.reverse() : children;
				dojo.forEach(list, function (child) {
					growth = this._growPane(growth, child);
				}, this);
			}
		} else {
			dojo.forEach(children, function (child) {
				child.sizeActual = Math.round(totalSize * (child.sizeMin / totalMinSize));
			});
		}
	}, beginSizing:function (e, i) {
		var children = this.getChildren();
		this.paneBefore = children[i];
		this.paneAfter = children[i + 1];
		this.isSizing = true;
		this.sizingSplitter = this.sizers[i];
		if (!this.cover) {
			this.cover = dojo.create("div", {style:{position:"absolute", zIndex:5, top:0, left:0, width:"100%", height:"100%"}}, this.domNode);
		} else {
			this.cover.style.zIndex = 5;
		}
		this.sizingSplitter.style.zIndex = 6;
		this.originPos = dojo.position(children[0].domNode, true);
		if (this.isHorizontal) {
			var client = e.layerX || e.offsetX || 0;
			var screen = e.pageX;
			this.originPos = this.originPos.x;
		} else {
			var client = e.layerY || e.offsetY || 0;
			var screen = e.pageY;
			this.originPos = this.originPos.y;
		}
		this.startPoint = this.lastPoint = screen;
		this.screenToClientOffset = screen - client;
		this.dragOffset = this.lastPoint - this.paneBefore.sizeActual - this.originPos - this.paneBefore.position;
		if (!this.activeSizing) {
			this._showSizingLine();
		}
		this._ownconnects = [];
		this._ownconnects.push(dojo.connect(dojo.doc.documentElement, "onmousemove", this, "changeSizing"));
		this._ownconnects.push(dojo.connect(dojo.doc.documentElement, "onmouseup", this, "endSizing"));
		dojo.stopEvent(e);
	}, changeSizing:function (e) {
		if (!this.isSizing) {
			return;
		}
		this.lastPoint = this.isHorizontal ? e.pageX : e.pageY;
		this.movePoint();
		if (this.activeSizing) {
			this._updateSize();
		} else {
			this._moveSizingLine();
		}
		dojo.stopEvent(e);
	}, endSizing:function (e) {
		if (!this.isSizing) {
			return;
		}
		if (this.cover) {
			this.cover.style.zIndex = -1;
		}
		if (!this.activeSizing) {
			this._hideSizingLine();
		}
		this._updateSize();
		this.isSizing = false;
		if (this.persist) {
			this._saveState(this);
		}
		dojo.forEach(this._ownconnects, dojo.disconnect);
	}, movePoint:function () {
		var p = this.lastPoint - this.screenToClientOffset;
		var a = p - this.dragOffset;
		a = this.legaliseSplitPoint(a);
		p = a + this.dragOffset;
		this.lastPoint = p + this.screenToClientOffset;
	}, legaliseSplitPoint:function (a) {
		a += this.sizingSplitter.position;
		this.isDraggingLeft = !!(a > 0);
		if (!this.activeSizing) {
			var min = this.paneBefore.position + this.paneBefore.sizeMin;
			if (a < min) {
				a = min;
			}
			var max = this.paneAfter.position + (this.paneAfter.sizeActual - (this.sizerWidth + this.paneAfter.sizeMin));
			if (a > max) {
				a = max;
			}
		}
		a -= this.sizingSplitter.position;
		this._checkSizes();
		return a;
	}, _updateSize:function () {
		var pos = this.lastPoint - this.dragOffset - this.originPos;
		var start_region = this.paneBefore.position;
		var end_region = this.paneAfter.position + this.paneAfter.sizeActual;
		this.paneBefore.sizeActual = pos - start_region;
		this.paneAfter.position = pos + this.sizerWidth;
		this.paneAfter.sizeActual = end_region - this.paneAfter.position;
		dojo.forEach(this.getChildren(), function (child) {
			child.sizeShare = child.sizeActual;
		});
		if (this._started) {
			this.layout();
		}
	}, _showSizingLine:function () {
		this._moveSizingLine();
		dojo.marginBox(this.virtualSizer, this.isHorizontal ? {w:this.sizerWidth, h:this.paneHeight} : {w:this.paneWidth, h:this.sizerWidth});
		this.virtualSizer.style.display = "block";
	}, _hideSizingLine:function () {
		this.virtualSizer.style.display = "none";
	}, _moveSizingLine:function () {
		var pos = (this.lastPoint - this.startPoint) + this.sizingSplitter.position;
		dojo.style(this.virtualSizer, (this.isHorizontal ? "left" : "top"), pos + "px");
	}, _getCookieName:function (i) {
		return this.id + "_" + i;
	}, _restoreState:function () {
		dojo.forEach(this.getChildren(), function (child, i) {
			var cookieName = this._getCookieName(i);
			var cookieValue = dojo.cookie(cookieName);
			if (cookieValue) {
				var pos = parseInt(cookieValue);
				if (typeof pos == "number") {
					child.sizeShare = pos;
				}
			}
		}, this);
	}, _saveState:function () {
		if (!this.persist) {
			return;
		}
		dojo.forEach(this.getChildren(), function (child, i) {
			dojo.cookie(this._getCookieName(i), child.sizeShare, {expires:365});
		}, this);
	}});
	dojo.extend(dijit._Widget, {sizeMin:10, sizeShare:10});
}

