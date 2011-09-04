/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.aspect.cflow"]) {
	dojo._hasResource["dojox.lang.aspect.cflow"] = true;
	dojo.provide("dojox.lang.aspect.cflow");
	(function () {
		var aop = dojox.lang.aspect;
		aop.cflow = function (instance, method) {
			if (arguments.length > 1 && !(method instanceof Array)) {
				method = [method];
			}
			var contextStack = aop.getContextStack();
			for (var i = contextStack.length - 1; i >= 0; --i) {
				var c = contextStack[i];
				if (instance && c.instance != instance) {
					continue;
				}
				if (!method) {
					return true;
				}
				var n = c.joinPoint.targetName;
				for (var j = method.length - 1; j >= 0; --j) {
					var m = method[j];
					if (m instanceof RegExp) {
						if (m.test(n)) {
							return true;
						}
					} else {
						if (n == m) {
							return true;
						}
					}
				}
			}
			return false;
		};
	})();
}

