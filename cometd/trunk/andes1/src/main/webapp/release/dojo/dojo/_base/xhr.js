/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.xhr"]) {
	dojo._hasResource["dojo._base.xhr"] = true;
	dojo.provide("dojo._base.xhr");
	dojo.require("dojo._base.Deferred");
	dojo.require("dojo._base.json");
	dojo.require("dojo._base.lang");
	dojo.require("dojo._base.query");
	(function () {
		var _d = dojo, cfg = _d.config;
		function setValue(obj, name, value) {
			if (value === null) {
				return;
			}
			var val = obj[name];
			if (typeof val == "string") {
				obj[name] = [val, value];
			} else {
				if (_d.isArray(val)) {
					val.push(value);
				} else {
					obj[name] = value;
				}
			}
		}
		dojo.fieldToObject = function (inputNode) {
			var ret = null;
			var item = _d.byId(inputNode);
			if (item) {
				var _in = item.name;
				var type = (item.type || "").toLowerCase();
				if (_in && type && !item.disabled) {
					if (type == "radio" || type == "checkbox") {
						if (item.checked) {
							ret = item.value;
						}
					} else {
						if (item.multiple) {
							ret = [];
							_d.query("option", item).forEach(function (opt) {
								if (opt.selected) {
									ret.push(opt.value);
								}
							});
						} else {
							ret = item.value;
						}
					}
				}
			}
			return ret;
		};
		dojo.formToObject = function (formNode) {
			var ret = {};
			var exclude = "file|submit|image|reset|button|";
			_d.forEach(dojo.byId(formNode).elements, function (item) {
				var _in = item.name;
				var type = (item.type || "").toLowerCase();
				if (_in && type && exclude.indexOf(type) == -1 && !item.disabled) {
					setValue(ret, _in, _d.fieldToObject(item));
					if (type == "image") {
						ret[_in + ".x"] = ret[_in + ".y"] = ret[_in].x = ret[_in].y = 0;
					}
				}
			});
			return ret;
		};
		dojo.objectToQuery = function (map) {
			var enc = encodeURIComponent;
			var pairs = [];
			var backstop = {};
			for (var name in map) {
				var value = map[name];
				if (value != backstop[name]) {
					var assign = enc(name) + "=";
					if (_d.isArray(value)) {
						for (var i = 0; i < value.length; i++) {
							pairs.push(assign + enc(value[i]));
						}
					} else {
						pairs.push(assign + enc(value));
					}
				}
			}
			return pairs.join("&");
		};
		dojo.formToQuery = function (formNode) {
			return _d.objectToQuery(_d.formToObject(formNode));
		};
		dojo.formToJson = function (formNode, prettyPrint) {
			return _d.toJson(_d.formToObject(formNode), prettyPrint);
		};
		dojo.queryToObject = function (str) {
			var ret = {};
			var qp = str.split("&");
			var dec = decodeURIComponent;
			_d.forEach(qp, function (item) {
				if (item.length) {
					var parts = item.split("=");
					var name = dec(parts.shift());
					var val = dec(parts.join("="));
					if (typeof ret[name] == "string") {
						ret[name] = [ret[name]];
					}
					if (_d.isArray(ret[name])) {
						ret[name].push(val);
					} else {
						ret[name] = val;
					}
				}
			});
			return ret;
		};
		dojo._blockAsync = false;
		var handlers = _d._contentHandlers = dojo.contentHandlers = {text:function (xhr) {
			return xhr.responseText;
		}, json:function (xhr) {
			return _d.fromJson(xhr.responseText || null);
		}, "json-comment-filtered":function (xhr) {
			if (!dojo.config.useCommentedJson) {
				console.warn("Consider using the standard mimetype:application/json." + " json-commenting can introduce security issues. To" + " decrease the chances of hijacking, use the standard the 'json' handler and" + " prefix your json with: {}&&\n" + "Use djConfig.useCommentedJson=true to turn off this message.");
			}
			var value = xhr.responseText;
			var cStartIdx = value.indexOf("/*");
			var cEndIdx = value.lastIndexOf("*/");
			if (cStartIdx == -1 || cEndIdx == -1) {
				throw new Error("JSON was not comment filtered");
			}
			return _d.fromJson(value.substring(cStartIdx + 2, cEndIdx));
		}, javascript:function (xhr) {
			return _d.eval(xhr.responseText);
		}, xml:function (xhr) {
			var result = xhr.responseXML;
			if (_d.isIE && (!result || !result.documentElement)) {
				var ms = function (n) {
					return "MSXML" + n + ".DOMDocument";
				};
				var dp = ["Microsoft.XMLDOM", ms(6), ms(4), ms(3), ms(2)];
				_d.some(dp, function (p) {
					try {
						var dom = new ActiveXObject(p);
						dom.async = false;
						dom.loadXML(xhr.responseText);
						result = dom;
					}
					catch (e) {
						return false;
					}
					return true;
				});
			}
			return result;
		}, "json-comment-optional":function (xhr) {
			if (xhr.responseText && /^[^{\[]*\/\*/.test(xhr.responseText)) {
				return handlers["json-comment-filtered"](xhr);
			} else {
				return handlers["json"](xhr);
			}
		}};
		dojo._ioSetArgs = function (args, canceller, okHandler, errHandler) {
			var ioArgs = {args:args, url:args.url};
			var formObject = null;
			if (args.form) {
				var form = _d.byId(args.form);
				var actnNode = form.getAttributeNode("action");
				ioArgs.url = ioArgs.url || (actnNode ? actnNode.value : null);
				formObject = _d.formToObject(form);
			}
			var miArgs = [{}];
			if (formObject) {
				miArgs.push(formObject);
			}
			if (args.content) {
				miArgs.push(args.content);
			}
			if (args.preventCache) {
				miArgs.push({"dojo.preventCache":new Date().valueOf()});
			}
			ioArgs.query = _d.objectToQuery(_d.mixin.apply(null, miArgs));
			ioArgs.handleAs = args.handleAs || "text";
			var d = new _d.Deferred(canceller);
			d.addCallbacks(okHandler, function (error) {
				return errHandler(error, d);
			});
			var ld = args.load;
			if (ld && _d.isFunction(ld)) {
				d.addCallback(function (value) {
					return ld.call(args, value, ioArgs);
				});
			}
			var err = args.error;
			if (err && _d.isFunction(err)) {
				d.addErrback(function (value) {
					return err.call(args, value, ioArgs);
				});
			}
			var handle = args.handle;
			if (handle && _d.isFunction(handle)) {
				d.addBoth(function (value) {
					return handle.call(args, value, ioArgs);
				});
			}
			if (cfg.ioPublish && _d.publish && ioArgs.args.ioPublish !== false) {
				d.addCallbacks(function (res) {
					_d.publish("/dojo/io/load", [d, res]);
					return res;
				}, function (res) {
					_d.publish("/dojo/io/error", [d, res]);
					return res;
				});
				d.addBoth(function (res) {
					_d.publish("/dojo/io/done", [d, res]);
					return res;
				});
			}
			d.ioArgs = ioArgs;
			return d;
		};
		var _deferredCancel = function (dfd) {
			dfd.canceled = true;
			var xhr = dfd.ioArgs.xhr;
			var _at = typeof xhr.abort;
			if (_at == "function" || _at == "object" || _at == "unknown") {
				xhr.abort();
			}
			var err = dfd.ioArgs.error;
			if (!err) {
				err = new Error("xhr cancelled");
				err.dojoType = "cancel";
			}
			return err;
		};
		var _deferredOk = function (dfd) {
			var ret = handlers[dfd.ioArgs.handleAs](dfd.ioArgs.xhr);
			return ret === undefined ? null : ret;
		};
		var _deferError = function (error, dfd) {
			if (!dfd.ioArgs.args.failOk) {
				console.error(error);
			}
			return error;
		};
		var _inFlightIntvl = null;
		var _inFlight = [];
		var _pubCount = 0;
		var _checkPubCount = function (dfd) {
			if (_pubCount <= 0) {
				_pubCount = 0;
				if (cfg.ioPublish && _d.publish && (!dfd || dfd && dfd.ioArgs.args.ioPublish !== false)) {
					_d.publish("/dojo/io/stop");
				}
			}
		};
		var _watchInFlight = function () {
			var now = (new Date()).getTime();
			if (!_d._blockAsync) {
				for (var i = 0, tif; i < _inFlight.length && (tif = _inFlight[i]); i++) {
					var dfd = tif.dfd;
					var func = function () {
						if (!dfd || dfd.canceled || !tif.validCheck(dfd)) {
							_inFlight.splice(i--, 1);
							_pubCount -= 1;
						} else {
							if (tif.ioCheck(dfd)) {
								_inFlight.splice(i--, 1);
								tif.resHandle(dfd);
								_pubCount -= 1;
							} else {
								if (dfd.startTime) {
									if (dfd.startTime + (dfd.ioArgs.args.timeout || 0) < now) {
										_inFlight.splice(i--, 1);
										var err = new Error("timeout exceeded");
										err.dojoType = "timeout";
										dfd.errback(err);
										dfd.cancel();
										_pubCount -= 1;
									}
								}
							}
						}
					};
					if (dojo.config.debugAtAllCosts) {
						func.call(this);
					} else {
						try {
							func.call(this);
						}
						catch (e) {
							dfd.errback(e);
						}
					}
				}
			}
			_checkPubCount(dfd);
			if (!_inFlight.length) {
				clearInterval(_inFlightIntvl);
				_inFlightIntvl = null;
				return;
			}
		};
		dojo._ioCancelAll = function () {
			try {
				_d.forEach(_inFlight, function (i) {
					try {
						i.dfd.cancel();
					}
					catch (e) {
					}
				});
			}
			catch (e) {
			}
		};
		if (_d.isIE) {
			_d.addOnWindowUnload(_d._ioCancelAll);
		}
		_d._ioNotifyStart = function (dfd) {
			if (cfg.ioPublish && _d.publish && dfd.ioArgs.args.ioPublish !== false) {
				if (!_pubCount) {
					_d.publish("/dojo/io/start");
				}
				_pubCount += 1;
				_d.publish("/dojo/io/send", [dfd]);
			}
		};
		_d._ioWatch = function (dfd, validCheck, ioCheck, resHandle) {
			var args = dfd.ioArgs.args;
			if (args.timeout) {
				dfd.startTime = (new Date()).getTime();
			}
			_inFlight.push({dfd:dfd, validCheck:validCheck, ioCheck:ioCheck, resHandle:resHandle});
			if (!_inFlightIntvl) {
				_inFlightIntvl = setInterval(_watchInFlight, 50);
			}
			if (args.sync) {
				_watchInFlight();
			}
		};
		var _defaultContentType = "application/x-www-form-urlencoded";
		var _validCheck = function (dfd) {
			return dfd.ioArgs.xhr.readyState;
		};
		var _ioCheck = function (dfd) {
			return 4 == dfd.ioArgs.xhr.readyState;
		};
		var _resHandle = function (dfd) {
			var xhr = dfd.ioArgs.xhr;
			if (_d._isDocumentOk(xhr)) {
				dfd.callback(dfd);
			} else {
				var err = new Error("Unable to load " + dfd.ioArgs.url + " status:" + xhr.status);
				err.status = xhr.status;
				err.responseText = xhr.responseText;
				dfd.errback(err);
			}
		};
		dojo._ioAddQueryToUrl = function (ioArgs) {
			if (ioArgs.query.length) {
				ioArgs.url += (ioArgs.url.indexOf("?") == -1 ? "?" : "&") + ioArgs.query;
				ioArgs.query = null;
			}
		};
		dojo.xhr = function (method, args, hasBody) {
			var dfd = _d._ioSetArgs(args, _deferredCancel, _deferredOk, _deferError);
			var ioArgs = dfd.ioArgs;
			var xhr = ioArgs.xhr = _d._xhrObj(ioArgs.args);
			if (!xhr) {
				dfd.cancel();
				return dfd;
			}
			if ("postData" in args) {
				ioArgs.query = args.postData;
			} else {
				if ("putData" in args) {
					ioArgs.query = args.putData;
				} else {
					if ("rawBody" in args) {
						ioArgs.query = args.rawBody;
					} else {
						if ((arguments.length > 2 && !hasBody) || "POST|PUT".indexOf(method.toUpperCase()) == -1) {
							_d._ioAddQueryToUrl(ioArgs);
						}
					}
				}
			}
			xhr.open(method, ioArgs.url, args.sync !== true, args.user || undefined, args.password || undefined);
			if (args.headers) {
				for (var hdr in args.headers) {
					if (hdr.toLowerCase() === "content-type" && !args.contentType) {
						args.contentType = args.headers[hdr];
					} else {
						if (args.headers[hdr]) {
							xhr.setRequestHeader(hdr, args.headers[hdr]);
						}
					}
				}
			}
			xhr.setRequestHeader("Content-Type", args.contentType || _defaultContentType);
			if (!args.headers || !("X-Requested-With" in args.headers)) {
				xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			}
			_d._ioNotifyStart(dfd);
			if (dojo.config.debugAtAllCosts) {
				xhr.send(ioArgs.query);
			} else {
				try {
					xhr.send(ioArgs.query);
				}
				catch (e) {
					ioArgs.error = e;
					dfd.cancel();
				}
			}
			_d._ioWatch(dfd, _validCheck, _ioCheck, _resHandle);
			xhr = null;
			return dfd;
		};
		dojo.xhrGet = function (args) {
			return _d.xhr("GET", args);
		};
		dojo.rawXhrPost = dojo.xhrPost = function (args) {
			return _d.xhr("POST", args, true);
		};
		dojo.rawXhrPut = dojo.xhrPut = function (args) {
			return _d.xhr("PUT", args, true);
		};
		dojo.xhrDelete = function (args) {
			return _d.xhr("DELETE", args);
		};
	})();
}

