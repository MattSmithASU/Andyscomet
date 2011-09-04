/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.oo.Decorator"]) {
	dojo._hasResource["dojox.lang.oo.Decorator"] = true;
	dojo.provide("dojox.lang.oo.Decorator");
	(function () {
		var oo = dojox.lang.oo, D = oo.Decorator = function (value, decorator) {
			this.value = value;
			this.decorator = typeof decorator == "object" ? function () {
				return decorator.exec.apply(decorator, arguments);
			} : decorator;
		};
		oo.makeDecorator = function (decorator) {
			return function (value) {
				return new D(value, decorator);
			};
		};
	})();
}

