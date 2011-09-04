/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.ComboButton"]) {
	dojo._hasResource["dijit.form.ComboButton"] = true;
	dojo.provide("dijit.form.ComboButton");
	dojo.require("dijit.form.DropDownButton");
	dojo.declare("dijit.form.ComboButton", dijit.form.DropDownButton, {templateString:dojo.cache("dijit.form", "templates/ComboButton.html", "<table class=\"dijit dijitReset dijitInline dijitLeft\"\n\tcellspacing='0' cellpadding='0' role=\"presentation\"\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonNode\" dojoAttachPoint=\"buttonNode\" dojoAttachEvent=\"ondijitclick:_onClick,onkeypress:_onButtonKeyPress\"\n\t\t><div id=\"${id}_button\" class=\"dijitReset dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"titleNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><div class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\" role=\"presentation\"></div\n\t\t></div\n\t\t></td\n\t\t><td id=\"${id}_arrow\" class='dijitReset dijitRight dijitButtonNode dijitArrowButton'\n\t\t\tdojoAttachPoint=\"_popupStateNode,focusNode,_buttonNode\"\n\t\t\tdojoAttachEvent=\"onkeypress:_onArrowKeyPress\"\n\t\t\ttitle=\"${optionsTitle}\"\n\t\t\trole=\"button\" aria-haspopup=\"true\"\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" role=\"presentation\">&#9660;</div\n\t\t></td\n\t\t><td style=\"display:none !important;\"\n\t\t\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" dojoAttachPoint=\"valueNode\"\n\t\t/></td></tr></tbody\n></table>\n"), _setIdAttr:"", _setTabIndexAttr:["focusNode", "titleNode"], _setTitleAttr:"titleNode", optionsTitle:"", baseClass:"dijitComboButton", cssStateNodes:{"buttonNode":"dijitButtonNode", "titleNode":"dijitButtonContents", "_popupStateNode":"dijitDownArrowButton"}, _focusedNode:null, _onButtonKeyPress:function (evt) {
		if (evt.charOrCode == dojo.keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"]) {
			dijit.focus(this._popupStateNode);
			dojo.stopEvent(evt);
		}
	}, _onArrowKeyPress:function (evt) {
		if (evt.charOrCode == dojo.keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]) {
			dijit.focus(this.titleNode);
			dojo.stopEvent(evt);
		}
	}, focus:function (position) {
		if (!this.disabled) {
			dijit.focus(position == "start" ? this.titleNode : this._popupStateNode);
		}
	}});
}

