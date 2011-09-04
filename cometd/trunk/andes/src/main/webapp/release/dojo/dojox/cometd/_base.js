/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.cometd._base"]) {
	dojo._hasResource["dojox.cometd._base"] = true;
	dojo.provide("dojox.cometd._base");
	dojo.require("dojo.AdapterRegistry");
	dojox.cometd = {Connection:function (prefix) {
		dojo.mixin(this, {prefix:prefix, _status:"unconnected", _handshook:false, _initialized:false, _polling:false, expectedNetworkDelay:10000, connectTimeout:0, version:"1.0", minimumVersion:"0.9", clientId:null, messageId:0, batch:0, _isXD:false, handshakeReturn:null, currentTransport:null, url:null, lastMessage:null, _messageQ:[], handleAs:"json", _advice:{}, _backoffInterval:0, _backoffIncrement:1000, _backoffMax:60000, _deferredSubscribes:{}, _deferredUnsubscribes:{}, _subscriptions:[], _extendInList:[], _extendOutList:[]});
		this.state = function () {
			return this._status;
		};
		this.init = function (root, props, bargs) {
			props = props || {};
			props.version = this.version;
			props.minimumVersion = this.minimumVersion;
			props.channel = "/meta/handshake";
			props.id = "" + this.messageId++;
			this.url = root || dojo.config["cometdRoot"];
			if (!this.url) {
				throw "no cometd root";
				return null;
			}
			var regexp = "^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$";
			var parts = ("" + window.location).match(new RegExp(regexp));
			if (parts[4]) {
				var tmp = parts[4].split(":");
				var thisHost = tmp[0];
				var thisPort = tmp[1] || "80";
				parts = this.url.match(new RegExp(regexp));
				if (parts[4]) {
					tmp = parts[4].split(":");
					var urlHost = tmp[0];
					var urlPort = tmp[1] || "80";
					this._isXD = ((urlHost != thisHost) || (urlPort != thisPort));
				}
			}
			if (!this._isXD) {
				props.supportedConnectionTypes = dojo.map(dojox.cometd.connectionTypes.pairs, "return item[0]");
			}
			props = this._extendOut(props);
			var bindArgs = {url:this.url, handleAs:this.handleAs, content:{"message":dojo.toJson([props])}, load:dojo.hitch(this, function (msg) {
				this._backon();
				this._finishInit(msg);
			}), error:dojo.hitch(this, function (e) {
				this._backoff();
				this._finishInit(e);
			}), timeout:this.expectedNetworkDelay};
			if (bargs) {
				dojo.mixin(bindArgs, bargs);
			}
			this._props = props;
			for (var tname in this._subscriptions) {
				for (var sub in this._subscriptions[tname]) {
					if (this._subscriptions[tname][sub].topic) {
						dojo.unsubscribe(this._subscriptions[tname][sub].topic);
					}
				}
			}
			this._messageQ = [];
			this._subscriptions = [];
			this._initialized = true;
			this._status = "handshaking";
			this.batch = 0;
			this.startBatch();
			var r;
			if (this._isXD) {
				bindArgs.callbackParamName = "jsonp";
				r = dojo.io.script.get(bindArgs);
			} else {
				r = dojo.xhrPost(bindArgs);
			}
			return r;
		};
		this.publish = function (channel, data, props) {
			var message = {data:data, channel:channel};
			if (props) {
				dojo.mixin(message, props);
			}
			this._sendMessage(message);
		};
		this.subscribe = function (channel, objOrFunc, funcName, props) {
			props = props || {};
			if (objOrFunc) {
				var tname = prefix + channel;
				var subs = this._subscriptions[tname];
				if (!subs || subs.length == 0) {
					subs = [];
					props.channel = "/meta/subscribe";
					props.subscription = channel;
					this._sendMessage(props);
					var _ds = this._deferredSubscribes;
					if (_ds[channel]) {
						_ds[channel].cancel();
						delete _ds[channel];
					}
					_ds[channel] = new dojo.Deferred();
				}
				for (var i in subs) {
					if (subs[i].objOrFunc === objOrFunc && (!subs[i].funcName && !funcName || subs[i].funcName == funcName)) {
						return null;
					}
				}
				var topic = dojo.subscribe(tname, objOrFunc, funcName);
				subs.push({topic:topic, objOrFunc:objOrFunc, funcName:funcName});
				this._subscriptions[tname] = subs;
			}
			var ret = this._deferredSubscribes[channel] || {};
			ret.args = dojo._toArray(arguments);
			return ret;
		};
		this.unsubscribe = function (channel, objOrFunc, funcName, props) {
			if ((arguments.length == 1) && (!dojo.isString(channel)) && (channel.args)) {
				return this.unsubscribe.apply(this, channel.args);
			}
			var tname = prefix + channel;
			var subs = this._subscriptions[tname];
			if (!subs || subs.length == 0) {
				return null;
			}
			var s = 0;
			for (var i in subs) {
				var sb = subs[i];
				if ((!objOrFunc) || (sb.objOrFunc === objOrFunc && (!sb.funcName && !funcName || sb.funcName == funcName))) {
					dojo.unsubscribe(subs[i].topic);
					delete subs[i];
				} else {
					s++;
				}
			}
			if (s == 0) {
				props = props || {};
				props.channel = "/meta/unsubscribe";
				props.subscription = channel;
				delete this._subscriptions[tname];
				this._sendMessage(props);
				this._deferredUnsubscribes[channel] = new dojo.Deferred();
				if (this._deferredSubscribes[channel]) {
					this._deferredSubscribes[channel].cancel();
					delete this._deferredSubscribes[channel];
				}
			}
			return this._deferredUnsubscribes[channel];
		};
		this.disconnect = function () {
			for (var tname in this._subscriptions) {
				for (var sub in this._subscriptions[tname]) {
					if (this._subscriptions[tname][sub].topic) {
						dojo.unsubscribe(this._subscriptions[tname][sub].topic);
					}
				}
			}
			this._subscriptions = [];
			this._messageQ = [];
			if (this._initialized && this.currentTransport) {
				this._initialized = false;
				this.currentTransport.disconnect();
			}
			if (!this._polling) {
				this._publishMeta("connect", false);
			}
			this._initialized = false;
			this._handshook = false;
			this._status = "disconnected";
			this._publishMeta("disconnect", true);
		};
		this.subscribed = function (channel, message) {
		};
		this.unsubscribed = function (channel, message) {
		};
		this.tunnelInit = function (childLocation, childDomain) {
		};
		this.tunnelCollapse = function () {
		};
		this._backoff = function () {
			if (!this._advice) {
				this._advice = {reconnect:"retry", interval:0};
			} else {
				if (!this._advice.interval) {
					this._advice.interval = 0;
				}
			}
			if (this._backoffInterval < this._backoffMax) {
				this._backoffInterval += this._backoffIncrement;
			}
		};
		this._backon = function () {
			this._backoffInterval = 0;
		};
		this._interval = function () {
			var i = this._backoffInterval + (this._advice ? (this._advice.interval ? this._advice.interval : 0) : 0);
			if (i > 0) {
				console.log("Retry in interval+backoff=" + this._advice.interval + "+" + this._backoffInterval + "=" + i + "ms");
			}
			return i;
		};
		this._publishMeta = function (action, successful, props) {
			try {
				var meta = {cometd:this, action:action, successful:successful, state:this.state()};
				if (props) {
					dojo.mixin(meta, props);
				}
				dojo.publish(this.prefix + "/meta", [meta]);
			}
			catch (e) {
				console.log(e);
			}
		};
		this._finishInit = function (data) {
			if (this._status != "handshaking") {
				return;
			}
			var wasHandshook = this._handshook;
			var successful = false;
			var metaMsg = {};
			if (data instanceof Error) {
				dojo.mixin(metaMsg, {reestablish:false, failure:true, error:data, advice:this._advice});
			} else {
				data = data[0];
				data = this._extendIn(data);
				this.handshakeReturn = data;
				if (data["advice"]) {
					this._advice = data.advice;
				}
				successful = data.successful ? data.successful : false;
				if (data.version < this.minimumVersion) {
					if (console.log) {
						console.log("cometd protocol version mismatch. We wanted", this.minimumVersion, "but got", data.version);
					}
					successful = false;
					this._advice.reconnect = "none";
				}
				dojo.mixin(metaMsg, {reestablish:successful && wasHandshook, response:data});
			}
			this._publishMeta("handshake", successful, metaMsg);
			if (this._status != "handshaking") {
				return;
			}
			if (successful) {
				this._status = "connecting";
				this._handshook = true;
				this.currentTransport = dojox.cometd.connectionTypes.match(data.supportedConnectionTypes, data.version, this._isXD);
				var transport = this.currentTransport;
				transport._cometd = this;
				transport.version = data.version;
				this.clientId = data.clientId;
				this.tunnelInit = transport.tunnelInit && dojo.hitch(transport, "tunnelInit");
				this.tunnelCollapse = transport.tunnelCollapse && dojo.hitch(transport, "tunnelCollapse");
				transport.startup(data);
			} else {
				if (!this._advice || this._advice["reconnect"] != "none") {
					setTimeout(dojo.hitch(this, "init", this.url, this._props), this._interval());
				}
			}
		};
		this._extendIn = function (message) {
			dojo.forEach(dojox.cometd._extendInList, function (f) {
				message = f(message) || message;
			});
			return message;
		};
		this._extendOut = function (message) {
			dojo.forEach(dojox.cometd._extendOutList, function (f) {
				message = f(message) || message;
			});
			return message;
		};
		this.deliver = function (messages) {
			dojo.forEach(messages, this._deliver, this);
			return messages;
		};
		this._deliver = function (message) {
			message = this._extendIn(message);
			if (!message["channel"]) {
				if (message["success"] !== true) {
					return;
				}
			}
			this.lastMessage = message;
			if (message.advice) {
				this._advice = message.advice;
			}
			var deferred = null;
			if ((message["channel"]) && (message.channel.length > 5) && (message.channel.substr(0, 5) == "/meta")) {
				switch (message.channel) {
				  case "/meta/connect":
					var metaMsg = {response:message};
					if (message.successful) {
						if (this._status != "connected") {
							this._status = "connected";
							this.endBatch();
						}
					}
					if (this._initialized) {
						this._publishMeta("connect", message.successful, metaMsg);
					}
					break;
				  case "/meta/subscribe":
					deferred = this._deferredSubscribes[message.subscription];
					try {
						if (!message.successful) {
							if (deferred) {
								deferred.errback(new Error(message.error));
							}
							this.currentTransport.cancelConnect();
							return;
						}
						if (deferred) {
							deferred.callback(true);
						}
						this.subscribed(message.subscription, message);
					}
					catch (e) {
						log.warn(e);
					}
					break;
				  case "/meta/unsubscribe":
					deferred = this._deferredUnsubscribes[message.subscription];
					try {
						if (!message.successful) {
							if (deferred) {
								deferred.errback(new Error(message.error));
							}
							this.currentTransport.cancelConnect();
							return;
						}
						if (deferred) {
							deferred.callback(true);
						}
						this.unsubscribed(message.subscription, message);
					}
					catch (e) {
						log.warn(e);
					}
					break;
				  default:
					if (message.successful && !message.successful) {
						this.currentTransport.cancelConnect();
						return;
					}
				}
			}
			this.currentTransport.deliver(message);
			if (message.data) {
				try {
					var messages = [message];
					var tname = prefix + message.channel;
					var tnameParts = message.channel.split("/");
					var tnameGlob = prefix;
					for (var i = 1; i < tnameParts.length - 1; i++) {
						dojo.publish(tnameGlob + "/**", messages);
						tnameGlob += "/" + tnameParts[i];
					}
					dojo.publish(tnameGlob + "/**", messages);
					dojo.publish(tnameGlob + "/*", messages);
					dojo.publish(tname, messages);
				}
				catch (e) {
					console.log(e);
				}
			}
		};
		this._sendMessage = function (message) {
			if (this.currentTransport && !this.batch) {
				return this.currentTransport.sendMessages([message]);
			} else {
				this._messageQ.push(message);
				return null;
			}
		};
		this.startBatch = function () {
			this.batch++;
		};
		this.endBatch = function () {
			if (--this.batch <= 0 && this.currentTransport && this._status == "connected") {
				this.batch = 0;
				var messages = this._messageQ;
				this._messageQ = [];
				if (messages.length > 0) {
					this.currentTransport.sendMessages(messages);
				}
			}
		};
		this._onUnload = function () {
			dojo.addOnUnload(dojox.cometd, "disconnect");
		};
		this._connectTimeout = function () {
			var advised = 0;
			if (this._advice && this._advice.timeout && this.expectedNetworkDelay > 0) {
				advised = this._advice.timeout + this.expectedNetworkDelay;
			}
			if (this.connectTimeout > 0 && this.connectTimeout < advised) {
				return this.connectTimeout;
			}
			return advised;
		};
	}, connectionTypes:new dojo.AdapterRegistry(true)};
	dojox.cometd.Connection.call(dojox.cometd, "/cometd");
	dojo.addOnUnload(dojox.cometd, "_onUnload");
}

