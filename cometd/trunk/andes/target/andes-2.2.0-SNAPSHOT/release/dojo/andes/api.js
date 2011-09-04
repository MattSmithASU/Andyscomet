/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.api"]) {
	dojo._hasResource["andes.api"] = true;
	dojo.provide("andes.api");
	dojo.require("andes.rpc");
	dojo.require("andes.error");
	dojo.require("andes.messages");
	dojo.require("andes.timer");
	(function () {
		var startTime = null, requestInFlight = false, queue = [], tries = 0;
		var MAX_RETRIES = 5, RETRY_TIMEOUT = 2000;
		(function () {
			console.info("api set headers", andes.sessionId);
			andes._originalXhr = dojo.xhr;
			dojo.xhr = function (method, args) {
				var headers = args.headers = args.headers || {};
				headers["Client-Id"] = andes.sessionId;
				return andes._originalXhr.apply(dojo, arguments);
			};
		})();
		function prepRequest(req) {
			var tm = ((new Date()).getTime() - (startTime || (new Date()).getTime())) / 1000;
			return dojo.mixin({time:tm}, req || {});
		}
		function sendRequest(req) {
			var request = prepRequest(req.params);
			requestInFlight = true;
			andes.rpc[req.method](request).addCallbacks(function (result) {
				requestInFlight = false;
				req.dfd.callback(result);
				nextRequest();
			}, function (error) {
				if (error._rpcErrorObject) {
					req.dfd.errback(error);
					var mo = andes.messages.server();
					var msg = "<p>" + mo.message + "</p><div class='errMsg'>" + error.name + ": " + error.message;
					if (error._rpcErrorObject.code) {
						msg += "\n(code " + error._rpcErrorObject.code + ")";
					}
					msg += "</div><div class='action'>" + mo.action + "</div>";
					andes.error({title:mo.title, message:msg, errorType:andes.error.OK});
				} else {
					if (++tries <= MAX_RETRIES) {
						setTimeout(function () {
							sendRequest(req);
						}, RETRY_TIMEOUT);
					} else {
						req.dfd.errback(error);
						console.error(error);
						var mo = andes.messages.connection(MAX_RETRIES);
						console.dir(mo);
						andes.error({title:mo.title, message:mo.message + "<div class='action'>" + mo.action + "</div>", dialogType:andes.error.OK});
					}
				}
			});
		}
		function nextRequest() {
			if (!requestInFlight) {
				var req = queue.shift();
				if (req) {
					tries = 0;
					sendRequest(req);
				}
			}
		}
		function queueRequest(method, params) {
			var dfd = new dojo.Deferred();
			queue.push({dfd:dfd, method:method, params:params});
			if (queue.length == 1) {
				nextRequest();
			}
			return dfd;
		}
		andes.api = {open:function (params) {
			startTime = (new Date()).getTime();
			andes.timer = new andes.timer(startTime);
			var dfd = queueRequest("open-problem", params);
			dfd.addCallback(function (result) {
				andes.help.processStep(result);
			});
			return dfd;
		}, step:function (params) {
			var dfd = queueRequest("solution-step", params);
			dfd.addCallback(function (result) {
				andes.help.processStep(result);
			});
			return dfd;
		}, help:function (params) {
			return queueRequest("seek-help", params);
		}, suggestWord:function (params) {
			var dfd = queueRequest("suggest-word", params);
			dfd.addCallback(function (result) {
				andes.WordTip.processResults(result);
			});
			return dfd;
		}, recordAction:function (params) {
			queueRequest("record-action", params);
		}, close:function (params) {
			console.info("andes.api.close", params);
			return queueRequest("close-problem", params);
		}};
	})();
}

