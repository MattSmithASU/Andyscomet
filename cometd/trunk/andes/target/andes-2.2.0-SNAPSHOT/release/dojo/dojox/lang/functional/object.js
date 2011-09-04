/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.functional.object"]) {
	dojo._hasResource["dojox.lang.functional.object"] = true;
	dojo.provide("dojox.lang.functional.object");
	dojo.require("dojox.lang.functional.lambda");
	(function () {
		var d = dojo, df = dojox.lang.functional, empty = {};
		d.mixin(df, {keys:function (obj) {
			var t = [];
			for (var i in obj) {
				if (!(i in empty)) {
					t.push(i);
				}
			}
			return t;
		}, values:function (obj) {
			var t = [];
			for (var i in obj) {
				if (!(i in empty)) {
					t.push(obj[i]);
				}
			}
			return t;
		}, filterIn:function (obj, f, o) {
			o = o || d.global;
			f = df.lambda(f);
			var t = {}, v, i;
			for (i in obj) {
				if (!(i in empty)) {
					v = obj[i];
					if (f.call(o, v, i, obj)) {
						t[i] = v;
					}
				}
			}
			return t;
		}, forIn:function (obj, f, o) {
			o = o || d.global;
			f = df.lambda(f);
			for (var i in obj) {
				if (!(i in empty)) {
					f.call(o, obj[i], i, obj);
				}
			}
			return o;
		}, mapIn:function (obj, f, o) {
			o = o || d.global;
			f = df.lambda(f);
			var t = {}, i;
			for (i in obj) {
				if (!(i in empty)) {
					t[i] = f.call(o, obj[i], i, obj);
				}
			}
			return t;
		}});
	})();
}

