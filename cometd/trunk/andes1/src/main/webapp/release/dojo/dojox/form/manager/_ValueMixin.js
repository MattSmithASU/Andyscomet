/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.manager._ValueMixin"]) {
	dojo._hasResource["dojox.form.manager._ValueMixin"] = true;
	dojo.provide("dojox.form.manager._ValueMixin");
	dojo.declare("dojox.form.manager._ValueMixin", null, {elementValue:function (name, value) {
		if (name in this.formWidgets) {
			return this.formWidgetValue(name, value);
		}
		if (this.formNodes && name in this.formNodes) {
			return this.formNodeValue(name, value);
		}
		return this.formPointValue(name, value);
	}, gatherFormValues:function (names) {
		var result = this.inspectFormWidgets(function (name) {
			return this.formWidgetValue(name);
		}, names);
		if (this.inspectFormNodes) {
			dojo.mixin(result, this.inspectFormNodes(function (name) {
				return this.formNodeValue(name);
			}, names));
		}
		dojo.mixin(result, this.inspectAttachedPoints(function (name) {
			return this.formPointValue(name);
		}, names));
		return result;
	}, setFormValues:function (values) {
		if (values) {
			this.inspectFormWidgets(function (name, widget, value) {
				this.formWidgetValue(name, value);
			}, values);
			if (this.inspectFormNodes) {
				this.inspectFormNodes(function (name, node, value) {
					this.formNodeValue(name, value);
				}, values);
			}
			this.inspectAttachedPoints(function (name, node, value) {
				this.formPointValue(name, value);
			}, values);
		}
		return this;
	}});
}

