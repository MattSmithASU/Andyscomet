/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.rpc.JsonService"]) {
	dojo._hasResource["dojo.rpc.JsonService"] = true;
	dojo.provide("dojo.rpc.JsonService");
	dojo.require("dojo.rpc.RpcService");
	dojo.declare("dojo.rpc.JsonService", dojo.rpc.RpcService, {bustCache:false, contentType:"application/json-rpc", lastSubmissionId:0, callRemote:function (method, params) {
		var deferred = new dojo.Deferred();
		this.bind(method, params, deferred);
		return deferred;
	}, bind:function (method, parameters, deferredRequestHandler, url) {
		var def = dojo.rawXhrPost({url:url || this.serviceUrl, postData:this.createRequest(method, parameters), contentType:this.contentType, timeout:this.timeout, handleAs:"json-comment-optional"});
		def.addCallbacks(this.resultCallback(deferredRequestHandler), this.errorCallback(deferredRequestHandler));
	}, createRequest:function (method, params) {
		var req = {"params":params, "method":method, "id":++this.lastSubmissionId};
		var data = dojo.toJson(req);
		return data;
	}, parseResults:function (obj) {
		if (dojo.isObject(obj)) {
			if ("result" in obj) {
				return obj.result;
			}
			if ("Result" in obj) {
				return obj.Result;
			}
			if ("ResultSet" in obj) {
				return obj.ResultSet;
			}
		}
		return obj;
	}});
}

