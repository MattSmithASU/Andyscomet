/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.html"]) {
	dojo._hasResource["dojo.html"] = true;
	dojo.provide("dojo.html");
	dojo.require("dojo.parser");
	dojo.getObject("html", true, dojo);
	(function () {
		var idCounter = 0, d = dojo;
		dojo.html._secureForInnerHtml = function (cont) {
			return cont.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig, "");
		};
		dojo.html._emptyNode = dojo.empty;
		dojo.html._setNodeContent = function (node, cont) {
			d.empty(node);
			if (cont) {
				if (typeof cont == "string") {
					cont = d._toDom(cont, node.ownerDocument);
				}
				if (!cont.nodeType && d.isArrayLike(cont)) {
					for (var startlen = cont.length, i = 0; i < cont.length; i = startlen == cont.length ? i + 1 : 0) {
						d.place(cont[i], node, "last");
					}
				} else {
					d.place(cont, node, "last");
				}
			}
			return node;
		};
		dojo.declare("dojo.html._ContentSetter", null, {node:"", content:"", id:"", cleanContent:false, extractContent:false, parseContent:false, parserScope:dojo._scopeName, startup:true, constructor:function (params, node) {
			dojo.mixin(this, params || {});
			node = this.node = dojo.byId(this.node || node);
			if (!this.id) {
				this.id = ["Setter", (node) ? node.id || node.tagName : "", idCounter++].join("_");
			}
		}, set:function (cont, params) {
			if (undefined !== cont) {
				this.content = cont;
			}
			if (params) {
				this._mixin(params);
			}
			this.onBegin();
			this.setContent();
			this.onEnd();
			return this.node;
		}, setContent:function () {
			var node = this.node;
			if (!node) {
				throw new Error(this.declaredClass + ": setContent given no node");
			}
			try {
				node = dojo.html._setNodeContent(node, this.content);
			}
			catch (e) {
				var errMess = this.onContentError(e);
				try {
					node.innerHTML = errMess;
				}
				catch (e) {
					console.error("Fatal " + this.declaredClass + ".setContent could not change content due to " + e.message, e);
				}
			}
			this.node = node;
		}, empty:function () {
			if (this.parseResults && this.parseResults.length) {
				dojo.forEach(this.parseResults, function (w) {
					if (w.destroy) {
						w.destroy();
					}
				});
				delete this.parseResults;
			}
			dojo.html._emptyNode(this.node);
		}, onBegin:function () {
			var cont = this.content;
			if (dojo.isString(cont)) {
				if (this.cleanContent) {
					cont = dojo.html._secureForInnerHtml(cont);
				}
				if (this.extractContent) {
					var match = cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
					if (match) {
						cont = match[1];
					}
				}
			}
			this.empty();
			this.content = cont;
			return this.node;
		}, onEnd:function () {
			if (this.parseContent) {
				this._parse();
			}
			return this.node;
		}, tearDown:function () {
			delete this.parseResults;
			delete this.node;
			delete this.content;
		}, onContentError:function (err) {
			return "Error occured setting content: " + err;
		}, _mixin:function (params) {
			var empty = {}, key;
			for (key in params) {
				if (key in empty) {
					continue;
				}
				this[key] = params[key];
			}
		}, _parse:function () {
			var rootNode = this.node;
			try {
				var inherited = {};
				dojo.forEach(["dir", "lang", "textDir"], function (name) {
					if (this[name]) {
						inherited[name] = this[name];
					}
				}, this);
				this.parseResults = dojo.parser.parse({rootNode:rootNode, noStart:!this.startup, inherited:inherited, scope:this.parserScope});
			}
			catch (e) {
				this._onError("Content", e, "Error parsing in _ContentSetter#" + this.id);
			}
		}, _onError:function (type, err, consoleText) {
			var errText = this["on" + type + "Error"].call(this, err);
			if (consoleText) {
				console.error(consoleText, err);
			} else {
				if (errText) {
					dojo.html._setNodeContent(this.node, errText, true);
				}
			}
		}});
		dojo.html.set = function (node, cont, params) {
			if (undefined == cont) {
				console.warn("dojo.html.set: no cont argument provided, using empty string");
				cont = "";
			}
			if (!params) {
				return dojo.html._setNodeContent(node, cont, true);
			} else {
				var op = new dojo.html._ContentSetter(dojo.mixin(params, {content:cont, node:node}));
				return op.set();
			}
		};
	})();
}

