/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.BarGauge"]) {
	dojo._hasResource["dojox.widget.BarGauge"] = true;
	dojo.provide("dojox.widget.BarGauge");
	dojo.require("dojox.gfx");
	dojo.require("dojox.widget.gauge._Gauge");
	dojo.experimental("dojox.widget.BarGauge");
	dojo.declare("dojox.widget.gauge.BarLineIndicator", [dojox.widget.gauge._Indicator], {width:1, _getShapes:function () {
		if (!this._gauge) {
			return null;
		}
		var v = this.value;
		if (v < this._gauge.min) {
			v = this._gauge.min;
		}
		if (v > this._gauge.max) {
			v = this._gauge.max;
		}
		var pos = this._gauge._getPosition(v);
		var shapes = [];
		if (this.width > 1) {
			shapes[0] = this._gauge.surface.createRect({x:pos, y:this._gauge.dataY + this.offset, width:this.width, height:this.length});
			shapes[0].setStroke({color:this.color});
			shapes[0].setFill(this.color);
		} else {
			shapes[0] = this._gauge.surface.createLine({x1:pos, y1:this._gauge.dataY + this.offset, x2:pos, y2:this._gauge.dataY + this.offset + this.length});
			shapes[0].setStroke({color:this.color});
		}
		return shapes;
	}, draw:function (dontAnimate) {
		var i;
		if (this.shapes) {
			this._move(dontAnimate);
		} else {
			if (this.shapes) {
				for (i = 0; i < this.shapes.length; i++) {
					this._gauge.surface.remove(this.shapes[i]);
				}
				this.shapes = null;
			}
			if (this.text) {
				this._gauge.surface.rawNode.removeChild(this.text);
				this.text = null;
			}
			this.color = this.color || "#000000";
			this.length = this.length || this._gauge.dataHeight;
			this.width = this.width || 3;
			this.offset = this.offset || 0;
			this.highlight = this.highlight || "#4D4D4D";
			this.highlight2 = this.highlight2 || "#A3A3A3";
			this.shapes = this._getShapes(this._gauge, this);
			if (this.label) {
				var v = this.value;
				if (v < this._gauge.min) {
					v = this._gauge.min;
				}
				if (v > this._gauge.max) {
					v = this._gauge.max;
				}
				var pos = this._gauge._getPosition(v);
				this.text = this._gauge.drawText("" + this.label, pos, this._gauge.dataY + this.offset - 5, "middle", "top", this.color, this.font);
			}
			for (i = 0; i < this.shapes.length; i++) {
				if (this.hover) {
					this.shapes[i].getEventSource().setAttribute("hover", this.hover);
				}
				if (this.onDragMove && !this.noChange) {
					this._gauge.connect(this.shapes[i].getEventSource(), "onmousedown", this._gauge.handleMouseDown);
					this.shapes[i].getEventSource().style.cursor = "pointer";
				}
			}
			this.currentValue = this.value;
		}
	}, _move:function (dontAnimate) {
		var v = this.value;
		if (v < this.min) {
			v = this.min;
		}
		if (v > this.max) {
			v = this.max;
		}
		var c = this._gauge._getPosition(this.currentValue);
		this.currentValue = v;
		v = this._gauge._getPosition(v) - this._gauge.dataX;
		if (dontAnimate) {
			this.shapes[0].applyTransform(dojox.gfx.matrix.translate(v - (this.shapes[0].matrix ? this.shapes[0].matrix.dx : 0), 0));
		} else {
			var anim = new dojo.Animation({curve:[c, v], duration:this.duration, easing:this.easing});
			dojo.connect(anim, "onAnimate", dojo.hitch(this, function (jump) {
				this.shapes[0].applyTransform(dojox.gfx.matrix.translate(jump - (this.shapes[0].matrix ? this.shapes[0].matrix.dx : 0), 0));
			}));
			anim.play();
		}
	}});
	dojo.declare("dojox.widget.BarGauge", dojox.widget.gauge._Gauge, {dataX:5, dataY:5, dataWidth:0, dataHeight:0, _defaultIndicator:dojox.widget.gauge.BarLineIndicator, startup:function () {
		if (this.getChildren) {
			dojo.forEach(this.getChildren(), function (child) {
				child.startup();
			});
		}
		if (!this.dataWidth) {
			this.dataWidth = this.gaugeWidth - 10;
		}
		if (!this.dataHeight) {
			this.dataHeight = this.gaugeHeight - 10;
		}
		this.inherited(arguments);
	}, _getPosition:function (value) {
		return this.dataX + Math.floor((value - this.min) / (this.max - this.min) * this.dataWidth);
	}, _getValueForPosition:function (pos) {
		return (pos - this.dataX) * (this.max - this.min) / this.dataWidth + this.min;
	}, draw:function () {
		if (!this.surface) {
			this.createSurface();
		}
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
		if (range.shape) {
			this.surface.remove(range.shape);
			range.shape = null;
		}
		var x1 = this._getPosition(range.low);
		var x2 = this._getPosition(range.high);
		var path = this.surface.createRect({x:x1, y:this.dataY, width:x2 - x1, height:this.dataHeight});
		if (dojo.isArray(range.color) || dojo.isString(range.color)) {
			path.setStroke({color:range.color});
			path.setFill(range.color);
		} else {
			if (range.color.type) {
				var y = this.dataY + this.dataHeight / 2;
				range.color.x1 = x1;
				range.color.x2 = x2;
				range.color.y1 = y;
				range.color.y2 = y;
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
		var range = null;
		var pos = dojo.coords(this.gaugeContent);
		var x = event.clientX - pos.x;
		var value = this._getValueForPosition(x);
		if (this._rangeData) {
			for (var i = 0; (i < this._rangeData.length) && !range; i++) {
				if ((Number(this._rangeData[i].low) <= value) && (Number(this._rangeData[i].high) >= value)) {
					range = this._rangeData[i];
				}
			}
		}
		return range;
	}, _dragIndicator:function (widget, event) {
		var pos = dojo.coords(widget.gaugeContent);
		var x = event.clientX - pos.x;
		var value = widget._getValueForPosition(x);
		if (value < widget.min) {
			value = widget.min;
		}
		if (value > widget.max) {
			value = widget.max;
		}
		widget._drag.value = value;
		widget._drag.onDragMove(widget._drag);
		widget._drag.draw(true);
		dojo.stopEvent(event);
	}});
}

