/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.PlaceholderMenuItem"]) {
	dojo._hasResource["dojox.widget.PlaceholderMenuItem"] = true;
	dojo.provide("dojox.widget.PlaceholderMenuItem");
	dojo.experimental("dojox.widget.PlaceholderMenuItem");
	dojo.require("dijit.Menu");
	dojo.declare("dojox.widget.PlaceholderMenuItem", dijit.MenuItem, {_replaced:false, _replacedWith:null, _isPlaceholder:true, postCreate:function () {
		this.domNode.style.display = "none";
		this._replacedWith = [];
		if (!this.label) {
			this.label = this.containerNode.innerHTML;
		}
		this.inherited(arguments);
	}, replace:function (menuItems) {
		if (this._replaced) {
			return false;
		}
		var index = this.getIndexInParent();
		if (index < 0) {
			return false;
		}
		var p = this.getParent();
		dojo.forEach(menuItems, function (item) {
			p.addChild(item, index++);
		});
		this._replacedWith = menuItems;
		this._replaced = true;
		return true;
	}, unReplace:function (destroy) {
		if (!this._replaced) {
			return [];
		}
		var p = this.getParent();
		if (!p) {
			return [];
		}
		var r = this._replacedWith;
		dojo.forEach(this._replacedWith, function (item) {
			p.removeChild(item);
			if (destroy) {
				item.destroyRecursive();
			}
		});
		this._replacedWith = [];
		this._replaced = false;
		return r;
	}});
	dojo.extend(dijit.Menu, {getPlaceholders:function (label) {
		var r = [];
		var children = this.getChildren();
		dojo.forEach(children, function (child) {
			if (child._isPlaceholder && (!label || child.label == label)) {
				r.push(child);
			} else {
				if (child._started && child.popup && child.popup.getPlaceholders) {
					r = r.concat(child.popup.getPlaceholders(label));
				} else {
					if (!child._started && child.dropDownContainer) {
						var node = dojo.query("[widgetId]", child.dropDownContainer)[0];
						var menu = dijit.byNode(node);
						if (menu.getPlaceholders) {
							r = r.concat(menu.getPlaceholders(label));
						}
					}
				}
			}
		}, this);
		return r;
	}});
}

