/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.xml.DomParser"]) {
	dojo._hasResource["dojox.xml.DomParser"] = true;
	dojo.provide("dojox.xml.DomParser");
	dojox.xml.DomParser = new (function () {
		var nodeTypes = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9};
		var reTags = /<([^>\/\s+]*)([^>]*)>([^<]*)/g;
		var reAttr = /([^=]*)=(("([^"]*)")|('([^']*)'))/g;
		var reEntity = /<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
		var reCData = /<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
		var reComments = /<!--([\u0001-\uFFFF]*?)-->/g;
		var trim = /^\s+|\s+$/g;
		var normalize = /\s+/g;
		var egt = /\&gt;/g;
		var elt = /\&lt;/g;
		var equot = /\&quot;/g;
		var eapos = /\&apos;/g;
		var eamp = /\&amp;/g;
		var dNs = "_def_";
		function _doc() {
			return new (function () {
				var all = {};
				this.nodeType = nodeTypes.DOCUMENT;
				this.nodeName = "#document";
				this.namespaces = {};
				this._nsPaths = {};
				this.childNodes = [];
				this.documentElement = null;
				this._add = function (obj) {
					if (typeof (obj.id) != "undefined") {
						all[obj.id] = obj;
					}
				};
				this._remove = function (id) {
					if (all[id]) {
						delete all[id];
					}
				};
				this.byId = this.getElementById = function (id) {
					return all[id];
				};
				this.byName = this.getElementsByTagName = byName;
				this.byNameNS = this.getElementsByTagNameNS = byNameNS;
				this.childrenByName = childrenByName;
				this.childrenByNameNS = childrenByNameNS;
			})();
		}
		function byName(name) {
			function __(node, name, arr) {
				dojo.forEach(node.childNodes, function (c) {
					if (c.nodeType == nodeTypes.ELEMENT) {
						if (name == "*") {
							arr.push(c);
						} else {
							if (c.nodeName == name) {
								arr.push(c);
							}
						}
						__(c, name, arr);
					}
				});
			}
			var a = [];
			__(this, name, a);
			return a;
		}
		function byNameNS(name, ns) {
			function __(node, name, ns, arr) {
				dojo.forEach(node.childNodes, function (c) {
					if (c.nodeType == nodeTypes.ELEMENT) {
						if (name == "*" && c.ownerDocument._nsPaths[ns] == c.namespace) {
							arr.push(c);
						} else {
							if (c.localName == name && c.ownerDocument._nsPaths[ns] == c.namespace) {
								arr.push(c);
							}
						}
						__(c, name, ns, arr);
					}
				});
			}
			if (!ns) {
				ns = dNs;
			}
			var a = [];
			__(this, name, ns, a);
			return a;
		}
		function childrenByName(name) {
			var a = [];
			dojo.forEach(this.childNodes, function (c) {
				if (c.nodeType == nodeTypes.ELEMENT) {
					if (name == "*") {
						a.push(c);
					} else {
						if (c.nodeName == name) {
							a.push(c);
						}
					}
				}
			});
			return a;
		}
		function childrenByNameNS(name, ns) {
			var a = [];
			dojo.forEach(this.childNodes, function (c) {
				if (c.nodeType == nodeTypes.ELEMENT) {
					if (name == "*" && c.ownerDocument._nsPaths[ns] == c.namespace) {
						a.push(c);
					} else {
						if (c.localName == name && c.ownerDocument._nsPaths[ns] == c.namespace) {
							a.push(c);
						}
					}
				}
			});
			return a;
		}
		function _createTextNode(v) {
			return {nodeType:nodeTypes.TEXT, nodeName:"#text", nodeValue:v.replace(normalize, " ").replace(egt, ">").replace(elt, "<").replace(eapos, "'").replace(equot, "\"").replace(eamp, "&")};
		}
		function getAttr(name) {
			for (var i = 0; i < this.attributes.length; i++) {
				if (this.attributes[i].nodeName == name) {
					return this.attributes[i].nodeValue;
				}
			}
			return null;
		}
		function getAttrNS(name, ns) {
			for (var i = 0; i < this.attributes.length; i++) {
				if (this.ownerDocument._nsPaths[ns] == this.attributes[i].namespace && this.attributes[i].localName == name) {
					return this.attributes[i].nodeValue;
				}
			}
			return null;
		}
		function setAttr(name, val) {
			var old = null;
			for (var i = 0; i < this.attributes.length; i++) {
				if (this.attributes[i].nodeName == name) {
					old = this.attributes[i].nodeValue;
					this.attributes[i].nodeValue = val;
					break;
				}
			}
			if (name == "id") {
				if (old != null) {
					this.ownerDocument._remove(old);
				}
				this.ownerDocument._add(this);
			}
		}
		function setAttrNS(name, val, ns) {
			for (var i = 0; i < this.attributes.length; i++) {
				if (this.ownerDocument._nsPaths[ns] == this.attributes[i].namespace && this.attributes[i].localName == name) {
					this.attributes[i].nodeValue = val;
					return;
				}
			}
		}
		function prev() {
			var p = this.parentNode;
			if (p) {
				for (var i = 0; i < p.childNodes.length; i++) {
					if (p.childNodes[i] == this && i > 0) {
						return p.childNodes[i - 1];
					}
				}
			}
			return null;
		}
		function next() {
			var p = this.parentNode;
			if (p) {
				for (var i = 0; i < p.childNodes.length; i++) {
					if (p.childNodes[i] == this && (i + 1) < p.childNodes.length) {
						return p.childNodes[i + 1];
					}
				}
			}
			return null;
		}
		this.parse = function (str) {
			var root = _doc();
			if (str == null) {
				return root;
			}
			if (str.length == 0) {
				return root;
			}
			if (str.indexOf("<!ENTITY") > 0) {
				var entity, eRe = [];
				if (reEntity.test(str)) {
					reEntity.lastIndex = 0;
					while ((entity = reEntity.exec(str)) != null) {
						eRe.push({entity:"&" + entity[1].replace(trim, "") + ";", expression:entity[2]});
					}
					for (var i = 0; i < eRe.length; i++) {
						str = str.replace(new RegExp(eRe[i].entity, "g"), eRe[i].expression);
					}
				}
			}
			var cdSections = [], cdata;
			while ((cdata = reCData.exec(str)) != null) {
				cdSections.push(cdata[1]);
			}
			for (var i = 0; i < cdSections.length; i++) {
				str = str.replace(cdSections[i], i);
			}
			var comments = [], comment;
			while ((comment = reComments.exec(str)) != null) {
				comments.push(comment[1]);
			}
			for (i = 0; i < comments.length; i++) {
				str = str.replace(comments[i], i);
			}
			var res, obj = root;
			while ((res = reTags.exec(str)) != null) {
				if (res[2].charAt(0) == "/" && res[2].replace(trim, "").length > 1) {
					if (obj.parentNode) {
						obj = obj.parentNode;
					}
					var text = (res[3] || "").replace(trim, "");
					if (text.length > 0) {
						obj.childNodes.push(_createTextNode(text));
					}
				} else {
					if (res[1].length > 0) {
						if (res[1].charAt(0) == "?") {
							var name = res[1].substr(1);
							var target = res[2].substr(0, res[2].length - 2);
							obj.childNodes.push({nodeType:nodeTypes.PROCESSING_INSTRUCTION, nodeName:name, nodeValue:target});
						} else {
							if (res[1].charAt(0) == "!") {
								if (res[1].indexOf("![CDATA[") == 0) {
									var val = parseInt(res[1].replace("![CDATA[", "").replace("]]", ""));
									obj.childNodes.push({nodeType:nodeTypes.CDATA_SECTION, nodeName:"#cdata-section", nodeValue:cdSections[val]});
								} else {
									if (res[1].substr(0, 3) == "!--") {
										var val = parseInt(res[1].replace("!--", "").replace("--", ""));
										obj.childNodes.push({nodeType:nodeTypes.COMMENT, nodeName:"#comment", nodeValue:comments[val]});
									}
								}
							} else {
								var name = res[1].replace(trim, "");
								var o = {nodeType:nodeTypes.ELEMENT, nodeName:name, localName:name, namespace:dNs, ownerDocument:root, attributes:[], parentNode:null, childNodes:[]};
								if (name.indexOf(":") > -1) {
									var t = name.split(":");
									o.namespace = t[0];
									o.localName = t[1];
								}
								o.byName = o.getElementsByTagName = byName;
								o.byNameNS = o.getElementsByTagNameNS = byNameNS;
								o.childrenByName = childrenByName;
								o.childrenByNameNS = childrenByNameNS;
								o.getAttribute = getAttr;
								o.getAttributeNS = getAttrNS;
								o.setAttribute = setAttr;
								o.setAttributeNS = setAttrNS;
								o.previous = o.previousSibling = prev;
								o.next = o.nextSibling = next;
								var attr;
								while ((attr = reAttr.exec(res[2])) != null) {
									if (attr.length > 0) {
										var name = attr[1].replace(trim, "");
										var val = (attr[4] || attr[6] || "").replace(normalize, " ").replace(egt, ">").replace(elt, "<").replace(eapos, "'").replace(equot, "\"").replace(eamp, "&");
										if (name.indexOf("xmlns") == 0) {
											if (name.indexOf(":") > 0) {
												var ns = name.split(":");
												root.namespaces[ns[1]] = val;
												root._nsPaths[val] = ns[1];
											} else {
												root.namespaces[dNs] = val;
												root._nsPaths[val] = dNs;
											}
										} else {
											var ln = name;
											var ns = dNs;
											if (name.indexOf(":") > 0) {
												var t = name.split(":");
												ln = t[1];
												ns = t[0];
											}
											o.attributes.push({nodeType:nodeTypes.ATTRIBUTE, nodeName:name, localName:ln, namespace:ns, nodeValue:val});
											if (ln == "id") {
												o.id = val;
											}
										}
									}
								}
								root._add(o);
								if (obj) {
									obj.childNodes.push(o);
									o.parentNode = obj;
									if (res[2].charAt(res[2].length - 1) != "/") {
										obj = o;
									}
								}
								var text = res[3];
								if (text.length > 0) {
									obj.childNodes.push(_createTextNode(text));
								}
							}
						}
					}
				}
			}
			for (var i = 0; i < root.childNodes.length; i++) {
				var e = root.childNodes[i];
				if (e.nodeType == nodeTypes.ELEMENT) {
					root.documentElement = e;
					break;
				}
			}
			return root;
		};
	})();
}

