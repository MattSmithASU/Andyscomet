/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.PersevereStore"]) {
	dojo._hasResource["dojox.data.PersevereStore"] = true;
	dojo.provide("dojox.data.PersevereStore");
	dojo.require("dojox.data.JsonQueryRestStore");
	dojo.require("dojox.rpc.Client");
	dojox.json.ref.serializeFunctions = true;
	dojo.declare("dojox.data.PersevereStore", dojox.data.JsonQueryRestStore, {useFullIdInQueries:true, jsonQueryPagination:false});
	dojox.data.PersevereStore.getStores = function (path, sync) {
		path = (path && (path.match(/\/$/) ? path : (path + "/"))) || "/";
		if (path.match(/^\w*:\/\//)) {
			dojo.require("dojox.io.xhrScriptPlugin");
			dojox.io.xhrScriptPlugin(path, "callback", dojox.io.xhrPlugins.fullHttpAdapter);
		}
		var plainXhr = dojo.xhr;
		dojo.xhr = function (method, args) {
			(args.headers = args.headers || {})["Server-Methods"] = "false";
			return plainXhr.apply(dojo, arguments);
		};
		var rootService = dojox.rpc.Rest(path, true);
		dojox.rpc._sync = sync;
		var dfd = rootService("Class/");
		var results;
		var stores = {};
		var callId = 0;
		dfd.addCallback(function (schemas) {
			dojox.json.ref.resolveJson(schemas, {index:dojox.rpc.Rest._index, idPrefix:"/Class/", assignAbsoluteIds:true});
			function setupHierarchy(schema) {
				if (schema["extends"] && schema["extends"].prototype) {
					if (!schema.prototype || !schema.prototype.isPrototypeOf(schema["extends"].prototype)) {
						setupHierarchy(schema["extends"]);
						dojox.rpc.Rest._index[schema.prototype.__id] = schema.prototype = dojo.mixin(dojo.delegate(schema["extends"].prototype), schema.prototype);
					}
				}
			}
			function setupMethods(methodsDefinitions, methodsTarget) {
				if (methodsDefinitions && methodsTarget) {
					for (var j in methodsDefinitions) {
						var methodDef = methodsDefinitions[j];
						if (methodDef.runAt != "client" && !methodsTarget[j]) {
							methodsTarget[j] = (function (methodName) {
								return function () {
									var deferred = dojo.rawXhrPost({url:this.__id, postData:dojox.json.ref.toJson({method:methodName, id:callId++, params:dojo._toArray(arguments)}), handleAs:"json"});
									deferred.addCallback(function (response) {
										return response.error ? new Error(response.error) : response.result;
									});
									return deferred;
								};
							})(j);
						}
					}
				}
			}
			for (var i in schemas) {
				if (typeof schemas[i] == "object") {
					var schema = schemas[i];
					setupHierarchy(schema);
					setupMethods(schema.methods, schema.prototype = schema.prototype || {});
					setupMethods(schema.staticMethods, schema);
					stores[schemas[i].id] = new dojox.data.PersevereStore({target:new dojo._Url(path, schemas[i].id) + "/", schema:schema});
				}
			}
			return (results = stores);
		});
		dojo.xhr = plainXhr;
		return sync ? results : dfd;
	};
	dojox.data.PersevereStore.addProxy = function () {
		dojo.require("dojox.io.xhrPlugins");
		dojox.io.xhrPlugins.addProxy("/proxy/");
	};
}

