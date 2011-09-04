/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.math.random.Secure"]) {
	dojo._hasResource["dojox.math.random.Secure"] = true;
	dojo.provide("dojox.math.random.Secure");
	dojo.declare("dojox.math.random.Secure", null, {constructor:function (prng, noEvents) {
		this.prng = prng;
		var p = this.pool = new Array(prng.size);
		this.pptr = 0;
		for (var i = 0, len = prng.size; i < len; ) {
			var t = Math.floor(65536 * Math.random());
			p[i++] = t >>> 8;
			p[i++] = t & 255;
		}
		this.seedTime();
		if (!noEvents) {
			this.h = [dojo.connect(dojo.body(), "onclick", this, "seedTime"), dojo.connect(dojo.body(), "onkeypress", this, "seedTime")];
		}
	}, destroy:function () {
		if (this.h) {
			dojo.forEach(this.h, dojo.disconnect);
		}
	}, nextBytes:function (byteArray) {
		var state = this.state;
		if (!state) {
			this.seedTime();
			state = this.state = this.prng();
			state.init(this.pool);
			for (var p = this.pool, i = 0, len = p.length; i < len; p[i++] = 0) {
			}
			this.pptr = 0;
		}
		for (var i = 0, len = byteArray.length; i < len; ++i) {
			byteArray[i] = state.next();
		}
	}, seedTime:function () {
		this._seed_int(new Date().getTime());
	}, _seed_int:function (x) {
		var p = this.pool, i = this.pptr;
		p[i++] ^= x & 255;
		p[i++] ^= (x >> 8) & 255;
		p[i++] ^= (x >> 16) & 255;
		p[i++] ^= (x >> 24) & 255;
		if (i >= this.prng.size) {
			i -= this.prng.size;
		}
		this.pptr = i;
	}});
}

