/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.Default"]) {
	dojo._hasResource["dojox.charting.plot2d.Default"] = true;
	dojo.provide("dojox.charting.plot2d.Default");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.charting.plot2d.Base");
	dojo.require("dojox.lang.utils");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.reversed");
	dojo.require("dojox.gfx.fx");
	(function () {
		var df = dojox.lang.functional, du = dojox.lang.utils, dc = dojox.charting.plot2d.common, purgeGroup = df.lambda("item.purgeGroup()");
		var DEFAULT_ANIMATION_LENGTH = 1200;
		dojo.declare("dojox.charting.plot2d.Default", dojox.charting.plot2d.Base, {defaultParams:{hAxis:"x", vAxis:"y", lines:true, areas:false, markers:false, tension:"", animate:false}, optionalParams:{stroke:{}, outline:{}, shadow:{}, fill:{}, font:"", fontColor:"", markerStroke:{}, markerOutline:{}, markerShadow:{}, markerFill:{}, markerFont:"", markerFontColor:""}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
			this.animate = this.opt.animate;
		}, render:function (dim, offsets) {
			if (this.zoom && !this.isDataDirty()) {
				return this.performZoom(dim, offsets);
			}
			this.resetEvents();
			this.dirty = this.isDirty();
			if (this.dirty) {
				dojo.forEach(this.series, purgeGroup);
				this._eventSeries = {};
				this.cleanGroup();
				this.group.setTransform(null);
				var s = this.group;
				df.forEachRev(this.series, function (item) {
					item.cleanGroup(s);
				});
			}
			var t = this.chart.theme, stroke, outline, marker, events = this.events();
			for (var i = this.series.length - 1; i >= 0; --i) {
				var run = this.series[i];
				if (!this.dirty && !run.dirty) {
					t.skip();
					this._reconnectEvents(run.name);
					continue;
				}
				run.cleanGroup();
				if (!run.data.length) {
					run.dirty = false;
					t.skip();
					continue;
				}
				var theme = t.next(this.opt.areas ? "area" : "line", [this.opt, run], true), s = run.group, rsegments = [], startindexes = [], rseg = null, lpoly, ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler), vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler), eventSeries = this._eventSeries[run.name] = new Array(run.data.length);
				for (var j = 0; j < run.data.length; j++) {
					if (run.data[j] != null) {
						if (!rseg) {
							rseg = [];
							startindexes.push(j);
							rsegments.push(rseg);
						}
						rseg.push(run.data[j]);
					} else {
						rseg = null;
					}
				}
				for (var seg = 0; seg < rsegments.length; seg++) {
					if (typeof rsegments[seg][0] == "number") {
						lpoly = dojo.map(rsegments[seg], function (v, i) {
							return {x:ht(i + startindexes[seg] + 1) + offsets.l, y:dim.height - offsets.b - vt(v)};
						}, this);
					} else {
						lpoly = dojo.map(rsegments[seg], function (v, i) {
							return {x:ht(v.x) + offsets.l, y:dim.height - offsets.b - vt(v.y)};
						}, this);
					}
					var lpath = this.opt.tension ? dc.curve(lpoly, this.opt.tension) : "";
					if (this.opt.areas && lpoly.length > 1) {
						var fill = theme.series.fill;
						var apoly = dojo.clone(lpoly);
						if (this.opt.tension) {
							var apath = "L" + apoly[apoly.length - 1].x + "," + (dim.height - offsets.b) + " L" + apoly[0].x + "," + (dim.height - offsets.b) + " L" + apoly[0].x + "," + apoly[0].y;
							run.dyn.fill = s.createPath(lpath + " " + apath).setFill(fill).getFill();
						} else {
							apoly.push({x:lpoly[lpoly.length - 1].x, y:dim.height - offsets.b});
							apoly.push({x:lpoly[0].x, y:dim.height - offsets.b});
							apoly.push(lpoly[0]);
							run.dyn.fill = s.createPolyline(apoly).setFill(fill).getFill();
						}
					}
					if (this.opt.lines || this.opt.markers) {
						stroke = theme.series.stroke;
						if (theme.series.outline) {
							outline = run.dyn.outline = dc.makeStroke(theme.series.outline);
							outline.width = 2 * outline.width + stroke.width;
						}
					}
					if (this.opt.markers) {
						run.dyn.marker = theme.symbol;
					}
					var frontMarkers = null, outlineMarkers = null, shadowMarkers = null;
					if (stroke && theme.series.shadow && lpoly.length > 1) {
						var shadow = theme.series.shadow, spoly = dojo.map(lpoly, function (c) {
							return {x:c.x + shadow.dx, y:c.y + shadow.dy};
						});
						if (this.opt.lines) {
							if (this.opt.tension) {
								run.dyn.shadow = s.createPath(dc.curve(spoly, this.opt.tension)).setStroke(shadow).getStroke();
							} else {
								run.dyn.shadow = s.createPolyline(spoly).setStroke(shadow).getStroke();
							}
						}
						if (this.opt.markers && theme.marker.shadow) {
							shadow = theme.marker.shadow;
							shadowMarkers = dojo.map(spoly, function (c) {
								return s.createPath("M" + c.x + " " + c.y + " " + theme.symbol).setStroke(shadow).setFill(shadow.color);
							}, this);
						}
					}
					if (this.opt.lines && lpoly.length > 1) {
						if (outline) {
							if (this.opt.tension) {
								run.dyn.outline = s.createPath(lpath).setStroke(outline).getStroke();
							} else {
								run.dyn.outline = s.createPolyline(lpoly).setStroke(outline).getStroke();
							}
						}
						if (this.opt.tension) {
							run.dyn.stroke = s.createPath(lpath).setStroke(stroke).getStroke();
						} else {
							run.dyn.stroke = s.createPolyline(lpoly).setStroke(stroke).getStroke();
						}
					}
					if (this.opt.markers) {
						frontMarkers = new Array(lpoly.length);
						outlineMarkers = new Array(lpoly.length);
						outline = null;
						if (theme.marker.outline) {
							outline = dc.makeStroke(theme.marker.outline);
							outline.width = 2 * outline.width + (theme.marker.stroke ? theme.marker.stroke.width : 0);
						}
						dojo.forEach(lpoly, function (c, i) {
							var path = "M" + c.x + " " + c.y + " " + theme.symbol;
							if (outline) {
								outlineMarkers[i] = s.createPath(path).setStroke(outline);
							}
							frontMarkers[i] = s.createPath(path).setStroke(theme.marker.stroke).setFill(theme.marker.fill);
						}, this);
						run.dyn.markerFill = theme.marker.fill;
						run.dyn.markerStroke = theme.marker.stroke;
						if (events) {
							dojo.forEach(frontMarkers, function (s, i) {
								var o = {element:"marker", index:i + startindexes[seg], run:run, shape:s, outline:outlineMarkers[i] || null, shadow:shadowMarkers && shadowMarkers[i] || null, cx:lpoly[i].x, cy:lpoly[i].y};
								if (typeof rsegments[seg][0] == "number") {
									o.x = i + startindexes[seg] + 1;
									o.y = rsegments[seg][i];
								} else {
									o.x = rsegments[seg][i].x;
									o.y = rsegments[seg][i].y;
								}
								this._connectEvents(o);
								eventSeries[i + startindexes[seg]] = o;
							}, this);
						} else {
							delete this._eventSeries[run.name];
						}
					}
				}
				run.dirty = false;
			}
			if (this.animate) {
				var plotGroup = this.group;
				dojox.gfx.fx.animateTransform(dojo.delegate({shape:plotGroup, duration:DEFAULT_ANIMATION_LENGTH, transform:[{name:"translate", start:[0, dim.height - offsets.b], end:[0, 0]}, {name:"scale", start:[1, 0], end:[1, 1]}, {name:"original"}]}, this.animate)).play();
			}
			this.dirty = false;
			return this;
		}});
	})();
}

