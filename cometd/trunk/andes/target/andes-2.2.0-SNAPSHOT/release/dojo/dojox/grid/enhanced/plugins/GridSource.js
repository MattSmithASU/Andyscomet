/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.GridSource"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.GridSource"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.GridSource");
	dojo.require("dojo.dnd.Source");
	dojo.require("dojox.grid.enhanced.plugins.DnD");
	(function () {
		var _joinToArray = function (arrays) {
			var a = arrays[0];
			for (var i = 1; i < arrays.length; ++i) {
				a = a.concat(arrays[i]);
			}
			return a;
		};
		dojo.declare("dojox.grid.enhanced.plugins.GridSource", dojo.dnd.Source, {accept:["grid/cells", "grid/rows", "grid/cols", "text"], insertNodesForGrid:false, markupFactory:function (params, node) {
			return new dojox.grid.enhanced.plugins.GridSource(node, params);
		}, checkAcceptance:function (source, nodes) {
			if (source instanceof dojox.grid.enhanced.plugins.GridDnDSource) {
				if (nodes[0]) {
					var item = source.getItem(nodes[0].id);
					if (item && (dojo.indexOf(item.type, "grid/rows") >= 0 || dojo.indexOf(item.type, "grid/cells") >= 0) && !source.dndPlugin._allDnDItemsLoaded()) {
						return false;
					}
				}
				this.sourcePlugin = source.dndPlugin;
			}
			return this.inherited(arguments);
		}, onDraggingOver:function () {
			if (this.sourcePlugin) {
				this.sourcePlugin._isSource = true;
			}
		}, onDraggingOut:function () {
			if (this.sourcePlugin) {
				this.sourcePlugin._isSource = false;
			}
		}, onDropExternal:function (source, nodes, copy) {
			if (source instanceof dojox.grid.enhanced.plugins.GridDnDSource) {
				var ranges = dojo.map(nodes, function (node) {
					return source.getItem(node.id).data;
				});
				var item = source.getItem(nodes[0].id);
				var grid = item.dndPlugin.grid;
				var type = item.type[0];
				var range;
				try {
					switch (type) {
					  case "grid/cells":
						nodes[0].innerHTML = this.getCellContent(grid, ranges[0].min, ranges[0].max) || "";
						this.onDropGridCells(grid, ranges[0].min, ranges[0].max);
						break;
					  case "grid/rows":
						range = _joinToArray(ranges);
						nodes[0].innerHTML = this.getRowContent(grid, range) || "";
						this.onDropGridRows(grid, range);
						break;
					  case "grid/cols":
						range = _joinToArray(ranges);
						nodes[0].innerHTML = this.getColumnContent(grid, range) || "";
						this.onDropGridColumns(grid, range);
						break;
					}
					if (this.insertNodesForGrid) {
						this.selectNone();
						this.insertNodes(true, [nodes[0]], this.before, this.current);
					}
					item.dndPlugin.onDragOut(!copy);
				}
				catch (e) {
					console.warn("GridSource.onDropExternal() error:", e);
				}
			} else {
				this.inherited(arguments);
			}
		}, getCellContent:function (grid, leftTopCell, rightBottomCell) {
		}, getRowContent:function (grid, rowIndexes) {
		}, getColumnContent:function (grid, colIndexes) {
		}, onDropGridCells:function (grid, leftTopCell, rightBottomCell) {
		}, onDropGridRows:function (grid, rowIndexes) {
		}, onDropGridColumns:function (grid, colIndexes) {
		}});
	})();
}

