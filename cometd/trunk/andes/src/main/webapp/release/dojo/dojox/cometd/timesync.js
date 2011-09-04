/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.cometd.timesync"]) {
	dojo._hasResource["dojox.cometd.timesync"] = true;
	dojo.provide("dojox.cometd.timesync");
	dojo.require("dojox.cometd._base");
	dojox.cometd.timesync = new function () {
		this._window = 10;
		this._lags = [];
		this._offsets = [];
		this.lag = 0;
		this.offset = 0;
		this.samples = 0;
		this.getServerTime = function () {
			return new Date().getTime() + this.offset;
		};
		this.getServerDate = function () {
			return new Date(this.getServerTime());
		};
		this.setTimeout = function (call, atTimeOrDate) {
			var ts = (atTimeOrDate instanceof Date) ? atTimeOrDate.getTime() : (0 + atTimeOrDate);
			var tc = ts - this.offset;
			var interval = tc - new Date().getTime();
			if (interval <= 0) {
				interval = 1;
			}
			return setTimeout(call, interval);
		};
		this._in = function (msg) {
			var channel = msg.channel;
			if (channel && channel.indexOf("/meta/") == 0) {
				if (msg.ext && msg.ext.timesync) {
					var sync = msg.ext.timesync;
					var now = new Date().getTime();
					var l = (now - sync.tc - sync.p) / 2 - sync.a;
					var o = sync.ts - sync.tc - l;
					this._lags.push(l);
					this._offsets.push(o);
					if (this._offsets.length > this._window) {
						this._offsets.shift();
						this._lags.shift();
					}
					this.samples++;
					l = 0;
					o = 0;
					for (var i in this._offsets) {
						l += this._lags[i];
						o += this._offsets[i];
					}
					this.offset = parseInt((o / this._offsets.length).toFixed());
					this.lag = parseInt((l / this._lags.length).toFixed());
				}
			}
			return msg;
		};
		this._out = function (msg) {
			var channel = msg.channel;
			if (channel && channel.indexOf("/meta/") == 0) {
				var now = new Date().getTime();
				if (!msg.ext) {
					msg.ext = {};
				}
				msg.ext.timesync = {tc:now, l:this.lag, o:this.offset};
			}
			return msg;
		};
	};
	dojox.cometd._extendInList.push(dojo.hitch(dojox.cometd.timesync, "_in"));
	dojox.cometd._extendOutList.push(dojo.hitch(dojox.cometd.timesync, "_out"));
}

