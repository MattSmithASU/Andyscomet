/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._FormMixin"]) {
	dojo._hasResource["dijit.form._FormMixin"] = true;
	dojo.provide("dijit.form._FormMixin");
	dojo.require("dojo.window");
	dojo.declare("dijit.form._FormMixin", null, {state:"", reset:function () {
		dojo.forEach(this.getDescendants(), function (widget) {
			if (widget.reset) {
				widget.reset();
			}
		});
	}, validate:function () {
		var didFocus = false;
		return dojo.every(dojo.map(this.getDescendants(), function (widget) {
			widget._hasBeenBlurred = true;
			var valid = widget.disabled || !widget.validate || widget.validate();
			if (!valid && !didFocus) {
				dojo.window.scrollIntoView(widget.containerNode || widget.domNode);
				widget.focus();
				didFocus = true;
			}
			return valid;
		}), function (item) {
			return item;
		});
	}, setValues:function (val) {
		dojo.deprecated(this.declaredClass + "::setValues() is deprecated. Use set('value', val) instead.", "", "2.0");
		return this.set("value", val);
	}, _setValueAttr:function (obj) {
		var map = {};
		dojo.forEach(this.getDescendants(), function (widget) {
			if (!widget.name) {
				return;
			}
			var entry = map[widget.name] || (map[widget.name] = []);
			entry.push(widget);
		});
		for (var name in map) {
			if (!map.hasOwnProperty(name)) {
				continue;
			}
			var widgets = map[name], values = dojo.getObject(name, false, obj);
			if (values === undefined) {
				continue;
			}
			if (!dojo.isArray(values)) {
				values = [values];
			}
			if (typeof widgets[0].checked == "boolean") {
				dojo.forEach(widgets, function (w, i) {
					w.set("value", dojo.indexOf(values, w.value) != -1);
				});
			} else {
				if (widgets[0].multiple) {
					widgets[0].set("value", values);
				} else {
					dojo.forEach(widgets, function (w, i) {
						w.set("value", values[i]);
					});
				}
			}
		}
	}, getValues:function () {
		dojo.deprecated(this.declaredClass + "::getValues() is deprecated. Use get('value') instead.", "", "2.0");
		return this.get("value");
	}, _getValueAttr:function () {
		var obj = {};
		dojo.forEach(this.getDescendants(), function (widget) {
			var name = widget.name;
			if (!name || widget.disabled) {
				return;
			}
			var value = widget.get("value");
			if (typeof widget.checked == "boolean") {
				if (/Radio/.test(widget.declaredClass)) {
					if (value !== false) {
						dojo.setObject(name, value, obj);
					} else {
						value = dojo.getObject(name, false, obj);
						if (value === undefined) {
							dojo.setObject(name, null, obj);
						}
					}
				} else {
					var ary = dojo.getObject(name, false, obj);
					if (!ary) {
						ary = [];
						dojo.setObject(name, ary, obj);
					}
					if (value !== false) {
						ary.push(value);
					}
				}
			} else {
				var prev = dojo.getObject(name, false, obj);
				if (typeof prev != "undefined") {
					if (dojo.isArray(prev)) {
						prev.push(value);
					} else {
						dojo.setObject(name, [prev, value], obj);
					}
				} else {
					dojo.setObject(name, value, obj);
				}
			}
		});
		return obj;
	}, isValid:function () {
		return this.state == "";
	}, onValidStateChange:function (isValid) {
	}, _getState:function () {
		var states = dojo.map(this._descendants, function (w) {
			return w.get("state") || "";
		});
		return dojo.indexOf(states, "Error") >= 0 ? "Error" : dojo.indexOf(states, "Incomplete") >= 0 ? "Incomplete" : "";
	}, disconnectChildren:function () {
		dojo.forEach(this._childConnections || [], dojo.hitch(this, "disconnect"));
		dojo.forEach(this._childWatches || [], function (w) {
			w.unwatch();
		});
	}, connectChildren:function (inStartup) {
		var _this = this;
		this.disconnectChildren();
		this._descendants = this.getDescendants();
		var set = inStartup ? function (name, val) {
			_this[name] = val;
		} : dojo.hitch(this, "_set");
		set("value", this.get("value"));
		set("state", this._getState());
		var conns = (this._childConnections = []), watches = (this._childWatches = []);
		dojo.forEach(dojo.filter(this._descendants, function (item) {
			return item.validate;
		}), function (widget) {
			dojo.forEach(["state", "disabled"], function (attr) {
				watches.push(widget.watch(attr, function (attr, oldVal, newVal) {
					_this.set("state", _this._getState());
				}));
			});
		});
		var onChange = function () {
			if (_this._onChangeDelayTimer) {
				clearTimeout(_this._onChangeDelayTimer);
			}
			_this._onChangeDelayTimer = setTimeout(function () {
				delete _this._onChangeDelayTimer;
				_this._set("value", _this.get("value"));
			}, 10);
		};
		dojo.forEach(dojo.filter(this._descendants, function (item) {
			return item.onChange;
		}), function (widget) {
			conns.push(_this.connect(widget, "onChange", onChange));
			watches.push(widget.watch("disabled", onChange));
		});
	}, startup:function () {
		this.inherited(arguments);
		this.connectChildren(true);
		this.watch("state", function (attr, oldVal, newVal) {
			this.onValidStateChange(newVal == "");
		});
	}, destroy:function () {
		this.disconnectChildren();
		this.inherited(arguments);
	}});
}

