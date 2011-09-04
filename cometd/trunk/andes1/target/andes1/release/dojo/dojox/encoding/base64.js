/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.encoding.base64"]) {
	dojo._hasResource["dojox.encoding.base64"] = true;
	dojo.provide("dojox.encoding.base64");
	dojo.getObject("encoding.base64", true, dojox);
	(function () {
		var p = "=";
		var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var dxe = dojox.encoding;
		dxe.base64.encode = function (ba) {
			var s = [], l = ba.length;
			var rm = l % 3;
			var x = l - rm;
			for (var i = 0; i < x; ) {
				var t = ba[i++] << 16 | ba[i++] << 8 | ba[i++];
				s.push(tab.charAt((t >>> 18) & 63));
				s.push(tab.charAt((t >>> 12) & 63));
				s.push(tab.charAt((t >>> 6) & 63));
				s.push(tab.charAt(t & 63));
			}
			switch (rm) {
			  case 2:
				var t = ba[i++] << 16 | ba[i++] << 8;
				s.push(tab.charAt((t >>> 18) & 63));
				s.push(tab.charAt((t >>> 12) & 63));
				s.push(tab.charAt((t >>> 6) & 63));
				s.push(p);
				break;
			  case 1:
				var t = ba[i++] << 16;
				s.push(tab.charAt((t >>> 18) & 63));
				s.push(tab.charAt((t >>> 12) & 63));
				s.push(p);
				s.push(p);
				break;
			}
			return s.join("");
		};
		dxe.base64.decode = function (str) {
			var s = str.split(""), out = [];
			var l = s.length;
			while (s[--l] == p) {
			}
			for (var i = 0; i < l; ) {
				var t = tab.indexOf(s[i++]) << 18;
				if (i <= l) {
					t |= tab.indexOf(s[i++]) << 12;
				}
				if (i <= l) {
					t |= tab.indexOf(s[i++]) << 6;
				}
				if (i <= l) {
					t |= tab.indexOf(s[i++]);
				}
				out.push((t >>> 16) & 255);
				out.push((t >>> 8) & 255);
				out.push(t & 255);
			}
			while (out[out.length - 1] == 0) {
				out.pop();
			}
			return out;
		};
	})();
}

