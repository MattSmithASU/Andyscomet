/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.dtl.Context"]) {
	dojo._hasResource["dojox.dtl.Context"] = true;
	dojo.provide("dojox.dtl.Context");
	dojo.require("dojox.dtl._base");
	dojox.dtl.Context = dojo.extend(function (dict) {
		this._this = {};
		dojox.dtl._Context.call(this, dict);
	}, dojox.dtl._Context.prototype, {getKeys:function () {
		var keys = [];
		for (var key in this) {
			if (this.hasOwnProperty(key) && key != "_this") {
				keys.push(key);
			}
		}
		return keys;
	}, extend:function (obj) {
		return dojo.delegate(this, obj);
	}, filter:function (filter) {
		var context = new dojox.dtl.Context();
		var keys = [];
		var i, arg;
		if (filter instanceof dojox.dtl.Context) {
			keys = filter.getKeys();
		} else {
			if (typeof filter == "object") {
				for (var key in filter) {
					keys.push(key);
				}
			} else {
				for (i = 0; arg = arguments[i]; i++) {
					if (typeof arg == "string") {
						keys.push(arg);
					}
				}
			}
		}
		for (i = 0, key; key = keys[i]; i++) {
			context[key] = this[key];
		}
		return context;
	}, setThis:function (_this) {
		this._this = _this;
	}, getThis:function () {
		return this._this;
	}, hasKey:function (key) {
		if (this._getter) {
			var got = this._getter(key);
			if (typeof got != "undefined") {
				return true;
			}
		}
		if (typeof this[key] != "undefined") {
			return true;
		}
		return false;
	}});
}

