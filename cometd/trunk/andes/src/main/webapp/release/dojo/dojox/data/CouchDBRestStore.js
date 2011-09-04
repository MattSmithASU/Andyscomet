/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.CouchDBRestStore"]) {
	dojo._hasResource["dojox.data.CouchDBRestStore"] = true;
	dojo.provide("dojox.data.CouchDBRestStore");
	dojo.require("dojox.data.JsonRestStore");
	dojo.declare("dojox.data.CouchDBRestStore", dojox.data.JsonRestStore, {save:function (kwArgs) {
		var actions = this.inherited(arguments);
		var prefix = this.service.servicePath;
		for (var i = 0; i < actions.length; i++) {
			(function (item, dfd) {
				dfd.addCallback(function (result) {
					if (result) {
						item.__id = prefix + result.id;
						item._rev = result.rev;
					}
					return result;
				});
			})(actions[i].content, actions[i].deferred);
		}
	}, fetch:function (args) {
		args.query = args.query || "_all_docs?";
		if (args.start) {
			args.query = (args.query ? (args.query + "&") : "") + "startkey=" + args.start;
			delete args.start;
		}
		if (args.count) {
			args.query = (args.query ? (args.query + "&") : "") + "limit=" + args.count;
			delete args.count;
		}
		return this.inherited(arguments);
	}, _processResults:function (results) {
		var rows = results.rows;
		if (rows) {
			var prefix = this.service.servicePath;
			var self = this;
			for (var i = 0; i < rows.length; i++) {
				var realItem = rows[i].value;
				realItem.__id = prefix + rows[i].id;
				realItem._id = rows[i].id;
				realItem._loadObject = dojox.rpc.JsonRest._loader;
				rows[i] = realItem;
			}
			return {totalCount:results.total_rows, items:results.rows};
		} else {
			return {items:results};
		}
	}});
	dojox.data.CouchDBRestStore.getStores = function (couchServerUrl) {
		var dfd = dojo.xhrGet({url:couchServerUrl + "_all_dbs", handleAs:"json", sync:true});
		var stores = {};
		dfd.addBoth(function (dbs) {
			for (var i = 0; i < dbs.length; i++) {
				stores[dbs[i]] = new dojox.data.CouchDBRestStore({target:couchServerUrl + dbs[i], idAttribute:"_id"});
			}
			return stores;
		});
		return stores;
	};
}

