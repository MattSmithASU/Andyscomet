/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.functional.lambda"]) {
	dojo._hasResource["dojox.lang.functional.lambda"] = true;
	dojo.provide("dojox.lang.functional.lambda");
	(function () {
		var df = dojox.lang.functional, lcache = {};
		var split = "ab".split(/a*/).length > 1 ? String.prototype.split : function (sep) {
			var r = this.split.call(this, sep), m = sep.exec(this);
			if (m && m.index == 0) {
				r.unshift("");
			}
			return r;
		};
		var lambda = function (s) {
			var args = [], sects = split.call(s, /\s*->\s*/m);
			if (sects.length > 1) {
				while (sects.length) {
					s = sects.pop();
					args = sects.pop().split(/\s*,\s*|\s+/m);
					if (sects.length) {
						sects.push("(function(" + args + "){return (" + s + ")})");
					}
				}
			} else {
				if (s.match(/\b_\b/)) {
					args = ["_"];
				} else {
					var l = s.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m), r = s.match(/[+\-*\/%&|\^\.=<>!]\s*$/m);
					if (l || r) {
						if (l) {
							args.push("$1");
							s = "$1" + s;
						}
						if (r) {
							args.push("$2");
							s = s + "$2";
						}
					} else {
						var vars = s.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*:|this|true|false|null|undefined|typeof|instanceof|in|delete|new|void|arguments|decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|escape|eval|isFinite|isNaN|parseFloat|parseInt|unescape|dojo|dijit|dojox|window|document|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, "").match(/([a-z_$][a-z_$\d]*)/gi) || [], t = {};
						dojo.forEach(vars, function (v) {
							if (!(v in t)) {
								args.push(v);
								t[v] = 1;
							}
						});
					}
				}
			}
			return {args:args, body:s};
		};
		var compose = function (a) {
			return a.length ? function () {
				var i = a.length - 1, x = df.lambda(a[i]).apply(this, arguments);
				for (--i; i >= 0; --i) {
					x = df.lambda(a[i]).call(this, x);
				}
				return x;
			} : function (x) {
				return x;
			};
		};
		dojo.mixin(df, {rawLambda:function (s) {
			return lambda(s);
		}, buildLambda:function (s) {
			s = lambda(s);
			return "function(" + s.args.join(",") + "){return (" + s.body + ");}";
		}, lambda:function (s) {
			if (typeof s == "function") {
				return s;
			}
			if (s instanceof Array) {
				return compose(s);
			}
			if (s in lcache) {
				return lcache[s];
			}
			s = lambda(s);
			return lcache[s] = new Function(s.args, "return (" + s.body + ");");
		}, clearLambdaCache:function () {
			lcache = {};
		}});
	})();
}

