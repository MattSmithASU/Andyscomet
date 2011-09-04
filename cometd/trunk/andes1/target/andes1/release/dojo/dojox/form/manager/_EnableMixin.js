/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.manager._EnableMixin"]) {
	dojo._hasResource["dojox.form.manager._EnableMixin"] = true;
	dojo.provide("dojox.form.manager._EnableMixin");
	dojo.require("dojox.form.manager._Mixin");
	(function () {
		var fm = dojox.form.manager, aa = fm.actionAdapter, ia = fm.inspectorAdapter;
		dojo.declare("dojox.form.manager._EnableMixin", null, {gatherEnableState:function (names) {
			var result = this.inspectFormWidgets(ia(function (name, widget) {
				return !widget.get("disabled");
			}), names);
			if (this.inspectFormNodes) {
				dojo.mixin(result, this.inspectFormNodes(ia(function (name, node) {
					return !dojo.attr(node, "disabled");
				}), names));
			}
			return result;
		}, enable:function (state, defaultState) {
			if (arguments.length < 2 || defaultState === undefined) {
				defaultState = true;
			}
			this.inspectFormWidgets(aa(function (name, widget, value) {
				widget.set("disabled", !value);
			}), state, defaultState);
			if (this.inspectFormNodes) {
				this.inspectFormNodes(aa(function (name, node, value) {
					dojo.attr(node, "disabled", !value);
				}), state, defaultState);
			}
			return this;
		}, disable:function (state) {
			var oldState = this.gatherEnableState();
			this.enable(state, false);
			return oldState;
		}});
	})();
}

