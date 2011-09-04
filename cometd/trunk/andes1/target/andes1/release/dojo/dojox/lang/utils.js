/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.utils"]) {
	dojo._hasResource["dojox.lang.utils"] = true;
	dojo.provide("dojox.lang.utils");
	(function () {
		var empty = {}, du = dojox.lang.utils, opts = Object.prototype.toString;
		var clone = function (o) {
			if (o) {
				switch (opts.call(o)) {
				  case "[object Array]":
					return o.slice(0);
				  case "[object Object]":
					return dojo.delegate(o);
				}
			}
			return o;
		};
		dojo.mixin(du, {coerceType:function (target, source) {
			switch (typeof target) {
			  case "number":
				return Number(eval("(" + source + ")"));
			  case "string":
				return String(source);
			  case "boolean":
				return Boolean(eval("(" + source + ")"));
			}
			return eval("(" + source + ")");
		}, updateWithObject:function (target, source, conv) {
			if (!source) {
				return target;
			}
			for (var x in target) {
				if (x in source && !(x in empty)) {
					var t = target[x];
					if (t && typeof t == "object") {
						du.updateWithObject(t, source[x], conv);
					} else {
						target[x] = conv ? du.coerceType(t, source[x]) : clone(source[x]);
					}
				}
			}
			return target;
		}, updateWithPattern:function (target, source, pattern, conv) {
			if (!source || !pattern) {
				return target;
			}
			for (var x in pattern) {
				if (x in source && !(x in empty)) {
					target[x] = conv ? du.coerceType(pattern[x], source[x]) : clone(source[x]);
				}
			}
			return target;
		}, merge:function (object, mixin) {
			if (mixin) {
				var otype = opts.call(object), mtype = opts.call(mixin), t, i, l, m;
				switch (mtype) {
				  case "[object Array]":
					if (mtype == otype) {
						t = new Array(Math.max(object.length, mixin.length));
						for (i = 0, l = t.length; i < l; ++i) {
							t[i] = du.merge(object[i], mixin[i]);
						}
						return t;
					}
					return mixin.slice(0);
				  case "[object Object]":
					if (mtype == otype && object) {
						t = dojo.delegate(object);
						for (i in mixin) {
							if (i in object) {
								l = object[i];
								m = mixin[i];
								if (m !== l) {
									t[i] = du.merge(l, m);
								}
							} else {
								t[i] = dojo.clone(mixin[i]);
							}
						}
						return t;
					}
					return dojo.clone(mixin);
				}
			}
			return mixin;
		}});
	})();
}

