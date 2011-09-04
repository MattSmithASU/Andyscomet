/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.util.QueryResults"]) {
	dojo._hasResource["dojo.store.util.QueryResults"] = true;
	dojo.provide("dojo.store.util.QueryResults");
	dojo.getObject("store.util", true, dojo);
	dojo.store.util.QueryResults = function (results) {
		if (!results) {
			return results;
		}
		if (results.then) {
			results = dojo.delegate(results);
		}
		function addIterativeMethod(method) {
			if (!results[method]) {
				results[method] = function () {
					var args = arguments;
					return dojo.when(results, function (results) {
						Array.prototype.unshift.call(args, results);
						return dojo.store.util.QueryResults(dojo[method].apply(dojo, args));
					});
				};
			}
		}
		addIterativeMethod("forEach");
		addIterativeMethod("filter");
		addIterativeMethod("map");
		if (!results.total) {
			results.total = dojo.when(results, function (results) {
				return results.length;
			});
		}
		return results;
	};
}

