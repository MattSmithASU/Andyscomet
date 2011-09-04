/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.util.oo"]) {
	dojo._hasResource["dojox.drawing.util.oo"] = true;
	dojo.provide("dojox.drawing.util.oo");
	dojox.drawing.util.oo = {declare:function () {
		var f, o, ext = 0, a = arguments;
		if (a.length < 2) {
			console.error("gfx.oo.declare; not enough arguments");
		}
		if (a.length == 2) {
			f = a[0];
			o = a[1];
		} else {
			a = Array.prototype.slice.call(arguments);
			o = a.pop();
			f = a.pop();
			ext = 1;
		}
		for (var n in o) {
			f.prototype[n] = o[n];
		}
		if (ext) {
			a.unshift(f);
			f = this.extend.apply(this, a);
		}
		return f;
	}, extend:function () {
		var a = arguments, sub = a[0];
		if (a.length < 2) {
			console.error("gfx.oo.extend; not enough arguments");
		}
		var f = function () {
			for (var i = 1; i < a.length; i++) {
				a[i].prototype.constructor.apply(this, arguments);
			}
			sub.prototype.constructor.apply(this, arguments);
		};
		for (var i = 1; i < a.length; i++) {
			for (var n in a[i].prototype) {
				f.prototype[n] = a[i].prototype[n];
			}
		}
		for (n in sub.prototype) {
			f.prototype[n] = sub.prototype[n];
		}
		return f;
	}};
}

