/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.array"]) {
	dojo._hasResource["dojo._base.array"] = true;
	dojo.provide("dojo._base.array");
	dojo.require("dojo._base.lang");
	(function () {
		var _getParts = function (arr, obj, cb) {
			return [(typeof arr == "string") ? arr.split("") : arr, obj || dojo.global, (typeof cb == "string") ? new Function("item", "index", "array", cb) : cb];
		};
		var everyOrSome = function (every, arr, callback, thisObject) {
			var _p = _getParts(arr, thisObject, callback);
			arr = _p[0];
			for (var i = 0, l = arr.length; i < l; ++i) {
				var result = !!_p[2].call(_p[1], arr[i], i, arr);
				if (every ^ result) {
					return result;
				}
			}
			return every;
		};
		dojo.mixin(dojo, {indexOf:function (array, value, fromIndex, findLast) {
			var step = 1, end = array.length || 0, i = 0;
			if (findLast) {
				i = end - 1;
				step = end = -1;
			}
			if (fromIndex != undefined) {
				i = fromIndex;
			}
			if ((findLast && i > end) || i < end) {
				for (; i != end; i += step) {
					if (array[i] == value) {
						return i;
					}
				}
			}
			return -1;
		}, lastIndexOf:function (array, value, fromIndex) {
			return dojo.indexOf(array, value, fromIndex, true);
		}, forEach:function (arr, callback, thisObject) {
			if (!arr || !arr.length) {
				return;
			}
			var _p = _getParts(arr, thisObject, callback);
			arr = _p[0];
			for (var i = 0, l = arr.length; i < l; ++i) {
				_p[2].call(_p[1], arr[i], i, arr);
			}
		}, every:function (arr, callback, thisObject) {
			return everyOrSome(true, arr, callback, thisObject);
		}, some:function (arr, callback, thisObject) {
			return everyOrSome(false, arr, callback, thisObject);
		}, map:function (arr, callback, thisObject) {
			var _p = _getParts(arr, thisObject, callback);
			arr = _p[0];
			var outArr = (arguments[3] ? (new arguments[3]()) : []);
			for (var i = 0, l = arr.length; i < l; ++i) {
				outArr.push(_p[2].call(_p[1], arr[i], i, arr));
			}
			return outArr;
		}, filter:function (arr, callback, thisObject) {
			var _p = _getParts(arr, thisObject, callback);
			arr = _p[0];
			var outArr = [];
			for (var i = 0, l = arr.length; i < l; ++i) {
				if (_p[2].call(_p[1], arr[i], i, arr)) {
					outArr.push(arr[i]);
				}
			}
			return outArr;
		}});
	})();
}

