/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.cometd.ack"]) {
	dojo._hasResource["dojox.cometd.ack"] = true;
	dojo.provide("dojox.cometd.ack");
	dojo.require("dojox.cometd._base");
	dojox.cometd._ack = new function () {
		var supportAcks = false;
		var lastAck = -1;
		this._in = function (msg) {
			if (msg.channel == "/meta/handshake") {
				supportAcks = msg.ext && msg.ext.ack;
			} else {
				if (supportAcks && msg.channel == "/meta/connect" && msg.ext && msg.ext.ack && msg.successful) {
					var ackId = parseInt(msg.ext.ack);
					lastAck = ackId;
				}
			}
			return msg;
		};
		this._out = function (msg) {
			if (msg.channel == "/meta/handshake") {
				if (!msg.ext) {
					msg.ext = {};
				}
				msg.ext.ack = dojox.cometd.ackEnabled;
				lastAck = -1;
			}
			if (supportAcks && msg.channel == "/meta/connect") {
				if (!msg.ext) {
					msg.ext = {};
				}
				msg.ext.ack = lastAck;
			}
			return msg;
		};
	};
	dojox.cometd._extendInList.push(dojo.hitch(dojox.cometd._ack, "_in"));
	dojox.cometd._extendOutList.push(dojo.hitch(dojox.cometd._ack, "_out"));
	dojox.cometd.ackEnabled = true;
}

