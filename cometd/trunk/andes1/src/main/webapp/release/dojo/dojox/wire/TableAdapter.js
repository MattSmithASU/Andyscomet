/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.wire.TableAdapter"]) {
	dojo._hasResource["dojox.wire.TableAdapter"] = true;
	dojo.provide("dojox.wire.TableAdapter");
	dojo.require("dojox.wire.CompositeWire");
	dojo.declare("dojox.wire.TableAdapter", dojox.wire.CompositeWire, {_wireClass:"dojox.wire.TableAdapter", constructor:function (args) {
		this._initializeChildren(this.columns);
	}, _getValue:function (object) {
		if (!object || !this.columns) {
			return object;
		}
		var array = object;
		if (!dojo.isArray(array)) {
			array = [array];
		}
		var rows = [];
		for (var i in array) {
			var row = this._getRow(array[i]);
			rows.push(row);
		}
		return rows;
	}, _setValue:function (object, value) {
		throw new Error("Unsupported API: " + this._wireClass + "._setValue");
	}, _getRow:function (object) {
		var row = (dojo.isArray(this.columns) ? [] : {});
		for (var c in this.columns) {
			row[c] = this.columns[c].getValue(object);
		}
		return row;
	}});
}

