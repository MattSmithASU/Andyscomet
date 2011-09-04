/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



(function () {
	if (typeof this["loadFirebugConsole"] == "function") {
		this["loadFirebugConsole"]();
	} else {
		this.console = this.console || {};
		var cn = ["assert", "count", "debug", "dir", "dirxml", "error", "group", "groupEnd", "info", "profile", "profileEnd", "time", "timeEnd", "trace", "warn", "log"];
		var i = 0, tn;
		while ((tn = cn[i++])) {
			if (!console[tn]) {
				(function () {
					var tcn = tn + "";
					console[tcn] = ("log" in console) ? function () {
						var a = Array.apply({}, arguments);
						a.unshift(tcn + ":");
						console["log"](a.join(" "));
					} : function () {
					};
					console[tcn]._fake = true;
				})();
			}
		}
	}
	if (typeof dojo == "undefined") {
		dojo = {_scopeName:"dojo", _scopePrefix:"", _scopePrefixArgs:"", _scopeSuffix:"", _scopeMap:{}, _scopeMapRev:{}};
	}
	var d = dojo;
	if (typeof dijit == "undefined") {
		dijit = {_scopeName:"dijit"};
	}
	if (typeof dojox == "undefined") {
		dojox = {_scopeName:"dojox"};
	}
	if (!d._scopeArgs) {
		d._scopeArgs = [dojo, dijit, dojox];
	}
	d.global = this;
	d.config = {isDebug:false, debugAtAllCosts:false};
	var cfg = typeof djConfig != "undefined" ? djConfig : typeof dojoConfig != "undefined" ? dojoConfig : null;
	if (cfg) {
		for (var c in cfg) {
			d.config[c] = cfg[c];
		}
	}
	dojo.locale = d.config.locale;
	var rev = "$Rev: 23930 $".match(/\d+/);
	dojo.version = {major:1, minor:7, patch:0, flag:"dev", revision:rev ? +rev[0] : NaN, toString:function () {
		with (d.version) {
			return major + "." + minor + "." + patch + flag + " (" + revision + ")";
		}
	}};
	if (typeof OpenAjax != "undefined") {
		OpenAjax.hub.registerLibrary(dojo._scopeName, "http://dojotoolkit.org", d.version.toString());
	}
	var extraNames, extraLen, empty = {};
	for (var i in {toString:1}) {
		extraNames = [];
		break;
	}
	dojo._extraNames = extraNames = extraNames || ["hasOwnProperty", "valueOf", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "constructor"];
	extraLen = extraNames.length;
	dojo._mixin = function (target, source) {
		var name, s, i;
		for (name in source) {
			s = source[name];
			if (!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))) {
				target[name] = s;
			}
		}
		if (extraLen && source) {
			for (i = 0; i < extraLen; ++i) {
				name = extraNames[i];
				s = source[name];
				if (!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))) {
					target[name] = s;
				}
			}
		}
		return target;
	};
	dojo.mixin = function (obj, props) {
		if (!obj) {
			obj = {};
		}
		for (var i = 1, l = arguments.length; i < l; i++) {
			d._mixin(obj, arguments[i]);
		}
		return obj;
	};
	dojo._getProp = function (parts, create, context) {
		var obj = context || d.global;
		for (var i = 0, p; obj && (p = parts[i]); i++) {
			if (i == 0 && d._scopeMap[p]) {
				p = d._scopeMap[p];
			}
			obj = (p in obj ? obj[p] : (create ? obj[p] = {} : undefined));
		}
		return obj;
	};
	dojo.setObject = function (name, value, context) {
		var parts = name.split("."), p = parts.pop(), obj = d._getProp(parts, true, context);
		return obj && p ? (obj[p] = value) : undefined;
	};
	dojo.getObject = function (name, create, context) {
		return d._getProp(name.split("."), create, context);
	};
	dojo.exists = function (name, obj) {
		return d.getObject(name, false, obj) !== undefined;
	};
	dojo["eval"] = function (scriptFragment) {
		return d.global.eval ? d.global.eval(scriptFragment) : eval(scriptFragment);
	};
	d.deprecated = d.experimental = function () {
	};
})();

