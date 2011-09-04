/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.Selector"]) {
	dojo._hasResource["dojo.dnd.Selector"] = true;
	dojo.provide("dojo.dnd.Selector");
	dojo.require("dojo.dnd.common");
	dojo.require("dojo.dnd.Container");
	dojo.declare("dojo.dnd.Selector", dojo.dnd.Container, {constructor:function (node, params) {
		if (!params) {
			params = {};
		}
		this.singular = params.singular;
		this.autoSync = params.autoSync;
		this.selection = {};
		this.anchor = null;
		this.simpleSelection = false;
		this.events.push(dojo.connect(this.node, "onmousedown", this, "onMouseDown"), dojo.connect(this.node, "onmouseup", this, "onMouseUp"));
	}, singular:false, getSelectedNodes:function () {
		var t = new dojo.NodeList();
		var e = dojo.dnd._empty;
		for (var i in this.selection) {
			if (i in e) {
				continue;
			}
			t.push(dojo.byId(i));
		}
		return t;
	}, selectNone:function () {
		return this._removeSelection()._removeAnchor();
	}, selectAll:function () {
		this.forInItems(function (data, id) {
			this._addItemClass(dojo.byId(id), "Selected");
			this.selection[id] = 1;
		}, this);
		return this._removeAnchor();
	}, deleteSelectedNodes:function () {
		var e = dojo.dnd._empty;
		for (var i in this.selection) {
			if (i in e) {
				continue;
			}
			var n = dojo.byId(i);
			this.delItem(i);
			dojo.destroy(n);
		}
		this.anchor = null;
		this.selection = {};
		return this;
	}, forInSelectedItems:function (f, o) {
		o = o || dojo.global;
		var s = this.selection, e = dojo.dnd._empty;
		for (var i in s) {
			if (i in e) {
				continue;
			}
			f.call(o, this.getItem(i), i, this);
		}
	}, sync:function () {
		dojo.dnd.Selector.superclass.sync.call(this);
		if (this.anchor) {
			if (!this.getItem(this.anchor.id)) {
				this.anchor = null;
			}
		}
		var t = [], e = dojo.dnd._empty;
		for (var i in this.selection) {
			if (i in e) {
				continue;
			}
			if (!this.getItem(i)) {
				t.push(i);
			}
		}
		dojo.forEach(t, function (i) {
			delete this.selection[i];
		}, this);
		return this;
	}, insertNodes:function (addSelected, data, before, anchor) {
		var oldCreator = this._normalizedCreator;
		this._normalizedCreator = function (item, hint) {
			var t = oldCreator.call(this, item, hint);
			if (addSelected) {
				if (!this.anchor) {
					this.anchor = t.node;
					this._removeItemClass(t.node, "Selected");
					this._addItemClass(this.anchor, "Anchor");
				} else {
					if (this.anchor != t.node) {
						this._removeItemClass(t.node, "Anchor");
						this._addItemClass(t.node, "Selected");
					}
				}
				this.selection[t.node.id] = 1;
			} else {
				this._removeItemClass(t.node, "Selected");
				this._removeItemClass(t.node, "Anchor");
			}
			return t;
		};
		dojo.dnd.Selector.superclass.insertNodes.call(this, data, before, anchor);
		this._normalizedCreator = oldCreator;
		return this;
	}, destroy:function () {
		dojo.dnd.Selector.superclass.destroy.call(this);
		this.selection = this.anchor = null;
	}, markupFactory:function (params, node) {
		params._skipStartup = true;
		return new dojo.dnd.Selector(node, params);
	}, onMouseDown:function (e) {
		if (this.autoSync) {
			this.sync();
		}
		if (!this.current) {
			return;
		}
		if (!this.singular && !dojo.isCopyKey(e) && !e.shiftKey && (this.current.id in this.selection)) {
			this.simpleSelection = true;
			if (e.button === dojo.mouseButtons.LEFT) {
				dojo.stopEvent(e);
			}
			return;
		}
		if (!this.singular && e.shiftKey) {
			if (!dojo.isCopyKey(e)) {
				this._removeSelection();
			}
			var c = this.getAllNodes();
			if (c.length) {
				if (!this.anchor) {
					this.anchor = c[0];
					this._addItemClass(this.anchor, "Anchor");
				}
				this.selection[this.anchor.id] = 1;
				if (this.anchor != this.current) {
					var i = 0;
					for (; i < c.length; ++i) {
						var node = c[i];
						if (node == this.anchor || node == this.current) {
							break;
						}
					}
					for (++i; i < c.length; ++i) {
						var node = c[i];
						if (node == this.anchor || node == this.current) {
							break;
						}
						this._addItemClass(node, "Selected");
						this.selection[node.id] = 1;
					}
					this._addItemClass(this.current, "Selected");
					this.selection[this.current.id] = 1;
				}
			}
		} else {
			if (this.singular) {
				if (this.anchor == this.current) {
					if (dojo.isCopyKey(e)) {
						this.selectNone();
					}
				} else {
					this.selectNone();
					this.anchor = this.current;
					this._addItemClass(this.anchor, "Anchor");
					this.selection[this.current.id] = 1;
				}
			} else {
				if (dojo.isCopyKey(e)) {
					if (this.anchor == this.current) {
						delete this.selection[this.anchor.id];
						this._removeAnchor();
					} else {
						if (this.current.id in this.selection) {
							this._removeItemClass(this.current, "Selected");
							delete this.selection[this.current.id];
						} else {
							if (this.anchor) {
								this._removeItemClass(this.anchor, "Anchor");
								this._addItemClass(this.anchor, "Selected");
							}
							this.anchor = this.current;
							this._addItemClass(this.current, "Anchor");
							this.selection[this.current.id] = 1;
						}
					}
				} else {
					if (!(this.current.id in this.selection)) {
						this.selectNone();
						this.anchor = this.current;
						this._addItemClass(this.current, "Anchor");
						this.selection[this.current.id] = 1;
					}
				}
			}
		}
		dojo.stopEvent(e);
	}, onMouseUp:function (e) {
		if (!this.simpleSelection) {
			return;
		}
		this.simpleSelection = false;
		this.selectNone();
		if (this.current) {
			this.anchor = this.current;
			this._addItemClass(this.anchor, "Anchor");
			this.selection[this.current.id] = 1;
		}
	}, onMouseMove:function (e) {
		this.simpleSelection = false;
	}, onOverEvent:function () {
		this.onmousemoveEvent = dojo.connect(this.node, "onmousemove", this, "onMouseMove");
	}, onOutEvent:function () {
		dojo.disconnect(this.onmousemoveEvent);
		delete this.onmousemoveEvent;
	}, _removeSelection:function () {
		var e = dojo.dnd._empty;
		for (var i in this.selection) {
			if (i in e) {
				continue;
			}
			var node = dojo.byId(i);
			if (node) {
				this._removeItemClass(node, "Selected");
			}
		}
		this.selection = {};
		return this;
	}, _removeAnchor:function () {
		if (this.anchor) {
			this._removeItemClass(this.anchor, "Anchor");
			this.anchor = null;
		}
		return this;
	}});
}

