/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.common"]) {
	dojo._hasResource["dojox.charting.plot2d.common"] = true;
	dojo.provide("dojox.charting.plot2d.common");
	dojo.require("dojo.colors");
	dojo.require("dojox.gfx");
	dojo.require("dojox.lang.functional");
	(function () {
		var df = dojox.lang.functional, dc = dojox.charting.plot2d.common;
		dojo.mixin(dojox.charting.plot2d.common, {makeStroke:function (stroke) {
			if (!stroke) {
				return stroke;
			}
			if (typeof stroke == "string" || stroke instanceof dojo.Color) {
				stroke = {color:stroke};
			}
			return dojox.gfx.makeParameters(dojox.gfx.defaultStroke, stroke);
		}, augmentColor:function (target, color) {
			var t = new dojo.Color(target), c = new dojo.Color(color);
			c.a = t.a;
			return c;
		}, augmentStroke:function (stroke, color) {
			var s = dc.makeStroke(stroke);
			if (s) {
				s.color = dc.augmentColor(s.color, color);
			}
			return s;
		}, augmentFill:function (fill, color) {
			var fc, c = new dojo.Color(color);
			if (typeof fill == "string" || fill instanceof dojo.Color) {
				return dc.augmentColor(fill, color);
			}
			return fill;
		}, defaultStats:{vmin:Number.POSITIVE_INFINITY, vmax:Number.NEGATIVE_INFINITY, hmin:Number.POSITIVE_INFINITY, hmax:Number.NEGATIVE_INFINITY}, collectSimpleStats:function (series) {
			var stats = dojo.delegate(dc.defaultStats);
			for (var i = 0; i < series.length; ++i) {
				var run = series[i];
				for (var j = 0; j < run.data.length; j++) {
					if (run.data[j] !== null) {
						if (typeof run.data[j] == "number") {
							var old_vmin = stats.vmin, old_vmax = stats.vmax;
							if (!("ymin" in run) || !("ymax" in run)) {
								dojo.forEach(run.data, function (val, i) {
									if (val !== null) {
										var x = i + 1, y = val;
										if (isNaN(y)) {
											y = 0;
										}
										stats.hmin = Math.min(stats.hmin, x);
										stats.hmax = Math.max(stats.hmax, x);
										stats.vmin = Math.min(stats.vmin, y);
										stats.vmax = Math.max(stats.vmax, y);
									}
								});
							}
							if ("ymin" in run) {
								stats.vmin = Math.min(old_vmin, run.ymin);
							}
							if ("ymax" in run) {
								stats.vmax = Math.max(old_vmax, run.ymax);
							}
						} else {
							var old_hmin = stats.hmin, old_hmax = stats.hmax, old_vmin = stats.vmin, old_vmax = stats.vmax;
							if (!("xmin" in run) || !("xmax" in run) || !("ymin" in run) || !("ymax" in run)) {
								dojo.forEach(run.data, function (val, i) {
									if (val !== null) {
										var x = "x" in val ? val.x : i + 1, y = val.y;
										if (isNaN(x)) {
											x = 0;
										}
										if (isNaN(y)) {
											y = 0;
										}
										stats.hmin = Math.min(stats.hmin, x);
										stats.hmax = Math.max(stats.hmax, x);
										stats.vmin = Math.min(stats.vmin, y);
										stats.vmax = Math.max(stats.vmax, y);
									}
								});
							}
							if ("xmin" in run) {
								stats.hmin = Math.min(old_hmin, run.xmin);
							}
							if ("xmax" in run) {
								stats.hmax = Math.max(old_hmax, run.xmax);
							}
							if ("ymin" in run) {
								stats.vmin = Math.min(old_vmin, run.ymin);
							}
							if ("ymax" in run) {
								stats.vmax = Math.max(old_vmax, run.ymax);
							}
						}
						break;
					}
				}
			}
			return stats;
		}, calculateBarSize:function (availableSize, opt, clusterSize) {
			if (!clusterSize) {
				clusterSize = 1;
			}
			var gap = opt.gap, size = (availableSize - 2 * gap) / clusterSize;
			if ("minBarSize" in opt) {
				size = Math.max(size, opt.minBarSize);
			}
			if ("maxBarSize" in opt) {
				size = Math.min(size, opt.maxBarSize);
			}
			size = Math.max(size, 1);
			gap = (availableSize - size * clusterSize) / 2;
			return {size:size, gap:gap};
		}, collectStackedStats:function (series) {
			var stats = dojo.clone(dc.defaultStats);
			if (series.length) {
				stats.hmin = Math.min(stats.hmin, 1);
				stats.hmax = df.foldl(series, "seed, run -> Math.max(seed, run.data.length)", stats.hmax);
				for (var i = 0; i < stats.hmax; ++i) {
					var v = series[0].data[i];
					v = v && (typeof v == "number" ? v : v.y);
					if (isNaN(v)) {
						v = 0;
					}
					stats.vmin = Math.min(stats.vmin, v);
					for (var j = 1; j < series.length; ++j) {
						var t = series[j].data[i];
						t = t && (typeof t == "number" ? t : t.y);
						if (isNaN(t)) {
							t = 0;
						}
						v += t;
					}
					stats.vmax = Math.max(stats.vmax, v);
				}
			}
			return stats;
		}, curve:function (a, tension) {
			var arr = a.slice(0);
			if (tension == "x") {
				arr[arr.length] = arr[0];
			}
			var p = dojo.map(arr, function (item, i) {
				if (i == 0) {
					return "M" + item.x + "," + item.y;
				}
				if (!isNaN(tension)) {
					var dx = item.x - arr[i - 1].x, dy = arr[i - 1].y;
					return "C" + (item.x - (tension - 1) * (dx / tension)) + "," + dy + " " + (item.x - (dx / tension)) + "," + item.y + " " + item.x + "," + item.y;
				} else {
					if (tension == "X" || tension == "x" || tension == "S") {
						var p0, p1 = arr[i - 1], p2 = arr[i], p3;
						var bz1x, bz1y, bz2x, bz2y;
						var f = 1 / 6;
						if (i == 1) {
							if (tension == "x") {
								p0 = arr[arr.length - 2];
							} else {
								p0 = p1;
							}
							f = 1 / 3;
						} else {
							p0 = arr[i - 2];
						}
						if (i == (arr.length - 1)) {
							if (tension == "x") {
								p3 = arr[1];
							} else {
								p3 = p2;
							}
							f = 1 / 3;
						} else {
							p3 = arr[i + 1];
						}
						var p1p2 = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
						var p0p2 = Math.sqrt((p2.x - p0.x) * (p2.x - p0.x) + (p2.y - p0.y) * (p2.y - p0.y));
						var p1p3 = Math.sqrt((p3.x - p1.x) * (p3.x - p1.x) + (p3.y - p1.y) * (p3.y - p1.y));
						var p0p2f = p0p2 * f;
						var p1p3f = p1p3 * f;
						if (p0p2f > p1p2 / 2 && p1p3f > p1p2 / 2) {
							p0p2f = p1p2 / 2;
							p1p3f = p1p2 / 2;
						} else {
							if (p0p2f > p1p2 / 2) {
								p0p2f = p1p2 / 2;
								p1p3f = p1p2 / 2 * p1p3 / p0p2;
							} else {
								if (p1p3f > p1p2 / 2) {
									p1p3f = p1p2 / 2;
									p0p2f = p1p2 / 2 * p0p2 / p1p3;
								}
							}
						}
						if (tension == "S") {
							if (p0 == p1) {
								p0p2f = 0;
							}
							if (p2 == p3) {
								p1p3f = 0;
							}
						}
						bz1x = p1.x + p0p2f * (p2.x - p0.x) / p0p2;
						bz1y = p1.y + p0p2f * (p2.y - p0.y) / p0p2;
						bz2x = p2.x - p1p3f * (p3.x - p1.x) / p1p3;
						bz2y = p2.y - p1p3f * (p3.y - p1.y) / p1p3;
					}
				}
				return "C" + (bz1x + "," + bz1y + " " + bz2x + "," + bz2y + " " + p2.x + "," + p2.y);
			});
			return p.join(" ");
		}, getLabel:function (number, fixed, precision) {
			if (dojo.number) {
				return (fixed ? dojo.number.format(number, {places:precision}) : dojo.number.format(number)) || "";
			}
			return fixed ? number.toFixed(precision) : number.toString();
		}});
	})();
}

