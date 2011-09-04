/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.GoogleFeedStore"]) {
	dojo._hasResource["dojox.data.GoogleFeedStore"] = true;
	dojo.provide("dojox.data.GoogleFeedStore");
	dojo.require("dojox.data.GoogleSearchStore");
	dojo.experimental("dojox.data.GoogleFeedStore");
	dojo.declare("dojox.data.GoogleFeedStore", dojox.data.GoogleSearchStore, {_type:"", _googleUrl:"http://ajax.googleapis.com/ajax/services/feed/load", _attributes:["title", "link", "author", "published", "content", "summary", "categories"], _queryAttrs:{"url":"q"}, getFeedValue:function (attribute, defaultValue) {
		var values = this.getFeedValues(attribute, defaultValue);
		if (dojo.isArray(values)) {
			return values[0];
		}
		return values;
	}, getFeedValues:function (attribute, defaultValue) {
		if (!this._feedMetaData) {
			return defaultValue;
		}
		return this._feedMetaData[attribute] || defaultValue;
	}, _processItem:function (item, request) {
		this.inherited(arguments);
		item["summary"] = item["contentSnippet"];
		item["published"] = item["publishedDate"];
	}, _getItems:function (data) {
		if (data["feed"]) {
			this._feedMetaData = {title:data.feed.title, desc:data.feed.description, url:data.feed.link, author:data.feed.author};
			return data.feed.entries;
		}
		return null;
	}, _createContent:function (query, callback, request) {
		var cb = this.inherited(arguments);
		cb.num = (request.count || 10) + (request.start || 0);
		return cb;
	}});
}

