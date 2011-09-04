/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.AdapterRegistry"]) {
	dojo._hasResource["dojo.AdapterRegistry"] = true;
	dojo.provide("dojo.AdapterRegistry");
	dojo.AdapterRegistry = function (returnWrappers) {
		this.pairs = [];
		this.returnWrappers = returnWrappers || false;
	};
	dojo.extend(dojo.AdapterRegistry, {register:function (name, check, wrap, directReturn, override) {
		this.pairs[((override) ? "unshift" : "push")]([name, check, wrap, directReturn]);
	}, match:function () {
		for (var i = 0; i < this.pairs.length; i++) {
			var pair = this.pairs[i];
			if (pair[1].apply(this, arguments)) {
				if ((pair[3]) || (this.returnWrappers)) {
					return pair[2];
				} else {
					return pair[2].apply(this, arguments);
				}
			}
		}
		throw new Error("No match found");
	}, unregister:function (name) {
		for (var i = 0; i < this.pairs.length; i++) {
			var pair = this.pairs[i];
			if (pair[0] == name) {
				this.pairs.splice(i, 1);
				return true;
			}
		}
		return false;
	}});
}

