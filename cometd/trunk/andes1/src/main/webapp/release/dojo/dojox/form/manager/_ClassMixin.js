/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.manager._ClassMixin"]) {
	dojo._hasResource["dojox.form.manager._ClassMixin"] = true;
	dojo.provide("dojox.form.manager._ClassMixin");
	dojo.require("dojox.form.manager._Mixin");
	(function () {
		var fm = dojox.form.manager, aa = fm.actionAdapter, ia = fm.inspectorAdapter;
		dojo.declare("dojox.form.manager._ClassMixin", null, {gatherClassState:function (className, names) {
			var result = this.inspect(ia(function (name, node) {
				return dojo.hasClass(node, className);
			}), names);
			return result;
		}, addClass:function (className, names) {
			this.inspect(aa(function (name, node) {
				dojo.addClass(node, className);
			}), names);
			return this;
		}, removeClass:function (className, names) {
			this.inspect(aa(function (name, node) {
				dojo.removeClass(node, className);
			}), names);
			return this;
		}});
	})();
}

