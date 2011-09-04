/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.GridContainerLite"]) {
	dojo._hasResource["dojox.layout.GridContainerLite"] = true;
	dojo.provide("dojox.layout.GridContainerLite");
	dojo.require("dijit._Templated");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.require("dojox.mdnd.AreaManager");
	dojo.require("dojox.mdnd.DropIndicator");
	dojo.require("dojox.mdnd.dropMode.OverDropMode");
	dojo.require("dojox.mdnd.AutoScroll");
	dojo.declare("dojox.layout.GridContainerLite", [dijit.layout._LayoutWidget, dijit._Templated], {autoRefresh:true, templateString:dojo.cache("dojox.layout", "resources/GridContainer.html", "<div id=\"${id}\" class=\"gridContainer\" dojoAttachPoint=\"containerNode\" tabIndex=\"0\" dojoAttachEvent=\"onkeypress:_selectFocus\">\n\t<div dojoAttachPoint=\"gridContainerDiv\">\n\t\t<table class=\"gridContainerTable\" dojoAttachPoint=\"gridContainerTable\" cellspacing=\"0\" cellpadding=\"0\">\n\t\t\t<tbody>\n\t\t\t\t<tr dojoAttachPoint=\"gridNode\" >\n\t\t\t\t\t\n\t\t\t\t</tr>\n\t\t\t</tbody>\n\t\t</table>\n\t</div>\n</div>\n"), dragHandleClass:"dojoxDragHandle", nbZones:1, doLayout:true, isAutoOrganized:true, acceptTypes:[], colWidths:"", constructor:function (props, node) {
		this.acceptTypes = (props || {}).acceptTypes || ["text"];
		this._disabled = true;
	}, postCreate:function () {
		this.inherited(arguments);
		this._grid = [];
		this._createCells();
		this.subscribe("/dojox/mdnd/drop", "resizeChildAfterDrop");
		this.subscribe("/dojox/mdnd/drag/start", "resizeChildAfterDragStart");
		this._dragManager = dojox.mdnd.areaManager();
		this._dragManager.autoRefresh = this.autoRefresh;
		this._dragManager.dragHandleClass = this.dragHandleClass;
		if (this.doLayout) {
			this._border = {"h":(dojo.isIE) ? dojo._getBorderExtents(this.gridContainerTable).h : 0, "w":(dojo.isIE == 6) ? 1 : 0};
		} else {
			dojo.style(this.domNode, "overflowY", "hidden");
			dojo.style(this.gridContainerTable, "height", "auto");
		}
		this.inherited(arguments);
	}, startup:function () {
		if (this._started) {
			return;
		}
		if (this.isAutoOrganized) {
			this._organizeChildren();
		} else {
			this._organizeChildrenManually();
		}
		dojo.forEach(this.getChildren(), function (child) {
			child.startup();
		});
		if (this._isShown()) {
			this.enableDnd();
		}
		this.inherited(arguments);
	}, resizeChildAfterDrop:function (node, targetArea, indexChild) {
		if (this._disabled) {
			return false;
		}
		if (dijit.getEnclosingWidget(targetArea.node) == this) {
			var widget = dijit.byNode(node);
			if (widget.resize && dojo.isFunction(widget.resize)) {
				widget.resize();
			}
			widget.set("column", node.parentNode.cellIndex);
			if (this.doLayout) {
				var domNodeHeight = this._contentBox.h, divHeight = dojo.contentBox(this.gridContainerDiv).h;
				if (divHeight >= domNodeHeight) {
					dojo.style(this.gridContainerTable, "height", (domNodeHeight - this._border.h) + "px");
				}
			}
			return true;
		}
		return false;
	}, resizeChildAfterDragStart:function (node, sourceArea, indexChild) {
		if (this._disabled) {
			return false;
		}
		if (dijit.getEnclosingWidget(sourceArea.node) == this) {
			this._draggedNode = node;
			if (this.doLayout) {
				dojo.marginBox(this.gridContainerTable, {"h":dojo.contentBox(this.gridContainerDiv).h - this._border.h});
			}
			return true;
		}
		return false;
	}, getChildren:function () {
		var children = [];
		dojo.forEach(this._grid, function (dropZone) {
			children = children.concat(dojo.query("> [widgetId]", dropZone.node).map(dijit.byNode));
		});
		return children;
	}, _isShown:function () {
		if ("open" in this) {
			return this.open;
		} else {
			var node = this.domNode;
			return (node.style.display != "none") && (node.style.visibility != "hidden") && !dojo.hasClass(node, "dijitHidden");
		}
	}, layout:function () {
		if (this.doLayout) {
			var contentBox = this._contentBox;
			dojo.marginBox(this.gridContainerTable, {"h":contentBox.h - this._border.h});
			dojo.contentBox(this.domNode, {"w":contentBox.w - this._border.w});
		}
		dojo.forEach(this.getChildren(), function (widget) {
			if (widget.resize && dojo.isFunction(widget.resize)) {
				widget.resize();
			}
		});
	}, onShow:function () {
		if (this._disabled) {
			this.enableDnd();
		}
	}, onHide:function () {
		if (!this._disabled) {
			this.disableDnd();
		}
	}, _createCells:function () {
		if (this.nbZones === 0) {
			this.nbZones = 1;
		}
		var accept = this.acceptTypes.join(","), i = 0;
		var origWidths = this.colWidths || [];
		var widths = [];
		var colWidth;
		var widthSum = 0;
		for (i = 0; i < this.nbZones; i++) {
			if (widths.length < origWidths.length) {
				widthSum += origWidths[i];
				widths.push(origWidths[i]);
			} else {
				if (!colWidth) {
					colWidth = (100 - widthSum) / (this.nbZones - i);
				}
				widths.push(colWidth);
			}
		}
		i = 0;
		while (i < this.nbZones) {
			this._grid.push({"node":dojo.create("td", {"class":"gridContainerZone", "accept":accept, "id":this.id + "_dz" + i, "style":{"width":widths[i] + "%"}}, this.gridNode)});
			i++;
		}
	}, _getZonesAttr:function () {
		return dojo.query(".gridContainerZone", this.containerNode);
	}, enableDnd:function () {
		var m = this._dragManager;
		dojo.forEach(this._grid, function (dropZone) {
			m.registerByNode(dropZone.node);
		});
		m._dropMode.updateAreas(m._areaList);
		this._disabled = false;
	}, disableDnd:function () {
		var m = this._dragManager;
		dojo.forEach(this._grid, function (dropZone) {
			m.unregister(dropZone.node);
		});
		m._dropMode.updateAreas(m._areaList);
		this._disabled = true;
	}, _organizeChildren:function () {
		var children = dojox.layout.GridContainerLite.superclass.getChildren.call(this);
		var numZones = this.nbZones, numPerZone = Math.floor(children.length / numZones), mod = children.length % numZones, i = 0;
		for (var z = 0; z < numZones; z++) {
			for (var r = 0; r < numPerZone; r++) {
				this._insertChild(children[i], z);
				i++;
			}
			if (mod > 0) {
				try {
					this._insertChild(children[i], z);
					i++;
				}
				catch (e) {
					console.error("Unable to insert child in GridContainer", e);
				}
				mod--;
			} else {
				if (numPerZone === 0) {
					break;
				}
			}
		}
	}, _organizeChildrenManually:function () {
		var children = dojox.layout.GridContainerLite.superclass.getChildren.call(this), length = children.length, child;
		for (var i = 0; i < length; i++) {
			child = children[i];
			try {
				this._insertChild(child, child.column - 1);
			}
			catch (e) {
				console.error("Unable to insert child in GridContainer", e);
			}
		}
	}, _insertChild:function (child, column, p) {
		var zone = this._grid[column].node, length = zone.childNodes.length;
		if (typeof (p) == undefined || p > length) {
			p = length;
		}
		if (this._disabled) {
			dojo.place(child.domNode, zone, p);
			dojo.attr(child.domNode, "tabIndex", "0");
		} else {
			if (!child.dragRestriction) {
				this._dragManager.addDragItem(zone, child.domNode, p, true);
			} else {
				dojo.place(child.domNode, zone, p);
				dojo.attr(child.domNode, "tabIndex", "0");
			}
		}
		child.set("column", column);
		return child;
	}, removeChild:function (widget) {
		if (this._disabled) {
			this.inherited(arguments);
		} else {
			this._dragManager.removeDragItem(widget.domNode.parentNode, widget.domNode);
		}
	}, addService:function (child, column, p) {
		dojo.deprecated("addService is deprecated.", "Please use  instead.", "Future");
		this.addChild(child, column, p);
	}, addChild:function (child, column, p) {
		child.domNode.id = child.id;
		dojox.layout.GridContainerLite.superclass.addChild.call(this, child, 0);
		if (column < 0 || column == undefined) {
			column = 0;
		}
		if (p <= 0) {
			p = 0;
		}
		try {
			return this._insertChild(child, column, p);
		}
		catch (e) {
			console.error("Unable to insert child in GridContainer", e);
		}
		return null;
	}, _setColWidthsAttr:function (value) {
		this.colWidths = dojo.isString(value) ? value.split(",") : (dojo.isArray(value) ? value : [value]);
		if (this._started) {
			this._updateColumnsWidth();
		}
	}, _updateColumnsWidth:function (manager) {
		var length = this._grid.length;
		var origWidths = this.colWidths || [];
		var widths = [];
		var colWidth;
		var widthSum = 0;
		var i;
		for (i = 0; i < length; i++) {
			if (widths.length < origWidths.length) {
				widthSum += origWidths[i] * 1;
				widths.push(origWidths[i]);
			} else {
				if (!colWidth) {
					colWidth = (100 - widthSum) / (this.nbZones - i);
					if (colWidth < 0) {
						colWidth = 100 / this.nbZones;
					}
				}
				widths.push(colWidth);
				widthSum += colWidth * 1;
			}
		}
		if (widthSum > 100) {
			var divisor = 100 / widthSum;
			for (i = 0; i < widths.length; i++) {
				widths[i] *= divisor;
			}
		}
		for (i = 0; i < length; i++) {
			this._grid[i].node.style.width = widths[i] + "%";
		}
	}, _selectFocus:function (event) {
		if (this._disabled) {
			return;
		}
		var key = event.keyCode, k = dojo.keys, zone = null, focus = dijit.getFocus(), focusNode = focus.node, m = this._dragManager, found, i, j, r, children, area, widget;
		if (focusNode == this.containerNode) {
			area = this.gridNode.childNodes;
			switch (key) {
			  case k.DOWN_ARROW:
			  case k.RIGHT_ARROW:
				found = false;
				for (i = 0; i < area.length; i++) {
					children = area[i].childNodes;
					for (j = 0; j < children.length; j++) {
						zone = children[j];
						if (zone != null && zone.style.display != "none") {
							dijit.focus(zone);
							dojo.stopEvent(event);
							found = true;
							break;
						}
					}
					if (found) {
						break;
					}
				}
				break;
			  case k.UP_ARROW:
			  case k.LEFT_ARROW:
				area = this.gridNode.childNodes;
				found = false;
				for (i = area.length - 1; i >= 0; i--) {
					children = area[i].childNodes;
					for (j = children.length; j >= 0; j--) {
						zone = children[j];
						if (zone != null && zone.style.display != "none") {
							dijit.focus(zone);
							dojo.stopEvent(event);
							found = true;
							break;
						}
					}
					if (found) {
						break;
					}
				}
				break;
			}
		} else {
			if (focusNode.parentNode.parentNode == this.gridNode) {
				var child = (key == k.UP_ARROW || key == k.LEFT_ARROW) ? "lastChild" : "firstChild";
				var pos = (key == k.UP_ARROW || key == k.LEFT_ARROW) ? "previousSibling" : "nextSibling";
				switch (key) {
				  case k.UP_ARROW:
				  case k.DOWN_ARROW:
					dojo.stopEvent(event);
					found = false;
					var focusTemp = focusNode;
					while (!found) {
						children = focusTemp.parentNode.childNodes;
						var num = 0;
						for (i = 0; i < children.length; i++) {
							if (children[i].style.display != "none") {
								num++;
							}
							if (num > 1) {
								break;
							}
						}
						if (num == 1) {
							return;
						}
						if (focusTemp[pos] == null) {
							zone = focusTemp.parentNode[child];
						} else {
							zone = focusTemp[pos];
						}
						if (zone.style.display === "none") {
							focusTemp = zone;
						} else {
							found = true;
						}
					}
					if (event.shiftKey) {
						var parent = focusNode.parentNode;
						for (i = 0; i < this.gridNode.childNodes.length; i++) {
							if (parent == this.gridNode.childNodes[i]) {
								break;
							}
						}
						children = this.gridNode.childNodes[i].childNodes;
						for (j = 0; j < children.length; j++) {
							if (zone == children[j]) {
								break;
							}
						}
						if (dojo.isMoz || dojo.isWebKit) {
							i--;
						}
						widget = dijit.byNode(focusNode);
						if (!widget.dragRestriction) {
							r = m.removeDragItem(parent, focusNode);
							this.addChild(widget, i, j);
							dojo.attr(focusNode, "tabIndex", "0");
							dijit.focus(focusNode);
						} else {
							dojo.publish("/dojox/layout/gridContainer/moveRestriction", [this]);
						}
					} else {
						dijit.focus(zone);
					}
					break;
				  case k.RIGHT_ARROW:
				  case k.LEFT_ARROW:
					dojo.stopEvent(event);
					if (event.shiftKey) {
						var z = 0;
						if (focusNode.parentNode[pos] == null) {
							if (dojo.isIE && key == k.LEFT_ARROW) {
								z = this.gridNode.childNodes.length - 1;
							}
						} else {
							if (focusNode.parentNode[pos].nodeType == 3) {
								z = this.gridNode.childNodes.length - 2;
							} else {
								for (i = 0; i < this.gridNode.childNodes.length; i++) {
									if (focusNode.parentNode[pos] == this.gridNode.childNodes[i]) {
										break;
									}
									z++;
								}
								if (dojo.isMoz || dojo.isWebKit) {
									z--;
								}
							}
						}
						widget = dijit.byNode(focusNode);
						var _dndType = focusNode.getAttribute("dndtype");
						if (_dndType == null) {
							if (widget && widget.dndType) {
								_dndType = widget.dndType.split(/\s*,\s*/);
							} else {
								_dndType = ["text"];
							}
						} else {
							_dndType = _dndType.split(/\s*,\s*/);
						}
						var accept = false;
						for (i = 0; i < this.acceptTypes.length; i++) {
							for (j = 0; j < _dndType.length; j++) {
								if (_dndType[j] == this.acceptTypes[i]) {
									accept = true;
									break;
								}
							}
						}
						if (accept && !widget.dragRestriction) {
							var parentSource = focusNode.parentNode, place = 0;
							if (k.LEFT_ARROW == key) {
								var t = z;
								if (dojo.isMoz || dojo.isWebKit) {
									t = z + 1;
								}
								place = this.gridNode.childNodes[t].childNodes.length;
							}
							r = m.removeDragItem(parentSource, focusNode);
							this.addChild(widget, z, place);
							dojo.attr(r, "tabIndex", "0");
							dijit.focus(r);
						} else {
							dojo.publish("/dojox/layout/gridContainer/moveRestriction", [this]);
						}
					} else {
						var node = focusNode.parentNode;
						while (zone === null) {
							if (node[pos] !== null && node[pos].nodeType !== 3) {
								node = node[pos];
							} else {
								if (pos === "previousSibling") {
									node = node.parentNode.childNodes[node.parentNode.childNodes.length - 1];
								} else {
									node = (dojo.isIE) ? node.parentNode.childNodes[0] : node.parentNode.childNodes[1];
								}
							}
							zone = node[child];
							if (zone && zone.style.display == "none") {
								children = zone.parentNode.childNodes;
								var childToSelect = null;
								if (pos == "previousSibling") {
									for (i = children.length - 1; i >= 0; i--) {
										if (children[i].style.display != "none") {
											childToSelect = children[i];
											break;
										}
									}
								} else {
									for (i = 0; i < children.length; i++) {
										if (children[i].style.display != "none") {
											childToSelect = children[i];
											break;
										}
									}
								}
								if (!childToSelect) {
									focusNode = zone;
									node = focusNode.parentNode;
									zone = null;
								} else {
									zone = childToSelect;
								}
							}
						}
						dijit.focus(zone);
					}
					break;
				}
			}
		}
	}, destroy:function () {
		var m = this._dragManager;
		dojo.forEach(this._grid, function (dropZone) {
			m.unregister(dropZone.node);
		});
		this.inherited(arguments);
	}});
	dojo.extend(dijit._Widget, {column:"1", dragRestriction:false});
}

