/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.axis2d.common"]) {
	dojo._hasResource["dojox.charting.axis2d.common"] = true;
	dojo.provide("dojox.charting.axis2d.common");
	dojo.require("dojox.gfx");
	(function () {
		var g = dojox.gfx;
		var clearNode = function (s) {
			s.marginLeft = "0px";
			s.marginTop = "0px";
			s.marginRight = "0px";
			s.marginBottom = "0px";
			s.paddingLeft = "0px";
			s.paddingTop = "0px";
			s.paddingRight = "0px";
			s.paddingBottom = "0px";
			s.borderLeftWidth = "0px";
			s.borderTopWidth = "0px";
			s.borderRightWidth = "0px";
			s.borderBottomWidth = "0px";
		};
		var getBoxWidth = function (n) {
			if (n["getBoundingClientRect"]) {
				var bcr = n.getBoundingClientRect();
				return bcr.width || (bcr.right - bcr.left);
			} else {
				return dojo.marginBox(n).w;
			}
		};
		dojo.mixin(dojox.charting.axis2d.common, {createText:{gfx:function (chart, creator, x, y, align, text, font, fontColor) {
			return creator.createText({x:x, y:y, text:text, align:align}).setFont(font).setFill(fontColor);
		}, html:function (chart, creator, x, y, align, text, font, fontColor, labelWidth) {
			var p = dojo.doc.createElement("div"), s = p.style, boxWidth;
			clearNode(s);
			s.font = font;
			p.innerHTML = String(text).replace(/\s/g, "&nbsp;");
			s.color = fontColor;
			s.position = "absolute";
			s.left = "-10000px";
			dojo.body().appendChild(p);
			var size = g.normalizedLength(g.splitFontString(font).size);
			if (!labelWidth) {
				boxWidth = getBoxWidth(p);
			}
			dojo.body().removeChild(p);
			s.position = "relative";
			if (labelWidth) {
				s.width = labelWidth + "px";
				switch (align) {
				  case "middle":
					s.textAlign = "center";
					s.left = (x - labelWidth / 2) + "px";
					break;
				  case "end":
					s.textAlign = "right";
					s.left = (x - labelWidth) + "px";
					break;
				  default:
					s.left = x + "px";
					s.textAlign = "left";
					break;
				}
			} else {
				switch (align) {
				  case "middle":
					s.left = Math.floor(x - boxWidth / 2) + "px";
					break;
				  case "end":
					s.left = Math.floor(x - boxWidth) + "px";
					break;
				  default:
					s.left = Math.floor(x) + "px";
					break;
				}
			}
			s.top = Math.floor(y - size) + "px";
			s.whiteSpace = "nowrap";
			var wrap = dojo.doc.createElement("div"), w = wrap.style;
			clearNode(w);
			w.width = "0px";
			w.height = "0px";
			wrap.appendChild(p);
			chart.node.insertBefore(wrap, chart.node.firstChild);
			return wrap;
		}}});
	})();
}

