/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.stencil.Path"]) {
	dojo._hasResource["dojox.drawing.stencil.Path"] = true;
	dojo.provide("dojox.drawing.stencil.Path");
	dojox.drawing.stencil.Path = dojox.drawing.util.oo.declare(dojox.drawing.stencil._Base, function (options) {
		dojo.disconnect(this._postRenderCon);
	}, {type:"dojox.drawing.stencil.Path", closePath:true, baseRender:true, closeRadius:10, closeColor:{r:255, g:255, b:0, a:0.5}, _create:function (shp, sty) {
		this.remove(this[shp]);
		if (!this.points.length) {
			return;
		}
		if (dojox.gfx.renderer == "svg") {
			var strAr = [];
			dojo.forEach(this.points, function (o, i) {
				if (!o.skip) {
					if (i == 0) {
						strAr.push("M " + o.x + " " + o.y);
					} else {
						var cmd = (o.t || "") + " ";
						if (o.x === undefined) {
							strAr.push(cmd);
						} else {
							strAr.push(cmd + o.x + " " + o.y);
						}
					}
				}
			}, this);
			if (this.closePath) {
				strAr.push("Z");
			}
			this.stringPath = strAr.join(" ");
			this[shp] = this.container.createPath(strAr.join(" ")).setStroke(sty);
			this.closePath && this[shp].setFill(sty.fill);
		} else {
			this[shp] = this.container.createPath({}).setStroke(sty);
			this.closePath && this[shp].setFill(sty.fill);
			dojo.forEach(this.points, function (o, i) {
				if (!o.skip) {
					if (i == 0 || o.t == "M") {
						this[shp].moveTo(o.x, o.y);
					} else {
						if (o.t == "Z") {
							this.closePath && this[shp].closePath();
						} else {
							this[shp].lineTo(o.x, o.y);
						}
					}
				}
			}, this);
			this.closePath && this[shp].closePath();
		}
		this._setNodeAtts(this[shp]);
	}, render:function () {
		this.onBeforeRender(this);
		this.renderHit && this._create("hit", this.style.currentHit);
		this._create("shape", this.style.current);
	}, getBounds:function (absolute) {
		var minx = 10000, miny = 10000, maxx = 0, maxy = 0;
		dojo.forEach(this.points, function (p) {
			if (p.x !== undefined && !isNaN(p.x)) {
				minx = Math.min(minx, p.x);
				miny = Math.min(miny, p.y);
				maxx = Math.max(maxx, p.x);
				maxy = Math.max(maxy, p.y);
			}
		});
		return {x1:minx, y1:miny, x2:maxx, y2:maxy, x:minx, y:miny, w:maxx - minx, h:maxy - miny};
	}, checkClosePoint:function (firstPt, currPt, remove) {
		var dist = this.util.distance(firstPt.x, firstPt.y, currPt.x, currPt.y);
		if (this.points.length > 1) {
			if (dist < this.closeRadius && !this.closeGuide && !remove) {
				var c = {cx:firstPt.x, cy:firstPt.y, rx:this.closeRadius, ry:this.closeRadius};
				this.closeGuide = this.container.createEllipse(c).setFill(this.closeColor);
			} else {
				if (remove || dist > this.closeRadius && this.closeGuide) {
					this.remove(this.closeGuide);
					this.closeGuide = null;
				}
			}
		}
		return dist < this.closeRadius;
	}});
	dojox.drawing.register({name:"dojox.drawing.stencil.Path"}, "stencil");
}

