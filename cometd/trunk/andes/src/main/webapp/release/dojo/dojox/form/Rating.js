/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.Rating"]) {
	dojo._hasResource["dojox.form.Rating"] = true;
	dojo.provide("dojox.form.Rating");
	dojo.require("dijit.form._FormWidget");
	dojo.declare("dojox.form.Rating", dijit.form._FormWidget, {templateString:null, numStars:3, value:0, constructor:function (params) {
		dojo.mixin(this, params);
		var tpl = "<div dojoAttachPoint=\"domNode\" class=\"dojoxRating dijitInline\">" + "<input type=\"hidden\" value=\"0\" dojoAttachPoint=\"focusNode\" /><ul>${stars}</ul>" + "</div>";
		var starTpl = "<li class=\"dojoxRatingStar dijitInline\" dojoAttachEvent=\"onclick:onStarClick,onmouseover:_onMouse,onmouseout:_onMouse\" value=\"${value}\"></li>";
		var rendered = "";
		for (var i = 0; i < this.numStars; i++) {
			rendered += dojo.string.substitute(starTpl, {value:i + 1});
		}
		this.templateString = dojo.string.substitute(tpl, {stars:rendered});
	}, postCreate:function () {
		this.inherited(arguments);
		this._renderStars(this.value);
	}, _onMouse:function (evt) {
		if (this.hovering) {
			var hoverValue = +dojo.attr(evt.target, "value");
			this.onMouseOver(evt, hoverValue);
			this._renderStars(hoverValue, true);
		} else {
			this._renderStars(this.value);
		}
	}, _renderStars:function (value, hover) {
		dojo.query(".dojoxRatingStar", this.domNode).forEach(function (star, i) {
			if (i + 1 > value) {
				dojo.removeClass(star, "dojoxRatingStarHover");
				dojo.removeClass(star, "dojoxRatingStarChecked");
			} else {
				dojo.removeClass(star, "dojoxRatingStar" + (hover ? "Checked" : "Hover"));
				dojo.addClass(star, "dojoxRatingStar" + (hover ? "Hover" : "Checked"));
			}
		});
	}, onStarClick:function (evt) {
		var newVal = +dojo.attr(evt.target, "value");
		this.setAttribute("value", newVal == this.value ? 0 : newVal);
		this._renderStars(this.value);
		this.onChange(this.value);
	}, onMouseOver:function () {
	}, setAttribute:function (key, value) {
		this.inherited("setAttribute", arguments);
		if (key == "value") {
			this._renderStars(this.value);
			this.onChange(this.value);
		}
	}});
}

