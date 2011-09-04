/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base._waiMixin"]) {
	dojo._hasResource["dijit._base._waiMixin"] = true;
	dojo.provide("dijit._base._waiMixin");
	dojo.mixin(dijit, {hasWaiRole:function (elem, role) {
		var waiRole = this.getWaiRole(elem);
		return role ? (waiRole.indexOf(role) > -1) : (waiRole.length > 0);
	}, getWaiRole:function (elem) {
		return dojo.trim((dojo.attr(elem, "role") || "").replace("wairole:", ""));
	}, setWaiRole:function (elem, role) {
		dojo.attr(elem, "role", role);
	}, removeWaiRole:function (elem, role) {
		var roleValue = dojo.attr(elem, "role");
		if (!roleValue) {
			return;
		}
		if (role) {
			var t = dojo.trim((" " + roleValue + " ").replace(" " + role + " ", " "));
			dojo.attr(elem, "role", t);
		} else {
			elem.removeAttribute("role");
		}
	}, hasWaiState:function (elem, state) {
		return elem.hasAttribute ? elem.hasAttribute("aria-" + state) : !!elem.getAttribute("aria-" + state);
	}, getWaiState:function (elem, state) {
		return elem.getAttribute("aria-" + state) || "";
	}, setWaiState:function (elem, state, value) {
		elem.setAttribute("aria-" + state, value);
	}, removeWaiState:function (elem, state) {
		elem.removeAttribute("aria-" + state);
	}});
}

