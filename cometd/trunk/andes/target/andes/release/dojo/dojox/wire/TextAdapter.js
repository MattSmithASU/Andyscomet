/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.wire.TextAdapter"]) {
	dojo._hasResource["dojox.wire.TextAdapter"] = true;
	dojo.provide("dojox.wire.TextAdapter");
	dojo.require("dojox.wire.CompositeWire");
	dojo.declare("dojox.wire.TextAdapter", dojox.wire.CompositeWire, {_wireClass:"dojox.wire.TextAdapter", constructor:function (args) {
		this._initializeChildren(this.segments);
		if (!this.delimiter) {
			this.delimiter = "";
		}
	}, _getValue:function (object) {
		if (!object || !this.segments) {
			return object;
		}
		var text = "";
		for (var i in this.segments) {
			var segment = this.segments[i].getValue(object);
			text = this._addSegment(text, segment);
		}
		return text;
	}, _setValue:function (object, value) {
		throw new Error("Unsupported API: " + this._wireClass + "._setValue");
	}, _addSegment:function (text, segment) {
		if (!segment) {
			return text;
		} else {
			if (!text) {
				return segment;
			} else {
				return text + this.delimiter + segment;
			}
		}
	}});
}

