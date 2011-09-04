/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.manager._FormMixin"]) {
	dojo._hasResource["dojox.form.manager._FormMixin"] = true;
	dojo.provide("dojox.form.manager._FormMixin");
	dojo.require("dojox.form.manager._Mixin");
	(function () {
		var fm = dojox.form.manager, aa = fm.actionAdapter;
		dojo.declare("dojox.form.manager._FormMixin", null, {name:"", action:"", method:"", encType:"", "accept-charset":"", accept:"", target:"", startup:function () {
			this.isForm = this.domNode.tagName.toLowerCase() == "form";
			if (this.isForm) {
				this.connect(this.domNode, "onreset", "_onReset");
				this.connect(this.domNode, "onsubmit", "_onSubmit");
			}
			this.inherited(arguments);
		}, _onReset:function (evt) {
			var faux = {returnValue:true, preventDefault:function () {
				this.returnValue = false;
			}, stopPropagation:function () {
			}, currentTarget:evt.currentTarget, target:evt.target};
			if (!(this.onReset(faux) === false) && faux.returnValue) {
				this.reset();
			}
			dojo.stopEvent(evt);
			return false;
		}, onReset:function () {
			return true;
		}, reset:function () {
			this.inspectFormWidgets(aa(function (_, widget) {
				if (widget.reset) {
					widget.reset();
				}
			}));
			if (this.isForm) {
				this.domNode.reset();
			}
			return this;
		}, _onSubmit:function (evt) {
			if (this.onSubmit(evt) === false) {
				dojo.stopEvent(evt);
			}
		}, onSubmit:function () {
			return this.isValid();
		}, submit:function () {
			if (this.isForm) {
				if (!(this.onSubmit() === false)) {
					this.domNode.submit();
				}
			}
		}, isValid:function () {
			for (var name in this.formWidgets) {
				var stop = false;
				aa(function (_, widget) {
					if (!widget.get("disabled") && widget.isValid && !widget.isValid()) {
						stop = true;
					}
				}).call(this, null, this.formWidgets[name].widget);
				if (stop) {
					return false;
				}
			}
			return true;
		}, validate:function () {
			var isValid = true, formWidgets = this.formWidgets, didFocus = false, name;
			for (name in formWidgets) {
				aa(function (_, widget) {
					widget._hasBeenBlurred = true;
					var valid = widget.disabled || !widget.validate || widget.validate();
					if (!valid && !didFocus) {
						dojo.window.scrollIntoView(widget.containerNode || widget.domNode);
						widget.focus();
						didFocus = true;
					}
					isValid = isValid && valid;
				}).call(this, null, formWidgets[name].widget);
			}
			return isValid;
		}});
	})();
}

