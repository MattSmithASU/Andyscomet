/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._ListBase"]) {
	dojo._hasResource["dijit.form._ListBase"] = true;
	dojo.provide("dijit.form._ListBase");
	dojo.require("dojo.window");
	dojo.declare("dijit.form._ListBase", null, {selected:null, _getTarget:function (evt) {
		var tgt = evt.touches ? evt.touches[0].target : evt.target;
		var container = this.containerNode;
		if (tgt == container || tgt == this.domNode) {
			return null;
		}
		while (tgt && tgt.parentNode != container) {
			tgt = tgt.parentNode;
		}
		return tgt;
	}, selectFirstNode:function () {
		var first = this.containerNode.firstChild;
		while (first && first.style.display == "none") {
			first = first.nextSibling;
		}
		this._setSelectedAttr(first);
	}, selectLastNode:function () {
		var last = this.containerNode.lastChild;
		while (last && last.style.display == "none") {
			last = last.previousSibling;
		}
		this._setSelectedAttr(last);
	}, selectNextNode:function () {
		var selectedNode = this._getSelectedAttr();
		if (!selectedNode) {
			this.selectFirstNode();
		} else {
			var next = selectedNode.nextSibling;
			while (next && next.style.display == "none") {
				next = next.nextSibling;
			}
			if (!next) {
				this.selectFirstNode();
			} else {
				this._setSelectedAttr(next);
			}
		}
	}, selectPreviousNode:function () {
		var selectedNode = this._getSelectedAttr();
		if (!selectedNode) {
			this.selectLastNode();
		} else {
			var prev = selectedNode.previousSibling;
			while (prev && prev.style.display == "none") {
				prev = prev.previousSibling;
			}
			if (!prev) {
				this.selectLastNode();
			} else {
				this._setSelectedAttr(prev);
			}
		}
	}, _setSelectedAttr:function (node) {
		if (this.selected != node) {
			var selectedNode = this._getSelectedAttr();
			if (selectedNode) {
				this.onDeselect(selectedNode);
				this.selected = null;
			}
			if (node && node.parentNode == this.containerNode) {
				this.selected = node;
				dojo.window.scrollIntoView(node);
				this.onSelect(node);
			}
		} else {
			if (node) {
				this.onSelect(node);
			}
		}
	}, _getSelectedAttr:function () {
		var v = this.selected;
		return (v && v.parentNode == this.containerNode) ? v : (this.selected = null);
	}});
}

