/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.DataList"]) {
	dojo._hasResource["dijit.form.DataList"] = true;
	dojo.provide("dijit.form.DataList");
	dojo.require("dijit._WidgetBase");
	dojo.require("dojo.data.util.simpleFetch");
	dojo.require("dojo.data.util.filter");
	dojo.declare("dijit.form.DataList", null, {postscript:function (params, srcNodeRef) {
		this.domNode = dojo.byId(srcNodeRef);
		dojo._mixin(this, params);
		if (this.id) {
			dijit.registry.add(this);
		}
		this.domNode.style.display = "none";
	}, destroy:function () {
		dijit.registry.remove(this.id);
	}, getValue:function (item, attribute, defaultValue) {
		return (attribute == "value") ? item.value : (item.innerText || item.textContent || "");
	}, isItemLoaded:function (something) {
		return true;
	}, getFeatures:function () {
		return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
	}, _fetchItems:function (args, findCallback, errorCallback) {
		if (!args.query) {
			args.query = {};
		}
		if (!args.query.name) {
			args.query.name = "";
		}
		if (!args.queryOptions) {
			args.queryOptions = {};
		}
		var matcher = dojo.data.util.filter.patternToRegExp(args.query.name, args.queryOptions.ignoreCase), items = dojo.query("option", this.domNode).filter(function (option) {
			return (dojo.trim(option.innerText || option.textContent || "")).match(matcher);
		});
		if (args.sort) {
			items.sort(dojo.data.util.sorter.createSortFunction(args.sort, this));
		}
		findCallback(items, args);
	}, close:function (request) {
		return;
	}, getLabel:function (item) {
		return dojo.trim(item.innerHTML);
	}, getIdentity:function (item) {
		return dojo.attr(item, "value");
	}, fetchItemByIdentity:function (args) {
		var item = dojo.query("option[value='" + args.identity + "']", this.domNode)[0];
		args.onItem(item);
	}, fetchSelectedItem:function () {
		return dojo.query("> option[selected]", this.domNode)[0] || dojo.query("> option", this.domNode)[0];
	}});
	dojo.extend(dijit.form.DataList, dojo.data.util.simpleFetch);
}

