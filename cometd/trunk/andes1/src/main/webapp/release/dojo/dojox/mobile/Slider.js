/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.Slider"]) {
	dojo._hasResource["dojox.mobile.Slider"] = true;
	dojo.provide("dojox.mobile.Slider");
	dojo.require("dijit._WidgetBase");
	dojo.require("dijit.form._FormWidgetMixin");
	dojo.experimental("dojox.mobile.Slider");
	dojo.declare("dojox.mobile.Slider", [dijit._WidgetBase, dijit.form._FormValueMixin], {value:0, min:0, max:100, step:1, baseClass:"mblSlider", flip:false, orientation:"auto", halo:"8pt", buildRendering:function () {
		this.focusNode = this.domNode = dojo.create("div", {});
		this.valueNode = dojo.create("input", (this.srcNodeRef && this.srcNodeRef.name) ? {type:"hidden", name:this.srcNodeRef.name} : {}, this.domNode, "last");
		var relativeParent = dojo.create("div", {style:{position:"relative", height:"100%", width:"100%"}}, this.domNode, "last");
		this.progressBar = dojo.create("div", {style:{position:"absolute"}, "class":"mblSliderProgressBar"}, relativeParent, "last");
		this.touchBox = dojo.create("div", {style:{position:"absolute"}, "class":"mblSliderTouchBox"}, relativeParent, "last");
		this.handle = dojo.create("div", {style:{position:"absolute"}, "class":"mblSliderHandle"}, relativeParent, "last");
		this.inherited(arguments);
	}, _setValueAttr:function (value, priorityChange) {
		var fromPercent = (this.value - this.min) * 100 / (this.max - this.min);
		this.valueNode.value = value;
		this.inherited(arguments);
		if (!this._started) {
			return;
		}
		this.focusNode.setAttribute("aria-valuenow", value);
		var toPercent = (value - this.min) * 100 / (this.max - this.min);
		var horizontal = this.orientation != "V";
		if (priorityChange === true) {
			dojo.addClass(this.handle, "mblSliderTransition");
			dojo.addClass(this.progressBar, "mblSliderTransition");
		} else {
			dojo.removeClass(this.handle, "mblSliderTransition");
			dojo.removeClass(this.progressBar, "mblSliderTransition");
		}
		dojo.style(this.handle, this._attrs.handleLeft, (this._reversed ? (100 - toPercent) : toPercent) + "%");
		dojo.style(this.progressBar, this._attrs.width, toPercent + "%");
	}, postCreate:function () {
		this.inherited(arguments);
		function beginDrag(e) {
			function getEventData(e) {
				point = isMouse ? e[this._attrs.pageX] : (e.touches ? e.touches[0][this._attrs.pageX] : e[this._attrs.clientX]);
				pixelValue = point - startPixel;
				pixelValue = Math.min(Math.max(pixelValue, 0), maxPixels);
				var discreteValues = this.step ? ((this.max - this.min) / this.step) : maxPixels;
				if (discreteValues <= 1 || discreteValues == Infinity) {
					discreteValues = maxPixels;
				}
				var wholeIncrements = Math.round(pixelValue * discreteValues / maxPixels);
				value = (this.max - this.min) * wholeIncrements / discreteValues;
				value = this._reversed ? (this.max - value) : (this.min + value);
			}
			function continueDrag(e) {
				e.preventDefault();
				dojo.hitch(this, getEventData)(e);
				this.set("value", value, false);
			}
			function endDrag(e) {
				e.preventDefault();
				dojo.forEach(actionHandles, dojo.hitch(this, "disconnect"));
				actionHandles = [];
				this.set("value", this.value, true);
			}
			e.preventDefault();
			var isMouse = e.type == "mousedown";
			var box = dojo.position(node, false);
			var bodyZoom = dojo.style(dojo.body(), "zoom") || 1;
			var nodeZoom = dojo.style(node, "zoom") || 1;
			var startPixel = box[this._attrs.x] * nodeZoom * bodyZoom + dojo._docScroll()[this._attrs.x];
			var maxPixels = box[this._attrs.w] * nodeZoom * bodyZoom;
			dojo.hitch(this, getEventData)(e);
			if (e.target == this.touchBox) {
				this.set("value", value, true);
			}
			dojo.forEach(actionHandles, dojo.disconnect);
			var root = dojo.doc.documentElement;
			var actionHandles = [this.connect(root, isMouse ? "onmousemove" : "ontouchmove", continueDrag), this.connect(root, isMouse ? "onmouseup" : "ontouchend", endDrag)];
		}
		var point, pixelValue, value;
		var node = this.domNode;
		if (this.orientation == "auto") {
			this.orientation = node.offsetHeight <= node.offsetWidth ? "H" : "V";
		}
		dojo.addClass(this.domNode, dojo.map(this.baseClass.split(" "), dojo.hitch(this, function (c) {
			return c + this.orientation;
		})));
		var horizontal = this.orientation != "V";
		var ltr = horizontal ? this.isLeftToRight() : false;
		var flip = this.flip;
		this._reversed = !(horizontal && ((ltr && !flip) || (!ltr && flip))) || (!horizontal && !flip);
		this._attrs = horizontal ? {x:"x", w:"w", l:"l", r:"r", pageX:"pageX", clientX:"clientX", handleLeft:"left", left:this._reversed ? "right" : "left", width:"width"} : {x:"y", w:"h", l:"t", r:"b", pageX:"pageY", clientX:"clientY", handleLeft:"top", left:this._reversed ? "bottom" : "top", width:"height"};
		this.progressBar.style[this._attrs.left] = "0px";
		this.connect(this.touchBox, "touchstart", beginDrag);
		this.connect(this.touchBox, "onmousedown", beginDrag);
		this.connect(this.handle, "touchstart", beginDrag);
		this.connect(this.handle, "onmousedown", beginDrag);
		this.startup();
		this.set("value", this.value);
	}});
}

