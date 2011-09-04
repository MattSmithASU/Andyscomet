/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.data.api.Identity"]) {
	dojo._hasResource["dojo.data.api.Identity"] = true;
	dojo.provide("dojo.data.api.Identity");
	dojo.require("dojo.data.api.Read");
	dojo.declare("dojo.data.api.Identity", dojo.data.api.Read, {getFeatures:function () {
		return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
	}, getIdentity:function (item) {
		throw new Error("Unimplemented API: dojo.data.api.Identity.getIdentity");
		var itemIdentityString = null;
		return itemIdentityString;
	}, getIdentityAttributes:function (item) {
		throw new Error("Unimplemented API: dojo.data.api.Identity.getIdentityAttributes");
		return null;
	}, fetchItemByIdentity:function (keywordArgs) {
		if (!this.isItemLoaded(keywordArgs.item)) {
			throw new Error("Unimplemented API: dojo.data.api.Identity.fetchItemByIdentity");
		}
	}});
}

