/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx.ext-dojo.reverse"]) {
	dojo._hasResource["dojox.fx.ext-dojo.reverse"] = true;
	dojo.provide("dojox.fx.ext-dojo.reverse");
	dojo.require("dojo.fx.easing");
	dojo.require("dojo.fx");
	dojo.extend(dojo.Animation, {_reversed:false, reverse:function (keepPaused, reverseEase) {
		var playing = this.status() == "playing";
		this.pause();
		this._reversed = !this._reversed;
		var d = this.duration, sofar = d * this._percent, togo = d - sofar, curr = new Date().valueOf(), cp = this.curve._properties, p = this.properties, nm;
		this._endTime = curr + sofar;
		this._startTime = curr - togo;
		if (playing) {
			this.gotoPercent(togo / d);
		}
		for (nm in p) {
			var tmp = p[nm].start;
			p[nm].start = cp[nm].start = p[nm].end;
			p[nm].end = cp[nm].end = tmp;
		}
		if (this._reversed) {
			if (!this.rEase) {
				this.fEase = this.easing;
				if (reverseEase) {
					this.rEase = reverseEase;
				} else {
					var de = dojo.fx.easing, found, eName;
					for (nm in de) {
						if (this.easing == de[nm]) {
							found = nm;
							break;
						}
					}
					if (found) {
						if (/InOut/.test(nm) || !/In|Out/i.test(nm)) {
							this.rEase = this.easing;
						} else {
							if (/In/.test(nm)) {
								eName = nm.replace("In", "Out");
							} else {
								eName = nm.replace("Out", "In");
							}
						}
						if (eName) {
							this.rEase = dojo.fx.easing[eName];
						}
					} else {
						console.info("ease function to reverse not found");
						this.rEase = this.easing;
					}
				}
			}
			this.easing = this.rEase;
		} else {
			this.easing = this.fEase;
		}
		if (!keepPaused && this.status() != "playing") {
			this.play();
		}
		return this;
	}});
}

