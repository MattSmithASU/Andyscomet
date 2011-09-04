/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.data.util.sorter"]) {
	dojo._hasResource["dojo.data.util.sorter"] = true;
	dojo.provide("dojo.data.util.sorter");
	dojo.getObject("data.util.sorter", true, dojo);
	dojo.data.util.sorter.basicComparator = function (a, b) {
		var r = -1;
		if (a === null) {
			a = undefined;
		}
		if (b === null) {
			b = undefined;
		}
		if (a == b) {
			r = 0;
		} else {
			if (a > b || a == null) {
				r = 1;
			}
		}
		return r;
	};
	dojo.data.util.sorter.createSortFunction = function (sortSpec, store) {
		var sortFunctions = [];
		function createSortFunction(attr, dir, comp, s) {
			return function (itemA, itemB) {
				var a = s.getValue(itemA, attr);
				var b = s.getValue(itemB, attr);
				return dir * comp(a, b);
			};
		}
		var sortAttribute;
		var map = store.comparatorMap;
		var bc = dojo.data.util.sorter.basicComparator;
		for (var i = 0; i < sortSpec.length; i++) {
			sortAttribute = sortSpec[i];
			var attr = sortAttribute.attribute;
			if (attr) {
				var dir = (sortAttribute.descending) ? -1 : 1;
				var comp = bc;
				if (map) {
					if (typeof attr !== "string" && ("toString" in attr)) {
						attr = attr.toString();
					}
					comp = map[attr] || bc;
				}
				sortFunctions.push(createSortFunction(attr, dir, comp, store));
			}
		}
		return function (rowA, rowB) {
			var i = 0;
			while (i < sortFunctions.length) {
				var ret = sortFunctions[i++](rowA, rowB);
				if (ret !== 0) {
					return ret;
				}
			}
			return 0;
		};
	};
}

