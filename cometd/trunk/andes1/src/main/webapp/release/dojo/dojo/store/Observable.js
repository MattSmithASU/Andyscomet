/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.Observable"]) {
	dojo._hasResource["dojo.store.Observable"] = true;
	dojo.provide("dojo.store.Observable");
	dojo.getObject("store", true, dojo);
	dojo.store.Observable = function (store) {
		var queryUpdaters = [], revision = 0;
		store.notify = function (object, existingId) {
			revision++;
			var updaters = queryUpdaters.slice();
			for (var i = 0, l = updaters.length; i < l; i++) {
				updaters[i](object, existingId);
			}
		};
		var originalQuery = store.query;
		store.query = function (query, options) {
			options = options || {};
			var results = originalQuery.apply(this, arguments);
			if (results && results.forEach) {
				var nonPagedOptions = dojo.mixin({}, options);
				delete nonPagedOptions.start;
				delete nonPagedOptions.count;
				var queryExecutor = store.queryEngine && store.queryEngine(query, nonPagedOptions);
				var queryRevision = revision;
				var listeners = [], queryUpdater;
				results.observe = function (listener, includeObjectUpdates) {
					if (listeners.push(listener) == 1) {
						queryUpdaters.push(queryUpdater = function (changed, existingId) {
							dojo.when(results, function (resultsArray) {
								var atEnd = resultsArray.length != options.count;
								var i;
								if (++queryRevision != revision) {
									throw new Error("Query is out of date, you must observe() the query prior to any data modifications");
								}
								var removedObject, removedFrom = -1, insertedInto = -1;
								if (existingId) {
									for (i = 0, l = resultsArray.length; i < l; i++) {
										var object = resultsArray[i];
										if (store.getIdentity(object) == existingId) {
											removedObject = object;
											removedFrom = i;
											if (queryExecutor || !changed) {
												resultsArray.splice(i, 1);
											}
											break;
										}
									}
								}
								if (queryExecutor) {
									if (changed && (queryExecutor.matches ? queryExecutor.matches(changed) : queryExecutor([changed]).length)) {
										if (removedFrom > -1) {
											resultsArray.splice(removedFrom, 0, changed);
										} else {
											resultsArray.push(changed);
										}
										insertedInto = dojo.indexOf(queryExecutor(resultsArray), changed);
										if ((options.start && insertedInto == 0) || (!atEnd && insertedInto == resultsArray.length - 1)) {
											insertedInto = -1;
										}
									}
								} else {
									if (changed) {
										insertedInto = removedFrom >= 0 ? removedFrom : (store.defaultIndex || 0);
									}
								}
								if ((removedFrom > -1 || insertedInto > -1) && (includeObjectUpdates || !queryExecutor || (removedFrom != insertedInto))) {
									var copyListeners = listeners.slice();
									for (i = 0; listener = copyListeners[i]; i++) {
										listener(changed || removedObject, removedFrom, insertedInto);
									}
								}
							});
						});
					}
					return {cancel:function () {
						listeners.splice(dojo.indexOf(listeners, listener), 1);
						if (!listeners.length) {
							queryUpdaters.splice(dojo.indexOf(queryUpdaters, queryUpdater), 1);
						}
					}};
				};
			}
			return results;
		};
		var inMethod;
		function whenFinished(method, action) {
			var original = store[method];
			if (original) {
				store[method] = function (value) {
					if (inMethod) {
						return original.apply(this, arguments);
					}
					inMethod = true;
					try {
						return dojo.when(original.apply(this, arguments), function (results) {
							action((typeof results == "object" && results) || value);
							return results;
						});
					}
					finally {
						inMethod = false;
					}
				};
			}
		}
		whenFinished("put", function (object) {
			store.notify(object, store.getIdentity(object));
		});
		whenFinished("add", function (object) {
			store.notify(object);
		});
		whenFinished("remove", function (id) {
			store.notify(undefined, id);
		});
		return store;
	};
}

