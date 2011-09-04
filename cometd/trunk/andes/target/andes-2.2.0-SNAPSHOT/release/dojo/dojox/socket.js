/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.socket"]) {
	dojo._hasResource["dojox.socket"] = true;
	dojo.provide("dojox.socket");
	dojo.require("dojo.cookie");
	var WebSocket = window.WebSocket;
	dojox.socket = Socket;
	function Socket(argsOrUrl) {
		if (typeof argsOrUrl == "string") {
			argsOrUrl = {url:argsOrUrl};
		}
		return WebSocket ? dojox.socket.WebSocket(argsOrUrl) : dojox.socket.LongPoll(argsOrUrl);
	}
	Socket.WebSocket = function (args) {
		var ws = new WebSocket(new dojo._Url(document.baseURI.replace(/^http/i, "ws"), args.url));
		ws.on = ws.addEventListener;
		var opened;
		dojo.connect(ws, "onopen", function (event) {
			opened = true;
		});
		dojo.connect(ws, "onclose", function (event) {
			if (opened) {
				return;
			}
			WebSocket = null;
			Socket.replace(ws, dojox.socket(args), true);
		});
		return ws;
	};
	Socket.replace = function (socket, newSocket, listenForOpen) {
		socket.send = dojo.hitch(newSocket, "send");
		socket.close = dojo.hitch(newSocket, "close");
		if (listenForOpen) {
			proxyEvent("open");
		}
		dojo.forEach(["message", "close", "error"], proxyEvent);
		function proxyEvent(type) {
			(newSocket.addEventListener || newSocket.on).call(newSocket, type, function (event) {
				socket.dispatchEvent(event);
			});
		}
	};
	Socket.LongPoll = function (args) {
		var cancelled = false, first = true, timeoutId, connections = [];
		var socket = {send:function (data) {
			var sendArgs = dojo.delegate(args);
			sendArgs.rawBody = data;
			clearTimeout(timeoutId);
			var deferred = first ? (first = false) || socket.firstRequest(sendArgs) : socket.transport(sendArgs);
			connections.push(deferred);
			deferred.then(function (response) {
				socket.readyState = 1;
				connections.splice(dojo.indexOf(connections, deferred), 1);
				if (!connections.length) {
					timeoutId = setTimeout(connect, args.interval);
				}
				if (response) {
					fire("message", {data:response}, deferred);
				}
			}, function (error) {
				connections.splice(dojo.indexOf(connections, deferred), 1);
				if (!cancelled) {
					fire("error", {error:error}, deferred);
					if (!connections.length) {
						socket.readyState = 3;
						fire("close", {wasClean:false}, deferred);
					}
				}
			});
			return deferred;
		}, close:function () {
			socket.readyState = 2;
			cancelled = true;
			for (var i = 0; i < connections.length; i++) {
				connections[i].cancel();
			}
			socket.readyState = 3;
			fire("close", {wasClean:true});
		}, transport:args.transport || dojo.xhrPost, args:args, url:args.url, readyState:0, CONNECTING:0, OPEN:1, CLOSING:2, CLOSED:3, dispatchEvent:function (event) {
			fire(event.type, event);
		}, on:function (type, callback) {
			return dojo.connect(this, "on" + type, callback);
		}, firstRequest:function (args) {
			var headers = (args.headers || (args.headers = {}));
			headers.Pragma = "start-long-poll";
			try {
				return this.transport(args);
			}
			finally {
				delete headers.Pragma;
			}
		}};
		function connect() {
			if (socket.readyState == 0) {
				fire("open", {});
			}
			if (!connections.length) {
				socket.send();
			}
		}
		function fire(type, object, deferred) {
			if (socket["on" + type]) {
				var event = document.createEvent("HTMLEvents");
				event.initEvent(type, false, false);
				dojo.mixin(event, object);
				event.ioArgs = deferred && deferred.ioArgs;
				socket["on" + type](event);
			}
		}
		socket.connect = socket.on;
		setTimeout(connect);
		return socket;
	};
}

