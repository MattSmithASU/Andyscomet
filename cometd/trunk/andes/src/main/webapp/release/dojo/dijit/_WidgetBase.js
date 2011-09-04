/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._WidgetBase"]) {
	dojo._hasResource["dijit._WidgetBase"] = true;
	dojo.provide("dijit._WidgetBase");
	dojo.require("dijit._base.manager");
	dojo.require("dojo.Stateful");
	dojo.declare("dijit._WidgetBase", dojo.Stateful, {id:"", _setIdAttr:"domNode", lang:"", _setLangAttr:"domNode", dir:"", _setDirAttr:"domNode", textDir:"", "class":"", _setClassAttr:{node:"domNode", type:"class"}, style:"", title:"", tooltip:"", baseClass:"", srcNodeRef:null, domNode:null, containerNode:null, attributeMap:{}, _blankGif:(dojo.config.blankGif || dojo.moduleUrl("dojo", "resources/blank.gif")).toString(), postscript:function (params, srcNodeRef) {
		this.create(params, srcNodeRef);
	}, create:function (params, srcNodeRef) {
		this.srcNodeRef = dojo.byId(srcNodeRef);
		this._connects = [];
		this._subscribes = [];
		this._supportingWidgets = [];
		if (this.srcNodeRef && (typeof this.srcNodeRef.id == "string")) {
			this.id = this.srcNodeRef.id;
		}
		if (params) {
			this.params = params;
			dojo._mixin(this, params);
		}
		this.postMixInProperties();
		if (!this.id) {
			this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
		}
		dijit.registry.add(this);
		this.buildRendering();
		if (this.domNode) {
			this._applyAttributes();
			var source = this.srcNodeRef;
			if (source && source.parentNode && this.domNode !== source) {
				source.parentNode.replaceChild(this.domNode, source);
			}
		}
		if (this.domNode) {
			this.domNode.setAttribute("widgetId", this.id);
		}
		this.postCreate();
		if (this.srcNodeRef && !this.srcNodeRef.parentNode) {
			delete this.srcNodeRef;
		}
		this._created = true;
	}, _applyAttributes:function () {
		var ctor = this.constructor, list = ctor._setterAttrs;
		if (!list) {
			list = (ctor._setterAttrs = []);
			for (var attr in this.attributeMap) {
				list.push(attr);
			}
			var attrs, proto = ctor.prototype;
			for (var fxName in proto) {
				if (fxName in this.attributeMap) {
					continue;
				}
				var setterName = "_set" + fxName.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
					return c.charAt(c.length - 1).toUpperCase();
				}) + "Attr";
				if (setterName in proto) {
					list.push(fxName);
				}
			}
		}
		dojo.forEach(list, function (attr) {
			if (this.params && attr in this.params) {
				return;
			} else {
				if (this[attr]) {
					this.set(attr, this[attr]);
				}
			}
		}, this);
		for (var param in this.params) {
			this.set(param, this[param]);
		}
	}, postMixInProperties:function () {
	}, buildRendering:function () {
		if (!this.domNode) {
			this.domNode = this.srcNodeRef || dojo.create("div");
		}
		if (this.baseClass) {
			var classes = this.baseClass.split(" ");
			if (!this.isLeftToRight()) {
				classes = classes.concat(dojo.map(classes, function (name) {
					return name + "Rtl";
				}));
			}
			dojo.addClass(this.domNode, classes);
		}
	}, postCreate:function () {
	}, startup:function () {
		this._started = true;
	}, destroyRecursive:function (preserveDom) {
		this._beingDestroyed = true;
		this.destroyDescendants(preserveDom);
		this.destroy(preserveDom);
	}, destroy:function (preserveDom) {
		this._beingDestroyed = true;
		this.uninitialize();
		var d = dojo, dfe = d.forEach, dun = d.unsubscribe;
		dfe(this._connects, function (array) {
			dfe(array, d.disconnect);
		});
		dfe(this._subscribes, function (handle) {
			dun(handle);
		});
		dfe(this._supportingWidgets || [], function (w) {
			if (w.destroyRecursive) {
				w.destroyRecursive();
			} else {
				if (w.destroy) {
					w.destroy();
				}
			}
		});
		this.destroyRendering(preserveDom);
		dijit.registry.remove(this.id);
		this._destroyed = true;
	}, destroyRendering:function (preserveDom) {
		if (this.bgIframe) {
			this.bgIframe.destroy(preserveDom);
			delete this.bgIframe;
		}
		if (this.domNode) {
			if (preserveDom) {
				dojo.removeAttr(this.domNode, "widgetId");
			} else {
				dojo.destroy(this.domNode);
			}
			delete this.domNode;
		}
		if (this.srcNodeRef) {
			if (!preserveDom) {
				dojo.destroy(this.srcNodeRef);
			}
			delete this.srcNodeRef;
		}
	}, destroyDescendants:function (preserveDom) {
		dojo.forEach(this.getChildren(), function (widget) {
			if (widget.destroyRecursive) {
				widget.destroyRecursive(preserveDom);
			}
		});
	}, uninitialize:function () {
		return false;
	}, _setStyleAttr:function (value) {
		var mapNode = this.domNode;
		if (dojo.isObject(value)) {
			dojo.style(mapNode, value);
		} else {
			if (mapNode.style.cssText) {
				mapNode.style.cssText += "; " + value;
			} else {
				mapNode.style.cssText = value;
			}
		}
		this._set("style", value);
	}, _attrToDom:function (attr, value, commands) {
		commands = arguments.length >= 3 ? commands : this.attributeMap[attr];
		dojo.forEach(dojo.isArray(commands) ? commands : [commands], function (command) {
			var mapNode = this[command.node || command || "domNode"];
			var type = command.type || "attribute";
			switch (type) {
			  case "attribute":
				if (dojo.isFunction(value)) {
					value = dojo.hitch(this, value);
				}
				var attrName = command.attribute ? command.attribute : (/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);
				dojo.attr(mapNode, attrName, value);
				break;
			  case "innerText":
				mapNode.innerHTML = "";
				mapNode.appendChild(dojo.doc.createTextNode(value));
				break;
			  case "innerHTML":
				mapNode.innerHTML = value;
				break;
			  case "class":
				dojo.replaceClass(mapNode, value, this[attr]);
				break;
			}
		}, this);
	}, get:function (name) {
		var names = this._getAttrNames(name);
		return this[names.g] ? this[names.g]() : this[name];
	}, set:function (name, value) {
		if (typeof name === "object") {
			for (var x in name) {
				this.set(x, name[x]);
			}
			return this;
		}
		var names = this._getAttrNames(name), setter = this[names.s];
		if (dojo.isFunction(setter)) {
			var result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			var defaultNode = this.focusNode ? "focusNode" : "domNode", map = name in this.attributeMap ? this.attributeMap[name] : names.s in this ? this[names.s] : (name in this[defaultNode] || /^aria-|^role$/.test(name)) ? defaultNode : null;
			if (map != null) {
				this._attrToDom(name, value, map);
			}
			this._set(name, value);
		}
		return result || this;
	}, _attrPairNames:{}, _getAttrNames:function (name) {
		var apn = this._attrPairNames;
		if (apn[name]) {
			return apn[name];
		}
		var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
			return c.charAt(c.length - 1).toUpperCase();
		});
		return (apn[name] = {n:name + "Node", s:"_set" + uc + "Attr", g:"_get" + uc + "Attr"});
	}, _set:function (name, value) {
		var oldValue = this[name];
		this[name] = value;
		if (this._watchCallbacks && this._created && value !== oldValue) {
			this._watchCallbacks(name, oldValue, value);
		}
	}, toString:function () {
		return "[Widget " + this.declaredClass + ", " + (this.id || "NO ID") + "]";
	}, getDescendants:function () {
		return this.containerNode ? dojo.query("[widgetId]", this.containerNode).map(dijit.byNode) : [];
	}, getChildren:function () {
		return this.containerNode ? dijit.findWidgets(this.containerNode) : [];
	}, connect:function (obj, event, method) {
		var handles = [dojo._connect(obj, event, this, method)];
		this._connects.push(handles);
		return handles;
	}, disconnect:function (handles) {
		for (var i = 0; i < this._connects.length; i++) {
			if (this._connects[i] == handles) {
				dojo.forEach(handles, dojo.disconnect);
				this._connects.splice(i, 1);
				return;
			}
		}
	}, subscribe:function (topic, method) {
		var handle = dojo.subscribe(topic, this, method);
		this._subscribes.push(handle);
		return handle;
	}, unsubscribe:function (handle) {
		for (var i = 0; i < this._subscribes.length; i++) {
			if (this._subscribes[i] == handle) {
				dojo.unsubscribe(handle);
				this._subscribes.splice(i, 1);
				return;
			}
		}
	}, isLeftToRight:function () {
		return this.dir ? (this.dir == "ltr") : dojo._isBodyLtr();
	}, placeAt:function (reference, position) {
		if (reference.declaredClass && reference.addChild) {
			reference.addChild(this, position);
		} else {
			dojo.place(this.domNode, reference, position);
		}
		return this;
	}, getTextDir:function (text, originalDir) {
		return originalDir;
	}, applyTextDir:function (element, text) {
	}});
}

