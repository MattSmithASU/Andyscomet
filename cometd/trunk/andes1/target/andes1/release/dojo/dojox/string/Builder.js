/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.string.Builder"]) {
	dojo._hasResource["dojox.string.Builder"] = true;
	dojo.provide("dojox.string.Builder");
	dojox.string.Builder = function (str) {
		var b = "";
		this.length = 0;
		this.append = function (s) {
			if (arguments.length > 1) {
				var tmp = "", l = arguments.length;
				switch (l) {
				  case 9:
					tmp = "" + arguments[8] + tmp;
				  case 8:
					tmp = "" + arguments[7] + tmp;
				  case 7:
					tmp = "" + arguments[6] + tmp;
				  case 6:
					tmp = "" + arguments[5] + tmp;
				  case 5:
					tmp = "" + arguments[4] + tmp;
				  case 4:
					tmp = "" + arguments[3] + tmp;
				  case 3:
					tmp = "" + arguments[2] + tmp;
				  case 2:
					b += "" + arguments[0] + arguments[1] + tmp;
					break;
				  default:
					var i = 0;
					while (i < arguments.length) {
						tmp += arguments[i++];
					}
					b += tmp;
				}
			} else {
				b += s;
			}
			this.length = b.length;
			return this;
		};
		this.concat = function (s) {
			return this.append.apply(this, arguments);
		};
		this.appendArray = function (strings) {
			return this.append.apply(this, strings);
		};
		this.clear = function () {
			b = "";
			this.length = 0;
			return this;
		};
		this.replace = function (oldStr, newStr) {
			b = b.replace(oldStr, newStr);
			this.length = b.length;
			return this;
		};
		this.remove = function (start, len) {
			if (len === undefined) {
				len = b.length;
			}
			if (len == 0) {
				return this;
			}
			b = b.substr(0, start) + b.substr(start + len);
			this.length = b.length;
			return this;
		};
		this.insert = function (index, str) {
			if (index == 0) {
				b = str + b;
			} else {
				b = b.slice(0, index) + str + b.slice(index);
			}
			this.length = b.length;
			return this;
		};
		this.toString = function () {
			return b;
		};
		if (str) {
			this.append(str);
		}
	};
}

