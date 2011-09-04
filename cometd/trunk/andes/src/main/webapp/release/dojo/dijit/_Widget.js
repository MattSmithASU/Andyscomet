/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._Widget"]) {
	dojo._hasResource["dijit._Widget"] = true;
	dojo.provide("dijit._Widget");
	dojo.require("dijit._WidgetBase");
	dojo.require("dijit._base");
	dojo.connect(dojo, "_connect", function (widget, event) {
		if (widget && dojo.isFunction(widget._onConnect)) {
			widget._onConnect(event);
		}
	});
	dijit._connectOnUseEventHandler = function (event) {
	};
	dijit._lastKeyDownNode = null;
	if (dojo.isIE) {
		(function () {
			var keydownCallback = function (evt) {
				dijit._lastKeyDownNode = evt.srcElement;
			};
			dojo.doc.attachEvent("onkeydown", keydownCallback);
			dojo.addOnWindowUnload(function () {
				dojo.doc.detachEvent("onkeydown", keydownCallback);
			});
		})();
	} else {
		dojo.doc.addEventListener("keydown", function (evt) {
			dijit._lastKeyDownNode = evt.target;
		}, true);
	}
	dojo.declare("dijit._Widget", dijit._WidgetBase, {_deferredConnects:{onClick:"", onDblClick:"", onKeyDown:"", onKeyPress:"", onKeyUp:"", onMouseMove:"", onMouseDown:"", onMouseOut:"", onMouseOver:"", onMouseLeave:"", onMouseEnter:"", onMouseUp:""}, onClick:dijit._connectOnUseEventHandler, onDblClick:dijit._connectOnUseEventHandler, onKeyDown:dijit._connectOnUseEventHandler, onKeyPress:dijit._connectOnUseEventHandler, onKeyUp:dijit._connectOnUseEventHandler, onMouseDown:dijit._connectOnUseEventHandler, onMouseMove:dijit._connectOnUseEventHandler, onMouseOut:dijit._connectOnUseEventHandler, onMouseOver:dijit._connectOnUseEventHandler, onMouseLeave:dijit._connectOnUseEventHandler, onMouseEnter:dijit._connectOnUseEventHandler, onMouseUp:dijit._connectOnUseEventHandler, create:function (params, srcNodeRef) {
		this._deferredConnects = dojo.clone(this._deferredConnects);
		for (attr in this._deferredConnects) {
			if (attr in this.attributeMap || this._getAttrNames(attr).s in this || this[attr] !== dijit._connectOnUseEventHandler) {
				delete this._deferredConnects[attr];
			}
		}
		this.inherited(arguments);
		if (this.domNode) {
			for (attr in this.params) {
				this._onConnect(attr);
			}
		}
	}, _onConnect:function (event) {
		if (event in this._deferredConnects) {
			var mapNode = this[this._deferredConnects[event] || "domNode"];
			this.connect(mapNode, event.toLowerCase(), event);
			delete this._deferredConnects[event];
		}
	}, focused:false, isFocusable:function () {
		return this.focus && (dojo.style(this.domNode, "display") != "none");
	}, onFocus:function () {
	}, onBlur:function () {
	}, _onFocus:function (e) {
		this.onFocus();
	}, _onBlur:function () {
		this.onBlur();
	}, setAttribute:function (attr, value) {
		dojo.deprecated(this.declaredClass + "::setAttribute(attr, value) is deprecated. Use set() instead.", "", "2.0");
		this.set(attr, value);
	}, attr:function (name, value) {
		if (dojo.config.isDebug) {
			var alreadyCalledHash = arguments.callee._ach || (arguments.callee._ach = {}), caller = (arguments.callee.caller || "unknown caller").toString();
			if (!alreadyCalledHash[caller]) {
				dojo.deprecated(this.declaredClass + "::attr() is deprecated. Use get() or set() instead, called from " + caller, "", "2.0");
				alreadyCalledHash[caller] = true;
			}
		}
		var args = arguments.length;
		if (args >= 2 || typeof name === "object") {
			return this.set.apply(this, arguments);
		} else {
			return this.get(name);
		}
	}, nodesWithKeyClick:["input", "button"], connect:function (obj, event, method) {
		var d = dojo, dc = d._connect, handles = this.inherited(arguments, [obj, event == "ondijitclick" ? "onclick" : event, method]);
		if (event == "ondijitclick") {
			if (d.indexOf(this.nodesWithKeyClick, obj.nodeName.toLowerCase()) == -1) {
				var m = d.hitch(this, method);
				handles.push(dc(obj, "onkeydown", this, function (e) {
					if ((e.keyCode == d.keys.ENTER || e.keyCode == d.keys.SPACE) && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
						dijit._lastKeyDownNode = e.target;
						if (!("openDropDown" in this && obj == this._buttonNode)) {
							e.preventDefault();
						}
					}
				}), dc(obj, "onkeyup", this, function (e) {
					if ((e.keyCode == d.keys.ENTER || e.keyCode == d.keys.SPACE) && e.target == dijit._lastKeyDownNode && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
						dijit._lastKeyDownNode = null;
						return m(e);
					}
				}));
			}
		}
		return handles;
	}, _onShow:function () {
		this.onShow();
	}, onShow:function () {
	}, onHide:function () {
	}, onClose:function () {
		return true;
	}});
}

