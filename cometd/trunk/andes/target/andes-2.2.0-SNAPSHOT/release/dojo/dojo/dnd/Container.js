/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.Container"]) {
	dojo._hasResource["dojo.dnd.Container"] = true;
	dojo.provide("dojo.dnd.Container");
	dojo.require("dojo.dnd.common");
	dojo.require("dojo.parser");
	dojo.declare("dojo.dnd.Container", null, {skipForm:false, constructor:function (node, params) {
		this.node = dojo.byId(node);
		if (!params) {
			params = {};
		}
		this.creator = params.creator || null;
		this.skipForm = params.skipForm;
		this.parent = params.dropParent && dojo.byId(params.dropParent);
		this.map = {};
		this.current = null;
		this.containerState = "";
		dojo.addClass(this.node, "dojoDndContainer");
		if (!(params && params._skipStartup)) {
			this.startup();
		}
		this.events = [dojo.connect(this.node, "onmouseover", this, "onMouseOver"), dojo.connect(this.node, "onmouseout", this, "onMouseOut"), dojo.connect(this.node, "ondragstart", this, "onSelectStart"), dojo.connect(this.node, "onselectstart", this, "onSelectStart")];
	}, creator:function () {
	}, getItem:function (key) {
		return this.map[key];
	}, setItem:function (key, data) {
		this.map[key] = data;
	}, delItem:function (key) {
		delete this.map[key];
	}, forInItems:function (f, o) {
		o = o || dojo.global;
		var m = this.map, e = dojo.dnd._empty;
		for (var i in m) {
			if (i in e) {
				continue;
			}
			f.call(o, m[i], i, this);
		}
		return o;
	}, clearItems:function () {
		this.map = {};
	}, getAllNodes:function () {
		return dojo.query("> .dojoDndItem", this.parent);
	}, sync:function () {
		var map = {};
		this.getAllNodes().forEach(function (node) {
			if (node.id) {
				var item = this.getItem(node.id);
				if (item) {
					map[node.id] = item;
					return;
				}
			} else {
				node.id = dojo.dnd.getUniqueId();
			}
			var type = node.getAttribute("dndType"), data = node.getAttribute("dndData");
			map[node.id] = {data:data || node.innerHTML, type:type ? type.split(/\s*,\s*/) : ["text"]};
		}, this);
		this.map = map;
		return this;
	}, insertNodes:function (data, before, anchor) {
		if (!this.parent.firstChild) {
			anchor = null;
		} else {
			if (before) {
				if (!anchor) {
					anchor = this.parent.firstChild;
				}
			} else {
				if (anchor) {
					anchor = anchor.nextSibling;
				}
			}
		}
		if (anchor) {
			for (var i = 0; i < data.length; ++i) {
				var t = this._normalizedCreator(data[i]);
				this.setItem(t.node.id, {data:t.data, type:t.type});
				this.parent.insertBefore(t.node, anchor);
			}
		} else {
			for (var i = 0; i < data.length; ++i) {
				var t = this._normalizedCreator(data[i]);
				this.setItem(t.node.id, {data:t.data, type:t.type});
				this.parent.appendChild(t.node);
			}
		}
		return this;
	}, destroy:function () {
		dojo.forEach(this.events, dojo.disconnect);
		this.clearItems();
		this.node = this.parent = this.current = null;
	}, markupFactory:function (params, node) {
		params._skipStartup = true;
		return new dojo.dnd.Container(node, params);
	}, startup:function () {
		if (!this.parent) {
			this.parent = this.node;
			if (this.parent.tagName.toLowerCase() == "table") {
				var c = this.parent.getElementsByTagName("tbody");
				if (c && c.length) {
					this.parent = c[0];
				}
			}
		}
		this.defaultCreator = dojo.dnd._defaultCreator(this.parent);
		this.sync();
	}, onMouseOver:function (e) {
		var n = e.relatedTarget;
		while (n) {
			if (n == this.node) {
				break;
			}
			try {
				n = n.parentNode;
			}
			catch (x) {
				n = null;
			}
		}
		if (!n) {
			this._changeState("Container", "Over");
			this.onOverEvent();
		}
		n = this._getChildByEvent(e);
		if (this.current == n) {
			return;
		}
		if (this.current) {
			this._removeItemClass(this.current, "Over");
		}
		if (n) {
			this._addItemClass(n, "Over");
		}
		this.current = n;
	}, onMouseOut:function (e) {
		for (var n = e.relatedTarget; n; ) {
			if (n == this.node) {
				return;
			}
			try {
				n = n.parentNode;
			}
			catch (x) {
				n = null;
			}
		}
		if (this.current) {
			this._removeItemClass(this.current, "Over");
			this.current = null;
		}
		this._changeState("Container", "");
		this.onOutEvent();
	}, onSelectStart:function (e) {
		if (!this.skipForm || !dojo.dnd.isFormElement(e)) {
			dojo.stopEvent(e);
		}
	}, onOverEvent:function () {
	}, onOutEvent:function () {
	}, _changeState:function (type, newState) {
		var prefix = "dojoDnd" + type;
		var state = type.toLowerCase() + "State";
		dojo.replaceClass(this.node, prefix + newState, prefix + this[state]);
		this[state] = newState;
	}, _addItemClass:function (node, type) {
		dojo.addClass(node, "dojoDndItem" + type);
	}, _removeItemClass:function (node, type) {
		dojo.removeClass(node, "dojoDndItem" + type);
	}, _getChildByEvent:function (e) {
		var node = e.target;
		if (node) {
			for (var parent = node.parentNode; parent; node = parent, parent = node.parentNode) {
				if (parent == this.parent && dojo.hasClass(node, "dojoDndItem")) {
					return node;
				}
			}
		}
		return null;
	}, _normalizedCreator:function (item, hint) {
		var t = (this.creator || this.defaultCreator).call(this, item, hint);
		if (!dojo.isArray(t.type)) {
			t.type = ["text"];
		}
		if (!t.node.id) {
			t.node.id = dojo.dnd.getUniqueId();
		}
		dojo.addClass(t.node, "dojoDndItem");
		return t;
	}});
	dojo.dnd._createNode = function (tag) {
		if (!tag) {
			return dojo.dnd._createSpan;
		}
		return function (text) {
			return dojo.create(tag, {innerHTML:text});
		};
	};
	dojo.dnd._createTrTd = function (text) {
		var tr = dojo.create("tr");
		dojo.create("td", {innerHTML:text}, tr);
		return tr;
	};
	dojo.dnd._createSpan = function (text) {
		return dojo.create("span", {innerHTML:text});
	};
	dojo.dnd._defaultCreatorNodes = {ul:"li", ol:"li", div:"div", p:"div"};
	dojo.dnd._defaultCreator = function (node) {
		var tag = node.tagName.toLowerCase();
		var c = tag == "tbody" || tag == "thead" ? dojo.dnd._createTrTd : dojo.dnd._createNode(dojo.dnd._defaultCreatorNodes[tag]);
		return function (item, hint) {
			var isObj = item && dojo.isObject(item), data, type, n;
			if (isObj && item.tagName && item.nodeType && item.getAttribute) {
				data = item.getAttribute("dndData") || item.innerHTML;
				type = item.getAttribute("dndType");
				type = type ? type.split(/\s*,\s*/) : ["text"];
				n = item;
			} else {
				data = (isObj && item.data) ? item.data : item;
				type = (isObj && item.type) ? item.type : ["text"];
				n = (hint == "avatar" ? dojo.dnd._createSpan : c)(String(data));
			}
			if (!n.id) {
				n.id = dojo.dnd.getUniqueId();
			}
			return {node:n, data:data, type:type};
		};
	};
}

