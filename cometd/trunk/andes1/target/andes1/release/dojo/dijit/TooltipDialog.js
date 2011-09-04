/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.TooltipDialog"]) {
	dojo._hasResource["dijit.TooltipDialog"] = true;
	dojo.provide("dijit.TooltipDialog");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit.form._FormMixin");
	dojo.require("dijit._DialogMixin");
	dojo.declare("dijit.TooltipDialog", [dijit.layout.ContentPane, dijit._TemplatedMixin, dijit.form._FormMixin, dijit._DialogMixin], {title:"", doLayout:false, autofocus:true, baseClass:"dijitTooltipDialog", _firstFocusItem:null, _lastFocusItem:null, templateString:dojo.cache("dijit", "templates/TooltipDialog.html", "<div role=\"presentation\" tabIndex=\"-1\">\n\t<div class=\"dijitTooltipContainer\" role=\"presentation\">\n\t\t<div class =\"dijitTooltipContents dijitTooltipFocusNode\" dojoAttachPoint=\"containerNode\" role=\"dialog\"></div>\n\t</div>\n\t<div class=\"dijitTooltipConnector\" role=\"presentation\"></div>\n</div>\n"), _setTitleAttr:function (title) {
		this.containerNode.title = title;
		this._set("title", title);
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.containerNode, "onkeypress", "_onKey");
	}, orient:function (node, aroundCorner, corner) {
		var newC = "dijitTooltipAB" + (corner.charAt(1) == "L" ? "Left" : "Right") + " dijitTooltip" + (corner.charAt(0) == "T" ? "Below" : "Above");
		dojo.replaceClass(this.domNode, newC, this._currentOrientClass || "");
		this._currentOrientClass = newC;
	}, focus:function () {
		this._getFocusItems(this.containerNode);
		dijit.focus(this._firstFocusItem);
	}, onOpen:function (pos) {
		this.orient(this.domNode, pos.aroundCorner, pos.corner);
		this._onShow();
	}, onClose:function () {
		this.onHide();
	}, _onKey:function (evt) {
		var node = evt.target;
		var dk = dojo.keys;
		if (evt.charOrCode === dk.TAB) {
			this._getFocusItems(this.containerNode);
		}
		var singleFocusItem = (this._firstFocusItem == this._lastFocusItem);
		if (evt.charOrCode == dk.ESCAPE) {
			setTimeout(dojo.hitch(this, "onCancel"), 0);
			dojo.stopEvent(evt);
		} else {
			if (node == this._firstFocusItem && evt.shiftKey && evt.charOrCode === dk.TAB) {
				if (!singleFocusItem) {
					dijit.focus(this._lastFocusItem);
				}
				dojo.stopEvent(evt);
			} else {
				if (node == this._lastFocusItem && evt.charOrCode === dk.TAB && !evt.shiftKey) {
					if (!singleFocusItem) {
						dijit.focus(this._firstFocusItem);
					}
					dojo.stopEvent(evt);
				} else {
					if (evt.charOrCode === dk.TAB) {
						evt.stopPropagation();
					}
				}
			}
		}
	}});
}

