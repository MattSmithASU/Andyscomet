/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.gauge._Gauge"]) {
	dojo._hasResource["dojox.widget.gauge._Gauge"] = true;
	dojo.provide("dojox.widget.gauge._Gauge");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Container");
	dojo.require("dijit._Contained");
	dojo.require("dijit.Tooltip");
	dojo.require("dojo.fx.easing");
	dojo.require("dojox.gfx");
	dojo.experimental("dojox.widget.gauge._Gauge");
	dojo.declare("dojox.widget.gauge._Gauge", [dijit._Widget, dijit._Templated, dijit._Container], {width:0, height:0, background:null, min:0, max:0, image:null, useRangeStyles:0, useTooltip:true, majorTicks:null, minorTicks:null, _defaultIndicator:null, defaultColors:[[0, 84, 170, 1], [68, 119, 187, 1], [102, 153, 204, 1], [153, 187, 238, 1], [153, 204, 255, 1], [204, 238, 255, 1], [221, 238, 255, 1]], min:null, max:null, surface:null, hideValues:false, gaugeContent:undefined, templateString:dojo.cache("dojox.widget.gauge", "_Gauge.html", "<div>\n\t<div class=\"dojoxGaugeContent\" dojoAttachPoint=\"gaugeContent\"></div>\n\t<div dojoAttachPoint=\"containerNode\"></div>\n\t<div dojoAttachPoint=\"mouseNode\"></div>\n</div>\n"), _backgroundDefault:{color:"#E0E0E0"}, _rangeData:null, _indicatorData:null, _drag:null, _img:null, _overOverlay:false, _lastHover:"", startup:function () {
		if (this.image === null) {
			this.image = {};
		}
		this.connect(this.gaugeContent, "onmousemove", this.handleMouseMove);
		this.connect(this.gaugeContent, "onmouseover", this.handleMouseOver);
		this.connect(this.gaugeContent, "onmouseout", this.handleMouseOut);
		this.connect(this.gaugeContent, "onmouseup", this.handleMouseUp);
		if (!dojo.isArray(this.ranges)) {
			this.ranges = [];
		}
		if (!dojo.isArray(this.indicators)) {
			this.indicators = [];
		}
		var ranges = [], indicators = [];
		var i;
		if (this.hasChildren()) {
			var children = this.getChildren();
			for (i = 0; i < children.length; i++) {
				if (/dojox\.widget\..*Indicator/.test(children[i].declaredClass)) {
					indicators.push(children[i]);
					continue;
				}
				switch (children[i].declaredClass) {
				  case "dojox.widget.gauge.Range":
					ranges.push(children[i]);
					break;
				}
			}
			this.ranges = this.ranges.concat(ranges);
			this.indicators = this.indicators.concat(indicators);
		}
		if (!this.background) {
			this.background = this._backgroundDefault;
		}
		this.background = this.background.color || this.background;
		if (!this.surface) {
			this.createSurface();
		}
		this.addRanges(this.ranges);
		if (this.minorTicks && this.minorTicks.interval) {
			this.setMinorTicks(this.minorTicks);
		}
		if (this.majorTicks && this.majorTicks.interval) {
			this.setMajorTicks(this.majorTicks);
		}
		for (i = 0; i < this.indicators.length; i++) {
			this.addIndicator(this.indicators[i]);
		}
	}, _setTicks:function (oldTicks, newTicks, label) {
		var i;
		if (oldTicks && dojo.isArray(oldTicks._ticks)) {
			for (i = 0; i < oldTicks._ticks.length; i++) {
				this.removeIndicator(oldTicks._ticks[i]);
			}
		}
		var t = {length:newTicks.length, offset:newTicks.offset, noChange:true};
		if (newTicks.color) {
			t.color = newTicks.color;
		}
		if (newTicks.font) {
			t.font = newTicks.font;
		}
		newTicks._ticks = [];
		for (i = this.min; i <= this.max; i += newTicks.interval) {
			t.value = i;
			if (label) {
				t.label = "" + i;
			}
			newTicks._ticks.push(this.addIndicator(t));
		}
		return newTicks;
	}, setMinorTicks:function (ticks) {
		this.minorTicks = this._setTicks(this.minorTicks, ticks, false);
	}, setMajorTicks:function (ticks) {
		this.majorTicks = this._setTicks(this.majorTicks, ticks, true);
	}, postCreate:function () {
		if (this.hideValues) {
			dojo.style(this.containerNode, "display", "none");
		}
		dojo.style(this.mouseNode, "width", "0");
		dojo.style(this.mouseNode, "height", "0");
		dojo.style(this.mouseNode, "position", "absolute");
		dojo.style(this.mouseNode, "z-index", "100");
		if (this.useTooltip) {
			dijit.showTooltip("test", this.mouseNode, !this.isLeftToRight());
			dijit.hideTooltip(this.mouseNode);
		}
	}, createSurface:function () {
		this.gaugeContent.style.width = this.width + "px";
		this.gaugeContent.style.height = this.height + "px";
		this.surface = dojox.gfx.createSurface(this.gaugeContent, this.width, this.height);
		this._background = this.surface.createRect({x:0, y:0, width:this.width, height:this.height});
		this._background.setFill(this.background);
		if (this.image.url) {
			this._img = this.surface.createImage({width:this.image.width || this.width, height:this.image.height || this.height, src:this.image.url});
			if (this.image.overlay) {
				this._img.getEventSource().setAttribute("overlay", true);
			}
			if (this.image.x || this.image.y) {
				this._img.setTransform({dx:this.image.x || 0, dy:this.image.y || 0});
			}
		}
	}, setBackground:function (background) {
		if (!background) {
			background = this._backgroundDefault;
		}
		this.background = background.color || background;
		this._background.setFill(this.background);
	}, addRange:function (range) {
		this.addRanges([range]);
	}, addRanges:function (ranges) {
		if (!this._rangeData) {
			this._rangeData = [];
		}
		var range;
		for (var i = 0; i < ranges.length; i++) {
			range = ranges[i];
			if ((this.min === null) || (range.low < this.min)) {
				this.min = range.low;
			}
			if ((this.max === null) || (range.high > this.max)) {
				this.max = range.high;
			}
			if (!range.color) {
				var colorIndex = this._rangeData.length % this.defaultColors.length;
				if (dojox.gfx.svg && this.useRangeStyles > 0) {
					colorIndex = (this._rangeData.length % this.useRangeStyles) + 1;
					range.color = {style:"dojoxGaugeRange" + colorIndex};
				} else {
					colorIndex = this._rangeData.length % this.defaultColors.length;
					range.color = this.defaultColors[colorIndex];
				}
			}
			this._rangeData[this._rangeData.length] = range;
		}
		this.draw();
	}, addIndicator:function (indicator) {
		indicator._gauge = this;
		if (!indicator.declaredClass) {
			indicator = new this._defaultIndicator(indicator);
		}
		if (!indicator.hideValue) {
			this.containerNode.appendChild(indicator.domNode);
		}
		if (!this._indicatorData) {
			this._indicatorData = [];
		}
		this._indicatorData[this._indicatorData.length] = indicator;
		indicator.draw();
		return indicator;
	}, removeIndicator:function (indicator) {
		for (var i = 0; i < this._indicatorData.length; i++) {
			if (this._indicatorData[i] === indicator) {
				this._indicatorData.splice(i, 1);
				indicator.remove();
				break;
			}
		}
	}, moveIndicatorToFront:function (indicator) {
		if (indicator.shapes) {
			for (var i = 0; i < indicator.shapes.length; i++) {
				indicator.shapes[i].moveToFront();
			}
		}
	}, drawText:function (txt, x, y, align, vAlign, color, font) {
		var t = this.surface.createText({x:x, y:y, text:txt, align:align});
		t.setFill(color);
		t.setFont(font);
		return t;
	}, removeText:function (t) {
		this.surface.rawNode.removeChild(t);
	}, updateTooltip:function (txt, e) {
		if (this._lastHover != txt) {
			if (txt !== "") {
				dijit.hideTooltip(this.mouseNode);
				dijit.showTooltip(txt, this.mouseNode, !this.isLeftToRight());
			} else {
				dijit.hideTooltip(this.mouseNode);
			}
			this._lastHover = txt;
		}
	}, handleMouseOver:function (event) {
		var hover = event.target.getAttribute("hover");
		if (event.target.getAttribute("overlay")) {
			this._overOverlay = true;
			var r = this.getRangeUnderMouse(event);
			if (r && r.hover) {
				hover = r.hover;
			}
		}
		if (this.useTooltip && !this._drag) {
			if (hover) {
				this.updateTooltip(hover, event);
			} else {
				this.updateTooltip("", event);
			}
		}
	}, handleMouseOut:function (event) {
		if (event.target.getAttribute("overlay")) {
			this._overOverlay = false;
		}
		if (this.useTooltip && this.mouseNode) {
			dijit.hideTooltip(this.mouseNode);
		}
	}, handleMouseDown:function (event) {
		for (var i = 0; i < this._indicatorData.length; i++) {
			var shapes = this._indicatorData[i].shapes;
			for (var s = 0; s < shapes.length; s++) {
				if (shapes[s].getEventSource() == event.target) {
					this._drag = this._indicatorData[i];
					s = shapes.length;
					i = this._indicatorData.length;
				}
			}
		}
		dojo.stopEvent(event);
	}, handleMouseUp:function (event) {
		this._drag = null;
		dojo.stopEvent(event);
	}, handleMouseMove:function (event) {
		if (event) {
			dojo.style(this.mouseNode, "left", event.pageX + 1 + "px");
			dojo.style(this.mouseNode, "top", event.pageY + 1 + "px");
		}
		if (this._drag) {
			this._dragIndicator(this, event);
		} else {
			if (this.useTooltip && this._overOverlay) {
				var r = this.getRangeUnderMouse(event);
				if (r && r.hover) {
					this.updateTooltip(r.hover, event);
				} else {
					this.updateTooltip("", event);
				}
			}
		}
	}});
	dojo.declare("dojox.widget.gauge.Range", [dijit._Widget, dijit._Contained], {low:0, high:0, hover:"", color:null, size:0, startup:function () {
		this.color = this.color.color || this.color;
	}});
	dojo.declare("dojox.widget.gauge._Indicator", [dijit._Widget, dijit._Contained, dijit._Templated], {value:0, type:"", color:"black", label:"", font:{family:"sans-serif", size:"12px"}, length:0, width:0, offset:0, hover:"", front:false, easing:dojo._defaultEasing, duration:1000, hideValue:false, noChange:false, _gauge:null, title:"", templateString:dojo.cache("dojox.widget.gauge", "_Indicator.html", "<div class=\"dojoxGaugeIndicatorDiv\">\n\t<label class=\"dojoxGaugeIndicatorLabel\" for=\"${title}\">${title}:</label>\n\t<input class=\"dojoxGaugeIndicatorInput\" name=\"${title}\" size=\"5\" value=\"${value}\" dojoAttachPoint=\"valueNode\" dojoAttachEvent=\"onchange:_update\"></input>\n</div>\n"), startup:function () {
		if (this.onDragMove) {
			this.onDragMove = dojo.hitch(this.onDragMove);
		}
	}, postCreate:function () {
		if (this.title === "") {
			dojo.style(this.domNode, "display", "none");
		}
		if (dojo.isString(this.easing)) {
			this.easing = dojo.getObject(this.easing);
		}
	}, _update:function (event) {
		var value = this.valueNode.value;
		if (value === "") {
			this.value = null;
		} else {
			this.value = Number(value);
			this.hover = this.title + ": " + value;
		}
		if (this._gauge) {
			this.draw();
			this.valueNode.value = this.value;
			if ((this.title == "Target" || this.front) && this._gauge.moveIndicator) {
				this._gauge.moveIndicatorToFront(this);
			}
		}
	}, update:function (value) {
		if (!this.noChange) {
			this.valueNode.value = value;
			this._update();
		}
	}, onDragMove:function () {
		this.value = Math.floor(this.value);
		this.valueNode.value = this.value;
		this.hover = this.title + ": " + this.value;
	}, draw:function (dontAnimate) {
	}, remove:function () {
		for (var i = 0; i < this.shapes.length; i++) {
			this._gauge.surface.remove(this.shapes[i]);
		}
		if (this.text) {
			this._gauge.surface.remove(this.text);
		}
	}});
}

