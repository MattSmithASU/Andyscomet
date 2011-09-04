/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.wire.ml.Service"]) {
	dojo._hasResource["dojox.wire.ml.Service"] = true;
	dojo.provide("dojox.wire.ml.Service");
	dojo.provide("dojox.wire.ml.RestHandler");
	dojo.provide("dojox.wire.ml.XmlHandler");
	dojo.provide("dojox.wire.ml.JsonHandler");
	dojo.require("dijit._Widget");
	dojo.require("dojox.xml.parser");
	dojo.require("dojox.wire._base");
	dojo.require("dojox.wire.ml.util");
	dojo.declare("dojox.wire.ml.Service", dijit._Widget, {url:"", serviceUrl:"", serviceType:"", handlerClass:"", preventCache:true, postCreate:function () {
		this.handler = this._createHandler();
	}, _handlerClasses:{"TEXT":"dojox.wire.ml.RestHandler", "XML":"dojox.wire.ml.XmlHandler", "JSON":"dojox.wire.ml.JsonHandler", "JSON-RPC":"dojo.rpc.JsonService"}, _createHandler:function () {
		if (this.url) {
			var self = this;
			var d = dojo.xhrGet({url:this.url, handleAs:"json", sync:true});
			d.addCallback(function (result) {
				self.smd = result;
			});
			if (this.smd && !this.serviceUrl) {
				this.serviceUrl = (this.smd.serviceUrl || this.smd.serviceURL);
			}
		}
		var handlerClass = undefined;
		if (this.handlerClass) {
			handlerClass = dojox.wire._getClass(this.handlerClass);
		} else {
			if (this.serviceType) {
				handlerClass = this._handlerClasses[this.serviceType];
				if (handlerClass && dojo.isString(handlerClass)) {
					handlerClass = dojox.wire._getClass(handlerClass);
					this._handlerClasses[this.serviceType] = handlerClass;
				}
			} else {
				if (this.smd && this.smd.serviceType) {
					handlerClass = this._handlerClasses[this.smd.serviceType];
					if (handlerClass && dojo.isString(handlerClass)) {
						handlerClass = dojox.wire._getClass(handlerClass);
						this._handlerClasses[this.smd.serviceType] = handlerClass;
					}
				}
			}
		}
		if (!handlerClass) {
			return null;
		}
		return new handlerClass();
	}, callMethod:function (method, parameters) {
		var deferred = new dojo.Deferred();
		this.handler.bind(method, parameters, deferred, this.serviceUrl);
		return deferred;
	}});
	dojo.declare("dojox.wire.ml.RestHandler", null, {contentType:"text/plain", handleAs:"text", bind:function (method, parameters, deferred, url) {
		method = method.toUpperCase();
		var self = this;
		var args = {url:this._getUrl(method, parameters, url), contentType:this.contentType, handleAs:this.handleAs, headers:this.headers, preventCache:this.preventCache};
		var d = null;
		if (method == "POST") {
			args.postData = this._getContent(method, parameters);
			d = dojo.rawXhrPost(args);
		} else {
			if (method == "PUT") {
				args.putData = this._getContent(method, parameters);
				d = dojo.rawXhrPut(args);
			} else {
				if (method == "DELETE") {
					d = dojo.xhrDelete(args);
				} else {
					d = dojo.xhrGet(args);
				}
			}
		}
		d.addCallbacks(function (result) {
			deferred.callback(self._getResult(result));
		}, function (error) {
			deferred.errback(error);
		});
	}, _getUrl:function (method, parameters, url) {
		var query;
		if (method == "GET" || method == "DELETE") {
			if (parameters.length > 0) {
				query = parameters[0];
			}
		} else {
			if (parameters.length > 1) {
				query = parameters[1];
			}
		}
		if (query) {
			var queryString = "";
			for (var name in query) {
				var value = query[name];
				if (value) {
					value = encodeURIComponent(value);
					var variable = "{" + name + "}";
					var index = url.indexOf(variable);
					if (index >= 0) {
						url = url.substring(0, index) + value + url.substring(index + variable.length);
					} else {
						if (queryString) {
							queryString += "&";
						}
						queryString += (name + "=" + value);
					}
				}
			}
			if (queryString) {
				url += "?" + queryString;
			}
		}
		return url;
	}, _getContent:function (method, parameters) {
		if (method == "POST" || method == "PUT") {
			return (parameters ? parameters[0] : null);
		} else {
			return null;
		}
	}, _getResult:function (data) {
		return data;
	}});
	dojo.declare("dojox.wire.ml.XmlHandler", dojox.wire.ml.RestHandler, {contentType:"text/xml", handleAs:"xml", _getContent:function (method, parameters) {
		var content = null;
		if (method == "POST" || method == "PUT") {
			var p = parameters[0];
			if (p) {
				if (dojo.isString(p)) {
					content = p;
				} else {
					var element = p;
					if (element instanceof dojox.wire.ml.XmlElement) {
						element = element.element;
					} else {
						if (element.nodeType === 9) {
							element = element.documentElement;
						}
					}
					var declaration = "<?xml version=\"1.0\"?>";
					content = declaration + dojox.xml.parser.innerXML(element);
				}
			}
		}
		return content;
	}, _getResult:function (data) {
		if (data) {
			data = new dojox.wire.ml.XmlElement(data);
		}
		return data;
	}});
	dojo.declare("dojox.wire.ml.JsonHandler", dojox.wire.ml.RestHandler, {contentType:"text/json", handleAs:"json", headers:{"Accept":"*/json"}, _getContent:function (method, parameters) {
		var content = null;
		if (method == "POST" || method == "PUT") {
			var p = (parameters ? parameters[0] : undefined);
			if (p) {
				if (dojo.isString(p)) {
					content = p;
				} else {
					content = dojo.toJson(p);
				}
			}
		}
		return content;
	}});
}

