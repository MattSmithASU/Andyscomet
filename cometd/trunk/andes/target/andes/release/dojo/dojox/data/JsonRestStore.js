/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.JsonRestStore"]) {
	dojo._hasResource["dojox.data.JsonRestStore"] = true;
	dojo.provide("dojox.data.JsonRestStore");
	dojo.require("dojox.rpc.JsonRest");
	dojo.require("dojox.data.ServiceStore");
	dojo.declare("dojox.data.JsonRestStore", dojox.data.ServiceStore, {constructor:function (options) {
		dojo.connect(dojox.rpc.Rest._index, "onUpdate", this, function (obj, attrName, oldValue, newValue) {
			var prefix = this.service.servicePath;
			if (!obj.__id) {
				console.log("no id on updated object ", obj);
			} else {
				if (obj.__id.substring(0, prefix.length) == prefix) {
					this.onSet(obj, attrName, oldValue, newValue);
				}
			}
		});
		this.idAttribute = this.idAttribute || "id";
		if (typeof options.target == "string") {
			options.target = options.target.match(/\/$/) || this.allowNoTrailingSlash ? options.target : (options.target + "/");
			if (!this.service) {
				this.service = dojox.rpc.JsonRest.services[options.target] || dojox.rpc.Rest(options.target, true);
			}
		}
		dojox.rpc.JsonRest.registerService(this.service, options.target, this.schema);
		this.schema = this.service._schema = this.schema || this.service._schema || {};
		this.service._store = this;
		this.service.idAsRef = this.idAsRef;
		this.schema._idAttr = this.idAttribute;
		var constructor = dojox.rpc.JsonRest.getConstructor(this.service);
		var self = this;
		this._constructor = function (data) {
			constructor.call(this, data);
			self.onNew(this);
		};
		this._constructor.prototype = constructor.prototype;
		this._index = dojox.rpc.Rest._index;
	}, loadReferencedSchema:true, idAsRef:false, referenceIntegrity:true, target:"", allowNoTrailingSlash:false, newItem:function (data, parentInfo) {
		data = new this._constructor(data);
		if (parentInfo) {
			var values = this.getValue(parentInfo.parent, parentInfo.attribute, []);
			values = values.concat([data]);
			data.__parent = values;
			this.setValue(parentInfo.parent, parentInfo.attribute, values);
		}
		return data;
	}, deleteItem:function (item) {
		var checked = [];
		var store = dojox.data._getStoreForItem(item) || this;
		if (this.referenceIntegrity) {
			dojox.rpc.JsonRest._saveNotNeeded = true;
			var index = dojox.rpc.Rest._index;
			var fixReferences = function (parent) {
				var toSplice;
				checked.push(parent);
				parent.__checked = 1;
				for (var i in parent) {
					if (i.substring(0, 2) != "__") {
						var value = parent[i];
						if (value == item) {
							if (parent != index) {
								if (parent instanceof Array) {
									(toSplice = toSplice || []).push(i);
								} else {
									(dojox.data._getStoreForItem(parent) || store).unsetAttribute(parent, i);
								}
							}
						} else {
							if ((typeof value == "object") && value) {
								if (!value.__checked) {
									fixReferences(value);
								}
								if (typeof value.__checked == "object" && parent != index) {
									(dojox.data._getStoreForItem(parent) || store).setValue(parent, i, value.__checked);
								}
							}
						}
					}
				}
				if (toSplice) {
					i = toSplice.length;
					parent = parent.__checked = parent.concat();
					while (i--) {
						parent.splice(toSplice[i], 1);
					}
					return parent;
				}
				return null;
			};
			fixReferences(index);
			dojox.rpc.JsonRest._saveNotNeeded = false;
			var i = 0;
			while (checked[i]) {
				delete checked[i++].__checked;
			}
		}
		dojox.rpc.JsonRest.deleteObject(item);
		store.onDelete(item);
	}, changing:function (item, _deleting) {
		dojox.rpc.JsonRest.changing(item, _deleting);
	}, cancelChanging:function (object) {
		if (!object.__id) {
			return;
		}
		dirtyObjects = dirty = dojox.rpc.JsonRest.getDirtyObjects();
		for (var i = 0; i < dirtyObjects.length; i++) {
			var dirty = dirtyObjects[i];
			if (object == dirty.object) {
				dirtyObjects.splice(i, 1);
				return;
			}
		}
	}, setValue:function (item, attribute, value) {
		var old = item[attribute];
		var store = item.__id ? dojox.data._getStoreForItem(item) : this;
		if (dojox.json.schema && store.schema && store.schema.properties) {
			dojox.json.schema.mustBeValid(dojox.json.schema.checkPropertyChange(value, store.schema.properties[attribute]));
		}
		if (attribute == store.idAttribute) {
			throw new Error("Can not change the identity attribute for an item");
		}
		store.changing(item);
		item[attribute] = value;
		if (value && !value.__parent) {
			value.__parent = item;
		}
		store.onSet(item, attribute, old, value);
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
	}, save:function (kwArgs) {
		if (!(kwArgs && kwArgs.global)) {
			(kwArgs = kwArgs || {}).service = this.service;
		}
		if ("syncMode" in kwArgs ? kwArgs.syncMode : this.syncMode) {
			dojox.rpc._sync = true;
		}
		var actions = dojox.rpc.JsonRest.commit(kwArgs);
		this.serverVersion = this._updates && this._updates.length;
		return actions;
	}, revert:function (kwArgs) {
		dojox.rpc.JsonRest.revert(kwArgs && kwArgs.global && this.service);
	}, isDirty:function (item) {
		return dojox.rpc.JsonRest.isDirty(item, this);
	}, isItem:function (item, anyStore) {
		return item && item.__id && (anyStore || this.service == dojox.rpc.JsonRest.getServiceAndId(item.__id).service);
	}, _doQuery:function (args) {
		var query = typeof args.queryStr == "string" ? args.queryStr : args.query;
		var deferred = dojox.rpc.JsonRest.query(this.service, query, args);
		var self = this;
		if (this.loadReferencedSchema) {
			deferred.addCallback(function (result) {
				var contentType = deferred.ioArgs && deferred.ioArgs.xhr && deferred.ioArgs.xhr.getResponseHeader("Content-Type");
				var schemaRef = contentType && contentType.match(/definedby\s*=\s*([^;]*)/);
				if (contentType && !schemaRef) {
					schemaRef = deferred.ioArgs.xhr.getResponseHeader("Link");
					schemaRef = schemaRef && schemaRef.match(/<([^>]*)>;\s*rel="?definedby"?/);
				}
				schemaRef = schemaRef && schemaRef[1];
				if (schemaRef) {
					var serviceAndId = dojox.rpc.JsonRest.getServiceAndId((self.target + schemaRef).replace(/^(.*\/)?(\w+:\/\/)|[^\/\.]+\/\.\.\/|^.*\/(\/)/, "$2$3"));
					var schemaDeferred = dojox.rpc.JsonRest.byId(serviceAndId.service, serviceAndId.id);
					schemaDeferred.addCallbacks(function (newSchema) {
						dojo.mixin(self.schema, newSchema);
						return result;
					}, function (error) {
						console.error(error);
						return result;
					});
					return schemaDeferred;
				}
				return undefined;
			});
		}
		return deferred;
	}, _processResults:function (results, deferred) {
		var count = results.length;
		return {totalCount:deferred.fullLength || (deferred.request.count == count ? (deferred.request.start || 0) + count * 2 : count), items:results};
	}, getConstructor:function () {
		return this._constructor;
	}, getIdentity:function (item) {
		var id = item.__clientId || item.__id;
		if (!id) {
			return id;
		}
		var prefix = this.service.servicePath.replace(/[^\/]*$/, "");
		return id.substring(0, prefix.length) != prefix ? id : id.substring(prefix.length);
	}, fetchItemByIdentity:function (args) {
		var id = args.identity;
		var store = this;
		if (id.toString().match(/^(\w*:)?\//)) {
			var serviceAndId = dojox.rpc.JsonRest.getServiceAndId(id);
			store = serviceAndId.service._store;
			args.identity = serviceAndId.id;
		}
		args._prefix = store.service.servicePath.replace(/[^\/]*$/, "");
		return store.inherited(arguments);
	}, onSet:function () {
	}, onNew:function () {
	}, onDelete:function () {
	}, getFeatures:function () {
		var features = this.inherited(arguments);
		features["dojo.data.api.Write"] = true;
		features["dojo.data.api.Notification"] = true;
		return features;
	}, getParent:function (item) {
		return item && item.__parent;
	}});
	dojox.data.JsonRestStore.getStore = function (options, Class) {
		if (typeof options.target == "string") {
			options.target = options.target.match(/\/$/) || options.allowNoTrailingSlash ? options.target : (options.target + "/");
			var store = (dojox.rpc.JsonRest.services[options.target] || {})._store;
			if (store) {
				return store;
			}
		}
		return new (Class || dojox.data.JsonRestStore)(options);
	};
	dojox.data._getStoreForItem = function (item) {
		if (item.__id) {
			var serviceAndId = dojox.rpc.JsonRest.getServiceAndId(item.__id);
			if (serviceAndId && serviceAndId.service._store) {
				return serviceAndId.service._store;
			} else {
				var servicePath = item.__id.toString().match(/.*\//)[0];
				return new dojox.data.JsonRestStore({target:servicePath});
			}
		}
		return null;
	};
	dojox.json.ref._useRefs = true;
}

