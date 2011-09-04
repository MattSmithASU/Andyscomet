/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Form"]) {
	dojo._hasResource["dijit.form.Form"] = true;
	dojo.provide("dijit.form.Form");
	dojo.require("dijit._Widget");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit.form._FormMixin");
	dojo.require("dijit.layout._ContentPaneResizeMixin");
	dojo.declare("dijit.form.Form", [dijit._Widget, dijit._TemplatedMixin, dijit.form._FormMixin, dijit.layout._ContentPaneResizeMixin], {name:"", action:"", method:"", encType:"", "accept-charset":"", accept:"", target:"", templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' ${!nameAttrSetting}></form>", postMixInProperties:function () {
		this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
		this.inherited(arguments);
	}, execute:function (formContents) {
	}, onExecute:function () {
	}, _setEncTypeAttr:function (value) {
		this.encType = value;
		dojo.attr(this.domNode, "encType", value);
		if (dojo.isIE) {
			this.domNode.encoding = value;
		}
	}, reset:function (e) {
		var faux = {returnValue:true, preventDefault:function () {
			this.returnValue = false;
		}, stopPropagation:function () {
		}, currentTarget:e ? e.target : this.domNode, target:e ? e.target : this.domNode};
		if (!(this.onReset(faux) === false) && faux.returnValue) {
			this.inherited(arguments, []);
		}
	}, onReset:function (e) {
		return true;
	}, _onReset:function (e) {
		this.reset(e);
		dojo.stopEvent(e);
		return false;
	}, _onSubmit:function (e) {
		var fp = dijit.form.Form.prototype;
		if (this.execute != fp.execute || this.onExecute != fp.onExecute) {
			dojo.deprecated("dijit.form.Form:execute()/onExecute() are deprecated. Use onSubmit() instead.", "", "2.0");
			this.onExecute();
			this.execute(this.getValues());
		}
		if (this.onSubmit(e) === false) {
			dojo.stopEvent(e);
		}
	}, onSubmit:function (e) {
		return this.isValid();
	}, submit:function () {
		if (!(this.onSubmit() === false)) {
			this.containerNode.submit();
		}
	}});
}

