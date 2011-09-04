/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.oo.rearrange"]) {
	dojo._hasResource["dojox.lang.oo.rearrange"] = true;
	dojo.provide("dojox.lang.oo.rearrange");
	(function () {
		var extraNames = dojo._extraNames, extraLen = extraNames.length, opts = Object.prototype.toString, empty = {};
		dojox.lang.oo.rearrange = function (bag, map) {
			var name, newName, prop, i, t;
			for (name in map) {
				newName = map[name];
				if (!newName || opts.call(newName) == "[object String]") {
					prop = bag[name];
					if (!(name in empty) || empty[name] !== prop) {
						if (!(delete bag[name])) {
							bag[name] = undefined;
						}
						if (newName) {
							bag[newName] = prop;
						}
					}
				}
			}
			if (extraLen) {
				for (i = 0; i < extraLen; ++i) {
					name = extraNames[i];
					newName = map[name];
					if (!newName || opts.call(newName) == "[object String]") {
						prop = bag[name];
						if (!(name in empty) || empty[name] !== prop) {
							if (!(delete bag[name])) {
								bag[name] = undefined;
							}
							if (newName) {
								bag[newName] = prop;
							}
						}
					}
				}
			}
			return bag;
		};
	})();
}

