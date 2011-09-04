/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.filter._ConditionExpr"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.filter._ConditionExpr"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.filter._ConditionExpr");
	(function () {
		var fns = dojox.grid.enhanced.plugins.filter;
		dojo.declare("dojox.grid.enhanced.plugins.filter._ConditionExpr", null, {_name:"expr", applyRow:function (datarow, getter) {
			throw new Error("_ConditionExpr.applyRow: unimplemented interface");
		}, toObject:function () {
			return {};
		}, getName:function () {
			return this._name;
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter._DataExpr", fns._ConditionExpr, {_name:"data", constructor:function (dataValue, isColumn, convertArgs) {
			this._convertArgs = convertArgs || {};
			if (dojo.isFunction(this._convertArgs.convert)) {
				this._convertData = dojo.hitch(this._convertArgs.scope, this._convertArgs.convert);
			}
			if (isColumn) {
				this._colArg = dataValue;
			} else {
				this._value = this._convertData(dataValue, this._convertArgs);
			}
		}, getValue:function () {
			return this._value;
		}, applyRow:function (datarow, getter) {
			return typeof this._colArg == "undefined" ? this : new (dojo.getObject(this.declaredClass))(this._convertData(getter(datarow, this._colArg), this._convertArgs));
		}, _convertData:function (dataValue) {
			return dataValue;
		}, toObject:function () {
			return {op:this.getName(), data:this._colArg === undefined ? this._value : this._colArg, isCol:this._colArg !== undefined};
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter._OperatorExpr", fns._ConditionExpr, {_name:"operator", constructor:function () {
			if (dojo.isArray(arguments[0])) {
				this._operands = arguments[0];
			} else {
				this._operands = [];
				for (var i = 0; i < arguments.length; ++i) {
					this._operands.push(arguments[i]);
				}
			}
		}, toObject:function () {
			return {op:this.getName(), data:dojo.map(this._operands, function (operand) {
				return operand.toObject();
			})};
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter._UniOpExpr", fns._OperatorExpr, {_name:"uniOperator", applyRow:function (datarow, getter) {
			if (!(this._operands[0] instanceof fns._ConditionExpr)) {
				throw new Error("_UniOpExpr: operand is not expression.");
			}
			return this._calculate(this._operands[0], datarow, getter);
		}, _calculate:function (operand, datarow, getter) {
			throw new Error("_UniOpExpr._calculate: unimplemented interface");
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter._BiOpExpr", fns._OperatorExpr, {_name:"biOperator", applyRow:function (datarow, getter) {
			if (!(this._operands[0] instanceof fns._ConditionExpr)) {
				throw new Error("_BiOpExpr: left operand is not expression.");
			} else {
				if (!(this._operands[1] instanceof fns._ConditionExpr)) {
					throw new Error("_BiOpExpr: right operand is not expression.");
				}
			}
			return this._calculate(this._operands[0], this._operands[1], datarow, getter);
		}, _calculate:function (left_operand, right_operand, datarow, getter) {
			throw new Error("_BiOpExpr._calculate: unimplemented interface");
		}});
	})();
}

