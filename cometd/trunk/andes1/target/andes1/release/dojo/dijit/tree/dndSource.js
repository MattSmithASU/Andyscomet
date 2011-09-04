/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.tree.dndSource"]) {
	dojo._hasResource["dijit.tree.dndSource"] = true;
	dojo.provide("dijit.tree.dndSource");
	dojo.require("dijit.tree._dndSelector");
	dojo.require("dojo.dnd.Manager");
	dojo.declare("dijit.tree.dndSource", dijit.tree._dndSelector, {isSource:true, accept:["text", "treeNode"], copyOnly:false, dragThreshold:5, betweenThreshold:0, constructor:function (tree, params) {
		if (!params) {
			params = {};
		}
		dojo.mixin(this, params);
		this.isSource = typeof params.isSource == "undefined" ? true : params.isSource;
		var type = params.accept instanceof Array ? params.accept : ["text", "treeNode"];
		this.accept = null;
		if (type.length) {
			this.accept = {};
			for (var i = 0; i < type.length; ++i) {
				this.accept[type[i]] = 1;
			}
		}
		this.isDragging = false;
		this.mouseDown = false;
		this.targetAnchor = null;
		this.targetBox = null;
		this.dropPosition = "";
		this._lastX = 0;
		this._lastY = 0;
		this.sourceState = "";
		if (this.isSource) {
			dojo.addClass(this.node, "dojoDndSource");
		}
		this.targetState = "";
		if (this.accept) {
			dojo.addClass(this.node, "dojoDndTarget");
		}
		this.topics = [dojo.subscribe("/dnd/source/over", this, "onDndSourceOver"), dojo.subscribe("/dnd/start", this, "onDndStart"), dojo.subscribe("/dnd/drop", this, "onDndDrop"), dojo.subscribe("/dnd/cancel", this, "onDndCancel")];
	}, checkAcceptance:function (source, nodes) {
		return true;
	}, copyState:function (keyPressed) {
		return this.copyOnly || keyPressed;
	}, destroy:function () {
		this.inherited("destroy", arguments);
		dojo.forEach(this.topics, dojo.unsubscribe);
		this.targetAnchor = null;
	}, _onDragMouse:function (e) {
		var m = dojo.dnd.manager(), oldTarget = this.targetAnchor, newTarget = this.current, oldDropPosition = this.dropPosition;
		var newDropPosition = "Over";
		if (newTarget && this.betweenThreshold > 0) {
			if (!this.targetBox || oldTarget != newTarget) {
				this.targetBox = dojo.position(newTarget.rowNode, true);
			}
			if ((e.pageY - this.targetBox.y) <= this.betweenThreshold) {
				newDropPosition = "Before";
			} else {
				if ((e.pageY - this.targetBox.y) >= (this.targetBox.h - this.betweenThreshold)) {
					newDropPosition = "After";
				}
			}
		}
		if (newTarget != oldTarget || newDropPosition != oldDropPosition) {
			if (oldTarget) {
				this._removeItemClass(oldTarget.rowNode, oldDropPosition);
			}
			if (newTarget) {
				this._addItemClass(newTarget.rowNode, newDropPosition);
			}
			if (!newTarget) {
				m.canDrop(false);
			} else {
				if (newTarget == this.tree.rootNode && newDropPosition != "Over") {
					m.canDrop(false);
				} else {
					if (m.source == this && (newTarget.id in this.selection)) {
						m.canDrop(false);
					} else {
						if (this.checkItemAcceptance(newTarget.rowNode, m.source, newDropPosition.toLowerCase()) && !this._isParentChildDrop(m.source, newTarget.rowNode)) {
							m.canDrop(true);
						} else {
							m.canDrop(false);
						}
					}
				}
			}
			this.targetAnchor = newTarget;
			this.dropPosition = newDropPosition;
		}
	}, onMouseMove:function (e) {
		if (this.isDragging && this.targetState == "Disabled") {
			return;
		}
		this.inherited(arguments);
		var m = dojo.dnd.manager();
		if (this.isDragging) {
			this._onDragMouse(e);
		} else {
			if (this.mouseDown && this.isSource && (Math.abs(e.pageX - this._lastX) >= this.dragThreshold || Math.abs(e.pageY - this._lastY) >= this.dragThreshold)) {
				var nodes = this.getSelectedTreeNodes();
				if (nodes.length) {
					if (nodes.length > 1) {
						var seen = this.selection, i = 0, r = [], n, p;
					nextitem:
						while ((n = nodes[i++])) {
							for (p = n.getParent(); p && p !== this.tree; p = p.getParent()) {
								if (seen[p.id]) {
									continue nextitem;
								}
							}
							r.push(n);
						}
						nodes = r;
					}
					nodes = dojo.map(nodes, function (n) {
						return n.domNode;
					});
					m.startDrag(this, nodes, this.copyState(dojo.isCopyKey(e)));
				}
			}
		}
	}, onMouseDown:function (e) {
		this.mouseDown = true;
		this.mouseButton = e.button;
		this._lastX = e.pageX;
		this._lastY = e.pageY;
		this.inherited(arguments);
	}, onMouseUp:function (e) {
		if (this.mouseDown) {
			this.mouseDown = false;
			this.inherited(arguments);
		}
	}, onMouseOut:function () {
		this.inherited(arguments);
		this._unmarkTargetAnchor();
	}, checkItemAcceptance:function (target, source, position) {
		return true;
	}, onDndSourceOver:function (source) {
		if (this != source) {
			this.mouseDown = false;
			this._unmarkTargetAnchor();
		} else {
			if (this.isDragging) {
				var m = dojo.dnd.manager();
				m.canDrop(false);
			}
		}
	}, onDndStart:function (source, nodes, copy) {
		if (this.isSource) {
			this._changeState("Source", this == source ? (copy ? "Copied" : "Moved") : "");
		}
		var accepted = this.checkAcceptance(source, nodes);
		this._changeState("Target", accepted ? "" : "Disabled");
		if (this == source) {
			dojo.dnd.manager().overSource(this);
		}
		this.isDragging = true;
	}, itemCreator:function (nodes, target, source) {
		return dojo.map(nodes, function (node) {
			return {"id":node.id, "name":node.textContent || node.innerText || ""};
		});
	}, onDndDrop:function (source, nodes, copy) {
		if (this.containerState == "Over") {
			var tree = this.tree, model = tree.model, target = this.targetAnchor, requeryRoot = false;
			this.isDragging = false;
			var targetWidget = target;
			var newParentItem;
			var insertIndex;
			newParentItem = (targetWidget && targetWidget.item) || tree.item;
			if (this.dropPosition == "Before" || this.dropPosition == "After") {
				newParentItem = (targetWidget.getParent() && targetWidget.getParent().item) || tree.item;
				insertIndex = targetWidget.getIndexInParent();
				if (this.dropPosition == "After") {
					insertIndex = targetWidget.getIndexInParent() + 1;
				}
			} else {
				newParentItem = (targetWidget && targetWidget.item) || tree.item;
			}
			var newItemsParams;
			dojo.forEach(nodes, function (node, idx) {
				var sourceItem = source.getItem(node.id);
				if (dojo.indexOf(sourceItem.type, "treeNode") != -1) {
					var childTreeNode = sourceItem.data, childItem = childTreeNode.item, oldParentItem = childTreeNode.getParent().item;
				}
				if (source == this) {
					if (typeof insertIndex == "number") {
						if (newParentItem == oldParentItem && childTreeNode.getIndexInParent() < insertIndex) {
							insertIndex -= 1;
						}
					}
					model.pasteItem(childItem, oldParentItem, newParentItem, copy, insertIndex);
				} else {
					if (model.isItem(childItem)) {
						model.pasteItem(childItem, oldParentItem, newParentItem, copy, insertIndex);
					} else {
						if (!newItemsParams) {
							newItemsParams = this.itemCreator(nodes, target.rowNode, source);
						}
						model.newItem(newItemsParams[idx], newParentItem, insertIndex);
					}
				}
			}, this);
			this.tree._expandNode(targetWidget);
		}
		this.onDndCancel();
	}, onDndCancel:function () {
		this._unmarkTargetAnchor();
		this.isDragging = false;
		this.mouseDown = false;
		delete this.mouseButton;
		this._changeState("Source", "");
		this._changeState("Target", "");
	}, onOverEvent:function () {
		this.inherited(arguments);
		dojo.dnd.manager().overSource(this);
	}, onOutEvent:function () {
		this._unmarkTargetAnchor();
		var m = dojo.dnd.manager();
		if (this.isDragging) {
			m.canDrop(false);
		}
		m.outSource(this);
		this.inherited(arguments);
	}, _isParentChildDrop:function (source, targetRow) {
		if (!source.tree || source.tree != this.tree) {
			return false;
		}
		var root = source.tree.domNode;
		var ids = source.selection;
		var node = targetRow.parentNode;
		while (node != root && !ids[node.id]) {
			node = node.parentNode;
		}
		return node.id && ids[node.id];
	}, _unmarkTargetAnchor:function () {
		if (!this.targetAnchor) {
			return;
		}
		this._removeItemClass(this.targetAnchor.rowNode, this.dropPosition);
		this.targetAnchor = null;
		this.targetBox = null;
		this.dropPosition = null;
	}, _markDndStatus:function (copy) {
		this._changeState("Source", copy ? "Copied" : "Moved");
	}});
}

