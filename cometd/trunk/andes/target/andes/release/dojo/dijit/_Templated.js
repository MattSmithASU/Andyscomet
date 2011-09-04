/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._Templated"]) {
	dojo._hasResource["dijit._Templated"] = true;
	dojo.provide("dijit._Templated");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit._WidgetsInTemplateMixin");
	dojo.require("dojo.string");
	dojo.require("dojo.parser");
	dojo.require("dojo.cache");
	dojo.declare("dijit._Templated", [dijit._TemplatedMixin, dijit._WidgetsInTemplateMixin], {widgetsInTemplate:false, constructor:function () {
		dojo.deprecated(this.declaredClass + ": dijit._Templated deprecated, use dijit._TemplatedMixin and if necessary dijit._WidgetsInTemplateMixin", "", "2.0");
	}, _attachTemplateNodes:function (rootNode, getAttrFunc) {
		this.inherited(arguments);
		var nodes = dojo.isArray(rootNode) ? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
		var x = dojo.isArray(rootNode) ? 0 : -1;
		for (; x < nodes.length; x++) {
			var baseNode = (x == -1) ? rootNode : nodes[x];
			var role = getAttrFunc(baseNode, "waiRole");
			if (role) {
				dijit.setWaiRole(baseNode, role);
			}
			var values = getAttrFunc(baseNode, "waiState");
			if (values) {
				dojo.forEach(values.split(/\s*,\s*/), function (stateValue) {
					if (stateValue.indexOf("-") != -1) {
						var pair = stateValue.split("-");
						dijit.setWaiState(baseNode, pair[0], pair[1]);
					}
				});
			}
		}
	}});
	dojo.extend(dijit._Widget, {waiRole:"", waiState:""});
}

