/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.S3Store"]) {
	dojo._hasResource["dojox.data.S3Store"] = true;
	dojo.provide("dojox.data.S3Store");
	dojo.require("dojox.data.JsonRestStore");
	dojo.require("dojox.rpc.ProxiedPath");
	dojo.declare("dojox.data.S3Store", dojox.data.JsonRestStore, {_processResults:function (results) {
		var keyElements = results.getElementsByTagName("Key");
		var jsResults = [];
		var self = this;
		for (var i = 0; i < keyElements.length; i++) {
			var keyElement = keyElements[i];
			var val = {_loadObject:(function (key, val) {
				return function (callback) {
					delete this._loadObject;
					self.service(key).addCallback(callback);
				};
			})(keyElement.firstChild.nodeValue, val)};
			jsResults.push(val);
		}
		return {totalCount:jsResults.length, items:jsResults};
	}});
}

