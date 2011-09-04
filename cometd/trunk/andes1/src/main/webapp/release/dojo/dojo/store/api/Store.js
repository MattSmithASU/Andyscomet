/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



define([], function () {
	dojo.declare("dojo.store.api.Store", null, {idProperty:"id", queryEngine:null, get:function (id) {
	}, getIdentity:function (object) {
	}, put:function (object, directives) {
	}, add:function (object, directives) {
	}, remove:function (id) {
		delete this.index[id];
		var data = this.data, idProperty = this.idProperty;
		for (var i = 0, l = data.length; i < l; i++) {
			if (data[i][idProperty] == id) {
				data.splice(i, 1);
				return;
			}
		}
	}, query:function (query, options) {
	}, transaction:function () {
	}, getChildren:function (parent, options) {
	}, getMetadata:function (object) {
	}});
	dojo.store.api.Store.PutDirectives = function (id, before, parent, overwrite) {
		this.id = id;
		this.before = before;
		this.parent = parent;
		this.overwrite = overwrite;
	};
	dojo.store.api.Store.SortInformation = function (attribute, descending) {
		this.attribute = attribute;
		this.descending = descending;
	};
	dojo.store.api.Store.QueryOptions = function (sort, start, count) {
		this.sort = sort;
		this.start = start;
		this.count = count;
	};
	dojo.declare("dojo.store.api.Store.QueryResults", null, {forEach:function (callback, thisObject) {
	}, filter:function (callback, thisObject) {
	}, map:function (callback, thisObject) {
	}, then:function (callback, errorHandler) {
	}, observe:function (listener, includeAllUpdates) {
	}, total:0});
	dojo.declare("dojo.store.api.Store.Transaction", null, {commit:function () {
	}, abort:function (callback, thisObject) {
	}});
});

