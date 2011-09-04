/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.manager"]) {
	dojo._hasResource["dijit._base.manager"] = true;
	dojo.provide("dijit._base.manager");
	dojo.declare("dijit.WidgetSet", null, {constructor:function () {
		this._hash = {};
		this.length = 0;
	}, add:function (widget) {
		if (this._hash[widget.id]) {
			throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
		}
		this._hash[widget.id] = widget;
		this.length++;
	}, remove:function (id) {
		if (this._hash[id]) {
			delete this._hash[id];
			this.length--;
		}
	}, forEach:function (func, thisObj) {
		thisObj = thisObj || dojo.global;
		var i = 0, id;
		for (id in this._hash) {
			func.call(thisObj, this._hash[id], i++, this._hash);
		}
		return this;
	}, filter:function (filter, thisObj) {
		thisObj = thisObj || dojo.global;
		var res = new dijit.WidgetSet(), i = 0, id;
		for (id in this._hash) {
			var w = this._hash[id];
			if (filter.call(thisObj, w, i++, this._hash)) {
				res.add(w);
			}
		}
		return res;
	}, byId:function (id) {
		return this._hash[id];
	}, byClass:function (cls) {
		var res = new dijit.WidgetSet(), id, widget;
		for (id in this._hash) {
			widget = this._hash[id];
			if (widget.declaredClass == cls) {
				res.add(widget);
			}
		}
		return res;
	}, toArray:function () {
		var ar = [];
		for (var id in this._hash) {
			ar.push(this._hash[id]);
		}
		return ar;
	}, map:function (func, thisObj) {
		return dojo.map(this.toArray(), func, thisObj);
	}, every:function (func, thisObj) {
		thisObj = thisObj || dojo.global;
		var x = 0, i;
		for (i in this._hash) {
			if (!func.call(thisObj, this._hash[i], x++, this._hash)) {
				return false;
			}
		}
		return true;
	}, some:function (func, thisObj) {
		thisObj = thisObj || dojo.global;
		var x = 0, i;
		for (i in this._hash) {
			if (func.call(thisObj, this._hash[i], x++, this._hash)) {
				return true;
			}
		}
		return false;
	}});
	(function () {
		dijit.registry = new dijit.WidgetSet();
		var hash = dijit.registry._hash, attr = dojo.attr, hasAttr = dojo.hasAttr, style = dojo.style;
		dijit.byId = function (id) {
			return typeof id == "string" ? hash[id] : id;
		};
		var _widgetTypeCtr = {};
		dijit.getUniqueId = function (widgetType) {
			var id;
			do {
				id = widgetType + "_" + (widgetType in _widgetTypeCtr ? ++_widgetTypeCtr[widgetType] : _widgetTypeCtr[widgetType] = 0);
			} while (hash[id]);
			return dijit._scopeName == "dijit" ? id : dijit._scopeName + "_" + id;
		};
		dijit.findWidgets = function (root) {
			var outAry = [];
			function getChildrenHelper(root) {
				for (var node = root.firstChild; node; node = node.nextSibling) {
					if (node.nodeType == 1) {
						var widgetId = node.getAttribute("widgetId");
						if (widgetId) {
							var widget = hash[widgetId];
							if (widget) {
								outAry.push(widget);
							}
						} else {
							getChildrenHelper(node);
						}
					}
				}
			}
			getChildrenHelper(root);
			return outAry;
		};
		dijit._destroyAll = function () {
			dijit._curFocus = null;
			dijit._prevFocus = null;
			dijit._activeStack = [];
			dojo.forEach(dijit.findWidgets(dojo.body()), function (widget) {
				if (!widget._destroyed) {
					if (widget.destroyRecursive) {
						widget.destroyRecursive();
					} else {
						if (widget.destroy) {
							widget.destroy();
						}
					}
				}
			});
		};
		if (dojo.isIE) {
			dojo.addOnWindowUnload(function () {
				dijit._destroyAll();
			});
		}
		dijit.byNode = function (node) {
			return hash[node.getAttribute("widgetId")];
		};
		dijit.getEnclosingWidget = function (node) {
			while (node) {
				var id = node.getAttribute && node.getAttribute("widgetId");
				if (id) {
					return hash[id];
				}
				node = node.parentNode;
			}
			return null;
		};
		var shown = (dijit._isElementShown = function (elem) {
			var s = style(elem);
			return (s.visibility != "hidden") && (s.visibility != "collapsed") && (s.display != "none") && (attr(elem, "type") != "hidden");
		});
		dijit.hasDefaultTabStop = function (elem) {
			switch (elem.nodeName.toLowerCase()) {
			  case "a":
				return hasAttr(elem, "href");
			  case "area":
			  case "button":
			  case "input":
			  case "object":
			  case "select":
			  case "textarea":
				return true;
			  case "iframe":
				var body;
				try {
					var contentDocument = elem.contentDocument;
					if ("designMode" in contentDocument && contentDocument.designMode == "on") {
						return true;
					}
					body = contentDocument.body;
				}
				catch (e1) {
					try {
						body = elem.contentWindow.document.body;
					}
					catch (e2) {
						return false;
					}
				}
				return body.contentEditable == "true" || (body.firstChild && body.firstChild.contentEditable == "true");
			  default:
				return elem.contentEditable == "true";
			}
		};
		var isTabNavigable = (dijit.isTabNavigable = function (elem) {
			if (attr(elem, "disabled")) {
				return false;
			} else {
				if (hasAttr(elem, "tabIndex")) {
					return attr(elem, "tabIndex") >= 0;
				} else {
					return dijit.hasDefaultTabStop(elem);
				}
			}
		});
		dijit._getTabNavigable = function (root) {
			var first, last, lowest, lowestTabindex, highest, highestTabindex, radioSelected = {};
			function radioName(node) {
				return node && node.tagName.toLowerCase() == "input" && node.type && node.type.toLowerCase() == "radio" && node.name && node.name.toLowerCase();
			}
			var walkTree = function (parent) {
				dojo.query("> *", parent).forEach(function (child) {
					if ((dojo.isIE && child.scopeName !== "HTML") || !shown(child)) {
						return;
					}
					if (isTabNavigable(child)) {
						var tabindex = attr(child, "tabIndex");
						if (!hasAttr(child, "tabIndex") || tabindex == 0) {
							if (!first) {
								first = child;
							}
							last = child;
						} else {
							if (tabindex > 0) {
								if (!lowest || tabindex < lowestTabindex) {
									lowestTabindex = tabindex;
									lowest = child;
								}
								if (!highest || tabindex >= highestTabindex) {
									highestTabindex = tabindex;
									highest = child;
								}
							}
						}
						var rn = radioName(child);
						if (dojo.attr(child, "checked") && rn) {
							radioSelected[rn] = child;
						}
					}
					if (child.nodeName.toUpperCase() != "SELECT") {
						walkTree(child);
					}
				});
			};
			if (shown(root)) {
				walkTree(root);
			}
			function rs(node) {
				return radioSelected[radioName(node)] || node;
			}
			return {first:rs(first), last:rs(last), lowest:rs(lowest), highest:rs(highest)};
		};
		dijit.getFirstInTabbingOrder = function (root) {
			var elems = dijit._getTabNavigable(dojo.byId(root));
			return elems.lowest ? elems.lowest : elems.first;
		};
		dijit.getLastInTabbingOrder = function (root) {
			var elems = dijit._getTabNavigable(dojo.byId(root));
			return elems.last ? elems.last : elems.highest;
		};
		dijit.defaultDuration = dojo.config["defaultDuration"] || 200;
	})();
}

