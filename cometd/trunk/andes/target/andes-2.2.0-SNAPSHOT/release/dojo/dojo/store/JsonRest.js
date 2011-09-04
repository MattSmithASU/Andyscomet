/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.JsonRest"]) {
	dojo._hasResource["dojo.store.JsonRest"] = true;
	dojo.provide("dojo.store.JsonRest");
	dojo.require("dojo.store.util.QueryResults");
	dojo.declare("dojo.store.JsonRest", null, {constructor:function (options) {
		dojo.mixin(this, options);
	}, target:"", idProperty:"id", get:function (id, options) {
		var headers = options || {};
		headers.Accept = "application/javascript, application/json";
		return dojo.xhrGet({url:this.target + id, handleAs:"json", headers:headers});
	}, getIdentity:function (object) {
		return object[this.idProperty];
	}, put:function (object, options) {
		options = options || {};
		var id = ("id" in options) ? options.id : this.getIdentity(object);
		var hasId = typeof id != "undefined";
		return dojo.xhr(hasId && !options.incremental ? "PUT" : "POST", {url:hasId ? this.target + id : this.target, postData:dojo.toJson(object), handleAs:"json", headers:{"Content-Type":"application/json", "If-Match":options.overwrite === true ? "*" : null, "If-None-Match":options.overwrite === false ? "*" : null}});
	}, add:function (object, options) {
		options = options || {};
		options.overwrite = false;
		return this.put(object, options);
	}, remove:function (id) {
		return dojo.xhrDelete({url:this.target + id});
	}, query:function (query, options) {
		var headers = {Accept:"application/javascript, application/json"};
		options = options || {};
		if (options.start >= 0 || options.count >= 0) {
			headers.Range = "items=" + (options.start || "0") + "-" + (("count" in options && options.count != Infinity) ? (options.count + (options.start || 0) - 1) : "");
		}
		if (dojo.isObject(query)) {
			query = dojo.objectToQuery(query);
			query = query ? "?" + query : "";
		}
		if (options && options.sort) {
			query += (query ? "&" : "?") + "sort(";
			for (var i = 0; i < options.sort.length; i++) {
				var sort = options.sort[i];
				query += (i > 0 ? "," : "") + (sort.descending ? "-" : "+") + encodeURIComponent(sort.attribute);
			}
			query += ")";
		}
		var results = dojo.xhrGet({url:this.target + (query || ""), handleAs:"json", headers:headers});
		results.total = results.then(function () {
			var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
			return range && (range = range.match(/\/(.*)/)) && +range[1];
		});
		return dojo.store.util.QueryResults(results);
	}});
}

