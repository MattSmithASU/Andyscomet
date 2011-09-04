/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.rpc.JsonpService"]) {
	dojo._hasResource["dojo.rpc.JsonpService"] = true;
	dojo.provide("dojo.rpc.JsonpService");
	dojo.require("dojo.rpc.RpcService");
	dojo.require("dojo.io.script");
	dojo.declare("dojo.rpc.JsonpService", dojo.rpc.RpcService, {constructor:function (args, requiredArgs) {
		if (this.required) {
			if (requiredArgs) {
				dojo.mixin(this.required, requiredArgs);
			}
			dojo.forEach(this.required, function (req) {
				if (req == "" || req == undefined) {
					throw new Error("Required Service Argument not found: " + req);
				}
			});
		}
	}, strictArgChecks:false, bind:function (method, parameters, deferredRequestHandler, url) {
		var def = dojo.io.script.get({url:url || this.serviceUrl, callbackParamName:this.callbackParamName || "callback", content:this.createRequest(parameters), timeout:this.timeout, handleAs:"json", preventCache:true});
		def.addCallbacks(this.resultCallback(deferredRequestHandler), this.errorCallback(deferredRequestHandler));
	}, createRequest:function (parameters) {
		var params = (dojo.isArrayLike(parameters) && parameters.length == 1) ? parameters[0] : {};
		dojo.mixin(params, this.required);
		return params;
	}});
}

