/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.socket.Reconnect"]) {
	dojo._hasResource["dojox.socket.Reconnect"] = true;
	dojo.provide("dojox.socket.Reconnect");
	dojox.socket.Reconnect = function (socket, options) {
		options = options || {};
		var reconnectTime = options.reconnectTime || 10000;
		var connectHandle = dojo.connect(socket, "onclose", function (event) {
			clearTimeout(checkForOpen);
			if (!event.wasClean) {
				socket.disconnected(function () {
					dojox.socket.replace(socket, newSocket = socket.reconnect());
				});
			}
		});
		var checkForOpen, newSocket;
		if (!socket.disconnected) {
			socket.disconnected = function (reconnect) {
				setTimeout(function () {
					reconnect();
					checkForOpen = setTimeout(function () {
						if (newSocket.readyState < 2) {
							reconnectTime = options.reconnectTime || 10000;
						}
					}, 10000);
				}, reconnectTime);
				reconnectTime *= options.backoffRate || 2;
			};
		}
		if (!socket.reconnect) {
			socket.reconnect = function () {
				return socket.args ? dojox.socket.LongPoll(socket.args) : dojox.socket(socket.URL);
			};
		}
		return socket;
	};
}

