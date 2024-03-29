/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.FlickrStore"]) {
	dojo._hasResource["dojox.data.FlickrStore"] = true;
	dojo.provide("dojox.data.FlickrStore");
	dojo.require("dojo.data.util.simpleFetch");
	dojo.require("dojo.io.script");
	dojo.require("dojo.date.stamp");
	dojo.require("dojo.AdapterRegistry");
	dojo.declare("dojox.data.FlickrStore", null, {constructor:function (args) {
		if (args && args.label) {
			this.label = args.label;
		}
		if (args && "urlPreventCache" in args) {
			this.urlPreventCache = args.urlPreventCache ? true : false;
		}
	}, _storeRef:"_S", label:"title", urlPreventCache:true, _assertIsItem:function (item) {
		if (!this.isItem(item)) {
			throw new Error("dojox.data.FlickrStore: a function was passed an item argument that was not an item");
		}
	}, _assertIsAttribute:function (attribute) {
		if (typeof attribute !== "string") {
			throw new Error("dojox.data.FlickrStore: a function was passed an attribute argument that was not an attribute name string");
		}
	}, getFeatures:function () {
		return {"dojo.data.api.Read":true};
	}, getValue:function (item, attribute, defaultValue) {
		var values = this.getValues(item, attribute);
		if (values && values.length > 0) {
			return values[0];
		}
		return defaultValue;
	}, getAttributes:function (item) {
		return ["title", "description", "author", "datePublished", "dateTaken", "imageUrl", "imageUrlSmall", "imageUrlMedium", "tags", "link"];
	}, hasAttribute:function (item, attribute) {
		var v = this.getValue(item, attribute);
		if (v || v === "" || v === false) {
			return true;
		}
		return false;
	}, isItemLoaded:function (item) {
		return this.isItem(item);
	}, loadItem:function (keywordArgs) {
	}, getLabel:function (item) {
		return this.getValue(item, this.label);
	}, getLabelAttributes:function (item) {
		return [this.label];
	}, containsValue:function (item, attribute, value) {
		var values = this.getValues(item, attribute);
		for (var i = 0; i < values.length; i++) {
			if (values[i] === value) {
				return true;
			}
		}
		return false;
	}, getValues:function (item, attribute) {
		this._assertIsItem(item);
		this._assertIsAttribute(attribute);
		var u = d.hitch(this, "_unescapeHtml");
		var s = d.hitch(d.date.stamp, "fromISOString");
		switch (attribute) {
		  case "title":
			return [u(item.title)];
		  case "author":
			return [u(item.author)];
		  case "datePublished":
			return [s(item.published)];
		  case "dateTaken":
			return [s(item.date_taken)];
		  case "imageUrlSmall":
			return [item.media.m.replace(/_m\./, "_s.")];
		  case "imageUrl":
			return [item.media.m.replace(/_m\./, ".")];
		  case "imageUrlMedium":
			return [item.media.m];
		  case "link":
			return [item.link];
		  case "tags":
			return item.tags.split(" ");
		  case "description":
			return [u(item.description)];
		  default:
			return [];
		}
	}, isItem:function (item) {
		if (item && item[this._storeRef] === this) {
			return true;
		}
		return false;
	}, close:function (request) {
	}, _fetchItems:function (request, fetchHandler, errorHandler) {
		var rq = request.query = request.query || {};
		var content = {format:"json", tagmode:"any"};
		d.forEach(["tags", "tagmode", "lang", "id", "ids"], function (i) {
			if (rq[i]) {
				content[i] = rq[i];
			}
		});
		content.id = rq.id || rq.userid || rq.groupid;
		if (rq.userids) {
			content.ids = rq.userids;
		}
		var handle = null;
		var getArgs = {url:dojox.data.FlickrStore.urlRegistry.match(request), preventCache:this.urlPreventCache, content:content};
		var myHandler = d.hitch(this, function (data) {
			if (!!handle) {
				d.disconnect(handle);
			}
			fetchHandler(this._processFlickrData(data), request);
		});
		handle = d.connect("jsonFlickrFeed", myHandler);
		var deferred = d.io.script.get(getArgs);
		deferred.addErrback(function (error) {
			d.disconnect(handle);
			errorHandler(error, request);
		});
	}, _processFlickrData:function (data) {
		var items = [];
		if (data.items) {
			items = data.items;
			for (var i = 0; i < data.items.length; i++) {
				var item = data.items[i];
				item[this._storeRef] = this;
			}
		}
		return items;
	}, _unescapeHtml:function (str) {
		return str.replace(/&amp;/gm, "&").replace(/&lt;/gm, "<").replace(/&gt;/gm, ">").replace(/&quot;/gm, "\"").replace(/&#39;/gm, "'");
	}});
	dojo.extend(dojox.data.FlickrStore, dojo.data.util.simpleFetch);
	var feedsUrl = "http://api.flickr.com/services/feeds/";
	var reg = dojox.data.FlickrStore.urlRegistry = new d.AdapterRegistry(true);
	reg.register("group pool", function (request) {
		return !!request.query["groupid"];
	}, feedsUrl + "groups_pool.gne");
	reg.register("default", function (request) {
		return true;
	}, feedsUrl + "photos_public.gne");
	if (!jsonFlickrFeed) {
		var jsonFlickrFeed = function (data) {
		};
	}
}

