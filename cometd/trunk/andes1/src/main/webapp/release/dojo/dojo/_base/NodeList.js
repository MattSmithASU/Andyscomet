/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.NodeList"]) {
	dojo._hasResource["dojo._base.NodeList"] = true;
	dojo.provide("dojo._base.NodeList");
	dojo.require("dojo._base.lang");
	dojo.require("dojo._base.array");
	dojo.require("dojo._base.connect");
	dojo.require("dojo._base.html");
	(function () {
		var d = dojo;
		var ap = Array.prototype, aps = ap.slice, apc = ap.concat;
		var tnl = function (a, parent, NodeListCtor) {
			if (!a.sort) {
				a = aps.call(a, 0);
			}
			var ctor = NodeListCtor || this._NodeListCtor || d._NodeListCtor;
			a.constructor = ctor;
			dojo._mixin(a, ctor.prototype);
			a._NodeListCtor = ctor;
			return parent ? a._stash(parent) : a;
		};
		var loopBody = function (f, a, o) {
			a = [0].concat(aps.call(a, 0));
			o = o || d.global;
			return function (node) {
				a[0] = node;
				return f.apply(o, a);
			};
		};
		var adaptAsForEach = function (f, o) {
			return function () {
				this.forEach(loopBody(f, arguments, o));
				return this;
			};
		};
		var adaptAsMap = function (f, o) {
			return function () {
				return this.map(loopBody(f, arguments, o));
			};
		};
		var adaptAsFilter = function (f, o) {
			return function () {
				return this.filter(loopBody(f, arguments, o));
			};
		};
		var adaptWithCondition = function (f, g, o) {
			return function () {
				var a = arguments, body = loopBody(f, a, o);
				if (g.call(o || d.global, a)) {
					return this.map(body);
				}
				this.forEach(body);
				return this;
			};
		};
		var magicGuard = function (a) {
			return a.length == 1 && (typeof a[0] == "string");
		};
		var orphan = function (node) {
			var p = node.parentNode;
			if (p) {
				p.removeChild(node);
			}
		};
		dojo.NodeList = function () {
			return tnl(Array.apply(null, arguments));
		};
		d._NodeListCtor = d.NodeList;
		var nl = d.NodeList, nlp = nl.prototype;
		nl._wrap = nlp._wrap = tnl;
		nl._adaptAsMap = adaptAsMap;
		nl._adaptAsForEach = adaptAsForEach;
		nl._adaptAsFilter = adaptAsFilter;
		nl._adaptWithCondition = adaptWithCondition;
		d.forEach(["slice", "splice"], function (name) {
			var f = ap[name];
			nlp[name] = function () {
				return this._wrap(f.apply(this, arguments), name == "slice" ? this : null);
			};
		});
		d.forEach(["indexOf", "lastIndexOf", "every", "some"], function (name) {
			var f = d[name];
			nlp[name] = function () {
				return f.apply(d, [this].concat(aps.call(arguments, 0)));
			};
		});
		d.forEach(["attr", "style"], function (name) {
			nlp[name] = adaptWithCondition(d[name], magicGuard);
		});
		d.forEach(["connect", "addClass", "removeClass", "replaceClass", "toggleClass", "empty", "removeAttr"], function (name) {
			nlp[name] = adaptAsForEach(d[name]);
		});
		dojo.extend(dojo.NodeList, {_normalize:function (content, refNode) {
			var parse = content.parse === true ? true : false;
			if (typeof content.template == "string") {
				var templateFunc = content.templateFunc || (dojo.string && dojo.string.substitute);
				content = templateFunc ? templateFunc(content.template, content) : content;
			}
			var type = (typeof content);
			if (type == "string" || type == "number") {
				content = dojo._toDom(content, (refNode && refNode.ownerDocument));
				if (content.nodeType == 11) {
					content = dojo._toArray(content.childNodes);
				} else {
					content = [content];
				}
			} else {
				if (!dojo.isArrayLike(content)) {
					content = [content];
				} else {
					if (!dojo.isArray(content)) {
						content = dojo._toArray(content);
					}
				}
			}
			if (parse) {
				content._runParse = true;
			}
			return content;
		}, _cloneNode:function (node) {
			return node.cloneNode(true);
		}, _place:function (ary, refNode, position, useClone) {
			if (refNode.nodeType != 1 && position == "only") {
				return;
			}
			var rNode = refNode, tempNode;
			var length = ary.length;
			for (var i = length - 1; i >= 0; i--) {
				var node = (useClone ? this._cloneNode(ary[i]) : ary[i]);
				if (ary._runParse && dojo.parser && dojo.parser.parse) {
					if (!tempNode) {
						tempNode = rNode.ownerDocument.createElement("div");
					}
					tempNode.appendChild(node);
					dojo.parser.parse(tempNode);
					node = tempNode.firstChild;
					while (tempNode.firstChild) {
						tempNode.removeChild(tempNode.firstChild);
					}
				}
				if (i == length - 1) {
					dojo.place(node, rNode, position);
				} else {
					rNode.parentNode.insertBefore(node, rNode);
				}
				rNode = node;
			}
		}, _stash:function (parent) {
			this._parent = parent;
			return this;
		}, end:function () {
			if (this._parent) {
				return this._parent;
			} else {
				return new this._NodeListCtor();
			}
		}, concat:function (item) {
			var t = d.isArray(this) ? this : aps.call(this, 0), m = d.map(arguments, function (a) {
				return a && !d.isArray(a) && (typeof NodeList != "undefined" && a.constructor === NodeList || a.constructor === this._NodeListCtor) ? aps.call(a, 0) : a;
			});
			return this._wrap(apc.apply(t, m), this);
		}, map:function (func, obj) {
			return this._wrap(d.map(this, func, obj), this);
		}, forEach:function (callback, thisObj) {
			d.forEach(this, callback, thisObj);
			return this;
		}, coords:adaptAsMap(d.coords), position:adaptAsMap(d.position), place:function (queryOrNode, position) {
			var item = d.query(queryOrNode)[0];
			return this.forEach(function (node) {
				d.place(node, item, position);
			});
		}, orphan:function (filter) {
			return (filter ? d._filterQueryResult(this, filter) : this).forEach(orphan);
		}, adopt:function (queryOrListOrNode, position) {
			return d.query(queryOrListOrNode).place(this[0], position)._stash(this);
		}, query:function (queryStr) {
			if (!queryStr) {
				return this;
			}
			var ret = this.map(function (node) {
				return d.query(queryStr, node).filter(function (subNode) {
					return subNode !== undefined;
				});
			});
			return this._wrap(apc.apply([], ret), this);
		}, filter:function (filter) {
			var a = arguments, items = this, start = 0;
			if (typeof filter == "string") {
				items = d._filterQueryResult(this, a[0]);
				if (a.length == 1) {
					return items._stash(this);
				}
				start = 1;
			}
			return this._wrap(d.filter(items, a[start], a[start + 1]), this);
		}, addContent:function (content, position) {
			content = this._normalize(content, this[0]);
			for (var i = 0, node; (node = this[i]); i++) {
				this._place(content, node, position, i > 0);
			}
			return this;
		}, instantiate:function (declaredClass, properties) {
			var c = d.isFunction(declaredClass) ? declaredClass : d.getObject(declaredClass);
			properties = properties || {};
			return this.forEach(function (node) {
				new c(properties, node);
			});
		}, at:function () {
			var t = new this._NodeListCtor();
			d.forEach(arguments, function (i) {
				if (i < 0) {
					i = this.length + i;
				}
				if (this[i]) {
					t.push(this[i]);
				}
			}, this);
			return t._stash(this);
		}});
		nl.events = ["blur", "focus", "change", "click", "error", "keydown", "keypress", "keyup", "load", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup", "submit"];
		d.forEach(nl.events, function (evt) {
			var _oe = "on" + evt;
			nlp[_oe] = function (a, b) {
				return this.connect(_oe, a, b);
			};
		});
	})();
}

