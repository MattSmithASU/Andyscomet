/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._WidgetsInTemplateMixin"]) {
	dojo._hasResource["dijit._WidgetsInTemplateMixin"] = true;
	dojo.provide("dijit._WidgetsInTemplateMixin");
	dojo.require("dojo.parser");
	dojo.declare("dijit._WidgetsInTemplateMixin", null, {_earlyTemplatedStartup:false, widgetsInTemplate:true, _beforeFillContent:function () {
		if (this.widgetsInTemplate) {
			var node = this.domNode;
			var cw = (this._startupWidgets = dojo.parser.parse(node, {noStart:!this._earlyTemplatedStartup, template:true, inherited:{dir:this.dir, lang:this.lang, textDir:this.textDir}, propsThis:this, scope:"dojo"}));
			this._supportingWidgets = dijit.findWidgets(node);
			this._attachTemplateNodes(cw, function (n, p) {
				return n[p];
			});
		}
	}, startup:function () {
		dojo.forEach(this._startupWidgets, function (w) {
			if (w && !w._started && w.startup) {
				w.startup();
			}
		});
		this.inherited(arguments);
	}});
}

