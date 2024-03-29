/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.html.metrics"]) {
	dojo._hasResource["dojox.html.metrics"] = true;
	dojo.provide("dojox.html.metrics");
	(function () {
		var dhm = dojox.html.metrics;
		dhm.getFontMeasurements = function () {
			var heights = {"1em":0, "1ex":0, "100%":0, "12pt":0, "16px":0, "xx-small":0, "x-small":0, "small":0, "medium":0, "large":0, "x-large":0, "xx-large":0};
			if (dojo.isIE) {
				dojo.doc.documentElement.style.fontSize = "100%";
			}
			var div = dojo.doc.createElement("div");
			var ds = div.style;
			ds.position = "absolute";
			ds.left = "-100px";
			ds.top = "0";
			ds.width = "30px";
			ds.height = "1000em";
			ds.borderWidth = "0";
			ds.margin = "0";
			ds.padding = "0";
			ds.outline = "0";
			ds.lineHeight = "1";
			ds.overflow = "hidden";
			dojo.body().appendChild(div);
			for (var p in heights) {
				ds.fontSize = p;
				heights[p] = Math.round(div.offsetHeight * 12 / 16) * 16 / 12 / 1000;
			}
			dojo.body().removeChild(div);
			div = null;
			return heights;
		};
		var fontMeasurements = null;
		dhm.getCachedFontMeasurements = function (recalculate) {
			if (recalculate || !fontMeasurements) {
				fontMeasurements = dhm.getFontMeasurements();
			}
			return fontMeasurements;
		};
		var measuringNode = null, empty = {};
		dhm.getTextBox = function (text, style, className) {
			var m, s;
			if (!measuringNode) {
				m = measuringNode = dojo.doc.createElement("div");
				var c = dojo.doc.createElement("div");
				c.appendChild(m);
				s = c.style;
				s.overflow = "scroll";
				s.position = "absolute";
				s.left = "0px";
				s.top = "-10000px";
				s.width = "1px";
				s.height = "1px";
				s.visibility = "hidden";
				s.borderWidth = "0";
				s.margin = "0";
				s.padding = "0";
				s.outline = "0";
				dojo.body().appendChild(c);
			} else {
				m = measuringNode;
			}
			m.className = "";
			s = m.style;
			s.borderWidth = "0";
			s.margin = "0";
			s.padding = "0";
			s.outline = "0";
			if (arguments.length > 1 && style) {
				for (var i in style) {
					if (i in empty) {
						continue;
					}
					s[i] = style[i];
				}
			}
			if (arguments.length > 2 && className) {
				m.className = className;
			}
			m.innerHTML = text;
			var box = dojo.position(m);
			box.w = m.parentNode.scrollWidth;
			return box;
		};
		var scroll = {w:16, h:16};
		dhm.getScrollbar = function () {
			return {w:scroll.w, h:scroll.h};
		};
		dhm._fontResizeNode = null;
		dhm.initOnFontResize = function (interval) {
			var f = dhm._fontResizeNode = dojo.doc.createElement("iframe");
			var fs = f.style;
			fs.position = "absolute";
			fs.width = "5em";
			fs.height = "10em";
			fs.top = "-10000px";
			if (dojo.isIE) {
				f.onreadystatechange = function () {
					if (f.contentWindow.document.readyState == "complete") {
						f.onresize = f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
					}
				};
			} else {
				f.onload = function () {
					f.contentWindow.onresize = f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
				};
			}
			f.setAttribute("src", "javascript:'<html><head><script>if(\"loadFirebugConsole\" in window){window.loadFirebugConsole();}</script></head><body></body></html>'");
			dojo.body().appendChild(f);
			dhm.initOnFontResize = function () {
			};
		};
		dhm.onFontResize = function () {
		};
		dhm._fontresize = function () {
			dhm.onFontResize();
		};
		dojo.addOnUnload(function () {
			var f = dhm._fontResizeNode;
			if (f) {
				if (dojo.isIE && f.onresize) {
					f.onresize = null;
				} else {
					if (f.contentWindow && f.contentWindow.onresize) {
						f.contentWindow.onresize = null;
					}
				}
				dhm._fontResizeNode = null;
			}
		});
		dojo.addOnLoad(function () {
			try {
				var n = dojo.doc.createElement("div");
				n.style.cssText = "top:0;left:0;width:100px;height:100px;overflow:scroll;position:absolute;visibility:hidden;";
				dojo.body().appendChild(n);
				scroll.w = n.offsetWidth - n.clientWidth;
				scroll.h = n.offsetHeight - n.clientHeight;
				dojo.body().removeChild(n);
				delete n;
			}
			catch (e) {
			}
			if ("fontSizeWatch" in dojo.config && !!dojo.config.fontSizeWatch) {
				dhm.initOnFontResize();
			}
		});
	})();
}

