/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.encoding.crypto.RSAKey"]) {
	dojo._hasResource["dojox.encoding.crypto.RSAKey"] = true;
	dojo.provide("dojox.encoding.crypto.RSAKey");
	dojo.require("dojox.math.BigInteger");
	dojo.require("dojox.math.random.Simple");
	dojo.experimental("dojox.encoding.crypto.RSAKey");
	(function () {
		var dm = dojox.math, BigInteger = dm.BigInteger, Simple = dm.random.Simple, defaultRngf = function () {
			return new Simple();
		};
		function pkcs1pad2(s, n, rngf) {
			if (n < s.length + 11) {
				throw new Error("Message too long for RSA");
			}
			var ba = new Array(n);
			var i = s.length;
			while (i && n) {
				ba[--n] = s.charCodeAt(--i);
			}
			ba[--n] = 0;
			var rng = rngf();
			var x = [0];
			while (n > 2) {
				x[0] = 0;
				while (x[0] == 0) {
					rng.nextBytes(x);
				}
				ba[--n] = x[0];
			}
			ba[--n] = 2;
			ba[--n] = 0;
			rng.destroy();
			return new BigInteger(ba);
		}
		dojo.declare("dojox.encoding.crypto.RSAKey", null, {constructor:function (rngf) {
			this.rngf = rngf || defaultRngf;
			this.e = 0;
			this.n = this.d = this.p = this.q = this.dmp1 = this.dmq1 = this.coeff = null;
		}, setPublic:function (N, E) {
			if (N && E && N.length && E.length) {
				this.n = new BigInteger(N, 16);
				this.e = parseInt(E, 16);
			} else {
				throw new Error("Invalid RSA public key");
			}
		}, encrypt:function (text) {
			var m = pkcs1pad2(text, (this.n.bitLength() + 7) >> 3, this.rngf);
			if (!m) {
				return null;
			}
			var c = m.modPowInt(this.e, this.n);
			if (!c) {
				return null;
			}
			var h = c.toString(16);
			return h.length % 2 ? "0" + h : h;
		}});
	})();
}

