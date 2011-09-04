/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.io.xhrPlugins"]) {
	dojo._hasResource["dojox.io.xhrPlugins"] = true;
	dojo.provide("dojox.io.xhrPlugins");
	dojo.require("dojo.AdapterRegistry");
	dojo.require("dojo._base.xhr");
	(function () {
		var registry;
		var plainXhr;
		function getPlainXhr() {
			return plainXhr = dojox.io.xhrPlugins.plainXhr = plainXhr || dojo._defaultXhr || dojo.xhr;
		}
		dojox.io.xhrPlugins.register = function () {
			var plainXhr = getPlainXhr();
			if (!registry) {
				registry = new dojo.AdapterRegistry();
				dojo[dojo._defaultXhr ? "_defaultXhr" : "xhr"] = function (method, args, hasBody) {
					return registry.match.apply(registry, arguments);
				};
				registry.register("xhr", function (method, args) {
					if (!args.url.match(/^\w*:\/\//)) {
						return true;
					}
					var root = window.location.href.match(/^.*?\/\/.*?\//)[0];
					return args.url.substring(0, root.length) == root;
				}, plainXhr);
			}
			return registry.register.apply(registry, arguments);
		};
		dojox.io.xhrPlugins.addProxy = function (proxyUrl) {
			var plainXhr = getPlainXhr();
			dojox.io.xhrPlugins.register("proxy", function (method, args) {
				return true;
			}, function (method, args, hasBody) {
				args.url = proxyUrl + encodeURIComponent(args.url);
				return plainXhr.call(dojo, method, args, hasBody);
			});
		};
		var csXhrSupport;
		dojox.io.xhrPlugins.addCrossSiteXhr = function (url, httpAdapter) {
			var plainXhr = getPlainXhr();
			if (csXhrSupport === undefined && window.XMLHttpRequest) {
				try {
					var xhr = new XMLHttpRequest();
					xhr.open("GET", "http://testing-cross-domain-capability.com", true);
					csXhrSupport = true;
					dojo.config.noRequestedWithHeaders = true;
				}
				catch (e) {
					csXhrSupport = false;
				}
			}
			dojox.io.xhrPlugins.register("cs-xhr", function (method, args) {
				return (csXhrSupport || (window.XDomainRequest && args.sync !== true && (method == "GET" || method == "POST" || httpAdapter))) && (args.url.substring(0, url.length) == url);
			}, csXhrSupport ? plainXhr : function () {
				var normalXhrObj = dojo._xhrObj;
				dojo._xhrObj = function () {
					var xdr = new XDomainRequest();
					xdr.readyState = 1;
					xdr.setRequestHeader = function () {
					};
					xdr.getResponseHeader = function (header) {
						return header == "Content-Type" ? xdr.contentType : null;
					};
					function handler(status, readyState) {
						return function () {
							xdr.readyState = readyState;
							xdr.status = status;
						};
					}
					xdr.onload = handler(200, 4);
					xdr.onprogress = handler(200, 3);
					xdr.onerror = handler(404, 4);
					return xdr;
				};
				var dfd = (httpAdapter ? httpAdapter(getPlainXhr()) : getPlainXhr()).apply(dojo, arguments);
				dojo._xhrObj = normalXhrObj;
				return dfd;
			});
		};
		dojox.io.xhrPlugins.fullHttpAdapter = function (plainXhr, noRawBody) {
			return function (method, args, hasBody) {
				var content = {};
				var parameters = {};
				if (method != "GET") {
					parameters["http-method"] = method;
					if (args.putData && noRawBody) {
						content["http-content"] = args.putData;
						delete args.putData;
						hasBody = false;
					}
					if (args.postData && noRawBody) {
						content["http-content"] = args.postData;
						delete args.postData;
						hasBody = false;
					}
					method = "POST";
				}
				for (var i in args.headers) {
					var parameterName = i.match(/^X-/) ? i.substring(2).replace(/-/g, "_").toLowerCase() : ("http-" + i);
					parameters[parameterName] = args.headers[i];
				}
				args.query = dojo.objectToQuery(parameters);
				dojo._ioAddQueryToUrl(args);
				args.content = dojo.mixin(args.content || {}, content);
				return plainXhr.call(dojo, method, args, hasBody);
			};
		};
	})();
}

