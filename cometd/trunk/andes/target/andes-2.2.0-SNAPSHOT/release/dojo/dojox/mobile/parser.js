/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.parser"]) {
	dojo._hasResource["dojox.mobile.parser"] = true;
	dojo.provide("dojox.mobile.parser");
	dojo.provide("dojo.parser");
	dojox.mobile.parser = new function () {
		this.instantiate = function (nodes, mixin, args) {
			mixin = mixin || {};
			args = args || {};
			var i, ws = [];
			if (nodes) {
				for (i = 0; i < nodes.length; i++) {
					var n = nodes[i];
					var cls = dojo.getObject(n.getAttribute("dojoType") || n.getAttribute("data-dojo-type"));
					var proto = cls.prototype;
					var params = {}, prop, v;
					dojo._mixin(params, eval("({" + (n.getAttribute("data-dojo-props") || "") + "})"));
					dojo._mixin(params, args.defaults);
					dojo._mixin(params, mixin);
					for (prop in proto) {
						v = n.getAttribute(prop);
						if (!v) {
							continue;
						}
						if (typeof proto[prop] === "string") {
							params[prop] = v;
						} else {
							if (typeof proto[prop] === "number") {
								params[prop] = v - 0;
							} else {
								if (typeof proto[prop] === "boolean") {
									params[prop] = (v !== "false");
								} else {
									if (typeof proto[prop] === "object") {
										params[prop] = eval("(" + v + ")");
									}
								}
							}
						}
					}
					params["class"] = n.className;
					params.style = n.style && n.style.cssText;
					v = n.getAttribute("data-dojo-attach-point");
					if (v) {
						params.dojoAttachPoint = v;
					}
					v = n.getAttribute("data-dojo-attach-event");
					if (v) {
						params.dojoAttachEvent = v;
					}
					var instance = new cls(params, n);
					ws.push(instance);
					var jsId = n.getAttribute("jsId") || n.getAttribute("data-dojo-id");
					if (jsId) {
						dojo.setObject(jsId, instance);
					}
				}
				for (i = 0; i < ws.length; i++) {
					var w = ws[i];
					!args.noStart && w.startup && !w._started && (!w.getParent || !w.getParent()) && w.startup();
				}
			}
			return ws;
		};
		this.parse = function (rootNode, args) {
			if (!rootNode) {
				rootNode = dojo.body();
			} else {
				if (!args && rootNode.rootNode) {
					args = rootNode;
					rootNode = rootNode.rootNode;
				}
			}
			var nodes = rootNode.getElementsByTagName("*");
			var i, list = [];
			for (i = 0; i < nodes.length; i++) {
				var n = nodes[i];
				if (n.getAttribute("dojoType") || n.getAttribute("data-dojo-type")) {
					list.push(n);
				}
			}
			var mixin = args && args.template ? {template:true} : null;
			return this.instantiate(list, mixin, args);
		};
	}();
	dojo._loaders.unshift(function () {
		if (dojo.config.parseOnLoad) {
			dojox.mobile.parser.parse();
		}
	});
	dojo.parser = dojox.mobile.parser;
}

