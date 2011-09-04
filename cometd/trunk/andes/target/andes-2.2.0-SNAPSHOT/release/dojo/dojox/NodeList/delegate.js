/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.NodeList.delegate"]) {
	dojo._hasResource["dojox.NodeList.delegate"] = true;
	dojo.provide("dojox.NodeList.delegate");
	dojo.require("dojo.NodeList-traverse");
	dojo.extend(dojo.NodeList, {delegate:function (selector, eventName, fn) {
		return this.connect(eventName, function (evt) {
			var closest = dojo.query(evt.target).closest(selector, this);
			if (closest.length) {
				fn.call(closest[0], evt);
			}
		});
	}});
}

