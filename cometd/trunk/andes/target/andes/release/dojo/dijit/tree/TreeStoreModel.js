/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.tree.TreeStoreModel"]) {
	dojo._hasResource["dijit.tree.TreeStoreModel"] = true;
	dojo.provide("dijit.tree.TreeStoreModel");
	dojo.declare("dijit.tree.TreeStoreModel", null, {store:null, childrenAttrs:["children"], newItemIdAttr:"id", labelAttr:"", root:null, query:null, deferItemLoadingUntilExpand:false, constructor:function (args) {
		dojo.mixin(this, args);
		this.connects = [];
		var store = this.store;
		if (!store.getFeatures()["dojo.data.api.Identity"]) {
			throw new Error("dijit.Tree: store must support dojo.data.Identity");
		}
		if (store.getFeatures()["dojo.data.api.Notification"]) {
			this.connects = this.connects.concat([dojo.connect(store, "onNew", this, "onNewItem"), dojo.connect(store, "onDelete", this, "onDeleteItem"), dojo.connect(store, "onSet", this, "onSetItem")]);
		}
	}, destroy:function () {
		dojo.forEach(this.connects, dojo.disconnect);
	}, getRoot:function (onItem, onError) {
		if (this.root) {
			onItem(this.root);
		} else {
			this.store.fetch({query:this.query, onComplete:dojo.hitch(this, function (items) {
				if (items.length != 1) {
					throw new Error(this.declaredClass + ": query " + dojo.toJson(this.query) + " returned " + items.length + " items, but must return exactly one item");
				}
				this.root = items[0];
				onItem(this.root);
			}), onError:onError});
		}
	}, mayHaveChildren:function (item) {
		return dojo.some(this.childrenAttrs, function (attr) {
			return this.store.hasAttribute(item, attr);
		}, this);
	}, getChildren:function (parentItem, onComplete, onError) {
		var store = this.store;
		if (!store.isItemLoaded(parentItem)) {
			var getChildren = dojo.hitch(this, arguments.callee);
			store.loadItem({item:parentItem, onItem:function (parentItem) {
				getChildren(parentItem, onComplete, onError);
			}, onError:onError});
			return;
		}
		var childItems = [];
		for (var i = 0; i < this.childrenAttrs.length; i++) {
			var vals = store.getValues(parentItem, this.childrenAttrs[i]);
			childItems = childItems.concat(vals);
		}
		var _waitCount = 0;
		if (!this.deferItemLoadingUntilExpand) {
			dojo.forEach(childItems, function (item) {
				if (!store.isItemLoaded(item)) {
					_waitCount++;
				}
			});
		}
		if (_waitCount == 0) {
			onComplete(childItems);
		} else {
			dojo.forEach(childItems, function (item, idx) {
				if (!store.isItemLoaded(item)) {
					store.loadItem({item:item, onItem:function (item) {
						childItems[idx] = item;
						if (--_waitCount == 0) {
							onComplete(childItems);
						}
					}, onError:onError});
				}
			});
		}
	}, isItem:function (something) {
		return this.store.isItem(something);
	}, fetchItemByIdentity:function (keywordArgs) {
		this.store.fetchItemByIdentity(keywordArgs);
	}, getIdentity:function (item) {
		return this.store.getIdentity(item);
	}, getLabel:function (item) {
		if (this.labelAttr) {
			return this.store.getValue(item, this.labelAttr);
		} else {
			return this.store.getLabel(item);
		}
	}, newItem:function (args, parent, insertIndex) {
		var pInfo = {parent:parent, attribute:this.childrenAttrs[0]}, LnewItem;
		if (this.newItemIdAttr && args[this.newItemIdAttr]) {
			this.fetchItemByIdentity({identity:args[this.newItemIdAttr], scope:this, onItem:function (item) {
				if (item) {
					this.pasteItem(item, null, parent, true, insertIndex);
				} else {
					LnewItem = this.store.newItem(args, pInfo);
					if (LnewItem && (insertIndex != undefined)) {
						this.pasteItem(LnewItem, parent, parent, false, insertIndex);
					}
				}
			}});
		} else {
			LnewItem = this.store.newItem(args, pInfo);
			if (LnewItem && (insertIndex != undefined)) {
				this.pasteItem(LnewItem, parent, parent, false, insertIndex);
			}
		}
	}, pasteItem:function (childItem, oldParentItem, newParentItem, bCopy, insertIndex) {
		var store = this.store, parentAttr = this.childrenAttrs[0];
		if (oldParentItem) {
			dojo.forEach(this.childrenAttrs, function (attr) {
				if (store.containsValue(oldParentItem, attr, childItem)) {
					if (!bCopy) {
						var values = dojo.filter(store.getValues(oldParentItem, attr), function (x) {
							return x != childItem;
						});
						store.setValues(oldParentItem, attr, values);
					}
					parentAttr = attr;
				}
			});
		}
		if (newParentItem) {
			if (typeof insertIndex == "number") {
				var childItems = store.getValues(newParentItem, parentAttr).slice();
				childItems.splice(insertIndex, 0, childItem);
				store.setValues(newParentItem, parentAttr, childItems);
			} else {
				store.setValues(newParentItem, parentAttr, store.getValues(newParentItem, parentAttr).concat(childItem));
			}
		}
	}, onChange:function (item) {
	}, onChildrenChange:function (parent, newChildrenList) {
	}, onDelete:function (parent, newChildrenList) {
	}, onNewItem:function (item, parentInfo) {
		if (!parentInfo) {
			return;
		}
		this.getChildren(parentInfo.item, dojo.hitch(this, function (children) {
			this.onChildrenChange(parentInfo.item, children);
		}));
	}, onDeleteItem:function (item) {
		this.onDelete(item);
	}, onSetItem:function (item, attribute, oldValue, newValue) {
		if (dojo.indexOf(this.childrenAttrs, attribute) != -1) {
			this.getChildren(item, dojo.hitch(this, function (children) {
				this.onChildrenChange(item, children);
			}));
		} else {
			this.onChange(item);
		}
	}});
}

