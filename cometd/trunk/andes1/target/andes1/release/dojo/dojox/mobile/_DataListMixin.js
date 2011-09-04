/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile._DataListMixin"]) {
	dojo._hasResource["dojox.mobile._DataListMixin"] = true;
	dojo.provide("dojox.mobile._DataListMixin");
	dojo.declare("dojox.mobile._DataListMixin", null, {store:null, query:null, queryOptions:null, buildRendering:function () {
		this.inherited(arguments);
		if (!this.store) {
			return;
		}
		var store = this.store;
		this.store = null;
		this.setStore(store, this.query, this.queryOptions);
	}, setStore:function (store, query, queryOptions) {
		if (store === this.store) {
			return;
		}
		this.store = store;
		this.query = query;
		this.queryOptions = queryOptions;
		if (store && store.getFeatures()["dojo.data.api.Notification"]) {
			dojo.forEach(this._conn || [], dojo.disconnect);
			this._conn = [dojo.connect(store, "onSet", this, "onSet"), dojo.connect(store, "onNew", this, "onNew"), dojo.connect(store, "onDelete", this, "onDelete")];
		}
		this.refresh();
	}, refresh:function () {
		if (!this.store) {
			return;
		}
		this.store.fetch({query:this.query, queryOptions:this.queryOptions, onComplete:dojo.hitch(this, "generateList"), onError:dojo.hitch(this, "onError")});
	}, createListItem:function (item) {
		var attr = {};
		var arr = this.store.getLabelAttributes(item);
		var labelAttr = arr ? arr[0] : null;
		dojo.forEach(this.store.getAttributes(item), function (name) {
			if (name === labelAttr) {
				attr["label"] = this.store.getLabel(item);
			} else {
				attr[name] = this.store.getValue(item, name);
			}
		}, this);
		var w = new dojox.mobile.ListItem(attr);
		item._widgetId = w.id;
		return w;
	}, generateList:function (items, dataObject) {
		dojo.forEach(this.getChildren(), function (child) {
			child.destroyRecursive();
		});
		dojo.forEach(items, function (item, index) {
			this.addChild(this.createListItem(item));
		}, this);
	}, onError:function (errText) {
	}, onSet:function (item, attribute, oldValue, newValue) {
	}, onNew:function (newItem, parentInfo) {
		this.addChild(this.createListItem(newItem));
	}, onDelete:function (deletedItem) {
		dijit.byId(deletedItem._widgetId).destroyRecursive();
	}});
}

