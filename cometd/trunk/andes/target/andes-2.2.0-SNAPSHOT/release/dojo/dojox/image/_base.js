/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.image._base"]) {
	dojo._hasResource["dojox.image._base"] = true;
	dojo.provide("dojox.image._base");
	(function (d) {
		var cacheNode;
		dojox.image.preload = function (urls) {
			if (!cacheNode) {
				cacheNode = d.create("div", {style:{position:"absolute", top:"-9999px", height:"1px", overflow:"hidden"}}, d.body());
			}
			return d.map(urls, function (url) {
				return d.create("img", {src:url}, cacheNode);
			});
		};
		if (d.config.preloadImages) {
			d.addOnLoad(function () {
				dojox.image.preload(d.config.preloadImages);
			});
		}
	})(dojo);
}

