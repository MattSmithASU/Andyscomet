/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._TemplatedMixin"]) {
	dojo._hasResource["dijit._TemplatedMixin"] = true;
	dojo.provide("dijit._TemplatedMixin");
	dojo.require("dijit._Widget");
	dojo.require("dojo.string");
	dojo.require("dojo.cache");
	dojo.declare("dijit._TemplatedMixin", null, {templateString:null, templatePath:null, _skipNodeCache:false, _earlyTemplatedStartup:false, constructor:function () {
		this._attachPoints = [];
		this._attachEvents = [];
	}, _stringRepl:function (tmpl) {
		var className = this.declaredClass, _this = this;
		return dojo.string.substitute(tmpl, this, function (value, key) {
			if (key.charAt(0) == "!") {
				value = dojo.getObject(key.substr(1), false, _this);
			}
			if (typeof value == "undefined") {
				throw new Error(className + " template:" + key);
			}
			if (value == null) {
				return "";
			}
			return key.charAt(0) == "!" ? value : value.toString().replace(/"/g, "&quot;");
		}, this);
	}, buildRendering:function () {
		if (!this.templateString) {
			this.templateString = dojo.cache(this.templatePath, {sanitize:true});
		}
		var cached = dijit._TemplatedMixin.getCachedTemplate(this.templateString, this._skipNodeCache);
		var node;
		if (dojo.isString(cached)) {
			node = dojo._toDom(this._stringRepl(cached));
			if (node.nodeType != 1) {
				throw new Error("Invalid template: " + cached);
			}
		} else {
			node = cached.cloneNode(true);
		}
		this.domNode = node;
		this.inherited(arguments);
		this._attachTemplateNodes(node, function (n, p) {
			return n.getAttribute(p);
		});
		this._beforeFillContent();
		this._fillContent(this.srcNodeRef);
	}, _beforeFillContent:function () {
	}, _fillContent:function (source) {
		var dest = this.containerNode;
		if (source && dest) {
			while (source.hasChildNodes()) {
				dest.appendChild(source.firstChild);
			}
		}
	}, _attachTemplateNodes:function (rootNode, getAttrFunc) {
		var nodes = dojo.isArray(rootNode) ? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
		var x = dojo.isArray(rootNode) ? 0 : -1;
		for (; x < nodes.length; x++) {
			var baseNode = (x == -1) ? rootNode : nodes[x];
			if (this.widgetsInTemplate && (getAttrFunc(baseNode, "dojoType") || getAttrFunc(baseNode, "data-dojo-type"))) {
				continue;
			}
			var attachPoint = getAttrFunc(baseNode, "dojoAttachPoint") || getAttrFunc(baseNode, "data-dojo-attach-point");
			if (attachPoint) {
				var point, points = attachPoint.split(/\s*,\s*/);
				while ((point = points.shift())) {
					if (dojo.isArray(this[point])) {
						this[point].push(baseNode);
					} else {
						this[point] = baseNode;
					}
					this._attachPoints.push(point);
				}
			}
			var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent") || getAttrFunc(baseNode, "data-dojo-attach-event");
			if (attachEvent) {
				var event, events = attachEvent.split(/\s*,\s*/);
				var trim = dojo.trim;
				while ((event = events.shift())) {
					if (event) {
						var thisFunc = null;
						if (event.indexOf(":") != -1) {
							var funcNameArr = event.split(":");
							event = trim(funcNameArr[0]);
							thisFunc = trim(funcNameArr[1]);
						} else {
							event = trim(event);
						}
						if (!thisFunc) {
							thisFunc = event;
						}
						this._attachEvents.push(this.connect(baseNode, event, thisFunc));
					}
				}
			}
		}
	}, destroyRendering:function () {
		dojo.forEach(this._attachPoints, function (point) {
			delete this[point];
		}, this);
		this._attachPoints = [];
		dojo.forEach(this._attachEvents, this.disconnect, this);
		this._attachEvents = [];
		this.inherited(arguments);
	}});
	dijit._TemplatedMixin._templateCache = {};
	dijit._TemplatedMixin.getCachedTemplate = function (templateString, alwaysUseString) {
		var tmplts = dijit._TemplatedMixin._templateCache;
		var key = templateString;
		var cached = tmplts[key];
		if (cached) {
			try {
				if (!cached.ownerDocument || cached.ownerDocument == dojo.doc) {
					return cached;
				}
			}
			catch (e) {
			}
			dojo.destroy(cached);
		}
		templateString = dojo.string.trim(templateString);
		if (alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g)) {
			return (tmplts[key] = templateString);
		} else {
			var node = dojo._toDom(templateString);
			if (node.nodeType != 1) {
				throw new Error("Invalid template: " + templateString);
			}
			return (tmplts[key] = node);
		}
	};
	if (dojo.isIE) {
		dojo.addOnWindowUnload(function () {
			var cache = dijit._TemplatedMixin._templateCache;
			for (var key in cache) {
				var value = cache[key];
				if (typeof value == "object") {
					dojo.destroy(value);
				}
				delete cache[key];
			}
		});
	}
	dojo.extend(dijit._Widget, {dojoAttachEvent:"", dojoAttachPoint:""});
}

