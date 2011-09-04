/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.timing.Streamer"]) {
	dojo._hasResource["dojox.timing.Streamer"] = true;
	dojo.provide("dojox.timing.Streamer");
	dojo.require("dojox.timing._base");
	dojox.timing.Streamer = function (input, output, interval, minimum, initialData) {
		var self = this;
		var queue = [];
		this.interval = interval || 1000;
		this.minimumSize = minimum || 10;
		this.inputFunction = input || function (q) {
		};
		this.outputFunction = output || function (point) {
		};
		var timer = new dojox.timing.Timer(this.interval);
		var tick = function () {
			self.onTick(self);
			if (queue.length < self.minimumSize) {
				self.inputFunction(queue);
			}
			var obj = queue.shift();
			while (typeof (obj) == "undefined" && queue.length > 0) {
				obj = queue.shift();
			}
			if (typeof (obj) == "undefined") {
				self.stop();
				return;
			}
			self.outputFunction(obj);
		};
		this.setInterval = function (ms) {
			this.interval = ms;
			timer.setInterval(ms);
		};
		this.onTick = function (obj) {
		};
		this.start = function () {
			if (typeof (this.inputFunction) == "function" && typeof (this.outputFunction) == "function") {
				timer.start();
				return;
			}
			throw new Error("You cannot start a Streamer without an input and an output function.");
		};
		this.onStart = function () {
		};
		this.stop = function () {
			timer.stop();
		};
		this.onStop = function () {
		};
		timer.onTick = this.tick;
		timer.onStart = this.onStart;
		timer.onStop = this.onStop;
		if (initialData) {
			queue.concat(initialData);
		}
	};
}

