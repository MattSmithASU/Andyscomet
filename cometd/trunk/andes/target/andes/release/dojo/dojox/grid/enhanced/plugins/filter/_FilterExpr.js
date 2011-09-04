/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.filter._FilterExpr"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.filter._FilterExpr"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.filter._FilterExpr");
	dojo.require("dojox.grid.enhanced.plugins.filter._DataExprs");
	dojo.require("dojo.date");
	(function () {
		var fns = dojox.grid.enhanced.plugins.filter;
		dojo.declare("dojox.grid.enhanced.plugins.filter.LogicAND", fns._BiOpExpr, {_name:"and", _calculate:function (left_operand, right_operand, datarow, getter) {
			var res = left_operand.applyRow(datarow, getter).getValue() && right_operand.applyRow(datarow, getter).getValue();
			return new fns.BooleanExpr(res);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LogicOR", fns._BiOpExpr, {_name:"or", _calculate:function (left_operand, right_operand, datarow, getter) {
			var res = left_operand.applyRow(datarow, getter).getValue() || right_operand.applyRow(datarow, getter).getValue();
			return new fns.BooleanExpr(res);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LogicXOR", fns._BiOpExpr, {_name:"xor", _calculate:function (left_operand, right_operand, datarow, getter) {
			var left_res = left_operand.applyRow(datarow, getter).getValue();
			var right_res = right_operand.applyRow(datarow, getter).getValue();
			return new fns.BooleanExpr((!!left_res) != (!!right_res));
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LogicNOT", fns._UniOpExpr, {_name:"not", _calculate:function (operand, datarow, getter) {
			return new fns.BooleanExpr(!operand.applyRow(datarow, getter).getValue());
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LogicALL", fns._OperatorExpr, {_name:"all", applyRow:function (datarow, getter) {
			for (var i = 0, res = true; res && (this._operands[i] instanceof fns._ConditionExpr); ++i) {
				res = this._operands[i].applyRow(datarow, getter).getValue();
			}
			return new fns.BooleanExpr(res);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LogicANY", fns._OperatorExpr, {_name:"any", applyRow:function (datarow, getter) {
			for (var i = 0, res = false; !res && (this._operands[i] instanceof fns._ConditionExpr); ++i) {
				res = this._operands[i].applyRow(datarow, getter).getValue();
			}
			return new fns.BooleanExpr(res);
		}});
		function compareFunc(left, right, row, getter) {
			left = left.applyRow(row, getter);
			right = right.applyRow(row, getter);
			var left_res = left.getValue();
			var right_res = right.getValue();
			if (left instanceof fns.TimeExpr) {
				return dojo.date.compare(left_res, right_res, "time");
			} else {
				if (left instanceof fns.DateExpr) {
					return dojo.date.compare(left_res, right_res, "date");
				} else {
					if (left instanceof fns.StringExpr) {
						left_res = left_res.toLowerCase();
						right_res = String(right_res).toLowerCase();
					}
					return left_res == right_res ? 0 : (left_res < right_res ? -1 : 1);
				}
			}
		}
		dojo.declare("dojox.grid.enhanced.plugins.filter.EqualTo", fns._BiOpExpr, {_name:"equal", _calculate:function (left_operand, right_operand, datarow, getter) {
			var res = compareFunc(left_operand, right_operand, datarow, getter);
			return new fns.BooleanExpr(res === 0);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LessThan", fns._BiOpExpr, {_name:"less", _calculate:function (left_operand, right_operand, datarow, getter) {
			var res = compareFunc(left_operand, right_operand, datarow, getter);
			return new fns.BooleanExpr(res < 0);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LessThanOrEqualTo", fns._BiOpExpr, {_name:"lessEqual", _calculate:function (left_operand, right_operand, datarow, getter) {
			var res = compareFunc(left_operand, right_operand, datarow, getter);
			return new fns.BooleanExpr(res <= 0);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LargerThan", fns._BiOpExpr, {_name:"larger", _calculate:function (left_operand, right_operand, datarow, getter) {
			var res = compareFunc(left_operand, right_operand, datarow, getter);
			return new fns.BooleanExpr(res > 0);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.LargerThanOrEqualTo", fns._BiOpExpr, {_name:"largerEqual", _calculate:function (left_operand, right_operand, datarow, getter) {
			var res = compareFunc(left_operand, right_operand, datarow, getter);
			return new fns.BooleanExpr(res >= 0);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.Contains", fns._BiOpExpr, {_name:"contains", _calculate:function (left_operand, right_operand, datarow, getter) {
			var left_res = String(left_operand.applyRow(datarow, getter).getValue()).toLowerCase();
			var right_res = String(right_operand.applyRow(datarow, getter).getValue()).toLowerCase();
			return new fns.BooleanExpr(left_res.indexOf(right_res) >= 0);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.StartsWith", fns._BiOpExpr, {_name:"startsWith", _calculate:function (left_operand, right_operand, datarow, getter) {
			var left_res = String(left_operand.applyRow(datarow, getter).getValue()).toLowerCase();
			var right_res = String(right_operand.applyRow(datarow, getter).getValue()).toLowerCase();
			return new fns.BooleanExpr(left_res.substring(0, right_res.length) == right_res);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.EndsWith", fns._BiOpExpr, {_name:"endsWith", _calculate:function (left_operand, right_operand, datarow, getter) {
			var left_res = String(left_operand.applyRow(datarow, getter).getValue()).toLowerCase();
			var right_res = String(right_operand.applyRow(datarow, getter).getValue()).toLowerCase();
			return new fns.BooleanExpr(left_res.substring(left_res.length - right_res.length) == right_res);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.Matches", fns._BiOpExpr, {_name:"matches", _calculate:function (left_operand, right_operand, datarow, getter) {
			var left_res = String(left_operand.applyRow(datarow, getter).getValue());
			var right_res = new RegExp(right_operand.applyRow(datarow, getter).getValue());
			return new fns.BooleanExpr(left_res.search(right_res) >= 0);
		}});
		dojo.declare("dojox.grid.enhanced.plugins.filter.IsEmpty", fns._UniOpExpr, {_name:"isEmpty", _calculate:function (operand, datarow, getter) {
			var res = operand.applyRow(datarow, getter).getValue();
			return new fns.BooleanExpr(res === "" || res == null);
		}});
	})();
}

