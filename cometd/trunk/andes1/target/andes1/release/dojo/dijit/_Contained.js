/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._Contained"]) {
	dojo._hasResource["dijit._Contained"] = true;
	dojo.provide("dijit._Contained");
	dojo.declare("dijit._Contained", null, {getParent:function () {
		var parent = dijit.getEnclosingWidget(this.domNode.parentNode);
		return parent && parent.isContainer ? parent : null;
	}, _getSibling:function (which) {
		var node = this.domNode;
		do {
			node = node[which + "Sibling"];
		} while (node && node.nodeType != 1);
		return node && dijit.byNode(node);
	}, getPreviousSibling:function () {
		return this._getSibling("previous");
	}, getNextSibling:function () {
		return this._getSibling("next");
	}, getIndexInParent:function () {
		var p = this.getParent();
		if (!p || !p.getIndexOfChild) {
			return -1;
		}
		return p.getIndexOfChild(this);
	}});
}

