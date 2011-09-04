/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._ComboBoxMenu"]) {
	dojo._hasResource["dijit.form._ComboBoxMenu"] = true;
	dojo.provide("dijit.form._ComboBoxMenu");
	dojo.require("dijit.form._ComboBoxMenuMixin");
	dojo.require("dijit._WidgetBase");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit.form._ListMouseMixin");
	dojo.declare("dijit.form._ComboBoxMenu", [dijit._WidgetBase, dijit._TemplatedMixin, dijit.form._ListMouseMixin, dijit.form._ComboBoxMenuMixin], {templateString:"<div class='dijitReset dijitMenu' dojoAttachPoint='containerNode' style='overflow: \"auto\"; overflow-x: \"hidden\";'>" + "<div class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton' role='option'></div>" + "<div class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton' role='option'></div>" + "</div>", baseClass:"dijitComboBoxMenu", _createMenuItem:function () {
		return dojo.create("div", {"class":"dijitReset dijitMenuItem" + (this.isLeftToRight() ? "" : " dijitMenuItemRtl"), role:"option"});
	}, onHover:function (node) {
		dojo.addClass(node, "dijitMenuItemHover");
	}, onUnhover:function (node) {
		dojo.removeClass(node, "dijitMenuItemHover");
	}, onSelect:function (node) {
		dojo.addClass(node, "dijitMenuItemSelected");
	}, onDeselect:function (node) {
		dojo.removeClass(node, "dijitMenuItemSelected");
	}, _page:function (up) {
		var scrollamount = 0;
		var oldscroll = this.domNode.scrollTop;
		var height = dojo.style(this.domNode, "height");
		if (!this.getHighlightedOption()) {
			this.selectNextNode();
		}
		while (scrollamount < height) {
			if (up) {
				if (!this.getHighlightedOption().previousSibling || this._highlighted_option.previousSibling.style.display == "none") {
					break;
				}
				this.selectPreviousNode();
			} else {
				if (!this.getHighlightedOption().nextSibling || this._highlighted_option.nextSibling.style.display == "none") {
					break;
				}
				this.selectNextNode();
			}
			var newscroll = this.domNode.scrollTop;
			scrollamount += (newscroll - oldscroll) * (up ? -1 : 1);
			oldscroll = newscroll;
		}
	}, handleKey:function (evt) {
		switch (evt.charOrCode) {
		  case dojo.keys.DOWN_ARROW:
			this.selectNextNode();
			return false;
		  case dojo.keys.PAGE_DOWN:
			this._page(false);
			return false;
		  case dojo.keys.UP_ARROW:
			this.selectPreviousNode();
			return false;
		  case dojo.keys.PAGE_UP:
			this._page(true);
			return false;
		  default:
			return true;
		}
	}});
}

