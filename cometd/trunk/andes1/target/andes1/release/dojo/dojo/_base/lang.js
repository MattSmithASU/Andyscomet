/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.lang"]) {
	dojo._hasResource["dojo._base.lang"] = true;
	dojo.provide("dojo._base.lang");
	(function () {
		var d = dojo, opts = Object.prototype.toString;
		dojo.isString = function (it) {
			return (typeof it == "string" || it instanceof String);
		};
		dojo.isArray = function (it) {
			return it && (it instanceof Array || typeof it == "array");
		};
		dojo.isFunction = function (it) {
			return opts.call(it) === "[object Function]";
		};
		dojo.isObject = function (it) {
			return it !== undefined && (it === null || typeof it == "object" || d.isArray(it) || d.isFunction(it));
		};
		dojo.isArrayLike = function (it) {
			return it && it !== undefined && !d.isString(it) && !d.isFunction(it) && !(it.tagName && it.tagName.toLowerCase() == "form") && (d.isArray(it) || isFinite(it.length));
		};
		dojo.isAlien = function (it) {
			return it && !d.isFunction(it) && /\{\s*\[native code\]\s*\}/.test(String(it));
		};
		dojo.extend = function (constructor, props) {
			for (var i = 1, l = arguments.length; i < l; i++) {
				d._mixin(constructor.prototype, arguments[i]);
			}
			return constructor;
		};
		dojo._hitchArgs = function (scope, method) {
			var pre = d._toArray(arguments, 2);
			var named = d.isString(method);
			return function () {
				var args = d._toArray(arguments);
				var f = named ? (scope || d.global)[method] : method;
				return f && f.apply(scope || this, pre.concat(args));
			};
		};
		dojo.hitch = function (scope, method) {
			if (arguments.length > 2) {
				return d._hitchArgs.apply(d, arguments);
			}
			if (!method) {
				method = scope;
				scope = null;
			}
			if (d.isString(method)) {
				scope = scope || d.global;
				if (!scope[method]) {
					throw (["dojo.hitch: scope[\"", method, "\"] is null (scope=\"", scope, "\")"].join(""));
				}
				return function () {
					return scope[method].apply(scope, arguments || []);
				};
			}
			return !scope ? method : function () {
				return method.apply(scope, arguments || []);
			};
		};
		dojo.delegate = dojo._delegate = (function () {
			function TMP() {
			}
			return function (obj, props) {
				TMP.prototype = obj;
				var tmp = new TMP();
				TMP.prototype = null;
				if (props) {
					d._mixin(tmp, props);
				}
				return tmp;
			};
		})();
		var efficient = function (obj, offset, startWith) {
			return (startWith || []).concat(Array.prototype.slice.call(obj, offset || 0));
		};
		var slow = function (obj, offset, startWith) {
			var arr = startWith || [];
			for (var x = offset || 0; x < obj.length; x++) {
				arr.push(obj[x]);
			}
			return arr;
		};
		dojo._toArray = d.isIE ? function (obj) {
			return ((obj.item) ? slow : efficient).apply(this, arguments);
		} : efficient;
		dojo.partial = function (method) {
			var arr = [null];
			return d.hitch.apply(d, arr.concat(d._toArray(arguments)));
		};
		var extraNames = d._extraNames, extraLen = extraNames.length, empty = {};
		dojo.clone = function (o) {
			if (!o || typeof o != "object" || d.isFunction(o)) {
				return o;
			}
			if (o.nodeType && "cloneNode" in o) {
				return o.cloneNode(true);
			}
			if (o instanceof Date) {
				return new Date(o.getTime());
			}
			if (o instanceof RegExp) {
				return new RegExp(o);
			}
			var r, i, l, s, name;
			if (d.isArray(o)) {
				r = [];
				for (i = 0, l = o.length; i < l; ++i) {
					if (i in o) {
						r.push(d.clone(o[i]));
					}
				}
			} else {
				r = o.constructor ? new o.constructor() : {};
			}
			for (name in o) {
				s = o[name];
				if (!(name in r) || (r[name] !== s && (!(name in empty) || empty[name] !== s))) {
					r[name] = d.clone(s);
				}
			}
			if (extraLen) {
				for (i = 0; i < extraLen; ++i) {
					name = extraNames[i];
					s = o[name];
					if (!(name in r) || (r[name] !== s && (!(name in empty) || empty[name] !== s))) {
						r[name] = s;
					}
				}
			}
			return r;
		};
		dojo.trim = String.prototype.trim ? function (str) {
			return str.trim();
		} : function (str) {
			return str.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
		};
		var _pattern = /\{([^\}]+)\}/g;
		dojo.replace = function (tmpl, map, pattern) {
			return tmpl.replace(pattern || _pattern, d.isFunction(map) ? map : function (_, k) {
				return d.getObject(k, false, map);
			});
		};
	})();
}

