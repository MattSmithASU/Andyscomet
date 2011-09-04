/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.action2d.Tooltip"]) {
	dojo._hasResource["dojox.charting.action2d.Tooltip"] = true;
	dojo.provide("dojox.charting.action2d.Tooltip");
	dojo.require("dijit.Tooltip");
	dojo.require("dojox.charting.action2d.Base");
	dojo.require("dojox.gfx.matrix");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.scan");
	dojo.require("dojox.lang.functional.fold");
	(function () {
		var DEFAULT_TEXT = function (o) {
			var t = o.run && o.run.data && o.run.data[o.index];
			if (t && typeof t != "number" && (t.tooltip || t.text)) {
				return t.tooltip || t.text;
			}
			if (o.element == "candlestick") {
				return "<table cellpadding=\"1\" cellspacing=\"0\" border=\"0\" style=\"font-size:0.9em;\">" + "<tr><td>Open:</td><td align=\"right\"><strong>" + o.data.open + "</strong></td></tr>" + "<tr><td>High:</td><td align=\"right\"><strong>" + o.data.high + "</strong></td></tr>" + "<tr><td>Low:</td><td align=\"right\"><strong>" + o.data.low + "</strong></td></tr>" + "<tr><td>Close:</td><td align=\"right\"><strong>" + o.data.close + "</strong></td></tr>" + (o.data.mid !== undefined ? "<tr><td>Mid:</td><td align=\"right\"><strong>" + o.data.mid + "</strong></td></tr>" : "") + "</table>";
			}
			return o.element == "bar" ? o.x : o.y;
		};
		var df = dojox.lang.functional, m = dojox.gfx.matrix, pi4 = Math.PI / 4, pi2 = Math.PI / 2;
		dojo.declare("dojox.charting.action2d.Tooltip", dojox.charting.action2d.Base, {defaultParams:{text:DEFAULT_TEXT}, optionalParams:{}, constructor:function (chart, plot, kwArgs) {
			this.text = kwArgs && kwArgs.text ? kwArgs.text : DEFAULT_TEXT;
			this.connect();
		}, process:function (o) {
			if (o.type === "onplotreset" || o.type === "onmouseout") {
				dijit.hideTooltip(this.aroundRect);
				this.aroundRect = null;
				if (o.type === "onplotreset") {
					delete this.angles;
				}
				return;
			}
			if (!o.shape || o.type !== "onmouseover") {
				return;
			}
			var aroundRect = {type:"rect"}, position = ["after", "before"];
			switch (o.element) {
			  case "marker":
				aroundRect.x = o.cx;
				aroundRect.y = o.cy;
				aroundRect.width = aroundRect.height = 1;
				break;
			  case "circle":
				aroundRect.x = o.cx - o.cr;
				aroundRect.y = o.cy - o.cr;
				aroundRect.width = aroundRect.height = 2 * o.cr;
				break;
			  case "column":
				position = ["above", "below"];
			  case "bar":
				aroundRect = dojo.clone(o.shape.getShape());
				break;
			  case "candlestick":
				aroundRect.x = o.x;
				aroundRect.y = o.y;
				aroundRect.width = o.width;
				aroundRect.height = o.height;
				break;
			  default:
				if (!this.angles) {
					if (typeof o.run.data[0] == "number") {
						this.angles = df.map(df.scanl(o.run.data, "+", 0), "* 2 * Math.PI / this", df.foldl(o.run.data, "+", 0));
					} else {
						this.angles = df.map(df.scanl(o.run.data, "a + b.y", 0), "* 2 * Math.PI / this", df.foldl(o.run.data, "a + b.y", 0));
					}
				}
				var startAngle = m._degToRad(o.plot.opt.startAngle), angle = (this.angles[o.index] + this.angles[o.index + 1]) / 2 + startAngle;
				aroundRect.x = o.cx + o.cr * Math.cos(angle);
				aroundRect.y = o.cy + o.cr * Math.sin(angle);
				aroundRect.width = aroundRect.height = 1;
				if (angle < pi4) {
				} else {
					if (angle < pi2 + pi4) {
						position = ["below", "above"];
					} else {
						if (angle < Math.PI + pi4) {
							position = ["before", "after"];
						} else {
							if (angle < 2 * Math.PI - pi4) {
								position = ["above", "below"];
							}
						}
					}
				}
				break;
			}
			var lt = dojo.coords(this.chart.node, true);
			aroundRect.x += lt.x;
			aroundRect.y += lt.y;
			aroundRect.x = Math.round(aroundRect.x);
			aroundRect.y = Math.round(aroundRect.y);
			aroundRect.width = Math.ceil(aroundRect.width);
			aroundRect.height = Math.ceil(aroundRect.height);
			this.aroundRect = aroundRect;
			var tooltip = this.text(o);
			if (tooltip) {
				dijit.showTooltip(tooltip, this.aroundRect, position);
			}
		}});
	})();
}

