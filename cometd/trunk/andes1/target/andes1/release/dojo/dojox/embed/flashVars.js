/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.embed.flashVars"]) {
	dojo._hasResource["dojox.embed.flashVars"] = true;
	dojo.provide("dojox.embed.flashVars");
	dojo.mixin(dojox.embed.flashVars, {serialize:function (n, o) {
		var esc = function (val) {
			if (typeof val == "string") {
				val = val.replace(/;/g, "_sc_");
				val = val.replace(/\./g, "_pr_");
				val = val.replace(/\:/g, "_cl_");
			}
			return val;
		};
		var df = dojox.embed.flashVars.serialize;
		var txt = "";
		if (dojo.isArray(o)) {
			for (var i = 0; i < o.length; i++) {
				txt += df(n + "." + i, esc(o[i])) + ";";
			}
			return txt.replace(/;{2,}/g, ";");
		} else {
			if (dojo.isObject(o)) {
				for (var nm in o) {
					txt += df(n + "." + nm, esc(o[nm])) + ";";
				}
				return txt.replace(/;{2,}/g, ";");
			}
		}
		return n + ":" + o;
	}});
}

