/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.MenuItem"]) {
	dojo._hasResource["dijit.MenuItem"] = true;
	dojo.provide("dijit.MenuItem");
	dojo.require("dijit._Widget");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit._Contained");
	dojo.require("dijit._CssStateMixin");
	dojo.declare("dijit.MenuItem", [dijit._Widget, dijit._TemplatedMixin, dijit._Contained, dijit._CssStateMixin], {templateString:dojo.cache("dijit", "templates/MenuItem.html", "<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" role=\"menuitem\" tabIndex=\"-1\"\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\n\t<td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\">\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\"/>\n\t</td>\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode\"></td>\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\n\t<td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">\n\t\t<div dojoAttachPoint=\"arrowWrapper\" style=\"visibility: hidden\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuExpand\"/>\n\t\t\t<span class=\"dijitMenuExpandA11y\">+</span>\n\t\t</div>\n\t</td>\n</tr>\n"), baseClass:"dijitMenuItem", label:"", _setLabelAttr:{node:"containerNode", type:"innerHTML"}, iconClass:"", _setIconClassAttr:{node:"iconNode", type:"class"}, accelKey:"", disabled:false, _fillContent:function (source) {
		if (source && !("label" in this.params)) {
			this.set("label", source.innerHTML);
		}
	}, buildRendering:function () {
		this.inherited(arguments);
		var label = this.id + "_text";
		dojo.attr(this.containerNode, "id", label);
		if (this.accelKeyNode) {
			dojo.attr(this.accelKeyNode, "id", this.id + "_accel");
			label += " " + this.id + "_accel";
		}
		dijit.setWaiState(this.domNode, "labelledby", label);
		dojo.setSelectable(this.domNode, false);
	}, _onHover:function () {
		this.getParent().onItemHover(this);
	}, _onUnhover:function () {
		this.getParent().onItemUnhover(this);
		this._set("hovering", false);
	}, _onClick:function (evt) {
		this.getParent().onItemClick(this, evt);
		dojo.stopEvent(evt);
	}, onClick:function (evt) {
	}, focus:function () {
		try {
			if (dojo.isIE == 8) {
				this.containerNode.focus();
			}
			dijit.focus(this.focusNode);
		}
		catch (e) {
		}
	}, _onFocus:function () {
		this._setSelected(true);
		this.getParent()._onItemFocus(this);
		this.inherited(arguments);
	}, _setSelected:function (selected) {
		dojo.toggleClass(this.domNode, "dijitMenuItemSelected", selected);
	}, setLabel:function (content) {
		dojo.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
		this.set("label", content);
	}, setDisabled:function (disabled) {
		dojo.deprecated("dijit.Menu.setDisabled() is deprecated.  Use set('disabled', bool) instead.", "", "2.0");
		this.set("disabled", disabled);
	}, _setDisabledAttr:function (value) {
		dijit.setWaiState(this.focusNode, "disabled", value ? "true" : "false");
		this._set("disabled", value);
	}, _setAccelKeyAttr:function (value) {
		this.accelKeyNode.style.display = value ? "" : "none";
		this.accelKeyNode.innerHTML = value;
		dojo.attr(this.containerNode, "colSpan", value ? "1" : "2");
		this._set("accelKey", value);
	}});
}

