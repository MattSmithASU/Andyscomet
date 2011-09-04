/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.tree.ForestStoreModel"]) {
	dojo._hasResource["dijit.tree.ForestStoreModel"] = true;
	dojo.provide("dijit.tree.ForestStoreModel");
	dojo.require("dijit.tree.TreeStoreModel");
	dojo.declare("dijit.tree.ForestStoreModel", dijit.tree.TreeStoreModel, {rootId:"$root$", rootLabel:"ROOT", query:null, constructor:function (params) {
		this.root = {store:this, root:true, id:params.rootId, label:params.rootLabel, children:params.rootChildren};
	}, mayHaveChildren:function (item) {
		return item === this.root || this.inherited(arguments);
	}, getChildren:function (parentItem, callback, onError) {
		if (parentItem === this.root) {
			if (this.root.children) {
				callback(this.root.children);
			} else {
				this.store.fetch({query:this.query, onComplete:dojo.hitch(this, function (items) {
					this.root.children = items;
					callback(items);
				}), onError:onError});
			}
		} else {
			this.inherited(arguments);
		}
	}, isItem:function (something) {
		return (something === this.root) ? true : this.inherited(arguments);
	}, fetchItemByIdentity:function (keywordArgs) {
		if (keywordArgs.identity == this.root.id) {
			var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
			if (keywordArgs.onItem) {
				keywordArgs.onItem.call(scope, this.root);
			}
		} else {
			this.inherited(arguments);
		}
	}, getIdentity:function (item) {
		return (item === this.root) ? this.root.id : this.inherited(arguments);
	}, getLabel:function (item) {
		return (item === this.root) ? this.root.label : this.inherited(arguments);
	}, newItem:function (args, parent, insertIndex) {
		if (parent === this.root) {
			this.onNewRootItem(args);
			return this.store.newItem(args);
		} else {
			return this.inherited(arguments);
		}
	}, onNewRootItem:function (args) {
	}, pasteItem:function (childItem, oldParentItem, newParentItem, bCopy, insertIndex) {
		if (oldParentItem === this.root) {
			if (!bCopy) {
				this.onLeaveRoot(childItem);
			}
		}
		dijit.tree.TreeStoreModel.prototype.pasteItem.call(this, childItem, oldParentItem === this.root ? null : oldParentItem, newParentItem === this.root ? null : newParentItem, bCopy, insertIndex);
		if (newParentItem === this.root) {
			this.onAddToRoot(childItem);
		}
	}, onAddToRoot:function (item) {
		console.log(this, ": item ", item, " added to root");
	}, onLeaveRoot:function (item) {
		console.log(this, ": item ", item, " removed from root");
	}, _requeryTop:function () {
		var oldChildren = this.root.children || [];
		this.store.fetch({query:this.query, onComplete:dojo.hitch(this, function (newChildren) {
			this.root.children = newChildren;
			if (oldChildren.length != newChildren.length || dojo.some(oldChildren, function (item, idx) {
				return newChildren[idx] != item;
			})) {
				this.onChildrenChange(this.root, newChildren);
			}
		})});
	}, onNewItem:function (item, parentInfo) {
		this._requeryTop();
		this.inherited(arguments);
	}, onDeleteItem:function (item) {
		if (dojo.indexOf(this.root.children, item) != -1) {
			this._requeryTop();
		}
		this.inherited(arguments);
	}, onSetItem:function (item, attribute, oldValue, newValue) {
		this._requeryTop();
		this.inherited(arguments);
	}});
}

