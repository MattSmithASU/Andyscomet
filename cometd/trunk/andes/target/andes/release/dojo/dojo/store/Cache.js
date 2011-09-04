/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.Cache"]) {
	dojo._hasResource["dojo.store.Cache"] = true;
	dojo.provide("dojo.store.Cache");
	dojo.getObject("store", true, dojo);
	dojo.store.Cache = function (masterStore, cachingStore, options) {
		options = options || {};
		return dojo.delegate(masterStore, {query:function (query, directives) {
			var results = masterStore.query(query, directives);
			results.forEach(function (object) {
				if (!options.isLoaded || options.isLoaded(object)) {
					cachingStore.put(object);
				}
			});
			return results;
		}, queryEngine:masterStore.queryEngine || cachingStore.queryEngine, get:function (id, directives) {
			return dojo.when(cachingStore.get(id), function (result) {
				return result || dojo.when(masterStore.get(id, directives), function (result) {
					if (result) {
						cachingStore.put(result, {id:id});
					}
					return result;
				});
			});
		}, add:function (object, directives) {
			return dojo.when(masterStore.add(object, directives), function (result) {
				return cachingStore.add(typeof result == "object" ? result : object, directives);
			});
		}, put:function (object, directives) {
			cachingStore.remove((directives && directives.id) || this.getIdentity(object));
			return dojo.when(masterStore.put(object, directives), function (result) {
				return cachingStore.put(typeof result == "object" ? result : object, directives);
			});
		}, remove:function (id, directives) {
			return dojo.when(masterStore.remove(id, directives), function (result) {
				return cachingStore.remove(id, directives);
			});
		}, evict:function (id) {
			return cachingStore.remove(id);
		}});
	};
}

