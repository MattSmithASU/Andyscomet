/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mdnd.dropMode.OverDropMode"]) {
	dojo._hasResource["dojox.mdnd.dropMode.OverDropMode"] = true;
	dojo.provide("dojox.mdnd.dropMode.OverDropMode");
	dojo.require("dojox.mdnd.AreaManager");
	dojo.declare("dojox.mdnd.dropMode.OverDropMode", null, {_oldXPoint:null, _oldYPoint:null, _oldBehaviour:"up", constructor:function () {
		this._dragHandler = [dojo.connect(dojox.mdnd.areaManager(), "onDragEnter", function (coords, size) {
			var m = dojox.mdnd.areaManager();
			if (m._oldIndexArea == -1) {
				m._oldIndexArea = m._lastValidIndexArea;
			}
		})];
	}, addArea:function (areas, object) {
		var length = areas.length, position = dojo.position(object.node, true);
		object.coords = {"x":position.x, "y":position.y};
		if (length == 0) {
			areas.push(object);
		} else {
			var x = object.coords.x;
			for (var i = 0; i < length; i++) {
				if (x < areas[i].coords.x) {
					for (var j = length - 1; j >= i; j--) {
						areas[j + 1] = areas[j];
					}
					areas[i] = object;
					break;
				}
			}
			if (i == length) {
				areas.push(object);
			}
		}
		return areas;
	}, updateAreas:function (areaList) {
		var length = areaList.length;
		for (var i = 0; i < length; i++) {
			this._updateArea(areaList[i]);
		}
	}, _updateArea:function (area) {
		var position = dojo.position(area.node, true);
		area.coords.x = position.x;
		area.coords.x2 = position.x + position.w;
		area.coords.y = position.y;
	}, initItems:function (area) {
		dojo.forEach(area.items, function (obj) {
			var node = obj.item.node;
			var position = dojo.position(node, true);
			var y = position.y + position.h / 2;
			obj.y = y;
		});
		area.initItems = true;
	}, refreshItems:function (area, indexItem, size, added) {
		if (indexItem == -1) {
			return;
		} else {
			if (area && size && size.h) {
				var height = size.h;
				if (area.margin) {
					height += area.margin.t;
				}
				var length = area.items.length;
				for (var i = indexItem; i < length; i++) {
					var item = area.items[i];
					if (added) {
						item.y += height;
					} else {
						item.y -= height;
					}
				}
			}
		}
	}, getDragPoint:function (coords, size, mousePosition) {
		return {"x":mousePosition.x, "y":mousePosition.y};
	}, getTargetArea:function (areaList, coords, currentIndexArea) {
		var index = 0;
		var x = coords.x;
		var y = coords.y;
		var end = areaList.length;
		var start = 0, direction = "right", compute = false;
		if (currentIndexArea == -1 || arguments.length < 3) {
			compute = true;
		} else {
			if (this._checkInterval(areaList, currentIndexArea, x, y)) {
				index = currentIndexArea;
			} else {
				if (this._oldXPoint < x) {
					start = currentIndexArea + 1;
				} else {
					start = currentIndexArea - 1;
					end = 0;
					direction = "left";
				}
				compute = true;
			}
		}
		if (compute) {
			if (direction === "right") {
				for (var i = start; i < end; i++) {
					if (this._checkInterval(areaList, i, x, y)) {
						index = i;
						break;
					}
				}
				if (i == end) {
					index = -1;
				}
			} else {
				for (var i = start; i >= end; i--) {
					if (this._checkInterval(areaList, i, x, y)) {
						index = i;
						break;
					}
				}
				if (i == end - 1) {
					index = -1;
				}
			}
		}
		this._oldXPoint = x;
		return index;
	}, _checkInterval:function (areaList, index, x, y) {
		var area = areaList[index];
		var node = area.node;
		var coords = area.coords;
		var startX = coords.x;
		var endX = coords.x2;
		var startY = coords.y;
		var endY = startY + node.offsetHeight;
		if (startX <= x && x <= endX && startY <= y && y <= endY) {
			return true;
		}
		return false;
	}, getDropIndex:function (targetArea, coords) {
		var length = targetArea.items.length;
		var coordinates = targetArea.coords;
		var y = coords.y;
		if (length > 0) {
			for (var i = 0; i < length; i++) {
				if (y < targetArea.items[i].y) {
					return i;
				} else {
					if (i == length - 1) {
						return -1;
					}
				}
			}
		}
		return -1;
	}, destroy:function () {
		dojo.forEach(this._dragHandler, dojo.disconnect);
	}});
	(function () {
		dojox.mdnd.areaManager()._dropMode = new dojox.mdnd.dropMode.OverDropMode();
	}());
}

