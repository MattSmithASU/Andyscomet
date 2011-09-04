/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.NodeList-html"]) {
	dojo._hasResource["dojo.NodeList-html"] = true;
	dojo.provide("dojo.NodeList-html");
	dojo.require("dojo.html");
	dojo.extend(dojo.NodeList, {html:function (content, params) {
		var dhs = new dojo.html._ContentSetter(params || {});
		this.forEach(function (elm) {
			dhs.node = elm;
			dhs.set(content);
			dhs.tearDown();
		});
		return this;
	}});
}

