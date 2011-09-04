/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.cometd.RestChannels"]) {
	dojo._hasResource["dojox.cometd.RestChannels"] = true;
	dojo.provide("dojox.cometd.RestChannels");
	dojo.require("dojox.rpc.Client");
	dojo.requireIf(dojox.data && !!dojox.data.JsonRestStore, "dojox.data.restListener");
	(function () {
		dojo.declare("dojox.cometd.RestChannels", null, {constructor:function (options) {
			dojo.mixin(this, options);
			if (dojox.rpc.Rest && this.autoSubscribeRoot) {
				var defaultGet = dojox.rpc.Rest._get;
				var self = this;
				dojox.rpc.Rest._get = function (service, id) {
					var defaultXhrGet = dojo.xhrGet;
					dojo.xhrGet = function (r) {
						var autoSubscribeRoot = self.autoSubscribeRoot;
						return (autoSubscribeRoot && r.url.substring(0, autoSubscribeRoot.length) == autoSubscribeRoot) ? self.get(r.url, r) : defaultXhrGet(r);
					};
					var result = defaultGet.apply(this, arguments);
					dojo.xhrGet = defaultXhrGet;
					return result;
				};
			}
		}, absoluteUrl:function (baseUrl, relativeUrl) {
			return new dojo._Url(baseUrl, relativeUrl) + "";
		}, acceptType:"application/rest+json,application/http;q=0.9,*/*;q=0.7", subscriptions:{}, subCallbacks:{}, autoReconnectTime:3000, reloadDataOnReconnect:true, sendAsJson:false, url:"/channels", autoSubscribeRoot:"/", open:function () {
			this.started = true;
			if (!this.connected) {
				this.connectionId = dojox.rpc.Client.clientId;
				var clientIdHeader = this.createdClientId ? "Client-Id" : "Create-Client-Id";
				this.createdClientId = true;
				var headers = {Accept:this.acceptType};
				headers[clientIdHeader] = this.connectionId;
				var dfd = dojo.xhrPost({headers:headers, url:this.url, noStatus:true});
				var self = this;
				this.lastIndex = 0;
				var onerror, onprogress = function (data) {
					if (typeof dojo == "undefined") {
						return null;
					}
					if (xhr && xhr.status > 400) {
						return onerror(true);
					}
					if (typeof data == "string") {
						data = data.substring(self.lastIndex);
					}
					var contentType = xhr && (xhr.contentType || xhr.getResponseHeader("Content-Type")) || (typeof data != "string" && "already json");
					var error = self.onprogress(xhr, data, contentType);
					if (error) {
						if (onerror()) {
							return new Error(error);
						}
					}
					if (!xhr || xhr.readyState == 4) {
						xhr = null;
						if (self.connected) {
							self.connected = false;
							self.open();
						}
					}
					return data;
				};
				onerror = function (error) {
					if (xhr && xhr.status == 409) {
						console.log("multiple tabs/windows open, polling");
						self.disconnected();
						return null;
					}
					self.createdClientId = false;
					self.disconnected();
					return error;
				};
				dfd.addCallbacks(onprogress, onerror);
				var xhr = dfd.ioArgs.xhr;
				if (xhr) {
					xhr.onreadystatechange = function () {
						var responseText;
						try {
							if (xhr.readyState == 3) {
								self.readyState = 3;
								responseText = xhr.responseText;
							}
						}
						catch (e) {
						}
						if (typeof responseText == "string") {
							onprogress(responseText);
						}
					};
				}
				if (window.attachEvent) {
					window.attachEvent("onunload", function () {
						self.connected = false;
						if (xhr) {
							xhr.abort();
						}
					});
				}
				this.connected = true;
			}
		}, _send:function (method, args, data) {
			if (this.sendAsJson) {
				args.postData = dojo.toJson({target:args.url, method:method, content:data, params:args.content, subscribe:args.headers["Subscribe"]});
				args.url = this.url;
				method = "POST";
			} else {
				args.postData = dojo.toJson(data);
			}
			return dojo.xhr(method, args, args.postData);
		}, subscribe:function (channel, args) {
			args = args || {};
			args.url = this.absoluteUrl(this.url, channel);
			if (args.headers) {
				delete args.headers.Range;
			}
			var oldSince = this.subscriptions[channel];
			var method = args.method || "HEAD";
			var since = args.since;
			var callback = args.callback;
			var headers = args.headers || (args.headers = {});
			this.subscriptions[channel] = since || oldSince || 0;
			var oldCallback = this.subCallbacks[channel];
			if (callback) {
				this.subCallbacks[channel] = oldCallback ? function (m) {
					oldCallback(m);
					callback(m);
				} : callback;
			}
			if (!this.connected) {
				this.open();
			}
			if (oldSince === undefined || oldSince != since) {
				headers["Cache-Control"] = "max-age=0";
				since = typeof since == "number" ? new Date(since).toUTCString() : since;
				if (since) {
					headers["Subscribe-Since"] = since;
				}
				headers["Subscribe"] = args.unsubscribe ? "none" : "*";
				var dfd = this._send(method, args);
				var self = this;
				dfd.addBoth(function (result) {
					var xhr = dfd.ioArgs.xhr;
					if (!(result instanceof Error)) {
						if (args.confirmation) {
							args.confirmation();
						}
					}
					if (xhr && xhr.getResponseHeader("Subscribed") == "OK") {
						var lastMod = xhr.getResponseHeader("Last-Modified");
						if (xhr.responseText) {
							self.subscriptions[channel] = lastMod || new Date().toUTCString();
						} else {
							return null;
						}
					} else {
						if (xhr && !(result instanceof Error)) {
							delete self.subscriptions[channel];
						}
					}
					if (!(result instanceof Error)) {
						var message = {responseText:xhr && xhr.responseText, channel:channel, getResponseHeader:function (name) {
							return xhr.getResponseHeader(name);
						}, getAllResponseHeaders:function () {
							return xhr.getAllResponseHeaders();
						}, result:result};
						if (self.subCallbacks[channel]) {
							self.subCallbacks[channel](message);
						}
					} else {
						if (self.subCallbacks[channel]) {
							self.subCallbacks[channel](xhr);
						}
					}
					return result;
				});
				return dfd;
			}
			return null;
		}, publish:function (channel, data) {
			return this._send("POST", {url:channel, contentType:"application/json"}, data);
		}, _processMessage:function (message) {
			message.event = message.event || message.getResponseHeader("Event");
			if (message.event == "connection-conflict") {
				return "conflict";
			}
			try {
				message.result = message.result || dojo.fromJson(message.responseText);
			}
			catch (e) {
			}
			var self = this;
			var loc = message.channel = new dojo._Url(this.url, message.source || message.getResponseHeader("Content-Location")) + "";
			if (loc in this.subscriptions && message.getResponseHeader) {
				this.subscriptions[loc] = message.getResponseHeader("Last-Modified");
			}
			if (this.subCallbacks[loc]) {
				setTimeout(function () {
					self.subCallbacks[loc](message);
				}, 0);
			}
			this.receive(message);
			return null;
		}, onprogress:function (xhr, data, contentType) {
			if (!contentType || contentType.match(/application\/rest\+json/)) {
				var size = data.length;
				data = data.replace(/^\s*[,\[]?/, "[").replace(/[,\]]?\s*$/, "]");
				try {
					var xhrs = dojo.fromJson(data);
					this.lastIndex += size;
				}
				catch (e) {
				}
			} else {
				if (dojox.io && dojox.io.httpParse && contentType.match(/application\/http/)) {
					var topHeaders = "";
					if (xhr && xhr.getAllResponseHeaders) {
						topHeaders = xhr.getAllResponseHeaders();
					}
					xhrs = dojox.io.httpParse(data, topHeaders, xhr.readyState != 4);
				} else {
					if (typeof data == "object") {
						xhrs = data;
					}
				}
			}
			if (xhrs) {
				for (var i = 0; i < xhrs.length; i++) {
					if (this._processMessage(xhrs[i])) {
						return "conflict";
					}
				}
				return null;
			}
			if (!xhr) {
				return "error";
			}
			if (xhr.readyState != 4) {
				return null;
			}
			if (xhr.__proto__) {
				xhr = {channel:"channel", __proto__:xhr};
			}
			return this._processMessage(xhr);
		}, get:function (channel, args) {
			(args = args || {}).method = "GET";
			return this.subscribe(channel, args);
		}, receive:function (message) {
			if (dojox.data && dojox.data.restListener) {
				dojox.data.restListener(message);
			}
		}, disconnected:function () {
			var self = this;
			if (this.connected) {
				this.connected = false;
				if (this.started) {
					setTimeout(function () {
						var subscriptions = self.subscriptions;
						self.subscriptions = {};
						for (var i in subscriptions) {
							if (self.reloadDataOnReconnect && dojox.rpc.JsonRest) {
								delete dojox.rpc.Rest._index[i];
								dojox.rpc.JsonRest.fetch(i);
							} else {
								self.subscribe(i, {since:subscriptions[i]});
							}
						}
						self.open();
					}, this.autoReconnectTime);
				}
			}
		}, unsubscribe:function (channel, args) {
			args = args || {};
			args.unsubscribe = true;
			this.subscribe(channel, args);
		}, disconnect:function () {
			this.started = false;
			this.xhr.abort();
		}});
		var Channels = dojox.cometd.RestChannels.defaultInstance = new dojox.cometd.RestChannels();
		if (dojox.cometd.connectionTypes) {
			Channels.startup = function (data) {
				Channels.open();
				this._cometd._deliver({channel:"/meta/connect", successful:true});
			};
			Channels.check = function (types, version, xdomain) {
				for (var i = 0; i < types.length; i++) {
					if (types[i] == "rest-channels") {
						return !xdomain;
					}
				}
				return false;
			};
			Channels.deliver = function (message) {
			};
			dojo.connect(this, "receive", null, function (message) {
				message.data = message.result;
				this._cometd._deliver(message);
			});
			Channels.sendMessages = function (messages) {
				for (var i = 0; i < messages.length; i++) {
					var message = messages[i];
					var channel = message.channel;
					var cometd = this._cometd;
					var args = {confirmation:function () {
						cometd._deliver({channel:channel, successful:true});
					}};
					if (channel == "/meta/subscribe") {
						this.subscribe(message.subscription, args);
					} else {
						if (channel == "/meta/unsubscribe") {
							this.unsubscribe(message.subscription, args);
						} else {
							if (channel == "/meta/connect") {
								args.confirmation();
							} else {
								if (channel == "/meta/disconnect") {
									Channels.disconnect();
									args.confirmation();
								} else {
									if (channel.substring(0, 6) != "/meta/") {
										this.publish(channel, message.data);
									}
								}
							}
						}
					}
				}
			};
			dojox.cometd.connectionTypes.register("rest-channels", Channels.check, Channels, false, true);
		}
	})();
}

