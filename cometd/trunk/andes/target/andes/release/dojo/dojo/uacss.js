/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.uacss"]) {
	dojo._hasResource["dojo.uacss"] = true;
	dojo.provide("dojo.uacss");
	(function () {
		var d = dojo, html = d.doc.documentElement, ie = d.isIE, opera = d.isOpera, maj = Math.floor, ff = d.isFF, boxModel = d.boxModel.replace(/-/, ""), classes = {dj_ie:ie, dj_ie6:maj(ie) == 6, dj_ie7:maj(ie) == 7, dj_ie8:maj(ie) == 8, dj_ie9:maj(ie) == 9, dj_quirks:d.isQuirks, dj_iequirks:ie && d.isQuirks, dj_opera:opera, dj_khtml:d.isKhtml, dj_webkit:d.isWebKit, dj_safari:d.isSafari, dj_chrome:d.isChrome, dj_gecko:d.isMozilla, dj_ff3:maj(ff) == 3};
		classes["dj_" + boxModel] = true;
		var classStr = "";
		for (var clz in classes) {
			if (classes[clz]) {
				classStr += clz + " ";
			}
		}
		html.className = d.trim(html.className + " " + classStr);
		dojo._loaders.unshift(function () {
			if (!dojo._isBodyLtr()) {
				var rtlClassStr = "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl ");
				html.className = d.trim(html.className + " " + rtlClassStr);
			}
		});
	})();
}

