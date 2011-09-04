/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.util.SimpleQueryEngine"]) {
	dojo._hasResource["dojo.store.util.SimpleQueryEngine"] = true;
	dojo.provide("dojo.store.util.SimpleQueryEngine");
	dojo.getObject("store.util", true, dojo);
	dojo.store.util.SimpleQueryEngine = function (query, options) {
		switch (typeof query) {
		  default:
			throw new Error("Can not query with a " + typeof query);
		  case "object":
		  case "undefined":
			var queryObject = query;
			query = function (object) {
				for (var key in queryObject) {
					var required = queryObject[key];
					if (required && required.test) {
						if (!required.test(object[key])) {
							return false;
						}
					} else {
						if (required != object[key]) {
							return false;
						}
					}
				}
				return true;
			};
			break;
		  case "string":
			if (!this[query]) {
				throw new Error("No filter function " + query + " was found in store");
			}
			query = this[query];
		  case "function":
		}
		function execute(array) {
			var results = dojo.filter(array, query);
			if (options && options.sort) {
				results.sort(function (a, b) {
					for (var sort, i = 0; sort = options.sort[i]; i++) {
						var aValue = a[sort.attribute];
						var bValue = b[sort.attribute];
						if (aValue != bValue) {
							return !!sort.descending == aValue > bValue ? -1 : 1;
						}
					}
					return 0;
				});
			}
			if (options && (options.start || options.count)) {
				var total = results.length;
				results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
				results.total = total;
			}
			return results;
		}
		execute.matches = query;
		return execute;
	};
}

