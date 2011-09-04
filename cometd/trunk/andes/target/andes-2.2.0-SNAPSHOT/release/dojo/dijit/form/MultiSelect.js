/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.MultiSelect"]) {
	dojo._hasResource["dijit.form.MultiSelect"] = true;
	dojo.provide("dijit.form.MultiSelect");
	dojo.require("dijit.form._FormWidget");
	dojo.declare("dijit.form.MultiSelect", dijit.form._FormValueWidget, {size:7, templateString:"<select multiple='true' ${!nameAttrSetting} dojoAttachPoint='containerNode,focusNode' dojoAttachEvent='onchange: _onChange'></select>", addSelected:function (select) {
		select.getSelected().forEach(function (n) {
			this.containerNode.appendChild(n);
			this.domNode.scrollTop = this.domNode.offsetHeight;
			var oldscroll = select.domNode.scrollTop;
			select.domNode.scrollTop = 0;
			select.domNode.scrollTop = oldscroll;
		}, this);
		this._set("value", this.get("value"));
	}, getSelected:function () {
		return dojo.query("option", this.containerNode).filter(function (n) {
			return n.selected;
		});
	}, _getValueAttr:function () {
		return this.getSelected().map(function (n) {
			return n.value;
		});
	}, multiple:true, _setValueAttr:function (values, priorityChange) {
		dojo.query("option", this.containerNode).forEach(function (n) {
			n.selected = (dojo.indexOf(values, n.value) != -1);
		});
		this.inherited(arguments);
	}, invertSelection:function (onChange) {
		var val = [];
		dojo.query("option", this.containerNode).forEach(function (n) {
			if (!n.selected) {
				val.push(n.value);
			}
		});
		this._setValueAttr(val, !(onChange === false || onChange == null));
	}, _onChange:function (e) {
		this._handleOnChange(this.get("value"), true);
	}, resize:function (size) {
		if (size) {
			dojo.marginBox(this.domNode, size);
		}
	}, postCreate:function () {
		this._set("value", this.get("value"));
		this.inherited(arguments);
	}});
}

