/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.data.util.simpleFetch"]) {
	dojo._hasResource["dojo.data.util.simpleFetch"] = true;
	dojo.provide("dojo.data.util.simpleFetch");
	dojo.require("dojo.data.util.sorter");
	dojo.getObject("data.util.simpleFetch", true, dojo);
	dojo.data.util.simpleFetch.fetch = function (request) {
		request = request || {};
		if (!request.store) {
			request.store = this;
		}
		var self = this;
		var _errorHandler = function (errorData, requestObject) {
			if (requestObject.onError) {
				var scope = requestObject.scope || dojo.global;
				requestObject.onError.call(scope, errorData, requestObject);
			}
		};
		var _fetchHandler = function (items, requestObject) {
			var oldAbortFunction = requestObject.abort || null;
			var aborted = false;
			var startIndex = requestObject.start ? requestObject.start : 0;
			var endIndex = (requestObject.count && (requestObject.count !== Infinity)) ? (startIndex + requestObject.count) : items.length;
			requestObject.abort = function () {
				aborted = true;
				if (oldAbortFunction) {
					oldAbortFunction.call(requestObject);
				}
			};
			var scope = requestObject.scope || dojo.global;
			if (!requestObject.store) {
				requestObject.store = self;
			}
			if (requestObject.onBegin) {
				requestObject.onBegin.call(scope, items.length, requestObject);
			}
			if (requestObject.sort) {
				items.sort(dojo.data.util.sorter.createSortFunction(requestObject.sort, self));
			}
			if (requestObject.onItem) {
				for (var i = startIndex; (i < items.length) && (i < endIndex); ++i) {
					var item = items[i];
					if (!aborted) {
						requestObject.onItem.call(scope, item, requestObject);
					}
				}
			}
			if (requestObject.onComplete && !aborted) {
				var subset = null;
				if (!requestObject.onItem) {
					subset = items.slice(startIndex, endIndex);
				}
				requestObject.onComplete.call(scope, subset, requestObject);
			}
		};
		this._fetchItems(request, _fetchHandler, _errorHandler);
		return request;
	};
}

