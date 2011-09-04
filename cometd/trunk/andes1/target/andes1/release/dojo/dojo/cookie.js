/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.cookie"]) {
	dojo._hasResource["dojo.cookie"] = true;
	dojo.provide("dojo.cookie");
	dojo.require("dojo.regexp");
	dojo.cookie = function (name, value, props) {
		var c = document.cookie;
		if (arguments.length == 1) {
			var matches = c.match(new RegExp("(?:^|; )" + dojo.regexp.escapeString(name) + "=([^;]*)"));
			return matches ? decodeURIComponent(matches[1]) : undefined;
		} else {
			props = props || {};
			var exp = props.expires;
			if (typeof exp == "number") {
				var d = new Date();
				d.setTime(d.getTime() + exp * 24 * 60 * 60 * 1000);
				exp = props.expires = d;
			}
			if (exp && exp.toUTCString) {
				props.expires = exp.toUTCString();
			}
			value = encodeURIComponent(value);
			var updatedCookie = name + "=" + value, propName;
			for (propName in props) {
				updatedCookie += "; " + propName;
				var propValue = props[propName];
				if (propValue !== true) {
					updatedCookie += "=" + propValue;
				}
			}
			document.cookie = updatedCookie;
		}
	};
	dojo.cookie.isSupported = function () {
		if (!("cookieEnabled" in navigator)) {
			this("__djCookieTest__", "CookiesAllowed");
			navigator.cookieEnabled = this("__djCookieTest__") == "CookiesAllowed";
			if (navigator.cookieEnabled) {
				this("__djCookieTest__", "", {expires:-1});
			}
		}
		return navigator.cookieEnabled;
	};
}

