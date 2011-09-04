/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.manager._Mixin"]) {
	dojo._hasResource["dojox.form.manager._Mixin"] = true;
	dojo.provide("dojox.form.manager._Mixin");
	dojo.require("dijit._Widget");
	(function () {
		var fm = dojox.form.manager, aa = fm.actionAdapter = function (action) {
			return function (name, elems, value) {
				if (dojo.isArray(elems)) {
					dojo.forEach(elems, function (elem) {
						action.call(this, name, elem, value);
					}, this);
				} else {
					action.apply(this, arguments);
				}
			};
		}, ia = fm.inspectorAdapter = function (inspector) {
			return function (name, elem, value) {
				return inspector.call(this, name, dojo.isArray(elem) ? elem[0] : elem, value);
			};
		}, skipNames = {domNode:1, containerNode:1, srcNodeRef:1, bgIframe:1}, keys = fm._keys = function (o) {
			var list = [], key;
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					list.push(key);
				}
			}
			return list;
		}, registerWidget = function (widget) {
			var name = widget.get("name");
			if (name && widget instanceof dijit.form._FormWidget) {
				if (name in this.formWidgets) {
					var a = this.formWidgets[name].widget;
					if (dojo.isArray(a)) {
						a.push(widget);
					} else {
						this.formWidgets[name].widget = [a, widget];
					}
				} else {
					this.formWidgets[name] = {widget:widget, connections:[]};
				}
			} else {
				name = null;
			}
			return name;
		}, getObserversFromWidget = function (name) {
			var observers = {};
			aa(function (_, w) {
				var o = w.get("observer");
				if (o && typeof o == "string") {
					dojo.forEach(o.split(","), function (o) {
						o = dojo.trim(o);
						if (o && dojo.isFunction(this[o])) {
							observers[o] = 1;
						}
					}, this);
				}
			}).call(this, null, this.formWidgets[name].widget);
			return keys(observers);
		}, connectWidget = function (name, observers) {
			var t = this.formWidgets[name], w = t.widget, c = t.connections;
			if (c.length) {
				dojo.forEach(c, dojo.disconnect);
				c = t.connections = [];
			}
			if (dojo.isArray(w)) {
				dojo.forEach(w, function (w) {
					dojo.forEach(observers, function (o) {
						c.push(dojo.connect(w, "onChange", this, function (evt) {
							if (this.watching && dojo.attr(w.focusNode, "checked")) {
								this[o](w.get("value"), name, w, evt);
							}
						}));
					}, this);
				}, this);
			} else {
				var eventName = w.declaredClass == "dijit.form.Button" ? "onClick" : "onChange";
				dojo.forEach(observers, function (o) {
					c.push(dojo.connect(w, eventName, this, function (evt) {
						if (this.watching) {
							this[o](w.get("value"), name, w, evt);
						}
					}));
				}, this);
			}
		};
		dojo.declare("dojox.form.manager._Mixin", null, {watching:true, startup:function () {
			if (this._started) {
				return;
			}
			this.formWidgets = {};
			this.formNodes = {};
			this.registerWidgetDescendants(this);
			this.inherited(arguments);
		}, destroy:function () {
			for (var name in this.formWidgets) {
				dojo.forEach(this.formWidgets[name].connections, dojo.disconnect);
			}
			this.formWidgets = {};
			this.inherited(arguments);
		}, registerWidget:function (widget) {
			if (typeof widget == "string") {
				widget = dijit.byId(widget);
			} else {
				if (widget.tagName && widget.cloneNode) {
					widget = dijit.byNode(widget);
				}
			}
			var name = registerWidget.call(this, widget);
			if (name) {
				connectWidget.call(this, name, getObserversFromWidget.call(this, name));
			}
			return this;
		}, unregisterWidget:function (name) {
			if (name in this.formWidgets) {
				dojo.forEach(this.formWidgets[name].connections, this.disconnect, this);
				delete this.formWidgets[name];
			}
			return this;
		}, registerWidgetDescendants:function (widget) {
			if (typeof widget == "string") {
				widget = dijit.byId(widget);
			} else {
				if (widget.tagName && widget.cloneNode) {
					widget = dijit.byNode(widget);
				}
			}
			var widgets = dojo.map(widget.getDescendants(), registerWidget, this);
			dojo.forEach(widgets, function (name) {
				if (name) {
					connectWidget.call(this, name, getObserversFromWidget.call(this, name));
				}
			}, this);
			return this.registerNodeDescendants ? this.registerNodeDescendants(widget.domNode) : this;
		}, unregisterWidgetDescendants:function (widget) {
			if (typeof widget == "string") {
				widget = dijit.byId(widget);
			} else {
				if (widget.tagName && widget.cloneNode) {
					widget = dijit.byNode(widget);
				}
			}
			dojo.forEach(dojo.map(widget.getDescendants(), function (w) {
				return w instanceof dijit.form._FormWidget && w.get("name") || null;
			}), function (name) {
				if (name) {
					this.unregisterNode(name);
				}
			}, this);
			return this.unregisterNodeDescendants ? this.unregisterNodeDescendants(widget.domNode) : this;
		}, formWidgetValue:function (elem, value) {
			var isSetter = arguments.length == 2 && value !== undefined, result;
			if (typeof elem == "string") {
				elem = this.formWidgets[elem];
				if (elem) {
					elem = elem.widget;
				}
			}
			if (!elem) {
				return null;
			}
			if (dojo.isArray(elem)) {
				if (isSetter) {
					dojo.forEach(elem, function (widget) {
						widget.set("checked", false, !this.watching);
					});
					dojo.forEach(elem, function (widget) {
						widget.set("checked", widget.value === value, !this.watching);
					});
					return this;
				}
				dojo.some(elem, function (widget) {
					if (dojo.attr(widget.focusNode, "checked")) {
						result = widget;
						return true;
					}
					return false;
				});
				return result ? result.get("value") : "";
			}
			if (elem.declaredClass == "dijit.form.CheckBox") {
				if (isSetter) {
					elem.set("value", Boolean(value), !this.watching);
					return this;
				}
				return Boolean(elem.get("value"));
			}
			if (isSetter) {
				elem.set("value", value, !this.watching);
				return this;
			}
			return elem.get("value");
		}, formPointValue:function (elem, value) {
			if (elem && typeof elem == "string") {
				elem = this[elem];
			}
			if (!elem || !elem.tagName || !elem.cloneNode) {
				return null;
			}
			if (!dojo.hasClass(elem, "dojoFormValue")) {
				return null;
			}
			if (arguments.length == 2 && value !== undefined) {
				elem.innerHTML = value;
				return this;
			}
			return elem.innerHTML;
		}, inspectFormWidgets:function (inspector, state, defaultValue) {
			var name, result = {};
			if (state) {
				if (dojo.isArray(state)) {
					dojo.forEach(state, function (name) {
						if (name in this.formWidgets) {
							result[name] = inspector.call(this, name, this.formWidgets[name].widget, defaultValue);
						}
					}, this);
				} else {
					for (name in state) {
						if (name in this.formWidgets) {
							result[name] = inspector.call(this, name, this.formWidgets[name].widget, state[name]);
						}
					}
				}
			} else {
				for (name in this.formWidgets) {
					result[name] = inspector.call(this, name, this.formWidgets[name].widget, defaultValue);
				}
			}
			return result;
		}, inspectAttachedPoints:function (inspector, state, defaultValue) {
			var name, result = {};
			if (state) {
				if (dojo.isArray(state)) {
					dojo.forEach(state, function (name) {
						var elem = this[name];
						if (elem && elem.tagName && elem.cloneNode) {
							result[name] = inspector.call(this, name, elem, defaultValue);
						}
					}, this);
				} else {
					for (name in state) {
						var elem = this[name];
						if (elem && elem.tagName && elem.cloneNode) {
							result[name] = inspector.call(this, name, elem, state[name]);
						}
					}
				}
			} else {
				for (name in this) {
					if (!(name in skipNames)) {
						var elem = this[name];
						if (elem && elem.tagName && elem.cloneNode) {
							result[name] = inspector.call(this, name, elem, defaultValue);
						}
					}
				}
			}
			return result;
		}, inspect:function (inspector, state, defaultValue) {
			var result = this.inspectFormWidgets(function (name, widget, value) {
				if (dojo.isArray(widget)) {
					return inspector.call(this, name, dojo.map(widget, function (w) {
						return w.domNode;
					}), value);
				}
				return inspector.call(this, name, widget.domNode, value);
			}, state, defaultValue);
			if (this.inspectFormNodes) {
				dojo.mixin(result, this.inspectFormNodes(inspector, state, defaultValue));
			}
			return dojo.mixin(result, this.inspectAttachedPoints(inspector, state, defaultValue));
		}});
	})();
	dojo.extend(dijit._Widget, {observer:""});
}

