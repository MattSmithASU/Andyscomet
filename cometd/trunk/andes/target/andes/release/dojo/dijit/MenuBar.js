/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.MenuBar"]) {
	dojo._hasResource["dijit.MenuBar"] = true;
	dojo.provide("dijit.MenuBar");
	dojo.require("dijit.Menu");
	dojo.declare("dijit.MenuBar", dijit._MenuBase, {templateString:dojo.cache("dijit", "templates/MenuBar.html", "<div class=\"dijitMenuBar dijitMenuPassive\" dojoAttachPoint=\"containerNode\"  role=\"menubar\" tabIndex=\"${tabIndex}\" dojoAttachEvent=\"onkeypress: _onKeyPress\"></div>\n"), baseClass:"dijitMenuBar", _isMenuBar:true, postCreate:function () {
		var k = dojo.keys, l = this.isLeftToRight();
		this.connectKeyNavHandlers(l ? [k.LEFT_ARROW] : [k.RIGHT_ARROW], l ? [k.RIGHT_ARROW] : [k.LEFT_ARROW]);
		this._orient = this.isLeftToRight() ? {BL:"TL"} : {BR:"TR"};
	}, focusChild:function (item) {
		var prev_item = this.focusedChild, showpopup = prev_item && prev_item.popup && prev_item.popup.isShowingNow;
		this.inherited(arguments);
		if (showpopup && item.popup && !item.disabled) {
			this._openPopup();
		}
	}, _onKeyPress:function (evt) {
		if (evt.ctrlKey || evt.altKey) {
			return;
		}
		switch (evt.charOrCode) {
		  case dojo.keys.DOWN_ARROW:
			this._moveToPopup(evt);
			dojo.stopEvent(evt);
		}
	}, onItemClick:function (item, evt) {
		if (item.popup && item.popup.isShowingNow) {
			item.popup.onCancel();
		} else {
			this.inherited(arguments);
		}
	}});
}

