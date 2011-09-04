/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.css"]) {
	dojo._hasResource["dojox.data.css"] = true;
	dojo.provide("dojox.data.css");
	dojox.data.css.rules = {};
	dojox.data.css.rules.forEach = function (fn, ctx, context) {
		if (context) {
			var _processSS = function (styleSheet) {
				dojo.forEach(styleSheet[styleSheet.cssRules ? "cssRules" : "rules"], function (rule) {
					if (!rule.type || rule.type !== 3) {
						var href = "";
						if (styleSheet && styleSheet.href) {
							href = styleSheet.href;
						}
						fn.call(ctx ? ctx : this, rule, styleSheet, href);
					}
				});
			};
			dojo.forEach(context, _processSS);
		}
	};
	dojox.data.css.findStyleSheets = function (sheets) {
		var sheetObjects = [];
		var _processSS = function (styleSheet) {
			var s = dojox.data.css.findStyleSheet(styleSheet);
			if (s) {
				dojo.forEach(s, function (sheet) {
					if (dojo.indexOf(sheetObjects, sheet) === -1) {
						sheetObjects.push(sheet);
					}
				});
			}
		};
		dojo.forEach(sheets, _processSS);
		return sheetObjects;
	};
	dojox.data.css.findStyleSheet = function (sheet) {
		var sheetObjects = [];
		if (sheet.charAt(0) === ".") {
			sheet = sheet.substring(1);
		}
		var _processSS = function (styleSheet) {
			if (styleSheet.href && styleSheet.href.match(sheet)) {
				sheetObjects.push(styleSheet);
				return true;
			}
			if (styleSheet.imports) {
				return dojo.some(styleSheet.imports, function (importedSS) {
					return _processSS(importedSS);
				});
			}
			return dojo.some(styleSheet[styleSheet.cssRules ? "cssRules" : "rules"], function (rule) {
				if (rule.type && rule.type === 3 && _processSS(rule.styleSheet)) {
					return true;
				}
				return false;
			});
		};
		dojo.some(document.styleSheets, _processSS);
		return sheetObjects;
	};
	dojox.data.css.determineContext = function (initialStylesheets) {
		var ret = [];
		if (initialStylesheets && initialStylesheets.length > 0) {
			initialStylesheets = dojox.data.css.findStyleSheets(initialStylesheets);
		} else {
			initialStylesheets = document.styleSheets;
		}
		var _processSS = function (styleSheet) {
			ret.push(styleSheet);
			if (styleSheet.imports) {
				dojo.forEach(styleSheet.imports, function (importedSS) {
					_processSS(importedSS);
				});
			}
			dojo.forEach(styleSheet[styleSheet.cssRules ? "cssRules" : "rules"], function (rule) {
				if (rule.type && rule.type === 3) {
					_processSS(rule.styleSheet);
				}
			});
		};
		dojo.forEach(initialStylesheets, _processSS);
		return ret;
	};
}

