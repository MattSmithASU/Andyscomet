/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.html"]) {
	dojo._hasResource["dijit._editor.html"] = true;
	dojo.provide("dijit._editor.html");
	dojo.getObject("_editor", true, dijit);
	dijit._editor.escapeXml = function (str, noSingleQuotes) {
		str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
		if (!noSingleQuotes) {
			str = str.replace(/'/gm, "&#39;");
		}
		return str;
	};
	dijit._editor.getNodeHtml = function (node) {
		var output;
		switch (node.nodeType) {
		  case 1:
			var lName = node.nodeName.toLowerCase();
			if (!lName || lName.charAt(0) == "/") {
				return "";
			}
			output = "<" + lName;
			var attrarray = [];
			var attr;
			if (dojo.isIE && node.outerHTML) {
				var s = node.outerHTML;
				s = s.substr(0, s.indexOf(">")).replace(/(['"])[^"']*\1/g, "");
				var reg = /(\b\w+)\s?=/g;
				var m, key;
				while ((m = reg.exec(s))) {
					key = m[1];
					if (key.substr(0, 3) != "_dj") {
						if (key == "src" || key == "href") {
							if (node.getAttribute("_djrealurl")) {
								attrarray.push([key, node.getAttribute("_djrealurl")]);
								continue;
							}
						}
						var val, match;
						switch (key) {
						  case "style":
							val = node.style.cssText.toLowerCase();
							break;
						  case "class":
							val = node.className;
							break;
						  case "width":
							if (lName === "img") {
								match = /width=(\S+)/i.exec(s);
								if (match) {
									val = match[1];
								}
								break;
							}
						  case "height":
							if (lName === "img") {
								match = /height=(\S+)/i.exec(s);
								if (match) {
									val = match[1];
								}
								break;
							}
						  default:
							val = node.getAttribute(key);
						}
						if (val != null) {
							attrarray.push([key, val.toString()]);
						}
					}
				}
			} else {
				var i = 0;
				while ((attr = node.attributes[i++])) {
					var n = attr.name;
					if (n.substr(0, 3) != "_dj") {
						var v = attr.value;
						if (n == "src" || n == "href") {
							if (node.getAttribute("_djrealurl")) {
								v = node.getAttribute("_djrealurl");
							}
						}
						attrarray.push([n, v]);
					}
				}
			}
			attrarray.sort(function (a, b) {
				return a[0] < b[0] ? -1 : (a[0] == b[0] ? 0 : 1);
			});
			var j = 0;
			while ((attr = attrarray[j++])) {
				output += " " + attr[0] + "=\"" + (dojo.isString(attr[1]) ? dijit._editor.escapeXml(attr[1], true) : attr[1]) + "\"";
			}
			if (lName === "script") {
				output += ">" + node.innerHTML + "</" + lName + ">";
			} else {
				if (node.childNodes.length) {
					output += ">" + dijit._editor.getChildrenHtml(node) + "</" + lName + ">";
				} else {
					switch (lName) {
					  case "br":
					  case "hr":
					  case "img":
					  case "input":
					  case "base":
					  case "meta":
					  case "area":
					  case "basefont":
						output += " />";
						break;
					  default:
						output += "></" + lName + ">";
					}
				}
			}
			break;
		  case 4:
		  case 3:
			output = dijit._editor.escapeXml(node.nodeValue, true);
			break;
		  case 8:
			output = "<!--" + dijit._editor.escapeXml(node.nodeValue, true) + "-->";
			break;
		  default:
			output = "<!-- Element not recognized - Type: " + node.nodeType + " Name: " + node.nodeName + "-->";
		}
		return output;
	};
	dijit._editor.getChildrenHtml = function (dom) {
		var out = "";
		if (!dom) {
			return out;
		}
		var nodes = dom["childNodes"] || dom;
		var checkParent = !dojo.isIE || nodes !== dom;
		var node, i = 0;
		while ((node = nodes[i++])) {
			if (!checkParent || node.parentNode == dom) {
				out += dijit._editor.getNodeHtml(node);
			}
		}
		return out;
	};
}

