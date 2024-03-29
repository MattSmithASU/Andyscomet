/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.RangeSlider"]) {
	dojo._hasResource["dojox.form.RangeSlider"] = true;
	dojo.provide("dojox.form.RangeSlider");
	dojo.require("dijit.form.HorizontalSlider");
	dojo.require("dijit.form.VerticalSlider");
	dojo.require("dojox.fx");
	(function () {
		var sortReversed = function (a, b) {
			return b - a;
		}, sortForward = function (a, b) {
			return a - b;
		};
		dojo.declare("dojox.form._RangeSliderMixin", null, {value:[0, 100], postMixInProperties:function () {
			this.inherited(arguments);
			this.value = dojo.map(this.value, function (i) {
				return parseInt(i, 10);
			});
		}, postCreate:function () {
			this.inherited(arguments);
			this.value.sort(this._isReversed() ? sortReversed : sortForward);
			var _self = this;
			var mover = dojo.declare(dijit.form._SliderMoverMax, {constructor:function () {
				this.widget = _self;
			}});
			this._movableMax = new dojo.dnd.Moveable(this.sliderHandleMax, {mover:mover});
			dijit.setWaiState(this.focusNodeMax, "valuemin", this.minimum);
			dijit.setWaiState(this.focusNodeMax, "valuemax", this.maximum);
			var barMover = dojo.declare(dijit.form._SliderBarMover, {constructor:function () {
				this.widget = _self;
			}});
			this._movableBar = new dojo.dnd.Moveable(this.progressBar, {mover:barMover});
		}, destroy:function () {
			this.inherited(arguments);
			this._movableMax.destroy();
			this._movableBar.destroy();
		}, _onKeyPress:function (e) {
			if (this.disabled || this.readOnly || e.altKey || e.ctrlKey) {
				return;
			}
			var focusedEl = e.currentTarget, minSelected = false, maxSelected = false, k = dojo.keys;
			if (focusedEl == this.sliderHandle) {
				minSelected = true;
			} else {
				if (focusedEl == this.progressBar) {
					maxSelected = minSelected = true;
				} else {
					if (focusedEl == this.sliderHandleMax) {
						maxSelected = true;
					}
				}
			}
			switch (e.keyCode) {
			  case k.HOME:
				this._setValueAttr(this.minimum, true, maxSelected);
				break;
			  case k.END:
				this._setValueAttr(this.maximum, true, maxSelected);
				break;
			  case ((this._descending || this.isLeftToRight()) ? k.RIGHT_ARROW : k.LEFT_ARROW):
			  case (this._descending === false ? k.DOWN_ARROW : k.UP_ARROW):
			  case (this._descending === false ? k.PAGE_DOWN : k.PAGE_UP):
				if (minSelected && maxSelected) {
					this._bumpValue([{"change":e.keyCode == k.PAGE_UP ? this.pageIncrement : 1, "useMaxValue":true}, {"change":e.keyCode == k.PAGE_UP ? this.pageIncrement : 1, "useMaxValue":false}]);
				} else {
					if (minSelected) {
						this._bumpValue(e.keyCode == k.PAGE_UP ? this.pageIncrement : 1, true);
					} else {
						if (maxSelected) {
							this._bumpValue(e.keyCode == k.PAGE_UP ? this.pageIncrement : 1);
						}
					}
				}
				break;
			  case ((this._descending || this.isLeftToRight()) ? k.LEFT_ARROW : k.RIGHT_ARROW):
			  case (this._descending === false ? k.UP_ARROW : k.DOWN_ARROW):
			  case (this._descending === false ? k.PAGE_UP : k.PAGE_DOWN):
				if (minSelected && maxSelected) {
					this._bumpValue([{change:e.keyCode == k.PAGE_DOWN ? -this.pageIncrement : -1, useMaxValue:false}, {change:e.keyCode == k.PAGE_DOWN ? -this.pageIncrement : -1, useMaxValue:true}]);
				} else {
					if (minSelected) {
						this._bumpValue(e.keyCode == k.PAGE_DOWN ? -this.pageIncrement : -1);
					} else {
						if (maxSelected) {
							this._bumpValue(e.keyCode == k.PAGE_DOWN ? -this.pageIncrement : -1, true);
						}
					}
				}
				break;
			  default:
				dijit.form._FormValueWidget.prototype._onKeyPress.apply(this, arguments);
				this.inherited(arguments);
				return;
			}
			dojo.stopEvent(e);
		}, _onHandleClickMax:function (e) {
			if (this.disabled || this.readOnly) {
				return;
			}
			if (!dojo.isIE) {
				dijit.focus(this.sliderHandleMax);
			}
			dojo.stopEvent(e);
		}, _onClkIncBumper:function () {
			this._setValueAttr(this._descending === false ? this.minimum : this.maximum, true, true);
		}, _bumpValue:function (signedChange, useMaxValue) {
			var value = dojo.isArray(signedChange) ? [this._getBumpValue(signedChange[0].change, signedChange[0].useMaxValue), this._getBumpValue(signedChange[1].change, signedChange[1].useMaxValue)] : this._getBumpValue(signedChange, useMaxValue);
			this._setValueAttr(value, true, !dojo.isArray(signedChange) && ((signedChange > 0 && !useMaxValue) || (useMaxValue && signedChange < 0)));
		}, _getBumpValue:function (signedChange, useMaxValue) {
			var s = dojo.getComputedStyle(this.sliderBarContainer), c = dojo._getContentBox(this.sliderBarContainer, s), count = this.discreteValues, myValue = !useMaxValue ? this.value[0] : this.value[1];
			if (count <= 1 || count == Infinity) {
				count = c[this._pixelCount];
			}
			count--;
			if ((this._isReversed() && signedChange < 0) || (signedChange > 0 && !this._isReversed())) {
				myValue = !useMaxValue ? this.value[1] : this.value[0];
			}
			var value = (myValue - this.minimum) * count / (this.maximum - this.minimum) + signedChange;
			if (value < 0) {
				value = 0;
			}
			if (value > count) {
				value = count;
			}
			return value * (this.maximum - this.minimum) / count + this.minimum;
		}, _onBarClick:function (e) {
			if (this.disabled || this.readOnly) {
				return;
			}
			if (!dojo.isIE) {
				dijit.focus(this.progressBar);
			}
			dojo.stopEvent(e);
		}, _onRemainingBarClick:function (e) {
			if (this.disabled || this.readOnly) {
				return;
			}
			if (!dojo.isIE) {
				dijit.focus(this.progressBar);
			}
			var abspos = dojo.coords(this.sliderBarContainer, true), bar = dojo.coords(this.progressBar, true), relMousePos = e[this._mousePixelCoord] - abspos[this._startingPixelCoord], leftPos = bar[this._startingPixelCount], rightPos = leftPos + bar[this._pixelCount], isMaxVal = this._isReversed() ? relMousePos <= leftPos : relMousePos >= rightPos, p = this._isReversed() ? abspos[this._pixelCount] - relMousePos : relMousePos;
			this._setPixelValue(p, abspos[this._pixelCount], true, isMaxVal);
			dojo.stopEvent(e);
		}, _setPixelValue:function (pixelValue, maxPixels, priorityChange, isMaxVal) {
			if (this.disabled || this.readOnly) {
				return;
			}
			var myValue = this._getValueByPixelValue(pixelValue, maxPixels);
			this._setValueAttr(myValue, priorityChange, isMaxVal);
		}, _getValueByPixelValue:function (pixelValue, maxPixels) {
			pixelValue = pixelValue < 0 ? 0 : maxPixels < pixelValue ? maxPixels : pixelValue;
			var count = this.discreteValues;
			if (count <= 1 || count == Infinity) {
				count = maxPixels;
			}
			count--;
			var pixelsPerValue = maxPixels / count;
			var wholeIncrements = Math.round(pixelValue / pixelsPerValue);
			return (this.maximum - this.minimum) * wholeIncrements / count + this.minimum;
		}, _setValueAttr:function (value, priorityChange, isMaxVal) {
			var actValue = this.value;
			if (!dojo.isArray(value)) {
				if (isMaxVal) {
					if (this._isReversed()) {
						actValue[0] = value;
					} else {
						actValue[1] = value;
					}
				} else {
					if (this._isReversed()) {
						actValue[1] = value;
					} else {
						actValue[0] = value;
					}
				}
			} else {
				actValue = value;
			}
			this._lastValueReported = "";
			this.valueNode.value = this.value = value = actValue;
			dijit.setWaiState(this.focusNode, "valuenow", actValue[0]);
			dijit.setWaiState(this.focusNodeMax, "valuenow", actValue[1]);
			this.value.sort(this._isReversed() ? sortReversed : sortForward);
			dijit.form._FormValueWidget.prototype._setValueAttr.apply(this, arguments);
			this._printSliderBar(priorityChange, isMaxVal);
		}, _printSliderBar:function (priorityChange, isMaxVal) {
			var percentMin = (this.value[0] - this.minimum) / (this.maximum - this.minimum);
			var percentMax = (this.value[1] - this.minimum) / (this.maximum - this.minimum);
			var percentMinSave = percentMin;
			if (percentMin > percentMax) {
				percentMin = percentMax;
				percentMax = percentMinSave;
			}
			var sliderHandleVal = this._isReversed() ? ((1 - percentMin) * 100) : (percentMin * 100);
			var sliderHandleMaxVal = this._isReversed() ? ((1 - percentMax) * 100) : (percentMax * 100);
			var progressBarVal = this._isReversed() ? ((1 - percentMax) * 100) : (percentMin * 100);
			if (priorityChange && this.slideDuration > 0 && this.progressBar.style[this._progressPixelSize]) {
				var percent = isMaxVal ? percentMax : percentMin;
				var _this = this;
				var props = {};
				var start = parseFloat(this.progressBar.style[this._handleOffsetCoord]);
				var duration = this.slideDuration / 10;
				if (duration === 0) {
					return;
				}
				if (duration < 0) {
					duration = 0 - duration;
				}
				var propsHandle = {};
				var propsHandleMax = {};
				var propsBar = {};
				propsHandle[this._handleOffsetCoord] = {start:this.sliderHandle.style[this._handleOffsetCoord], end:sliderHandleVal, units:"%"};
				propsHandleMax[this._handleOffsetCoord] = {start:this.sliderHandleMax.style[this._handleOffsetCoord], end:sliderHandleMaxVal, units:"%"};
				propsBar[this._handleOffsetCoord] = {start:this.progressBar.style[this._handleOffsetCoord], end:progressBarVal, units:"%"};
				propsBar[this._progressPixelSize] = {start:this.progressBar.style[this._progressPixelSize], end:(percentMax - percentMin) * 100, units:"%"};
				var animHandle = dojo.animateProperty({node:this.sliderHandle, duration:duration, properties:propsHandle});
				var animHandleMax = dojo.animateProperty({node:this.sliderHandleMax, duration:duration, properties:propsHandleMax});
				var animBar = dojo.animateProperty({node:this.progressBar, duration:duration, properties:propsBar});
				var animCombine = dojo.fx.combine([animHandle, animHandleMax, animBar]);
				animCombine.play();
			} else {
				this.sliderHandle.style[this._handleOffsetCoord] = sliderHandleVal + "%";
				this.sliderHandleMax.style[this._handleOffsetCoord] = sliderHandleMaxVal + "%";
				this.progressBar.style[this._handleOffsetCoord] = progressBarVal + "%";
				this.progressBar.style[this._progressPixelSize] = ((percentMax - percentMin) * 100) + "%";
			}
		}});
		dojo.declare("dijit.form._SliderMoverMax", dijit.form._SliderMover, {onMouseMove:function (e) {
			var widget = this.widget;
			var abspos = widget._abspos;
			if (!abspos) {
				abspos = widget._abspos = dojo.coords(widget.sliderBarContainer, true);
				widget._setPixelValue_ = dojo.hitch(widget, "_setPixelValue");
				widget._isReversed_ = widget._isReversed();
			}
			var coordEvent = e.touches ? e.touches[0] : e;
			var pixelValue = coordEvent[widget._mousePixelCoord] - abspos[widget._startingPixelCoord];
			widget._setPixelValue_(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValue) : pixelValue, abspos[widget._pixelCount], false, true);
		}, destroy:function (e) {
			dojo.dnd.Mover.prototype.destroy.apply(this, arguments);
			var widget = this.widget;
			widget._abspos = null;
			widget._setValueAttr(widget.value, true);
		}});
		dojo.declare("dijit.form._SliderBarMover", dojo.dnd.Mover, {onMouseMove:function (e) {
			var widget = this.widget;
			if (widget.disabled || widget.readOnly) {
				return;
			}
			var abspos = widget._abspos;
			var bar = widget._bar;
			var mouseOffset = widget._mouseOffset;
			if (!abspos) {
				abspos = widget._abspos = dojo.coords(widget.sliderBarContainer, true);
				widget._setPixelValue_ = dojo.hitch(widget, "_setPixelValue");
				widget._getValueByPixelValue_ = dojo.hitch(widget, "_getValueByPixelValue");
				widget._isReversed_ = widget._isReversed();
			}
			if (!bar) {
				bar = widget._bar = dojo.coords(widget.progressBar, true);
			}
			var coordEvent = e.touches ? e.touches[0] : e;
			if (!mouseOffset) {
				mouseOffset = widget._mouseOffset = coordEvent[widget._mousePixelCoord] - abspos[widget._startingPixelCoord] - bar[widget._startingPixelCount];
			}
			var pixelValueMin = coordEvent[widget._mousePixelCoord] - abspos[widget._startingPixelCoord] - mouseOffset, pixelValueMax = pixelValueMin + bar[widget._pixelCount];
			pixelValues = [pixelValueMin, pixelValueMax];
			pixelValues.sort(sortForward);
			if (pixelValues[0] <= 0) {
				pixelValues[0] = 0;
				pixelValues[1] = bar[widget._pixelCount];
			}
			if (pixelValues[1] >= abspos[widget._pixelCount]) {
				pixelValues[1] = abspos[widget._pixelCount];
				pixelValues[0] = abspos[widget._pixelCount] - bar[widget._pixelCount];
			}
			var myValues = [widget._getValueByPixelValue(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValues[0]) : pixelValues[0], abspos[widget._pixelCount]), widget._getValueByPixelValue(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValues[1]) : pixelValues[1], abspos[widget._pixelCount])];
			widget._setValueAttr(myValues, false, false);
		}, destroy:function () {
			dojo.dnd.Mover.prototype.destroy.apply(this, arguments);
			var widget = this.widget;
			widget._abspos = null;
			widget._bar = null;
			widget._mouseOffset = null;
			widget._setValueAttr(widget.value, true);
		}});
		dojo.declare("dojox.form.HorizontalRangeSlider", [dijit.form.HorizontalSlider, dojox.form._RangeSliderMixin], {templateString:dojo.cache("dojox.form", "resources/HorizontalRangeSlider.html", "<table class=\"dijit dijitReset dijitSlider dijitSliderH dojoxRangeSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" dojoAttachEvent=\"onkeypress:_onKeyPress,onkeyup:_onKeyUp\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td dojoAttachPoint=\"topDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationT dijitSliderDecorationH\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderDecrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper\" dojoAttachEvent=\"onmousedown:_onClkDecBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" ${!nameAttrSetting}\n\t\t\t/><div role=\"presentation\" class=\"dojoxRangeSliderBarContainer\" dojoAttachPoint=\"sliderBarContainer\"\n\t\t\t\t><div dojoAttachPoint=\"sliderHandle\" tabIndex=\"${tabIndex}\" class=\"dijitSliderMoveable dijitSliderMoveableH\" dojoAttachEvent=\"onmousedown:_onHandleClick\" role=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleH\"></div\n\t\t\t\t></div\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"progressBar,focusNode\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" dojoAttachEvent=\"onmousedown:_onBarClick\"></div\n\t\t\t\t><div dojoAttachPoint=\"sliderHandleMax,focusNodeMax\" tabIndex=\"${tabIndex}\" class=\"dijitSliderMoveable dijitSliderMoveableH\" dojoAttachEvent=\"onmousedown:_onHandleClickMax\" role=\"sliderMax\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleH\"></div\n\t\t\t\t></div\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" dojoAttachEvent=\"onmousedown:_onRemainingBarClick\"></div\n\t\t\t></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper\" dojoAttachEvent=\"onmousedown:_onClkIncBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderIncrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\n\t\t></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td dojoAttachPoint=\"containerNode,bottomDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationB dijitSliderDecorationH\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n></table>\n")});
		dojo.declare("dojox.form.VerticalRangeSlider", [dijit.form.VerticalSlider, dojox.form._RangeSliderMixin], {templateString:dojo.cache("dojox.form", "resources/VerticalRangeSlider.html", "<table class=\"dijitReset dijitSlider dijitSliderV dojoxRangeSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerV\"\n\t\t\t><div class=\"dijitSliderIncrementIconV\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\" dojoAttachEvent=\"onclick: increment\"><span class=\"dijitSliderButtonInner\">+</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperV dijitSliderTopBumper\" dojoAttachEvent=\"onclick:_onClkIncBumper\"></div></center\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td dojoAttachPoint=\"leftDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationL dijitSliderDecorationV\" style=\"text-align:center;height:100%;\"></td\n\t\t><td class=\"dijitReset\" style=\"height:100%;\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" ${!nameAttrSetting}\n\t\t\t/><center role=\"presentation\" style=\"position:relative;height:100%;\" dojoAttachPoint=\"sliderBarContainer\"\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarV dijitSliderRemainingBar dijitSliderRemainingBarV\" dojoAttachEvent=\"onmousedown:_onRemainingBarClick\"\n\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle\" tabIndex=\"${tabIndex}\" class=\"dijitSliderMoveable dijitSliderMoveableV\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onHandleClick\" style=\"vertical-align:top;\" role=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleV\"></div\n\t\t\t\t\t></div\n\t\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"progressBar,focusNode\" tabIndex=\"${tabIndex}\" class=\"dijitSliderBar dijitSliderBarV dijitSliderProgressBar dijitSliderProgressBarV\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onBarClick\"\n\t\t\t\t\t></div\n\t\t\t\t\t><div dojoAttachPoint=\"sliderHandleMax,focusNodeMax\" tabIndex=\"${tabIndex}\" class=\"dijitSliderMoveable dijitSliderMoveableV\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onHandleClickMax\" style=\"vertical-align:top;\" role=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleV\"></div\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t></center\n\t\t></td\n\t\t><td dojoAttachPoint=\"containerNode,rightDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationR dijitSliderDecorationV\" style=\"text-align:center;height:100%;\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperV dijitSliderBottomBumper\" dojoAttachEvent=\"onclick:_onClkDecBumper\"></div></center\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerV\"\n\t\t\t><div class=\"dijitSliderDecrementIconV\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\" dojoAttachEvent=\"onclick: decrement\"><span class=\"dijitSliderButtonInner\">-</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n></table>\n")});
	})();
}

