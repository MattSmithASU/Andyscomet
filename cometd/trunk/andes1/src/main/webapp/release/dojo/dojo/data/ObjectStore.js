/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.data.ObjectStore"]) {
	dojo._hasResource["dojo.data.ObjectStore"] = true;
	dojo.provide("dojo.data.ObjectStore");
	dojo.require("dojo.regexp");
	dojo.declare("dojo.data.ObjectStore", null, {objectStore:null, constructor:function (options) {
		dojo.mixin(this, options);
	}, labelProperty:"label", getValue:function (item, property, defaultValue) {
		return typeof item.get === "function" ? item.get(property) : property in item ? item[property] : defaultValue;
	}, getValues:function (item, property) {
		var val = this.getValue(item, property);
		return val instanceof Array ? val : val === undefined ? [] : [val];
	}, getAttributes:function (item) {
		var res = [];
		for (var i in item) {
			if (item.hasOwnProperty(i) && !(i.charAt(0) == "_" && i.charAt(1) == "_")) {
				res.push(i);
			}
		}
		return res;
	}, hasAttribute:function (item, attribute) {
		return attribute in item;
	}, containsValue:function (item, attribute, value) {
		return dojo.indexOf(this.getValues(item, attribute), value) > -1;
	}, isItem:function (item) {
		return (typeof item == "object") && item && !(item instanceof Date);
	}, isItemLoaded:function (item) {
		return item && typeof item.load !== "function";
	}, loadItem:function (args) {
		var item;
		if (typeof args.item.load === "function") {
			dojo.when(args.item.load(), function (result) {
				item = result;
				var func = result instanceof Error ? args.onError : args.onItem;
				if (func) {
					func.call(args.scope, result);
				}
			});
		} else {
			if (args.onItem) {
				args.onItem.call(args.scope, args.item);
			}
		}
		return item;
	}, close:function (request) {
		return request && request.abort && request.abort();
	}, fetch:function (args) {
		args = dojo.delegate(args, args && args.queryOptions);
		var self = this;
		var scope = args.scope || self;
		var query = args.query;
		if (typeof query == "object") {
			query = dojo.delegate(query);
			for (var i in query) {
				var required = query[i];
				if (typeof required == "string") {
					query[i] = RegExp("^" + dojo.regexp.escapeString(required, "*?").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", args.ignoreCase ? "mi" : "m");
				}
			}
		}
		var results = this.objectStore.query(query, args);
		dojo.when(results.total, function (totalCount) {
			dojo.when(results, function (results) {
				if (args.onBegin) {
					args.onBegin.call(scope, totalCount || results.length, args);
				}
				if (args.onItem) {
					for (var i = 0; i < results.length; i++) {
						args.onItem.call(scope, results[i], args);
					}
				}
				if (args.onComplete) {
					args.onComplete.call(scope, args.onItem ? null : results, args);
				}
				return results;
			}, errorHandler);
		}, errorHandler);
		function errorHandler(error) {
			if (args.onError) {
				args.onError.call(scope, error, args);
			}
		}
		args.abort = function () {
			if (results.cancel) {
				results.cancel();
			}
		};
		if (results.observe) {
			results.observe(function (object, removedFrom, insertedInto) {
				if (dojo.indexOf(self._dirtyObjects, object) == -1) {
					if (removedFrom == -1) {
						self.onNew(object);
					} else {
						if (insertedInto == -1) {
							self.onDelete(object);
						} else {
							for (var i in object) {
								if (i != self.idProperty) {
									self.onSet(object, i, null, object[i]);
								}
							}
						}
					}
				}
			});
		}
		this.onFetch(results);
		args.store = this;
		return args;
	}, getFeatures:function () {
		return {"dojo.data.api.Read":!!this.objectStore.get, "dojo.data.api.Identity":true, "dojo.data.api.Write":!!this.objectStore.put, "dojo.data.api.Notification":true};
	}, getLabel:function (item) {
		if (this.isItem(item)) {
			return this.getValue(item, this.labelProperty);
		}
		return undefined;
	}, getLabelAttributes:function (item) {
		return [this.labelProperty];
	}, getIdentity:function (item) {
		return item.getId ? item.getId() : item[this.objectStore.idProperty || "id"];
	}, getIdentityAttributes:function (item) {
		return [this.objectStore.idProperty];
	}, fetchItemByIdentity:function (args) {
		var item;
		dojo.when(this.objectStore.get(args.identity), function (result) {
			item = result;
			args.onItem.call(args.scope, result);
		}, function (error) {
			args.onError.call(args.scope, error);
		});
		return item;
	}, newItem:function (data, parentInfo) {
		if (parentInfo) {
			var values = this.getValue(parentInfo.parent, parentInfo.attribute, []);
			values = values.concat([data]);
			data.__parent = values;
			this.setValue(parentInfo.parent, parentInfo.attribute, values);
		}
		this._dirtyObjects.push({object:data, save:true});
		this.onNew(data);
		return data;
	}, deleteItem:function (item) {
		this.changing(item, true);
		this.onDelete(item);
	}, setValue:function (item, attribute, value) {
		var old = item[attribute];
		this.changing(item);
		item[attribute] = value;
		this.onSet(item, attribute, old, value);
	}, setValues:function (item, attribute, values) {
		if (!dojo.isArray(values)) {
			throw new Error("setValues expects to be passed an Array object as its value");
		}
		this.setValue(item, attribute, values);
	}, unsetAttribute:function (item, attribute) {
		this.changing(item);
		var old = item[attribute];
		delete item[attribute];
		this.onSet(item, attribute, old, undefined);
	}, _dirtyObjects:[], changing:function (object, _deleting) {
		object.__isDirty = true;
		for (var i = 0; i < this._dirtyObjects.length; i++) {
			var dirty = this._dirtyObjects[i];
			if (object == dirty.object) {
				if (_deleting) {
					dirty.object = false;
					if (!this._saveNotNeeded) {
						dirty.save = true;
					}
				}
				return;
			}
		}
		var old = object instanceof Array ? [] : {};
		for (i in object) {
			if (object.hasOwnProperty(i)) {
				old[i] = object[i];
			}
		}
		this._dirtyObjects.push({object:!_deleting && object, old:old, save:!this._saveNotNeeded});
	}, save:function (kwArgs) {
		kwArgs = kwArgs || {};
		var result, actions = [];
		var alreadyRecorded = {};
		var savingObjects = [];
		var self;
		var dirtyObjects = this._dirtyObjects;
		var left = dirtyObjects.length;
		try {
			dojo.connect(kwArgs, "onError", function () {
				if (kwArgs.revertOnError !== false) {
					var postCommitDirtyObjects = dirtyObjects;
					dirtyObjects = savingObjects;
					var numDirty = 0;
					jr.revert();
					self._dirtyObjects = postCommitDirtyObjects;
				} else {
					self._dirtyObjects = dirtyObject.concat(savingObjects);
				}
			});
			if (this.objectStore.transaction) {
				var transaction = this.objectStore.transaction();
			}
			for (var i = 0; i < dirtyObjects.length; i++) {
				var dirty = dirtyObjects[i];
				var object = dirty.object;
				var old = dirty.old;
				delete object.__isDirty;
				if (object) {
					result = this.objectStore.put(object, {overwrite:!!old});
				} else {
					result = this.objectStore.remove(this.getIdentity(old));
				}
				savingObjects.push(dirty);
				dirtyObjects.splice(i--, 1);
				dojo.when(result, function (value) {
					if (!(--left)) {
						if (kwArgs.onComplete) {
							kwArgs.onComplete.call(kwArgs.scope, actions);
						}
					}
				}, function (value) {
					left = -1;
					kwArgs.onError.call(kwArgs.scope, value);
				});
			}
			if (transaction) {
				transaction.commit();
			}
		}
		catch (e) {
			kwArgs.onError.call(kwArgs.scope, value);
		}
	}, revert:function (kwArgs) {
		var dirtyObjects = this._dirtyObjects;
		for (var i = dirtyObjects.length; i > 0; ) {
			i--;
			var dirty = dirtyObjects[i];
			var object = dirty.object;
			var old = dirty.old;
			if (object && old) {
				for (var j in old) {
					if (old.hasOwnProperty(j) && object[j] !== old[j]) {
						this.onSet(object, j, object[j], old[j]);
						object[j] = old[j];
					}
				}
				for (j in object) {
					if (!old.hasOwnProperty(j)) {
						this.onSet(object, j, object[j]);
						delete object[j];
					}
				}
			} else {
				if (!old) {
					this.onDelete(object);
				} else {
					this.onNew(old);
				}
			}
			delete (object || old).__isDirty;
			dirtyObjects.splice(i, 1);
		}
	}, isDirty:function (item) {
		if (!item) {
			return !!this._dirtyObjects.length;
		}
		return item.__isDirty;
	}, onSet:function () {
	}, onNew:function () {
	}, onDelete:function () {
	}, onFetch:function (results) {
	}});
}

