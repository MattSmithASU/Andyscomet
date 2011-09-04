/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.html.styles"]) {
	dojo._hasResource["dojox.html.styles"] = true;
	dojo.provide("dojox.html.styles");
	(function () {
		var dynamicStyleMap = {};
		var pageStyleSheets = {};
		var titledSheets = [];
		var styleIndicies = [];
		dojox.html.insertCssRule = function (selector, declaration, styleSheetName) {
			var ss = dojox.html.getDynamicStyleSheet(styleSheetName);
			var styleText = selector + " {" + declaration + "}";
			console.log("insertRule:", styleText);
			if (dojo.isIE) {
				ss.cssText += styleText;
				console.log("ss.cssText:", ss.cssText);
			} else {
				if (ss.sheet) {
					ss.sheet.insertRule(styleText, ss._indicies.length);
				} else {
					ss.appendChild(dojo.doc.createTextNode(styleText));
				}
			}
			ss._indicies.push(selector + " " + declaration);
			return selector;
		};
		dojox.html.removeCssRule = function (selector, declaration, styleSheetName) {
			var ss;
			var index = -1;
			for (var nm in dynamicStyleMap) {
				if (styleSheetName && styleSheetName != nm) {
					continue;
				}
				ss = dynamicStyleMap[nm];
				for (var i = 0; i < ss._indicies.length; i++) {
					if (selector + " " + declaration == ss._indicies[i]) {
						index = i;
						break;
					}
				}
				if (index > -1) {
					break;
				}
			}
			if (!ss) {
				console.log("No dynamic style sheet has been created from which to remove a rule.");
				return false;
			}
			if (index == -1) {
				console.log("The css rule was not found and could not be removed.");
				return false;
			}
			ss._indicies.splice(index, 1);
			if (dojo.isIE) {
				ss.removeRule(index);
			} else {
				if (ss.sheet) {
					ss.sheet.deleteRule(index);
				} else {
					if (document.styleSheets[0]) {
						console.log("what browser hath useth thith?");
					}
				}
			}
			return true;
		};
		dojox.html.getStyleSheet = function (styleSheetName) {
			if (dynamicStyleMap[styleSheetName || "default"]) {
				return dynamicStyleMap[styleSheetName || "default"];
			}
			if (!styleSheetName) {
				return false;
			}
			var allSheets = dojox.html.getStyleSheets();
			if (allSheets[styleSheetName]) {
				return dojox.html.getStyleSheets()[styleSheetName];
			}
			for (var nm in allSheets) {
				if (allSheets[nm].href && allSheets[nm].href.indexOf(styleSheetName) > -1) {
					return allSheets[nm];
				}
			}
			return false;
		};
		dojox.html.getDynamicStyleSheet = function (styleSheetName) {
			if (!styleSheetName) {
				styleSheetName = "default";
			}
			if (!dynamicStyleMap[styleSheetName]) {
				if (dojo.doc.createStyleSheet) {
					dynamicStyleMap[styleSheetName] = dojo.doc.createStyleSheet();
					if (dojo.isIE < 9) {
						dynamicStyleMap[styleSheetName].title = styleSheetName;
					}
				} else {
					dynamicStyleMap[styleSheetName] = dojo.doc.createElement("style");
					dynamicStyleMap[styleSheetName].setAttribute("type", "text/css");
					dojo.doc.getElementsByTagName("head")[0].appendChild(dynamicStyleMap[styleSheetName]);
					console.log(styleSheetName, " ss created: ", dynamicStyleMap[styleSheetName].sheet);
				}
				dynamicStyleMap[styleSheetName]._indicies = [];
			}
			return dynamicStyleMap[styleSheetName];
		};
		dojox.html.enableStyleSheet = function (styleSheetName) {
			var ss = dojox.html.getStyleSheet(styleSheetName);
			if (ss) {
				if (ss.sheet) {
					ss.sheet.disabled = false;
				} else {
					ss.disabled = false;
				}
			}
		};
		dojox.html.disableStyleSheet = function (styleSheetName) {
			var ss = dojox.html.getStyleSheet(styleSheetName);
			if (ss) {
				if (ss.sheet) {
					ss.sheet.disabled = true;
				} else {
					ss.disabled = true;
				}
			}
		};
		dojox.html.activeStyleSheet = function (title) {
			var sheets = dojox.html.getToggledStyleSheets();
			if (arguments.length == 1) {
				dojo.forEach(sheets, function (s) {
					s.disabled = (s.title == title) ? false : true;
				});
			} else {
				for (var i = 0; i < sheets.length; i++) {
					if (sheets[i].disabled == false) {
						return sheets[i];
					}
				}
			}
			return true;
		};
		dojox.html.getPreferredStyleSheet = function () {
		};
		dojox.html.getToggledStyleSheets = function () {
			if (!titledSheets.length) {
				var sObjects = dojox.html.getStyleSheets();
				for (var nm in sObjects) {
					if (sObjects[nm].title) {
						titledSheets.push(sObjects[nm]);
					}
				}
			}
			return titledSheets;
		};
		dojox.html.getStyleSheets = function () {
			if (pageStyleSheets.collected) {
				return pageStyleSheets;
			}
			var sheets = dojo.doc.styleSheets;
			dojo.forEach(sheets, function (n) {
				var s = (n.sheet) ? n.sheet : n;
				var name = s.title || s.href;
				if (dojo.isIE) {
					if (s.cssText.indexOf("#default#VML") == -1) {
						if (s.href) {
							pageStyleSheets[name] = s;
						} else {
							if (s.imports.length) {
								dojo.forEach(s.imports, function (si) {
									pageStyleSheets[si.title || si.href] = si;
								});
							} else {
								pageStyleSheets[name] = s;
							}
						}
					}
				} else {
					pageStyleSheets[name] = s;
					pageStyleSheets[name].id = s.ownerNode.id;
					dojo.forEach(s.cssRules, function (r) {
						if (r.href) {
							pageStyleSheets[r.href] = r.styleSheet;
							pageStyleSheets[r.href].id = s.ownerNode.id;
						}
					});
				}
			});
			pageStyleSheets.collected = true;
			return pageStyleSheets;
		};
	})();
}

