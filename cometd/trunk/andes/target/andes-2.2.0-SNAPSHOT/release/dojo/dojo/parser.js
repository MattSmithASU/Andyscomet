/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.parser"]) {
	dojo._hasResource["dojo.parser"] = true;
	dojo.provide("dojo.parser");
	dojo.require("dojo.date.stamp");
	new Date("X");
	var features = {"dom-attributes-explicit":document.createElement("div").attributes.length < 40};
	function has(feature) {
		return features[feature];
	}
	dojo.parser = new function () {
		var d = dojo;
		var _nameMap = {};
		function getNameMap(proto) {
			var map = {};
			for (var name in proto) {
				if (name.charAt(0) == "_") {
					continue;
				}
				map[name.toLowerCase()] = name;
			}
			return map;
		}
		d.connect(d, "extend", function () {
			_nameMap = {};
		});
		var _ctorMap = {};
		this._functionFromScript = function (script, attrData) {
			var preamble = "";
			var suffix = "";
			var argsStr = (script.getAttribute(attrData + "args") || script.getAttribute("args"));
			if (argsStr) {
				d.forEach(argsStr.split(/\s*,\s*/), function (part, idx) {
					preamble += "var " + part + " = arguments[" + idx + "]; ";
				});
			}
			var withStr = script.getAttribute("with");
			if (withStr && withStr.length) {
				d.forEach(withStr.split(/\s*,\s*/), function (part) {
					preamble += "with(" + part + "){";
					suffix += "}";
				});
			}
			return new Function(preamble + script.innerHTML + suffix);
		};
		this.instantiate = function (nodes, mixin, args) {
			var thelist = [], mixin = mixin || {};
			args = args || {};
			var dojoType = (args.scope || d._scopeName) + "Type", attrData = "data-" + (args.scope || d._scopeName) + "-", dataDojoType = attrData + "type", dataDojoProps = attrData + "props", dataDojoAttachPoint = attrData + "attach-point", dataDojoAttachEvent = attrData + "attach-event", dataDojoId = attrData + "id";
			var specialAttrs = {};
			dojo.forEach([dataDojoProps, dataDojoType, dojoType, dataDojoId, "jsId", dataDojoAttachPoint, dataDojoAttachEvent, "dojoAttachPoint", "dojoAttachEvent", "class", "style"], function (name) {
				specialAttrs[name.toLowerCase()] = name.replace(args.scope, "dojo");
			});
			d.forEach(nodes, function (obj) {
				if (!obj) {
					return;
				}
				var node = obj.node || obj, type = dojoType in mixin ? mixin[dojoType] : obj.node ? obj.type : (node.getAttribute(dataDojoType) || node.getAttribute(dojoType)), ctor = _ctorMap[type] || (_ctorMap[type] = dojo.getObject(type));
				proto = ctor && ctor.prototype;
				if (!ctor) {
					throw new Error("Could not load class '" + type);
				}
				var params = {};
				if (args.defaults) {
					d._mixin(params, args.defaults);
				}
				if (obj.inherited) {
					d._mixin(params, obj.inherited);
				}
				var attributes;
				if (has("dom-attributes-explicit")) {
					attributes = node.attributes;
				} else {
					var clone = /^input$|^img$/i.test(node.nodeName) ? node : node.cloneNode(false), attrs = clone.outerHTML.replace(/=[^\s"']+|="[^"]*"|='[^']*'/g, "").replace(/^\s*<[a-zA-Z]*/, "").replace(/>.*$/, "");
					attributes = dojo.map(attrs.split(/\s+/), function (name) {
						var lcName = name.toLowerCase();
						return {name:name, value:node.nodeName.match(/^BUTTON$|^TEXTAREA$/) && name == "value" ? node.getAttributeNode(lcName).value : node.getAttribute(lcName), specified:true};
					});
				}
				var i = 0, item;
				while (item = attributes[i++]) {
					if (!item || !item.specified) {
						continue;
					}
					var name = item.name, lcName = name.toLowerCase(), value = item.value;
					if (lcName in specialAttrs) {
						switch (specialAttrs[lcName]) {
						  case "data-dojo-props":
							var extra = value;
							break;
						  case "data-dojo-id":
						  case "jsId":
							var jsname = value;
							break;
						  case "data-dojo-attach-point":
						  case "dojoAttachPoint":
							params.dojoAttachPoint = value;
							break;
						  case "data-dojo-attach-event":
						  case "dojoAttachEvent":
							params.dojoAttachEvent = value;
							break;
						  case "class":
							params["class"] = node.className;
							break;
						  case "style":
							params["style"] = node.style && node.style.cssText;
							break;
						}
					} else {
						if (!(name in proto)) {
							var map = (_nameMap[type] || (_nameMap[type] = getNameMap(proto)));
							name = map[lcName] || name;
						}
						if (typeof value == "string" && name in proto) {
							switch (typeof proto[name]) {
							  case "string":
								params[name] = value;
								break;
							  case "number":
								params[name] = value.length ? Number(value) : NaN;
								break;
							  case "boolean":
								params[name] = typeof value == "boolean" ? value : !(value.toLowerCase() == "false");
								break;
							  case "function":
								if (d.isFunction(value)) {
									value = value.toString();
									value = d.trim(value.substring(value.indexOf("{") + 1, value.length - 1));
								}
								try {
									if (value === "" || value.search(/[^\w\.]+/i) != -1) {
										params[name] = new Function(value);
									} else {
										params[name] = d.getObject(value, false) || new Function(value);
									}
								}
								catch (e) {
									params[name] = new Function();
								}
								break;
							  default:
								var pVal = proto[name];
								params[name] = (pVal && "length" in pVal) ? (value ? value.split(/\s*,\s*/) : []) : (pVal instanceof Date) ? (value == "" ? new Date("") : value == "now" ? new Date() : d.date.stamp.fromISOString(value)) : (pVal instanceof d._Url) ? (d.baseUrl + value) : d.fromJson(value);
							}
						} else {
							params[name] = value;
						}
					}
				}
				if (extra) {
					try {
						extra = d.fromJson.call(args.propsThis, "{" + extra + "}");
						d._mixin(params, extra);
					}
					catch (e) {
						throw new Error(e.toString() + " in data-dojo-props='" + extra + "'");
					}
				}
				d._mixin(params, mixin);
				var scripts = obj.node ? obj.scripts : (ctor && (ctor._noScript || proto._noScript) ? [] : d.query("> script[type^='dojo/']", node));
				var connects = [], calls = [];
				if (scripts) {
					for (i = 0; i < scripts.length; i++) {
						var script = scripts[i];
						node.removeChild(script);
						var event = (script.getAttribute(attrData + "event") || script.getAttribute("event")), type = script.getAttribute("type"), nf = this._functionFromScript(script, attrData);
						if (event) {
							if (type == "dojo/connect") {
								connects.push({event:event, func:nf});
							} else {
								params[event] = nf;
							}
						} else {
							calls.push(nf);
						}
					}
				}
				var markupFactory = ctor.markupFactory || proto.markupFactory;
				var instance = markupFactory ? markupFactory(params, node, ctor) : new ctor(params, node);
				thelist.push(instance);
				if (jsname) {
					d.setObject(jsname, instance);
				}
				for (i = 0; i < connects.length; i++) {
					d.connect(instance, connects[i].event, null, connects[i].func);
				}
				for (i = 0; i < calls.length; i++) {
					calls[i].call(instance);
				}
			}, this);
			if (!mixin._started) {
				d.forEach(thelist, function (instance) {
					if (!args.noStart && instance && dojo.isFunction(instance.startup) && !instance._started && (!instance.getParent || !instance.getParent())) {
						instance.startup();
					}
				});
			}
			return thelist;
		};
		this.parse = function (rootNode, args) {
			var root;
			if (!args && rootNode && rootNode.rootNode) {
				args = rootNode;
				root = args.rootNode;
			} else {
				root = rootNode;
			}
			root = root ? dojo.byId(root) : dojo.body();
			args = args || {};
			var dojoType = (args.scope || d._scopeName) + "Type", attrData = "data-" + (args.scope || d._scopeName) + "-", dataDojoType = attrData + "type", dataDojoTextDir = attrData + "textdir";
			var list = [];
			var node = root.firstChild;
			var inherited = args && args.inherited;
			if (!inherited) {
				function findAncestorAttr(node, attr) {
					return node.getAttribute(attr) || (node !== d.doc.documentElement && node.parentNode ? findAncestorAttr(node.parentNode, attr) : null);
				}
				inherited = {dir:findAncestorAttr(root, "dir"), lang:findAncestorAttr(root, "lang"), textDir:findAncestorAttr(root, dataDojoTextDir)};
				for (var key in inherited) {
					if (!inherited[key]) {
						delete inherited[key];
					}
				}
			}
			var parent = {inherited:inherited};
			var scripts;
			var scriptsOnly;
			function getEffective(parent) {
				if (!parent.inherited) {
					parent.inherited = {};
					var node = parent.node, grandparent = getEffective(parent.parent);
					var inherited = {dir:node.getAttribute("dir") || grandparent.dir, lang:node.getAttribute("lang") || grandparent.lang, textDir:node.getAttribute(dataDojoTextDir) || grandparent.textDir};
					for (var key in inherited) {
						if (inherited[key]) {
							parent.inherited[key] = inherited[key];
						}
					}
				}
				return parent.inherited;
			}
			while (true) {
				if (!node) {
					if (!parent || !parent.node) {
						break;
					}
					node = parent.node.nextSibling;
					scripts = parent.scripts;
					scriptsOnly = false;
					parent = parent.parent;
					continue;
				}
				if (node.nodeType != 1) {
					node = node.nextSibling;
					continue;
				}
				if (scripts && node.nodeName.toLowerCase() == "script") {
					type = node.getAttribute("type");
					if (type && /^dojo\/\w/i.test(type)) {
						scripts.push(node);
					}
					node = node.nextSibling;
					continue;
				}
				if (scriptsOnly) {
					node = node.nextSibling;
					continue;
				}
				var type = node.getAttribute(dataDojoType) || node.getAttribute(dojoType);
				var firstChild = node.firstChild;
				if (!type && (!firstChild || (firstChild.nodeType == 3 && !firstChild.nextSibling))) {
					node = node.nextSibling;
					continue;
				}
				var current = {node:node, scripts:scripts, parent:parent};
				var ctor = type && (_ctorMap[type] || (_ctorMap[type] = dojo.getObject(type))), childScripts = ctor && !ctor.prototype._noScript ? [] : null;
				if (type) {
					list.push({"type":type, node:node, scripts:childScripts, inherited:getEffective(current)});
				}
				node = firstChild;
				scripts = childScripts;
				scriptsOnly = ctor && ctor.prototype.stopParser && !(args && args.template);
				parent = current;
			}
			var mixin = args && args.template ? {template:true} : null;
			return this.instantiate(list, mixin, args);
		};
	}();
	(function () {
		var parseRunner = function () {
			if (dojo.config.parseOnLoad) {
				dojo.parser.parse();
			}
		};
		if (dojo.getObject("dijit.wai.onload") === dojo._loaders[0]) {
			dojo._loaders.splice(1, 0, parseRunner);
		} else {
			dojo._loaders.unshift(parseRunner);
		}
	})();
}

