/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.AnalogGauge"]) {
	dojo._hasResource["dojox.widget.AnalogGauge"] = true;
	dojo.provide("dojox.widget.AnalogGauge");
	dojo.require("dojox.gfx");
	dojo.require("dojox.widget.gauge._Gauge");
	dojo.experimental("dojox.widget.AnalogGauge");
	dojo.declare("dojox.widget.gauge.AnalogLineIndicator", [dojox.widget.gauge._Indicator], {_getShapes:function () {
		return [this._gauge.surface.createLine({x1:0, y1:-this.offset, x2:0, y2:-this.length - this.offset}).setStroke({color:this.color, width:this.width})];
	}, draw:function (dontAnimate) {
		if (this.shapes) {
			this._move(dontAnimate);
		} else {
			if (this.text) {
				this._gauge.surface.rawNode.removeChild(this.text);
				this.text = null;
			}
			var a = this._gauge._getAngle(Math.min(Math.max(this.value, this._gauge.min), this._gauge.max));
			this.color = this.color || "#000000";
			this.length = this.length || this._gauge.radius;
			this.width = this.width || 1;
			this.offset = this.offset || 0;
			this.highlight = this.highlight || "#D0D0D0";
			this.shapes = this._getShapes(this._gauge, this);
			if (this.shapes) {
				for (var s = 0; s < this.shapes.length; s++) {
					this.shapes[s].setTransform([{dx:this._gauge.cx, dy:this._gauge.cy}, dojox.gfx.matrix.rotateg(a)]);
					if (this.hover) {
						this.shapes[s].getEventSource().setAttribute("hover", this.hover);
					}
					if (this.onDragMove && !this.noChange) {
						this._gauge.connect(this.shapes[s].getEventSource(), "onmousedown", this._gauge.handleMouseDown);
						this.shapes[s].getEventSource().style.cursor = "pointer";
					}
				}
			}
			if (this.label) {
				var len = this.length + this.offset, rad = this._gauge._getRadians(a), x = this._gauge.cx + (len + 5) * Math.sin(rad), y = this._gauge.cy - (len + 5) * Math.cos(rad), align = "start", aa = Math.abs(a);
				if (a <= -10) {
					align = "end";
				}
				if (aa < 10) {
					align = "middle";
				}
				var vAlign = "bottom";
				if (aa > 90) {
					vAlign = "top";
				}
				this.text = this._gauge.drawText("" + this.label, x, y, align, vAlign, this.color, this.font);
			}
			this.currentValue = this.value;
		}
	}, _move:function (dontAnimate) {
		var v = Math.min(Math.max(this.value, this._gauge.min), this._gauge.max), c = this.currentValue;
		if (dontAnimate) {
			var angle = this._gauge._getAngle(v);
			for (var i in this.shapes) {
				this.shapes[i].setTransform([{dx:this._gauge.cx, dy:this._gauge.cy}, dojox.gfx.matrix.rotateg(angle)]);
				if (this.hover) {
					this.shapes[i].getEventSource().setAttribute("hover", this.hover);
				}
			}
		} else {
			if (c != v) {
				var anim = new dojo.Animation({curve:[c, v], duration:this.duration, easing:this.easing});
				dojo.connect(anim, "onAnimate", dojo.hitch(this, function (step) {
					for (var i in this.shapes) {
						this.shapes[i].setTransform([{dx:this._gauge.cx, dy:this._gauge.cy}, dojox.gfx.matrix.rotateg(this._gauge._getAngle(step))]);
						if (this.hover) {
							this.shapes[i].getEventSource().setAttribute("hover", this.hover);
						}
					}
					this.currentValue = step;
				}));
				anim.play();
			}
		}
	}});
	dojo.declare("dojox.widget.AnalogGauge", dojox.widget.gauge._Gauge, {startAngle:-90, endAngle:90, cx:0, cy:0, radius:0, _defaultIndicator:dojox.widget.gauge.AnalogLineIndicator, startup:function () {
		if (this.getChildren) {
			dojo.forEach(this.getChildren(), function (child) {
				child.startup();
			});
		}
		this.startAngle = Number(this.startAngle);
		this.endAngle = Number(this.endAngle);
		this.cx = Number(this.cx);
		if (!this.cx) {
			this.cx = this.width / 2;
		}
		this.cy = Number(this.cy);
		if (!this.cy) {
			this.cy = this.height / 2;
		}
		this.radius = Number(this.radius);
		if (!this.radius) {
			this.radius = Math.min(this.cx, this.cy) - 25;
		}
		this._oppositeMiddle = (this.startAngle + this.endAngle) / 2 + 180;
		this.inherited(arguments);
	}, _getAngle:function (value) {
		return (value - this.min) / (this.max - this.min) * (this.endAngle - this.startAngle) + this.startAngle;
	}, _getValueForAngle:function (angle) {
		if (angle > this._oppositeMiddle) {
			angle -= 360;
		}
		return (angle - this.startAngle) * (this.max - this.min) / (this.endAngle - this.startAngle) + this.min;
	}, _getRadians:function (angle) {
		return angle * Math.PI / 180;
	}, _getDegrees:function (radians) {
		return radians * 180 / Math.PI;
	}, draw:function () {
		var i;
		if (this._rangeData) {
			for (i = 0; i < this._rangeData.length; i++) {
				this.drawRange(this._rangeData[i]);
			}
			if (this._img && this.image.overlay) {
				this._img.moveToFront();
			}
		}
		if (this._indicatorData) {
			for (i = 0; i < this._indicatorData.length; i++) {
				this._indicatorData[i].draw();
			}
		}
	}, drawRange:function (range) {
		var path;
		if (range.shape) {
			this.surface.remove(range.shape);
			range.shape = null;
		}
		var a1, a2;
		if ((range.low == this.min) && (range.high == this.max) && ((this.endAngle - this.startAngle) == 360)) {
			path = this.surface.createCircle({cx:this.cx, cy:this.cy, r:this.radius});
		} else {
			a1 = this._getRadians(this._getAngle(range.low));
			a2 = this._getRadians(this._getAngle(range.high));
			var x1 = this.cx + this.radius * Math.sin(a1), y1 = this.cy - this.radius * Math.cos(a1), x2 = this.cx + this.radius * Math.sin(a2), y2 = this.cy - this.radius * Math.cos(a2), big = 0;
			if ((a2 - a1) > Math.PI) {
				big = 1;
			}
			path = this.surface.createPath();
			if (range.size) {
				path.moveTo(this.cx + (this.radius - range.size) * Math.sin(a1), this.cy - (this.radius - range.size) * Math.cos(a1));
			} else {
				path.moveTo(this.cx, this.cy);
			}
			path.lineTo(x1, y1);
			path.arcTo(this.radius, this.radius, 0, big, 1, x2, y2);
			if (range.size) {
				path.lineTo(this.cx + (this.radius - range.size) * Math.sin(a2), this.cy - (this.radius - range.size) * Math.cos(a2));
				path.arcTo((this.radius - range.size), (this.radius - range.size), 0, big, 0, this.cx + (this.radius - range.size) * Math.sin(a1), this.cy - (this.radius - range.size) * Math.cos(a1));
			}
			path.closePath();
		}
		if (dojo.isArray(range.color) || dojo.isString(range.color)) {
			path.setStroke({color:range.color});
			path.setFill(range.color);
		} else {
			if (range.color.type) {
				a1 = this._getRadians(this._getAngle(range.low));
				a2 = this._getRadians(this._getAngle(range.high));
				range.color.x1 = this.cx + (this.radius * Math.sin(a1)) / 2;
				range.color.x2 = this.cx + (this.radius * Math.sin(a2)) / 2;
				range.color.y1 = this.cy - (this.radius * Math.cos(a1)) / 2;
				range.color.y2 = this.cy - (this.radius * Math.cos(a2)) / 2;
				path.setFill(range.color);
				path.setStroke({color:range.color.colors[0].color});
			} else {
				path.setStroke({color:"green"});
				path.setFill("green");
				path.getEventSource().setAttribute("class", range.color.style);
			}
		}
		if (range.hover) {
			path.getEventSource().setAttribute("hover", range.hover);
		}
		range.shape = path;
	}, getRangeUnderMouse:function (event) {
		var range = null, pos = dojo.coords(this.gaugeContent), x = event.clientX - pos.x, y = event.clientY - pos.y, r = Math.sqrt((y - this.cy) * (y - this.cy) + (x - this.cx) * (x - this.cx));
		if (r < this.radius) {
			var angle = this._getDegrees(Math.atan2(y - this.cy, x - this.cx) + Math.PI / 2), value = this._getValueForAngle(angle);
			if (this._rangeData) {
				for (var i = 0; (i < this._rangeData.length) && !range; i++) {
					if ((Number(this._rangeData[i].low) <= value) && (Number(this._rangeData[i].high) >= value)) {
						range = this._rangeData[i];
					}
				}
			}
		}
		return range;
	}, _dragIndicator:function (widget, event) {
		var pos = dojo.coords(widget.gaugeContent), x = event.clientX - pos.x, y = event.clientY - pos.y, angle = widget._getDegrees(Math.atan2(y - widget.cy, x - widget.cx) + Math.PI / 2), value = widget._getValueForAngle(angle);
		value = Math.min(Math.max(value, widget.min), widget.max);
		widget._drag.value = widget._drag.currentValue = value;
		widget._drag.onDragMove(widget._drag);
		widget._drag.draw(true);
		dojo.stopEvent(event);
	}});
}

