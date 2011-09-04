/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.WikipediaStore"]) {
	dojo._hasResource["dojox.data.WikipediaStore"] = true;
	dojo.provide("dojox.data.WikipediaStore");
	dojo.require("dojo.io.script");
	dojo.require("dojox.rpc.Service");
	dojo.require("dojox.data.ServiceStore");
	dojo.experimental("dojox.data.WikipediaStore");
	dojo.declare("dojox.data.WikipediaStore", dojox.data.ServiceStore, {constructor:function (options) {
		if (options && options.service) {
			this.service = options.service;
		} else {
			var svc = new dojox.rpc.Service(dojo.moduleUrl("dojox.rpc.SMDLibrary", "wikipedia.smd"));
			this.service = svc.query;
		}
		this.idAttribute = this.labelAttribute = "title";
	}, fetch:function (request) {
		var rq = dojo.mixin({}, request.query);
		if (rq && (!rq.action || rq.action === "parse")) {
			rq.action = "parse";
			rq.page = rq.title;
			delete rq.title;
		} else {
			if (rq.action === "query") {
				rq.list = "search";
				rq.srwhat = "text";
				rq.srsearch = rq.text;
				if (request.start) {
					rq.sroffset = request.start - 1;
				}
				if (request.count) {
					rq.srlimit = request.count >= 500 ? 500 : request.count;
				}
				delete rq.text;
			}
		}
		request.query = rq;
		return this.inherited(arguments);
	}, _processResults:function (results, def) {
		if (results.parse) {
			results.parse.title = dojo.queryToObject(def.ioArgs.url.split("?")[1]).page;
			results = [results.parse];
		} else {
			if (results.query && results.query.search) {
				results = results.query.search;
				var _thisStore = this;
				for (var i in results) {
					results[i]._loadObject = function (callback) {
						_thisStore.fetch({query:{action:"parse", title:this.title}, onItem:callback});
						delete this._loadObject;
					};
				}
			}
		}
		return this.inherited(arguments);
	}});
}

