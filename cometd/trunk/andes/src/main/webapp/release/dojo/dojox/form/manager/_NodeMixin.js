/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.manager._NodeMixin"]) {
	dojo._hasResource["dojox.form.manager._NodeMixin"] = true;
	dojo.provide("dojox.form.manager._NodeMixin");
	dojo.require("dojox.form.manager._Mixin");
	(function () {
		var fm = dojox.form.manager, aa = fm.actionAdapter, keys = fm._keys, ce = fm.changeEvent = function (node) {
			var eventName = "onclick";
			switch (node.tagName.toLowerCase()) {
			  case "textarea":
				eventName = "onkeyup";
				break;
			  case "select":
				eventName = "onchange";
				break;
			  case "input":
				switch (node.type.toLowerCase()) {
				  case "text":
				  case "password":
					eventName = "onkeyup";
					break;
				}
				break;
			}
			return eventName;
		}, registerNode = function (node, groupNode) {
			var name = dojo.attr(node, "name");
			groupNode = groupNode || this.domNode;
			if (name && !(name in this.formWidgets)) {
				for (var n = node; n && n !== groupNode; n = n.parentNode) {
					if (dojo.attr(n, "widgetId") && dijit.byNode(n) instanceof dijit.form._FormWidget) {
						return null;
					}
				}
				if (node.tagName.toLowerCase() == "input" && node.type.toLowerCase() == "radio") {
					var a = this.formNodes[name];
					a = a && a.node;
					if (a && dojo.isArray(a)) {
						a.push(node);
					} else {
						this.formNodes[name] = {node:[node], connections:[]};
					}
				} else {
					this.formNodes[name] = {node:node, connections:[]};
				}
			} else {
				name = null;
			}
			return name;
		}, getObserversFromNode = function (name) {
			var observers = {};
			aa(function (_, n) {
				var o = dojo.attr(n, "observer");
				if (o && typeof o == "string") {
					dojo.forEach(o.split(","), function (o) {
						o = dojo.trim(o);
						if (o && dojo.isFunction(this[o])) {
							observers[o] = 1;
						}
					}, this);
				}
			}).call(this, null, this.formNodes[name].node);
			return keys(observers);
		}, connectNode = function (name, observers) {
			var t = this.formNodes[name], c = t.connections;
			if (c.length) {
				dojo.forEach(c, dojo.disconnect);
				c = t.connections = [];
			}
			aa(function (_, n) {
				var eventName = ce(n);
				dojo.forEach(observers, function (o) {
					c.push(dojo.connect(n, eventName, this, function (evt) {
						if (this.watching) {
							this[o](this.formNodeValue(name), name, n, evt);
						}
					}));
				}, this);
			}).call(this, null, t.node);
		};
		dojo.declare("dojox.form.manager._NodeMixin", null, {destroy:function () {
			for (var name in this.formNodes) {
				dojo.forEach(this.formNodes[name].connections, dojo.disconnect);
			}
			this.formNodes = {};
			this.inherited(arguments);
		}, registerNode:function (node) {
			if (typeof node == "string") {
				node = dojo.byId(node);
			}
			var name = registerNode.call(this, node);
			if (name) {
				connectNode.call(this, name, getObserversFromNode.call(this, name));
			}
			return this;
		}, unregisterNode:function (name) {
			if (name in this.formNodes) {
				dojo.forEach(this.formNodes[name].connections, this.disconnect, this);
				delete this.formNodes[name];
			}
			return this;
		}, registerNodeDescendants:function (node) {
			if (typeof node == "string") {
				node = dojo.byId(node);
			}
			dojo.query("input, select, textarea, button", node).map(function (n) {
				return registerNode.call(this, n, node);
			}, this).forEach(function (name) {
				if (name) {
					connectNode.call(this, name, getObserversFromNode.call(this, name));
				}
			}, this);
			return this;
		}, unregisterNodeDescendants:function (node) {
			if (typeof node == "string") {
				node = dojo.byId(node);
			}
			dojo.query("input, select, textarea, button", node).map(function (n) {
				return dojo.attr(node, "name") || null;
			}).forEach(function (name) {
				if (name) {
					this.unregisterNode(name);
				}
			}, this);
			return this;
		}, formNodeValue:function (elem, value) {
			var isSetter = arguments.length == 2 && value !== undefined, result;
			if (typeof elem == "string") {
				elem = this.formNodes[elem];
				if (elem) {
					elem = elem.node;
				}
			}
			if (!elem) {
				return null;
			}
			if (dojo.isArray(elem)) {
				if (isSetter) {
					dojo.forEach(elem, function (node) {
						node.checked = "";
					});
					dojo.forEach(elem, function (node) {
						node.checked = node.value === value ? "checked" : "";
					});
					return this;
				}
				dojo.some(elem, function (node) {
					if (node.checked) {
						result = node;
						return true;
					}
					return false;
				});
				return result ? result.value : "";
			}
			switch (elem.tagName.toLowerCase()) {
			  case "select":
				if (elem.multiple) {
					if (isSetter) {
						if (dojo.isArray(value)) {
							var dict = {};
							dojo.forEach(value, function (v) {
								dict[v] = 1;
							});
							dojo.query("> option", elem).forEach(function (opt) {
								opt.selected = opt.value in dict;
							});
							return this;
						}
						dojo.query("> option", elem).forEach(function (opt) {
							opt.selected = opt.value === value;
						});
						return this;
					}
					var result = dojo.query("> option", elem).filter(function (opt) {
						return opt.selected;
					}).map(function (opt) {
						return opt.value;
					});
					return result.length == 1 ? result[0] : result;
				}
				if (isSetter) {
					dojo.query("> option", elem).forEach(function (opt) {
						opt.selected = opt.value === value;
					});
					return this;
				}
				return elem.value || "";
			  case "button":
				if (isSetter) {
					elem.innerHTML = "" + value;
					return this;
				}
				return elem.innerHTML;
			  case "input":
				if (elem.type.toLowerCase() == "checkbox") {
					if (isSetter) {
						elem.checked = value ? "checked" : "";
						return this;
					}
					return Boolean(elem.checked);
				}
			}
			if (isSetter) {
				elem.value = "" + value;
				return this;
			}
			return elem.value;
		}, inspectFormNodes:function (inspector, state, defaultValue) {
			var name, result = {};
			if (state) {
				if (dojo.isArray(state)) {
					dojo.forEach(state, function (name) {
						if (name in this.formNodes) {
							result[name] = inspector.call(this, name, this.formNodes[name].node, defaultValue);
						}
					}, this);
				} else {
					for (name in state) {
						if (name in this.formNodes) {
							result[name] = inspector.call(this, name, this.formNodes[name].node, state[name]);
						}
					}
				}
			} else {
				for (name in this.formNodes) {
					result[name] = inspector.call(this, name, this.formNodes[name].node, defaultValue);
				}
			}
			return result;
		}});
	})();
}

