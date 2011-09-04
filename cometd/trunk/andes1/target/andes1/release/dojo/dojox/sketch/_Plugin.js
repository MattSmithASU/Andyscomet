/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.sketch._Plugin"]) {
	dojo._hasResource["dojox.sketch._Plugin"] = true;
	dojo.provide("dojox.sketch._Plugin");
	dojo.require("dijit.form.ToggleButton");
	dojo.declare("dojox.sketch._Plugin", null, {constructor:function (args) {
		if (args) {
			dojo.mixin(this, args);
		}
		this._connects = [];
	}, figure:null, iconClassPrefix:"dojoxSketchIcon", itemGroup:"toolsGroup", button:null, queryCommand:null, shape:"", useDefaultCommand:true, buttonClass:dijit.form.ToggleButton, _initButton:function () {
		if (this.shape.length) {
			var className = this.iconClassPrefix + " " + this.iconClassPrefix + this.shape.charAt(0).toUpperCase() + this.shape.substr(1);
			if (!this.button) {
				var props = {label:this.shape, showLabel:false, iconClass:className, dropDown:this.dropDown, tabIndex:"-1"};
				this.button = new this.buttonClass(props);
				this.connect(this.button, "onClick", "activate");
			}
		}
	}, attr:function (name, value) {
		return this.button.attr(name, value);
	}, onActivate:function () {
	}, activate:function (e) {
		this.onActivate();
		this.figure.setTool(this);
		this.attr("checked", true);
	}, onMouseDown:function (e) {
	}, onMouseMove:function (e) {
	}, onMouseUp:function (e) {
	}, destroy:function (f) {
		dojo.forEach(this._connects, dojo.disconnect);
	}, connect:function (o, f, tf) {
		this._connects.push(dojo.connect(o, f, this, tf));
	}, setFigure:function (figure) {
		this.figure = figure;
	}, setToolbar:function (toolbar) {
		this._initButton();
		if (this.button) {
			toolbar.addChild(this.button);
		}
		if (this.itemGroup) {
			toolbar.addGroupItem(this, this.itemGroup);
		}
	}});
}

