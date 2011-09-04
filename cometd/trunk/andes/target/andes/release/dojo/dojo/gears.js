/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.gears"]) {
	dojo._hasResource["dojo.gears"] = true;
	dojo.provide("dojo.gears");
	dojo.getObject("gears", true, dojo);
	dojo.gears._gearsObject = function () {
		var factory;
		var results;
		var gearsObj = dojo.getObject("google.gears");
		if (gearsObj) {
			return gearsObj;
		}
		if (typeof GearsFactory != "undefined") {
			factory = new GearsFactory();
		} else {
			if (dojo.isIE) {
				try {
					factory = new ActiveXObject("Gears.Factory");
				}
				catch (e) {
				}
			} else {
				if (navigator.mimeTypes["application/x-googlegears"]) {
					factory = document.createElement("object");
					factory.setAttribute("type", "application/x-googlegears");
					factory.setAttribute("width", 0);
					factory.setAttribute("height", 0);
					factory.style.display = "none";
					document.documentElement.appendChild(factory);
				}
			}
		}
		if (!factory) {
			return null;
		}
		dojo.setObject("google.gears.factory", factory);
		return dojo.getObject("google.gears");
	};
	dojo.gears.available = (!!dojo.gears._gearsObject()) || 0;
}

