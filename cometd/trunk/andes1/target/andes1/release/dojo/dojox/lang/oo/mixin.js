/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.oo.mixin"]) {
	dojo._hasResource["dojox.lang.oo.mixin"] = true;
	dojo.provide("dojox.lang.oo.mixin");
	dojo.experimental("dojox.lang.oo.mixin");
	dojo.require("dojox.lang.oo.Filter");
	dojo.require("dojox.lang.oo.Decorator");
	(function () {
		var oo = dojox.lang.oo, Filter = oo.Filter, Decorator = oo.Decorator, empty = {}, defaultFilter = function (name) {
			return name;
		}, defaultDecorator = function (name, newValue, oldValue) {
			return newValue;
		}, defaultMixer = function (target, name, newValue, oldValue) {
			target[name] = newValue;
		}, defaults = {}, extraNames = dojo._extraNames, extraLen = extraNames.length, applyDecorator = oo.applyDecorator = function (decorator, name, newValue, oldValue) {
			if (newValue instanceof Decorator) {
				var d = newValue.decorator;
				newValue = applyDecorator(decorator, name, newValue.value, oldValue);
				return d(name, newValue, oldValue);
			}
			return decorator(name, newValue, oldValue);
		};
		oo.__mixin = function (target, source, decorator, filter, mixer) {
			var name, targetName, prop, newValue, oldValue, i;
			for (name in source) {
				prop = source[name];
				if (!(name in empty) || empty[name] !== prop) {
					targetName = filter(name, target, source, prop);
					if (targetName && (!(targetName in target) || !(targetName in empty) || empty[targetName] !== prop)) {
						oldValue = target[targetName];
						newValue = applyDecorator(decorator, targetName, prop, oldValue);
						if (oldValue !== newValue) {
							mixer(target, targetName, newValue, oldValue);
						}
					}
				}
			}
			if (extraLen) {
				for (i = 0; i < extraLen; ++i) {
					name = extraNames[i];
					prop = source[name];
					if (!(name in empty) || empty[name] !== prop) {
						targetName = filter(name, target, source, prop);
						if (targetName && (!(targetName in target) || !(targetName in empty) || empty[targetName] !== prop)) {
							oldValue = target[targetName];
							newValue = applyDecorator(decorator, targetName, prop, oldValue);
							if (oldValue !== newValue) {
								mixer(target, targetName, newValue, oldValue);
							}
						}
					}
				}
			}
			return target;
		};
		oo.mixin = function (target, source) {
			var decorator, filter, i = 1, l = arguments.length;
			for (; i < l; ++i) {
				source = arguments[i];
				if (source instanceof Filter) {
					filter = source.filter;
					source = source.bag;
				} else {
					filter = defaultFilter;
				}
				if (source instanceof Decorator) {
					decorator = source.decorator;
					source = source.value;
				} else {
					decorator = defaultDecorator;
				}
				oo.__mixin(target, source, decorator, filter, defaultMixer);
			}
			return target;
		};
	})();
}

