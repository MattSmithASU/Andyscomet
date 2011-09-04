/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.util.positioning"]) {
	dojo._hasResource["dojox.drawing.util.positioning"] = true;
	dojo.provide("dojox.drawing.util.positioning");
	(function () {
		var textOffset = 4;
		var textYOffset = 20;
		dojox.drawing.util.positioning.label = function (start, end) {
			var x = 0.5 * (start.x + end.x);
			var y = 0.5 * (start.y + end.y);
			var slope = dojox.drawing.util.common.slope(start, end);
			var deltay = textOffset / Math.sqrt(1 + slope * slope);
			if (end.y > start.y && end.x > start.x || end.y < start.y && end.x < start.x) {
				deltay = -deltay;
				y -= textYOffset;
			}
			x += -deltay * slope;
			y += deltay;
			var align = end.x < start.x ? "end" : "start";
			return {x:x, y:y, foo:"bar", align:align};
		};
		dojox.drawing.util.positioning.angle = function (start, end) {
			var x = 0.7 * start.x + 0.3 * end.x;
			var y = 0.7 * start.y + 0.3 * end.y;
			var slope = dojox.drawing.util.common.slope(start, end);
			var deltay = textOffset / Math.sqrt(1 + slope * slope);
			if (end.x < start.x) {
				deltay = -deltay;
			}
			x += -deltay * slope;
			y += deltay;
			var align = end.y > start.y ? "end" : "start";
			y += end.x > start.x ? 0.5 * textYOffset : -0.5 * textYOffset;
			return {x:x, y:y, align:align};
		};
	})();
}

