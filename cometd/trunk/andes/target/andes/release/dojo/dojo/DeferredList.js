/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.DeferredList"]) {
	dojo._hasResource["dojo.DeferredList"] = true;
	dojo.provide("dojo.DeferredList");
	dojo.DeferredList = function (list, fireOnOneCallback, fireOnOneErrback, consumeErrors, canceller) {
		var resultList = [];
		dojo.Deferred.call(this);
		var self = this;
		if (list.length === 0 && !fireOnOneCallback) {
			this.resolve([0, []]);
		}
		var finished = 0;
		dojo.forEach(list, function (item, i) {
			item.then(function (result) {
				if (fireOnOneCallback) {
					self.resolve([i, result]);
				} else {
					addResult(true, result);
				}
			}, function (error) {
				if (fireOnOneErrback) {
					self.reject(error);
				} else {
					addResult(false, error);
				}
				if (consumeErrors) {
					return null;
				}
				throw error;
			});
			function addResult(succeeded, result) {
				resultList[i] = [succeeded, result];
				finished++;
				if (finished === list.length) {
					self.resolve(resultList);
				}
			}
		});
	};
	dojo.DeferredList.prototype = new dojo.Deferred();
	dojo.DeferredList.prototype.gatherResults = function (deferredList) {
		var d = new dojo.DeferredList(deferredList, false, true, false);
		d.addCallback(function (results) {
			var ret = [];
			dojo.forEach(results, function (result) {
				ret.push(result[1]);
			});
			return ret;
		});
		return d;
	};
}

