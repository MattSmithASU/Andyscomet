/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.functional.listcomp"]) {
	dojo._hasResource["dojox.lang.functional.listcomp"] = true;
	dojo.provide("dojox.lang.functional.listcomp");
	(function () {
		var g_re = /\bfor\b|\bif\b/gm;
		var listcomp = function (s) {
			var frag = s.split(g_re), act = s.match(g_re), head = ["var r = [];"], tail = [], i = 0, l = act.length;
			while (i < l) {
				var a = act[i], f = frag[++i];
				if (a == "for" && !/^\s*\(\s*(;|var)/.test(f)) {
					f = f.replace(/^\s*\(/, "(var ");
				}
				head.push(a, f, "{");
				tail.push("}");
			}
			return head.join("") + "r.push(" + frag[0] + ");" + tail.join("") + "return r;";
		};
		dojo.mixin(dojox.lang.functional, {buildListcomp:function (s) {
			return "function(){" + listcomp(s) + "}";
		}, compileListcomp:function (s) {
			return new Function([], listcomp(s));
		}, listcomp:function (s) {
			return (new Function([], listcomp(s)))();
		}});
	})();
}

