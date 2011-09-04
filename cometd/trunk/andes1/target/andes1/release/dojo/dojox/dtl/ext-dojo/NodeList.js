/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.dtl.ext-dojo.NodeList"]) {
	dojo._hasResource["dojox.dtl.ext-dojo.NodeList"] = true;
	dojo.provide("dojox.dtl.ext-dojo.NodeList");
	dojo.require("dojox.dtl._base");
	dojo.extend(dojo.NodeList, {dtl:function (template, context) {
		var d = dojox.dtl;
		var self = this;
		var render = function (template, context) {
			var content = template.render(new d._Context(context));
			self.forEach(function (node) {
				node.innerHTML = content;
			});
		};
		d.text._resolveTemplateArg(template).addCallback(function (templateString) {
			template = new d.Template(templateString);
			d.text._resolveContextArg(context).addCallback(function (context) {
				render(template, context);
			});
		});
		return this;
	}});
}

