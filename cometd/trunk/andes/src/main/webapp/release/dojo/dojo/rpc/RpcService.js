/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.rpc.RpcService"]) {
	dojo._hasResource["dojo.rpc.RpcService"] = true;
	dojo.provide("dojo.rpc.RpcService");
	dojo.declare("dojo.rpc.RpcService", null, {constructor:function (args) {
		if (args) {
			if ((dojo.isString(args)) || (args instanceof dojo._Url)) {
				if (args instanceof dojo._Url) {
					var url = args + "";
				} else {
					url = args;
				}
				var def = dojo.xhrGet({url:url, handleAs:"json-comment-optional", sync:true});
				def.addCallback(this, "processSmd");
				def.addErrback(function () {
					throw new Error("Unable to load SMD from " + args);
				});
			} else {
				if (args.smdStr) {
					this.processSmd(dojo.eval("(" + args.smdStr + ")"));
				} else {
					if (args.serviceUrl) {
						this.serviceUrl = args.serviceUrl;
					}
					this.timeout = args.timeout || 3000;
					if ("strictArgChecks" in args) {
						this.strictArgChecks = args.strictArgChecks;
					}
					this.processSmd(args);
				}
			}
		}
	}, strictArgChecks:true, serviceUrl:"", parseResults:function (obj) {
		return obj;
	}, errorCallback:function (deferredRequestHandler) {
		return function (data) {
			deferredRequestHandler.errback(data.message);
		};
	}, resultCallback:function (deferredRequestHandler) {
		var tf = dojo.hitch(this, function (obj) {
			if (obj.error != null) {
				var err;
				if (typeof obj.error == "object") {
					err = new Error(obj.error.message);
					err.code = obj.error.code;
					err.error = obj.error.error;
				} else {
					err = new Error(obj.error);
				}
				err.id = obj.id;
				err.errorObject = obj;
				deferredRequestHandler.errback(err);
			} else {
				deferredRequestHandler.callback(this.parseResults(obj));
			}
		});
		return tf;
	}, generateMethod:function (method, parameters, url) {
		return dojo.hitch(this, function () {
			var deferredRequestHandler = new dojo.Deferred();
			if ((this.strictArgChecks) && (parameters != null) && (arguments.length != parameters.length)) {
				throw new Error("Invalid number of parameters for remote method.");
			} else {
				this.bind(method, dojo._toArray(arguments), deferredRequestHandler, url);
			}
			return deferredRequestHandler;
		});
	}, processSmd:function (object) {
		if (object.methods) {
			dojo.forEach(object.methods, function (m) {
				if (m && m.name) {
					this[m.name] = this.generateMethod(m.name, m.parameters, m.url || m.serviceUrl || m.serviceURL);
					if (!dojo.isFunction(this[m.name])) {
						throw new Error("RpcService: Failed to create" + m.name + "()");
					}
				}
			}, this);
		}
		this.serviceUrl = object.serviceUrl || object.serviceURL;
		this.required = object.required;
		this.smd = object;
	}});
}

