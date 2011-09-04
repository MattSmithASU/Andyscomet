/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.Stateful"]) {
	dojo._hasResource["dojo.Stateful"] = true;
	dojo.provide("dojo.Stateful");
	dojo.declare("dojo.Stateful", null, {postscript:function (mixin) {
		if (mixin) {
			dojo.mixin(this, mixin);
		}
	}, get:function (name) {
		return this[name];
	}, set:function (name, value) {
		if (typeof name === "object") {
			for (var x in name) {
				this.set(x, name[x]);
			}
			return this;
		}
		var oldValue = this[name];
		this[name] = value;
		if (this._watchCallbacks) {
			this._watchCallbacks(name, oldValue, value);
		}
		return this;
	}, watch:function (name, callback) {
		var callbacks = this._watchCallbacks;
		if (!callbacks) {
			var self = this;
			callbacks = this._watchCallbacks = function (name, oldValue, value, ignoreCatchall) {
				var notify = function (propertyCallbacks) {
					if (propertyCallbacks) {
						propertyCallbacks = propertyCallbacks.slice();
						for (var i = 0, l = propertyCallbacks.length; i < l; i++) {
							try {
								propertyCallbacks[i].call(self, name, oldValue, value);
							}
							catch (e) {
								console.error(e);
							}
						}
					}
				};
				notify(callbacks["_" + name]);
				if (!ignoreCatchall) {
					notify(callbacks["*"]);
				}
			};
		}
		if (!callback && typeof name === "function") {
			callback = name;
			name = "*";
		} else {
			name = "_" + name;
		}
		var propertyCallbacks = callbacks[name];
		if (typeof propertyCallbacks !== "object") {
			propertyCallbacks = callbacks[name] = [];
		}
		propertyCallbacks.push(callback);
		return {unwatch:function () {
			propertyCallbacks.splice(dojo.indexOf(propertyCallbacks, callback), 1);
		}};
	}});
}

