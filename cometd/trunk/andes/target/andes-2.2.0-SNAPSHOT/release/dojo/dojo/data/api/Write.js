/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.data.api.Write"]) {
	dojo._hasResource["dojo.data.api.Write"] = true;
	dojo.provide("dojo.data.api.Write");
	dojo.require("dojo.data.api.Read");
	dojo.declare("dojo.data.api.Write", dojo.data.api.Read, {getFeatures:function () {
		return {"dojo.data.api.Read":true, "dojo.data.api.Write":true};
	}, newItem:function (keywordArgs, parentInfo) {
		var newItem;
		throw new Error("Unimplemented API: dojo.data.api.Write.newItem");
		return newItem;
	}, deleteItem:function (item) {
		throw new Error("Unimplemented API: dojo.data.api.Write.deleteItem");
		return false;
	}, setValue:function (item, attribute, value) {
		throw new Error("Unimplemented API: dojo.data.api.Write.setValue");
		return false;
	}, setValues:function (item, attribute, values) {
		throw new Error("Unimplemented API: dojo.data.api.Write.setValues");
		return false;
	}, unsetAttribute:function (item, attribute) {
		throw new Error("Unimplemented API: dojo.data.api.Write.clear");
		return false;
	}, save:function (keywordArgs) {
		throw new Error("Unimplemented API: dojo.data.api.Write.save");
	}, revert:function () {
		throw new Error("Unimplemented API: dojo.data.api.Write.revert");
		return false;
	}, isDirty:function (item) {
		throw new Error("Unimplemented API: dojo.data.api.Write.isDirty");
		return false;
	}});
}

