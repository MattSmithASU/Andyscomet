/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.aspect.tracer"]) {
	dojo._hasResource["dojox.lang.aspect.tracer"] = true;
	dojo.provide("dojox.lang.aspect.tracer");
	(function () {
		var aop = dojox.lang.aspect;
		var Tracer = function (grouping) {
			this.method = grouping ? "group" : "log";
			if (grouping) {
				this.after = this._after;
			}
		};
		dojo.extend(Tracer, {before:function () {
			var context = aop.getContext(), joinPoint = context.joinPoint, args = Array.prototype.join.call(arguments, ", ");
			console[this.method](context.instance, "=>", joinPoint.targetName + "(" + args + ")");
		}, afterReturning:function (retVal) {
			var joinPoint = aop.getContext().joinPoint;
			if (typeof retVal != "undefined") {
				console.log(joinPoint.targetName + "() returns:", retVal);
			} else {
				console.log(joinPoint.targetName + "() returns");
			}
		}, afterThrowing:function (excp) {
			console.log(aop.getContext().joinPoint.targetName + "() throws:", excp);
		}, _after:function (excp) {
			console.groupEnd();
		}});
		aop.tracer = function (grouping) {
			return new Tracer(grouping);
		};
	})();
}

