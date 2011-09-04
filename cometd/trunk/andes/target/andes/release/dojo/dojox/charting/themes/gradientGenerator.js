/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.themes.gradientGenerator"]) {
	dojo._hasResource["dojox.charting.themes.gradientGenerator"] = true;
	dojo.provide("dojox.charting.themes.gradientGenerator");
	dojo.require("dojox.charting.Theme");
	(function () {
		var gg = dojox.charting.themes.gradientGenerator;
		gg.generateFills = function (colors, fillPattern, lumFrom, lumTo) {
			var Theme = dojox.charting.Theme;
			return dojo.map(colors, function (c) {
				return Theme.generateHslGradient(c, fillPattern, lumFrom, lumTo);
			});
		};
		gg.updateFills = function (themes, fillPattern, lumFrom, lumTo) {
			var Theme = dojox.charting.Theme;
			dojo.forEach(themes, function (t) {
				if (t.fill && !t.fill.type) {
					t.fill = Theme.generateHslGradient(t.fill, fillPattern, lumFrom, lumTo);
				}
			});
		};
		gg.generateMiniTheme = function (colors, fillPattern, lumFrom, lumTo, lumStroke) {
			var Theme = dojox.charting.Theme;
			return dojo.map(colors, function (c) {
				c = new dojox.color.Color(c);
				return {fill:Theme.generateHslGradient(c, fillPattern, lumFrom, lumTo), stroke:{color:Theme.generateHslColor(c, lumStroke)}};
			});
		};
		gg.generateGradientByIntensity = function (color, intensityMap) {
			color = new dojo.Color(color);
			return dojo.map(intensityMap, function (stop) {
				var s = stop.i / 255;
				return {offset:stop.o, color:new dojo.Color([color.r * s, color.g * s, color.b * s, color.a])};
			});
		};
	})();
}

