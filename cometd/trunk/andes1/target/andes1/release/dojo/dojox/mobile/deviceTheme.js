/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.deviceTheme"]) {
	dojo._hasResource["dojox.mobile.deviceTheme"] = true;
	dojo.provide("dojox.mobile.deviceTheme");
	dojox.mobile.loadCssFile = function (file) {
		dojo.create("LINK", {href:file, type:"text/css", rel:"stylesheet"}, dojo.doc.getElementsByTagName("head")[0]);
	};
	dojox.mobile.themeMap = [["Android", "android", []], ["BlackBerry", "blackberry", []], ["iPad", "iphone", [dojo.moduleUrl("dojox.mobile", "themes/iphone/ipad.css")]], [".*", "iphone", []]];
	dojox.mobile.loadDeviceTheme = function () {
		var t = dojo.config["mblThemeFiles"] || dojox.mobile.themeFiles || ["@theme"];
		if (!dojo.isArray(t)) {
			alert("loadDeviceTheme: array is expected but found: " + t);
		}
		var i, j;
		var m = dojox.mobile.themeMap;
		for (i = 0; i < m.length; i++) {
			var re1 = new RegExp("theme=" + m[i][0]);
			var re2 = new RegExp(m[i][0]);
			if (location.search.match(re1) || navigator.userAgent.match(re2)) {
				var theme = m[i][1];
				var files = m[i][2];
				for (j = t.length - 1; j >= 0; j--) {
					var pkg = dojo.isArray(t[j]) ? t[j][0] : "dojox.mobile";
					var name = dojo.isArray(t[j]) ? t[j][1] : t[j];
					var f = "themes/" + theme + "/" + (name === "@theme" ? theme : name) + ".css";
					files.unshift(dojo.moduleUrl(pkg, f));
				}
				for (j = 0; j < files.length; j++) {
					dojox.mobile.loadCssFile(files[j]);
				}
				break;
			}
		}
	};
	dojox.mobile.loadDeviceTheme();
}

