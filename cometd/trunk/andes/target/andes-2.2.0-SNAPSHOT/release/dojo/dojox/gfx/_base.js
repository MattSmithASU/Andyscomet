/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx._base"]) {
	dojo._hasResource["dojox.gfx._base"] = true;
	dojo.provide("dojox.gfx._base");
	(function () {
		var g = dojox.gfx, b = g._base;
		g._hasClass = function (node, classStr) {
			var cls = node.getAttribute("className");
			return cls && (" " + cls + " ").indexOf(" " + classStr + " ") >= 0;
		};
		g._addClass = function (node, classStr) {
			var cls = node.getAttribute("className") || "";
			if (!cls || (" " + cls + " ").indexOf(" " + classStr + " ") < 0) {
				node.setAttribute("className", cls + (cls ? " " : "") + classStr);
			}
		};
		g._removeClass = function (node, classStr) {
			var cls = node.getAttribute("className");
			if (cls) {
				node.setAttribute("className", cls.replace(new RegExp("(^|\\s+)" + classStr + "(\\s+|$)"), "$1$2"));
			}
		};
		b._getFontMeasurements = function () {
			var heights = {"1em":0, "1ex":0, "100%":0, "12pt":0, "16px":0, "xx-small":0, "x-small":0, "small":0, "medium":0, "large":0, "x-large":0, "xx-large":0};
			if (dojo.isIE) {
				dojo.doc.documentElement.style.fontSize = "100%";
			}
			var div = dojo.create("div", {style:{position:"absolute", left:"0", top:"-100px", width:"30px", height:"1000em", borderWidth:"0", margin:"0", padding:"0", outline:"none", lineHeight:"1", overflow:"hidden"}}, dojo.body());
			for (var p in heights) {
				div.style.fontSize = p;
				heights[p] = Math.round(div.offsetHeight * 12 / 16) * 16 / 12 / 1000;
			}
			dojo.body().removeChild(div);
			return heights;
		};
		var fontMeasurements = null;
		b._getCachedFontMeasurements = function (recalculate) {
			if (recalculate || !fontMeasurements) {
				fontMeasurements = b._getFontMeasurements();
			}
			return fontMeasurements;
		};
		var measuringNode = null, empty = {};
		b._getTextBox = function (text, style, className) {
			var m, s, al = arguments.length;
			if (!measuringNode) {
				measuringNode = dojo.create("div", {style:{position:"absolute", top:"-10000px", left:"0"}}, dojo.body());
			}
			m = measuringNode;
			m.className = "";
			s = m.style;
			s.borderWidth = "0";
			s.margin = "0";
			s.padding = "0";
			s.outline = "0";
			if (al > 1 && style) {
				for (var i in style) {
					if (i in empty) {
						continue;
					}
					s[i] = style[i];
				}
			}
			if (al > 2 && className) {
				m.className = className;
			}
			m.innerHTML = text;
			if (m["getBoundingClientRect"]) {
				var bcr = m.getBoundingClientRect();
				return {l:bcr.left, t:bcr.top, w:bcr.width || (bcr.right - bcr.left), h:bcr.height || (bcr.bottom - bcr.top)};
			} else {
				return dojo.marginBox(m);
			}
		};
		var uniqueId = 0;
		b._getUniqueId = function () {
			var id;
			do {
				id = dojo._scopeName + "Unique" + (++uniqueId);
			} while (dojo.byId(id));
			return id;
		};
	})();
	dojo.mixin(dojox.gfx, {defaultPath:{type:"path", path:""}, defaultPolyline:{type:"polyline", points:[]}, defaultRect:{type:"rect", x:0, y:0, width:100, height:100, r:0}, defaultEllipse:{type:"ellipse", cx:0, cy:0, rx:200, ry:100}, defaultCircle:{type:"circle", cx:0, cy:0, r:100}, defaultLine:{type:"line", x1:0, y1:0, x2:100, y2:100}, defaultImage:{type:"image", x:0, y:0, width:0, height:0, src:""}, defaultText:{type:"text", x:0, y:0, text:"", align:"start", decoration:"none", rotated:false, kerning:true}, defaultTextPath:{type:"textpath", text:"", align:"start", decoration:"none", rotated:false, kerning:true}, defaultStroke:{type:"stroke", color:"black", style:"solid", width:1, cap:"butt", join:4}, defaultLinearGradient:{type:"linear", x1:0, y1:0, x2:100, y2:100, colors:[{offset:0, color:"black"}, {offset:1, color:"white"}]}, defaultRadialGradient:{type:"radial", cx:0, cy:0, r:100, colors:[{offset:0, color:"black"}, {offset:1, color:"white"}]}, defaultPattern:{type:"pattern", x:0, y:0, width:0, height:0, src:""}, defaultFont:{type:"font", style:"normal", variant:"normal", weight:"normal", size:"10pt", family:"serif"}, getDefault:(function () {
		var typeCtorCache = {};
		return function (type) {
			var t = typeCtorCache[type];
			if (t) {
				return new t();
			}
			t = typeCtorCache[type] = new Function;
			t.prototype = dojox.gfx["default" + type];
			return new t();
		};
	})(), normalizeColor:function (color) {
		return (color instanceof dojo.Color) ? color : new dojo.Color(color);
	}, normalizeParameters:function (existed, update) {
		if (update) {
			var empty = {};
			for (var x in existed) {
				if (x in update && !(x in empty)) {
					existed[x] = update[x];
				}
			}
		}
		return existed;
	}, makeParameters:function (defaults, update) {
		if (!update) {
			return dojo.delegate(defaults);
		}
		var result = {};
		for (var i in defaults) {
			if (!(i in result)) {
				result[i] = dojo.clone((i in update) ? update[i] : defaults[i]);
			}
		}
		return result;
	}, formatNumber:function (x, addSpace) {
		var val = x.toString();
		if (val.indexOf("e") >= 0) {
			val = x.toFixed(4);
		} else {
			var point = val.indexOf(".");
			if (point >= 0 && val.length - point > 5) {
				val = x.toFixed(4);
			}
		}
		if (x < 0) {
			return val;
		}
		return addSpace ? " " + val : val;
	}, makeFontString:function (font) {
		return font.style + " " + font.variant + " " + font.weight + " " + font.size + " " + font.family;
	}, splitFontString:function (str) {
		var font = dojox.gfx.getDefault("Font");
		var t = str.split(/\s+/);
		do {
			if (t.length < 5) {
				break;
			}
			font.style = t[0];
			font.variant = t[1];
			font.weight = t[2];
			var i = t[3].indexOf("/");
			font.size = i < 0 ? t[3] : t[3].substring(0, i);
			var j = 4;
			if (i < 0) {
				if (t[4] == "/") {
					j = 6;
				} else {
					if (t[4].charAt(0) == "/") {
						j = 5;
					}
				}
			}
			if (j < t.length) {
				font.family = t.slice(j).join(" ");
			}
		} while (false);
		return font;
	}, cm_in_pt:72 / 2.54, mm_in_pt:7.2 / 2.54, px_in_pt:function () {
		return dojox.gfx._base._getCachedFontMeasurements()["12pt"] / 12;
	}, pt2px:function (len) {
		return len * dojox.gfx.px_in_pt();
	}, px2pt:function (len) {
		return len / dojox.gfx.px_in_pt();
	}, normalizedLength:function (len) {
		if (len.length == 0) {
			return 0;
		}
		if (len.length > 2) {
			var px_in_pt = dojox.gfx.px_in_pt();
			var val = parseFloat(len);
			switch (len.slice(-2)) {
			  case "px":
				return val;
			  case "pt":
				return val * px_in_pt;
			  case "in":
				return val * 72 * px_in_pt;
			  case "pc":
				return val * 12 * px_in_pt;
			  case "mm":
				return val * dojox.gfx.mm_in_pt * px_in_pt;
			  case "cm":
				return val * dojox.gfx.cm_in_pt * px_in_pt;
			}
		}
		return parseFloat(len);
	}, pathVmlRegExp:/([A-Za-z]+)|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g, pathSvgRegExp:/([A-Za-z])|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g, equalSources:function (a, b) {
		return a && b && a == b;
	}, switchTo:function (renderer) {
		var ns = dojox.gfx[renderer];
		if (ns) {
			dojo.forEach(["Group", "Rect", "Ellipse", "Circle", "Line", "Polyline", "Image", "Text", "Path", "TextPath", "Surface", "createSurface"], function (name) {
				dojox.gfx[name] = ns[name];
			});
		}
	}});
}

