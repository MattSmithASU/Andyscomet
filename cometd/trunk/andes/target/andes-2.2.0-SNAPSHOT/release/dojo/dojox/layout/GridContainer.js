/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.GridContainer"]) {
	dojo._hasResource["dojox.layout.GridContainer"] = true;
	dojo.provide("dojox.layout.GridContainer");
	dojo.require("dojox.layout.GridContainerLite");
	dojo.declare("dojox.layout.GridContainer", dojox.layout.GridContainerLite, {hasResizableColumns:true, liveResizeColumns:false, minColWidth:20, minChildWidth:150, mode:"right", isRightFixed:false, isLeftFixed:false, startup:function () {
		this.inherited(arguments);
		if (this.hasResizableColumns) {
			for (var i = 0; i < this._grid.length - 1; i++) {
				this._createGrip(i);
			}
			if (!this.getParent()) {
				dojo.ready(dojo.hitch(this, "_placeGrips"));
			}
		}
	}, resizeChildAfterDrop:function (node, targetArea, indexChild) {
		if (this.inherited(arguments)) {
			this._placeGrips();
		}
	}, onShow:function () {
		this.inherited(arguments);
		this._placeGrips();
	}, resize:function () {
		this.inherited(arguments);
		if (this._isShown() && this.hasResizableColumns) {
			this._placeGrips();
		}
	}, _createGrip:function (index) {
		var dropZone = this._grid[index], grip = dojo.create("div", {"class":"gridContainerGrip"}, this.domNode);
		dropZone.grip = grip;
		dropZone.gripHandler = [this.connect(grip, "onmouseover", function (e) {
			var gridContainerGripShow = false;
			for (var i = 0; i < this._grid.length - 1; i++) {
				if (dojo.hasClass(this._grid[i].grip, "gridContainerGripShow")) {
					gridContainerGripShow = true;
					break;
				}
			}
			if (!gridContainerGripShow) {
				dojo.removeClass(e.target, "gridContainerGrip");
				dojo.addClass(e.target, "gridContainerGripShow");
			}
		})[0], this.connect(grip, "onmouseout", function (e) {
			if (!this._isResized) {
				dojo.removeClass(e.target, "gridContainerGripShow");
				dojo.addClass(e.target, "gridContainerGrip");
			}
		})[0], this.connect(grip, "onmousedown", "_resizeColumnOn")[0], this.connect(grip, "ondblclick", "_onGripDbClick")[0]];
	}, _placeGrips:function () {
		var gripWidth, height, left = 0, grip;
		var scroll = this.domNode.style.overflowY;
		dojo.forEach(this._grid, function (dropZone) {
			if (dropZone.grip) {
				grip = dropZone.grip;
				if (!gripWidth) {
					gripWidth = grip.offsetWidth / 2;
				}
				left += dojo.marginBox(dropZone.node).w;
				dojo.style(grip, "left", (left - gripWidth) + "px");
				if (!height) {
					height = dojo.contentBox(this.gridNode).h;
				}
				if (height > 0) {
					dojo.style(grip, "height", height + "px");
				}
			}
		}, this);
	}, _onGripDbClick:function () {
		this._updateColumnsWidth(this._dragManager);
		this.resize();
	}, _resizeColumnOn:function (e) {
		this._activeGrip = e.target;
		this._initX = e.pageX;
		e.preventDefault();
		dojo.body().style.cursor = "ew-resize";
		this._isResized = true;
		var tabSize = [];
		var grid;
		var i;
		for (i = 0; i < this._grid.length; i++) {
			tabSize[i] = dojo.contentBox(this._grid[i].node).w;
		}
		this._oldTabSize = tabSize;
		for (i = 0; i < this._grid.length; i++) {
			grid = this._grid[i];
			if (this._activeGrip == grid.grip) {
				this._currentColumn = grid.node;
				this._currentColumnWidth = tabSize[i];
				this._nextColumn = this._grid[i + 1].node;
				this._nextColumnWidth = tabSize[i + 1];
			}
			grid.node.style.width = tabSize[i] + "px";
		}
		var calculateChildMinWidth = function (childNodes, minChild) {
			var width = 0;
			var childMinWidth = 0;
			dojo.forEach(childNodes, function (child) {
				if (child.nodeType == 1) {
					var objectStyle = dojo.getComputedStyle(child);
					var minWidth = (dojo.isIE) ? minChild : parseInt(objectStyle.minWidth);
					childMinWidth = minWidth + parseInt(objectStyle.marginLeft) + parseInt(objectStyle.marginRight);
					if (width < childMinWidth) {
						width = childMinWidth;
					}
				}
			});
			return width;
		};
		var currentColumnMinWidth = calculateChildMinWidth(this._currentColumn.childNodes, this.minChildWidth);
		var nextColumnMinWidth = calculateChildMinWidth(this._nextColumn.childNodes, this.minChildWidth);
		var minPix = Math.round((dojo.marginBox(this.gridContainerTable).w * this.minColWidth) / 100);
		this._currentMinCol = currentColumnMinWidth;
		this._nextMinCol = nextColumnMinWidth;
		if (minPix > this._currentMinCol) {
			this._currentMinCol = minPix;
		}
		if (minPix > this._nextMinCol) {
			this._nextMinCol = minPix;
		}
		this._connectResizeColumnMove = dojo.connect(dojo.doc, "onmousemove", this, "_resizeColumnMove");
		this._connectOnGripMouseUp = dojo.connect(dojo.doc, "onmouseup", this, "_onGripMouseUp");
	}, _onGripMouseUp:function () {
		dojo.body().style.cursor = "default";
		dojo.disconnect(this._connectResizeColumnMove);
		dojo.disconnect(this._connectOnGripMouseUp);
		this._connectOnGripMouseUp = this._connectResizeColumnMove = null;
		if (this._activeGrip) {
			dojo.removeClass(this._activeGrip, "gridContainerGripShow");
			dojo.addClass(this._activeGrip, "gridContainerGrip");
		}
		this._isResized = false;
	}, _resizeColumnMove:function (e) {
		e.preventDefault();
		if (!this._connectResizeColumnOff) {
			dojo.disconnect(this._connectOnGripMouseUp);
			this._connectOnGripMouseUp = null;
			this._connectResizeColumnOff = dojo.connect(dojo.doc, "onmouseup", this, "_resizeColumnOff");
		}
		var d = e.pageX - this._initX;
		if (d == 0) {
			return;
		}
		if (!(this._currentColumnWidth + d < this._currentMinCol || this._nextColumnWidth - d < this._nextMinCol)) {
			this._currentColumnWidth += d;
			this._nextColumnWidth -= d;
			this._initX = e.pageX;
			this._activeGrip.style.left = parseInt(this._activeGrip.style.left) + d + "px";
			if (this.liveResizeColumns) {
				this._currentColumn.style["width"] = this._currentColumnWidth + "px";
				this._nextColumn.style["width"] = this._nextColumnWidth + "px";
				this.resize();
			}
		}
	}, _resizeColumnOff:function (e) {
		dojo.body().style.cursor = "default";
		dojo.disconnect(this._connectResizeColumnMove);
		dojo.disconnect(this._connectResizeColumnOff);
		this._connectResizeColumnOff = this._connectResizeColumnMove = null;
		if (!this.liveResizeColumns) {
			this._currentColumn.style["width"] = this._currentColumnWidth + "px";
			this._nextColumn.style["width"] = this._nextColumnWidth + "px";
		}
		var tabSize = [], testSize = [], tabWidth = this.gridContainerTable.clientWidth, node, update = false, i;
		for (i = 0; i < this._grid.length; i++) {
			node = this._grid[i].node;
			if (dojo.isIE) {
				tabSize[i] = dojo.marginBox(node).w;
				testSize[i] = dojo.contentBox(node).w;
			} else {
				tabSize[i] = dojo.contentBox(node).w;
				testSize = tabSize;
			}
		}
		for (i = 0; i < testSize.length; i++) {
			if (testSize[i] != this._oldTabSize[i]) {
				update = true;
				break;
			}
		}
		if (update) {
			var mul = dojo.isIE ? 100 : 10000;
			for (i = 0; i < this._grid.length; i++) {
				this._grid[i].node.style.width = Math.round((100 * mul * tabSize[i]) / tabWidth) / mul + "%";
			}
			this.resize();
		}
		if (this._activeGrip) {
			dojo.removeClass(this._activeGrip, "gridContainerGripShow");
			dojo.addClass(this._activeGrip, "gridContainerGrip");
		}
		this._isResized = false;
	}, setColumns:function (nbColumns) {
		var z, j;
		if (nbColumns > 0) {
			var length = this._grid.length, delta = length - nbColumns;
			if (delta > 0) {
				var count = [], zone, start, end, nbChildren;
				if (this.mode == "right") {
					end = (this.isLeftFixed && length > 0) ? 1 : 0;
					start = (this.isRightFixed) ? length - 2 : length - 1;
					for (z = start; z >= end; z--) {
						nbChildren = 0;
						zone = this._grid[z].node;
						for (j = 0; j < zone.childNodes.length; j++) {
							if (zone.childNodes[j].nodeType == 1 && !(zone.childNodes[j].id == "")) {
								nbChildren++;
								break;
							}
						}
						if (nbChildren == 0) {
							count[count.length] = z;
						}
						if (count.length >= delta) {
							this._deleteColumn(count);
							break;
						}
					}
					if (count.length < delta) {
						dojo.publish("/dojox/layout/gridContainer/noEmptyColumn", [this]);
					}
				} else {
					start = (this.isLeftFixed && length > 0) ? 1 : 0;
					end = (this.isRightFixed) ? length - 1 : length;
					for (z = start; z < end; z++) {
						nbChildren = 0;
						zone = this._grid[z].node;
						for (j = 0; j < zone.childNodes.length; j++) {
							if (zone.childNodes[j].nodeType == 1 && !(zone.childNodes[j].id == "")) {
								nbChildren++;
								break;
							}
						}
						if (nbChildren == 0) {
							count[count.length] = z;
						}
						if (count.length >= delta) {
							this._deleteColumn(count);
							break;
						}
					}
					if (count.length < delta) {
						dojo.publish("/dojox/layout/gridContainer/noEmptyColumn", [this]);
					}
				}
			} else {
				if (delta < 0) {
					this._addColumn(Math.abs(delta));
				}
			}
			if (this.hasResizableColumns) {
				this._placeGrips();
			}
		}
	}, _addColumn:function (nbColumns) {
		var grid = this._grid, dropZone, node, index, length, isRightMode = (this.mode == "right"), accept = this.acceptTypes.join(","), m = this._dragManager;
		if (this.hasResizableColumns && ((!this.isRightFixed && isRightMode) || (this.isLeftFixed && !isRightMode && this.nbZones == 1))) {
			this._createGrip(grid.length - 1);
		}
		for (var i = 0; i < nbColumns; i++) {
			node = dojo.create("td", {"class":"gridContainerZone dojoxDndArea", "accept":accept, "id":this.id + "_dz" + this.nbZones});
			length = grid.length;
			if (isRightMode) {
				if (this.isRightFixed) {
					index = length - 1;
					grid.splice(index, 0, {"node":grid[index].node.parentNode.insertBefore(node, grid[index].node)});
				} else {
					index = length;
					grid.push({"node":this.gridNode.appendChild(node)});
				}
			} else {
				if (this.isLeftFixed) {
					index = (length == 1) ? 0 : 1;
					this._grid.splice(1, 0, {"node":this._grid[index].node.parentNode.appendChild(node, this._grid[index].node)});
					index = 1;
				} else {
					index = length - this.nbZones;
					this._grid.splice(index, 0, {"node":grid[index].node.parentNode.insertBefore(node, grid[index].node)});
				}
			}
			if (this.hasResizableColumns) {
				if ((!isRightMode && this.nbZones != 1) || (!isRightMode && this.nbZones == 1 && !this.isLeftFixed) || (isRightMode && i < nbColumns - 1) || (isRightMode && i == nbColumns - 1 && this.isRightFixed)) {
					this._createGrip(index);
				}
			}
			m.registerByNode(grid[index].node);
			this.nbZones++;
		}
		this._updateColumnsWidth(m);
	}, _deleteColumn:function (indices) {
		var child, grid, index, nbDelZones = 0, length = indices.length, m = this._dragManager;
		for (var i = 0; i < length; i++) {
			index = (this.mode == "right") ? indices[i] : indices[i] - nbDelZones;
			grid = this._grid[index];
			if (this.hasResizableColumns && grid.grip) {
				dojo.forEach(grid.gripHandler, function (handler) {
					dojo.disconnect(handler);
				});
				dojo.destroy(this.domNode.removeChild(grid.grip));
				grid.grip = null;
			}
			m.unregister(grid.node);
			dojo.destroy(this.gridNode.removeChild(grid.node));
			this._grid.splice(index, 1);
			this.nbZones--;
			nbDelZones++;
		}
		var lastGrid = this._grid[this.nbZones - 1];
		if (lastGrid.grip) {
			dojo.forEach(lastGrid.gripHandler, dojo.disconnect);
			dojo.destroy(this.domNode.removeChild(lastGrid.grip));
			lastGrid.grip = null;
		}
		this._updateColumnsWidth(m);
	}, _updateColumnsWidth:function (manager) {
		this.inherited(arguments);
		manager._dropMode.updateAreas(manager._areaList);
	}, destroy:function () {
		dojo.unsubscribe(this._dropHandler);
		this.inherited(arguments);
	}});
}

