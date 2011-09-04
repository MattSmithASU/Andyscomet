/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.timer"]) {
	dojo._hasResource["andes.timer"] = true;
	dojo.provide("andes.timer");
	dojo.declare("andes.timer", null, {node:null, display:false, ready:false, constructor:function (st) {
		this.startTime = st;
		dojo.addOnLoad(this, function () {
			this.node = dojo.byId("timer");
			this.ready = true;
			if (this.display) {
				this.displayTimer(true);
			}
		});
	}, displayTimer:function (t) {
		this.display = t;
		if (!this.ready) {
			return;
		}
		var disp;
		if (t) {
			disp = "block";
			this.interval = setInterval(dojo.hitch(this, function () {
				this.updateTime();
			}), 500);
		} else {
			disp = "none";
			if (this.interval) {
				clearInterval(this.interval);
			}
		}
		dojo.style(this.node, {"display":disp});
	}, updateTime:function () {
		var elapsed = (new Date()).getTime() - this.startTime;
		if (this.node) {
			this.node.innerHTML = Math.floor(elapsed / 1000);
		}
	}});
}

