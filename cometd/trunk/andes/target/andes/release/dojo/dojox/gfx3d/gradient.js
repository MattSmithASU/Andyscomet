/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx3d.gradient"]) {
	dojo._hasResource["dojox.gfx3d.gradient"] = true;
	dojo.provide("dojox.gfx3d.gradient");
	dojo.require("dojox.gfx3d.vector");
	dojo.require("dojox.gfx3d.matrix");
	(function () {
		var dist = function (a, b) {
			return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
		};
		var N = 32;
		dojox.gfx3d.gradient = function (model, material, center, radius, from, to, matrix) {
			var m = dojox.gfx3d.matrix, v = dojox.gfx3d.vector, mx = m.normalize(matrix), f = m.multiplyPoint(mx, radius * Math.cos(from) + center.x, radius * Math.sin(from) + center.y, center.z), t = m.multiplyPoint(mx, radius * Math.cos(to) + center.x, radius * Math.sin(to) + center.y, center.z), c = m.multiplyPoint(mx, center.x, center.y, center.z), step = (to - from) / N, r = dist(f, t) / 2, mod = model[material.type], fin = material.finish, pmt = material.color, colors = [{offset:0, color:mod.call(model, v.substract(f, c), fin, pmt)}];
			for (var a = from + step; a < to; a += step) {
				var p = m.multiplyPoint(mx, radius * Math.cos(a) + center.x, radius * Math.sin(a) + center.y, center.z), df = dist(f, p), dt = dist(t, p);
				colors.push({offset:df / (df + dt), color:mod.call(model, v.substract(p, c), fin, pmt)});
			}
			colors.push({offset:1, color:mod.call(model, v.substract(t, c), fin, pmt)});
			return {type:"linear", x1:0, y1:-r, x2:0, y2:r, colors:colors};
		};
	})();
}

