/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.filter._DataExprs"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.filter._DataExprs"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.filter._DataExprs");
	dojo.require("dojox.grid.enhanced.plugins.filter._ConditionExpr");
	dojo.require("dojo.date.locale");
	(function () {
		var fns = dojox.grid.enhanced.plugins.filter;
		dojo.declare("dojox.grid.enhanced.plugins.filter.BooleanExpr", fns._DataExpr, {_name:"bool", _convertData:function (dataValue) {
			return !!dataValue;
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.StringExpr", fns._DataExpr, {_name:"string", _convertData:function (dataValue) {
			return String(dataValue);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.NumberExpr", fns._DataExpr, {_name:"number", _convertDataToExpr:function (dataValue) {
			return parseFloat(dataValue);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.DateExpr", fns._DataExpr, {_name:"date", _convertData:function (dataValue) {
			if (dataValue instanceof Date) {
				return dataValue;
			} else {
				if (typeof dataValue == "number") {
					return new Date(dataValue);
				} else {
					var res = dojo.date.locale.parse(String(dataValue), dojo.mixin({selector:this._name}, this._convertArgs));
					if (!res) {
						throw new Error("Datetime parse failed: " + dataValue);
					}
					return res;
				}
			}
		}, toObject:function () {
			if (this._value instanceof Date) {
				var tmp = this._value;
				this._value = this._value.valueOf();
				var res = this.inherited(arguments);
				this._value = tmp;
				return res;
			} else {
				return this.inherited(arguments);
			}
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.TimeExpr", fns.DateExpr, {_name:"time"});
	})();
}
