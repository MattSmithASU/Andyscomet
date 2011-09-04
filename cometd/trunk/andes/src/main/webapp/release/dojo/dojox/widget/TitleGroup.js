/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.TitleGroup"]) {
	dojo._hasResource["dojox.widget.TitleGroup"] = true;
	dojo.provide("dojox.widget.TitleGroup");
	dojo.require("dijit._Widget");
	dojo.require("dijit.TitlePane");
	(function (d) {
		var tp = dijit.TitlePane.prototype, lookup = function () {
			var parent = this._dxfindParent && this._dxfindParent();
			parent && parent.selectChild(this);
		};
		tp._dxfindParent = function () {
			var n = this.domNode.parentNode;
			if (n) {
				n = dijit.getEnclosingWidget(n);
				return n && n instanceof dojox.widget.TitleGroup && n;
			}
			return n;
		};
		d.connect(tp, "_onTitleClick", lookup);
		d.connect(tp, "_onTitleKey", function (e) {
			if (!(e && e.type && e.type == "keypress" && e.charOrCode == d.keys.TAB)) {
				lookup.apply(this, arguments);
			}
		});
		d.declare("dojox.widget.TitleGroup", dijit._Widget, {"class":"dojoxTitleGroup", addChild:function (widget, position) {
			return widget.placeAt(this.domNode, position);
		}, removeChild:function (widget) {
			this.domNode.removeChild(widget.domNode);
			return widget;
		}, selectChild:function (widget) {
			widget && dojo.query("> .dijitTitlePane", this.domNode).forEach(function (n) {
				var tp = dijit.getEnclosingWidget(n);
				tp && tp !== widget && tp.open && tp.set("open", false);
			});
			return widget;
		}});
	})(dojo);
}

