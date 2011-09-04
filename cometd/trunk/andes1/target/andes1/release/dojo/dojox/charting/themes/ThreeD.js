/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.themes.ThreeD"]) {
	dojo._hasResource["dojox.charting.themes.ThreeD"] = true;
	dojo.provide("dojox.charting.themes.ThreeD");
	dojo.require("dojo.colors");
	dojo.require("dojox.charting.Theme");
	dojo.require("dojox.charting.themes.gradientGenerator");
	dojo.require("dojox.charting.themes.PrimaryColors");
	(function () {
		var dc = dojox.charting, themes = dc.themes, Theme = dc.Theme, gi = themes.gradientGenerator.generateGradientByIntensity, colors = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"], defaultFill = {type:"linear", space:"shape", x1:0, y1:0, x2:100, y2:0}, cyl3dMap = [{o:0, i:174}, {o:0.08, i:231}, {o:0.18, i:237}, {o:0.3, i:231}, {o:0.39, i:221}, {o:0.49, i:206}, {o:0.58, i:187}, {o:0.68, i:165}, {o:0.8, i:128}, {o:0.9, i:102}, {o:1, i:174}], hiliteIndex = 2, hiliteIntensity = 100, lumStroke = 50, cyl3dFills = dojo.map(colors, function (c) {
			var fill = dojo.delegate(defaultFill), colors = fill.colors = themes.gradientGenerator.generateGradientByIntensity(c, cyl3dMap), hilite = colors[hiliteIndex].color;
			hilite.r += hiliteIntensity;
			hilite.g += hiliteIntensity;
			hilite.b += hiliteIntensity;
			hilite.sanitize();
			return fill;
		});
		themes.ThreeD = themes.PrimaryColors.clone();
		themes.ThreeD.series.shadow = {dx:1, dy:1, width:3, color:[0, 0, 0, 0.15]};
		themes.ThreeD.next = function (elementType, mixin, doPost) {
			if (elementType == "bar" || elementType == "column") {
				var index = this._current % this.seriesThemes.length, s = this.seriesThemes[index], old = s.fill;
				s.fill = cyl3dFills[index];
				var theme = Theme.prototype.next.apply(this, arguments);
				s.fill = old;
				return theme;
			}
			return Theme.prototype.next.apply(this, arguments);
		};
	})();
}

