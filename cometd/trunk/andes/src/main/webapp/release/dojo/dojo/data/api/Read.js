/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.data.api.Read"]) {
	dojo._hasResource["dojo.data.api.Read"] = true;
	dojo.provide("dojo.data.api.Read");
	dojo.require("dojo.data.api.Request");
	dojo.declare("dojo.data.api.Read", null, {getValue:function (item, attribute, defaultValue) {
		var attributeValue = null;
		throw new Error("Unimplemented API: dojo.data.api.Read.getValue");
		return attributeValue;
	}, getValues:function (item, attribute) {
		var array = [];
		throw new Error("Unimplemented API: dojo.data.api.Read.getValues");
		return array;
	}, getAttributes:function (item) {
		var array = [];
		throw new Error("Unimplemented API: dojo.data.api.Read.getAttributes");
		return array;
	}, hasAttribute:function (item, attribute) {
		throw new Error("Unimplemented API: dojo.data.api.Read.hasAttribute");
		return false;
	}, containsValue:function (item, attribute, value) {
		throw new Error("Unimplemented API: dojo.data.api.Read.containsValue");
		return false;
	}, isItem:function (something) {
		throw new Error("Unimplemented API: dojo.data.api.Read.isItem");
		return false;
	}, isItemLoaded:function (something) {
		throw new Error("Unimplemented API: dojo.data.api.Read.isItemLoaded");
		return false;
	}, loadItem:function (keywordArgs) {
		if (!this.isItemLoaded(keywordArgs.item)) {
			throw new Error("Unimplemented API: dojo.data.api.Read.loadItem");
		}
	}, fetch:function (keywordArgs) {
		var request = null;
		throw new Error("Unimplemented API: dojo.data.api.Read.fetch");
		return request;
	}, getFeatures:function () {
		return {"dojo.data.api.Read":true};
	}, close:function (request) {
		throw new Error("Unimplemented API: dojo.data.api.Read.close");
	}, getLabel:function (item) {
		throw new Error("Unimplemented API: dojo.data.api.Read.getLabel");
		return undefined;
	}, getLabelAttributes:function (item) {
		throw new Error("Unimplemented API: dojo.data.api.Read.getLabelAttributes");
		return null;
	}});
}

