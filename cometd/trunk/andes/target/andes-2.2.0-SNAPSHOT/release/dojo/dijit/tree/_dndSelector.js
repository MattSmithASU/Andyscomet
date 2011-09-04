/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.tree._dndSelector"]) {
	dojo._hasResource["dijit.tree._dndSelector"] = true;
	dojo.provide("dijit.tree._dndSelector");
	dojo.require("dojo.dnd.common");
	dojo.require("dijit.tree._dndContainer");
	dojo.declare("dijit.tree._dndSelector", dijit.tree._dndContainer, {constructor:function (tree, params) {
		this.selection = {};
		this.anchor = null;
		dijit.setWaiState(this.tree.domNode, "multiselect", !this.singular);
		this.events.push(dojo.connect(this.tree.domNode, "onmousedown", this, "onMouseDown"), dojo.connect(this.tree.domNode, "onmouseup", this, "onMouseUp"), dojo.connect(this.tree.domNode, "onmousemove", this, "onMouseMove"));
	}, singular:false, getSelectedTreeNodes:function () {
		var nodes = [], sel = this.selection;
		for (var i in sel) {
			nodes.push(sel[i]);
		}
		return nodes;
	}, selectNone:function () {
		this.setSelection([]);
		return this;
	}, destroy:function () {
		this.inherited(arguments);
		this.selection = this.anchor = null;
	}, addTreeNode:function (node, isAnchor) {
		this.setSelection(this.getSelectedTreeNodes().concat([node]));
		if (isAnchor) {
			this.anchor = node;
		}
		return node;
	}, removeTreeNode:function (node) {
		this.setSelection(this._setDifference(this.getSelectedTreeNodes(), [node]));
		return node;
	}, isTreeNodeSelected:function (node) {
		return node.id && !!this.selection[node.id];
	}, setSelection:function (newSelection) {
		var oldSelection = this.getSelectedTreeNodes();
		dojo.forEach(this._setDifference(oldSelection, newSelection), dojo.hitch(this, function (node) {
			node.setSelected(false);
			if (this.anchor == node) {
				delete this.anchor;
			}
			delete this.selection[node.id];
		}));
		dojo.forEach(this._setDifference(newSelection, oldSelection), dojo.hitch(this, function (node) {
			node.setSelected(true);
			this.selection[node.id] = node;
		}));
		this._updateSelectionProperties();
	}, _setDifference:function (xs, ys) {
		dojo.forEach(ys, function (y) {
			y.__exclude__ = true;
		});
		var ret = dojo.filter(xs, function (x) {
			return !x.__exclude__;
		});
		dojo.forEach(ys, function (y) {
			delete y["__exclude__"];
		});
		return ret;
	}, _updateSelectionProperties:function () {
		var selected = this.getSelectedTreeNodes();
		var paths = [], nodes = [];
		dojo.forEach(selected, function (node) {
			nodes.push(node);
			paths.push(node.getTreePath());
		});
		var items = dojo.map(nodes, function (node) {
			return node.item;
		});
		this.tree._set("paths", paths);
		this.tree._set("path", paths[0] || []);
		this.tree._set("selectedNodes", nodes);
		this.tree._set("selectedNode", nodes[0] || null);
		this.tree._set("selectedItems", items);
		this.tree._set("selectedItem", items[0] || null);
	}, onMouseDown:function (e) {
		if (!this.current || this.tree.isExpandoNode(e.target, this.current)) {
			return;
		}
		if (e.button == dojo.mouseButtons.RIGHT) {
			return;
		}
		dojo.stopEvent(e);
		var treeNode = this.current, copy = dojo.isCopyKey(e), id = treeNode.id;
		if (!this.singular && !e.shiftKey && this.selection[id]) {
			this._doDeselect = true;
			return;
		} else {
			this._doDeselect = false;
		}
		this.userSelect(treeNode, copy, e.shiftKey);
	}, onMouseUp:function (e) {
		if (!this._doDeselect) {
			return;
		}
		this._doDeselect = false;
		this.userSelect(this.current, dojo.isCopyKey(e), e.shiftKey);
	}, onMouseMove:function (e) {
		this._doDeselect = false;
	}, userSelect:function (node, multi, range) {
		if (this.singular) {
			if (this.anchor == node && multi) {
				this.selectNone();
			} else {
				this.setSelection([node]);
				this.anchor = node;
			}
		} else {
			if (range && this.anchor) {
				var cr = dijit.tree._compareNodes(this.anchor.rowNode, node.rowNode), begin, end, anchor = this.anchor;
				if (cr < 0) {
					begin = anchor;
					end = node;
				} else {
					begin = node;
					end = anchor;
				}
				nodes = [];
				while (begin != end) {
					nodes.push(begin);
					begin = this.tree._getNextNode(begin);
				}
				nodes.push(end);
				this.setSelection(nodes);
			} else {
				if (this.selection[node.id] && multi) {
					this.removeTreeNode(node);
				} else {
					if (multi) {
						this.addTreeNode(node, true);
					} else {
						this.setSelection([node]);
						this.anchor = node;
					}
				}
			}
		}
	}, forInSelectedItems:function (f, o) {
		o = o || dojo.global;
		for (var id in this.selection) {
			f.call(o, this.getItem(id), id, this);
		}
	}});
}

