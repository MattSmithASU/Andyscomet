/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.CssClassStore"]) {
	dojo._hasResource["dojox.data.CssClassStore"] = true;
	dojo.provide("dojox.data.CssClassStore");
	dojo.require("dojox.data.CssRuleStore");
	dojo.declare("dojox.data.CssClassStore", dojox.data.CssRuleStore, {_labelAttribute:"class", _idAttribute:"class", _cName:"dojox.data.CssClassStore", getFeatures:function () {
		return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
	}, getAttributes:function (item) {
		this._assertIsItem(item);
		return ["class", "classSans"];
	}, getValue:function (item, attribute, defaultValue) {
		var values = this.getValues(item, attribute);
		if (values && values.length > 0) {
			return values[0];
		}
		return defaultValue;
	}, getValues:function (item, attribute) {
		this._assertIsItem(item);
		this._assertIsAttribute(attribute);
		var value = [];
		if (attribute === "class") {
			value = [item.className];
		} else {
			if (attribute === "classSans") {
				value = [item.className.replace(/\./g, "")];
			}
		}
		return value;
	}, _handleRule:function (rule, styleSheet, href) {
		var obj = {};
		var s = rule["selectorText"].split(" ");
		for (var j = 0; j < s.length; j++) {
			var tmp = s[j];
			var first = tmp.indexOf(".");
			if (tmp && tmp.length > 0 && first !== -1) {
				var last = tmp.indexOf(",") || tmp.indexOf("[");
				tmp = tmp.substring(first, ((last !== -1 && last > first) ? last : tmp.length));
				obj[tmp] = true;
			}
		}
		for (var key in obj) {
			if (!this._allItems[key]) {
				var item = {};
				item.className = key;
				item[this._storeRef] = this;
				this._allItems[key] = item;
			}
		}
	}, _handleReturn:function () {
		var _inProgress = [];
		var items = {};
		for (var i in this._allItems) {
			items[i] = this._allItems[i];
		}
		var requestInfo;
		while (this._pending.length) {
			requestInfo = this._pending.pop();
			requestInfo.request._items = items;
			_inProgress.push(requestInfo);
		}
		while (_inProgress.length) {
			requestInfo = _inProgress.pop();
			if (requestInfo.fetch) {
				this._handleFetchReturn(requestInfo.request);
			} else {
				this._handleFetchByIdentityReturn(requestInfo.request);
			}
		}
	}, _handleFetchByIdentityReturn:function (request) {
		var items = request._items;
		var item = items[(dojo.isWebKit ? request.identity.toLowerCase() : request.identity)];
		if (!this.isItem(item)) {
			item = null;
		}
		if (request.onItem) {
			var scope = request.scope || dojo.global;
			request.onItem.call(scope, item);
		}
	}, getIdentity:function (item) {
		this._assertIsItem(item);
		return this.getValue(item, this._idAttribute);
	}, getIdentityAttributes:function (item) {
		this._assertIsItem(item);
		return [this._idAttribute];
	}, fetchItemByIdentity:function (request) {
		request = request || {};
		if (!request.store) {
			request.store = this;
		}
		if (this._pending && this._pending.length > 0) {
			this._pending.push({request:request});
		} else {
			this._pending = [{request:request}];
			this._fetch(request);
		}
		return request;
	}});
}

