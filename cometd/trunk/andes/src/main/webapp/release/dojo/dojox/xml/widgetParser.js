/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.xml.widgetParser"]) {
	dojo._hasResource["dojox.xml.widgetParser"] = true;
	dojo.provide("dojox.xml.widgetParser");
	dojo.require("dojox.xml.parser");
	dojo.require("dojo.parser");
	dojox.xml.widgetParser = new function () {
		var d = dojo;
		this.parseNode = function (node) {
			var toBuild = [];
			d.query("script[type='text/xml']", node).forEach(function (script) {
				toBuild.push.apply(toBuild, this._processScript(script));
			}, this).orphan();
			return d.parser.instantiate(toBuild);
		};
		this._processScript = function (script) {
			var text = script.src ? d._getText(script.src) : script.innerHTML || script.firstChild.nodeValue;
			var htmlNode = this.toHTML(dojox.xml.parser.parse(text).firstChild);
			var ret = d.query("[dojoType]", htmlNode);
			dojo.query(">", htmlNode).place(script, "before");
			script.parentNode.removeChild(script);
			return ret;
		};
		this.toHTML = function (node) {
			var newNode;
			var nodeName = node.nodeName;
			var dd = dojo.doc;
			var type = node.nodeType;
			if (type >= 3) {
				return dd.createTextNode((type == 3 || type == 4) ? node.nodeValue : "");
			}
			var localName = node.localName || nodeName.split(":").pop();
			var namespace = node.namespaceURI || (node.getNamespaceUri ? node.getNamespaceUri() : "");
			if (namespace == "html") {
				newNode = dd.createElement(localName);
			} else {
				var dojoType = namespace + "." + localName;
				newNode = newNode || dd.createElement((dojoType == "dijit.form.ComboBox") ? "select" : "div");
				newNode.setAttribute("dojoType", dojoType);
			}
			d.forEach(node.attributes, function (attr) {
				var name = attr.name || attr.nodeName;
				var value = attr.value || attr.nodeValue;
				if (name.indexOf("xmlns") != 0) {
					if (dojo.isIE && name == "style") {
						newNode.style.setAttribute("cssText", value);
					} else {
						newNode.setAttribute(name, value);
					}
				}
			});
			d.forEach(node.childNodes, function (cn) {
				var childNode = this.toHTML(cn);
				if (localName == "script") {
					newNode.text += childNode.nodeValue;
				} else {
					newNode.appendChild(childNode);
				}
			}, this);
			return newNode;
		};
	}();
}

