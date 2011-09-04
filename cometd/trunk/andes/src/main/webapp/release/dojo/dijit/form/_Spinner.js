/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._Spinner"]) {
	dojo._hasResource["dijit.form._Spinner"] = true;
	dojo.provide("dijit.form._Spinner");
	dojo.require("dijit.form.RangeBoundTextBox");
	dojo.declare("dijit.form._Spinner", dijit.form.RangeBoundTextBox, {defaultTimeout:500, minimumTimeout:10, timeoutChangeRate:0.9, smallDelta:1, largeDelta:10, templateString:dojo.cache("dijit.form", "templates/Spinner.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitButtonNode dijitSpinnerButtonContainer\"\n\t\t><input class=\"dijitReset dijitInputField dijitSpinnerButtonInner\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t/><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\n\t\t\tdojoAttachPoint=\"upArrowNode\"\n\t\t\t><div class=\"dijitArrowButtonInner\"\n\t\t\t\t><input class=\"dijitReset dijitInputField\" value=\"&#9650;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t\t\t${_buttonInputDisabled}\n\t\t\t/></div\n\t\t></div\n\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\n\t\t\tdojoAttachPoint=\"downArrowNode\"\n\t\t\t><div class=\"dijitArrowButtonInner\"\n\t\t\t\t><input class=\"dijitReset dijitInputField\" value=\"&#9660;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t\t\t${_buttonInputDisabled}\n\t\t\t/></div\n\t\t></div\n\t></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\n\t\t\trole=\"spinbutton\" autocomplete=\"off\" ${!nameAttrSetting}\n\t/></div\n></div>\n"), baseClass:"dijitTextBox dijitSpinner", cssStateNodes:{"upArrowNode":"dijitUpArrowButton", "downArrowNode":"dijitDownArrowButton"}, adjust:function (val, delta) {
		return val;
	}, _arrowPressed:function (nodePressed, direction, increment) {
		if (this.disabled || this.readOnly) {
			return;
		}
		this._setValueAttr(this.adjust(this.get("value"), direction * increment), false);
		dijit.selectInputText(this.textbox, this.textbox.value.length);
	}, _arrowReleased:function (node) {
		this._wheelTimer = null;
		if (this.disabled || this.readOnly) {
			return;
		}
	}, _typematicCallback:function (count, node, evt) {
		var inc = this.smallDelta;
		if (node == this.textbox) {
			var k = dojo.keys;
			var key = evt.charOrCode;
			inc = (key == k.PAGE_UP || key == k.PAGE_DOWN) ? this.largeDelta : this.smallDelta;
			node = (key == k.UP_ARROW || key == k.PAGE_UP) ? this.upArrowNode : this.downArrowNode;
		}
		if (count == -1) {
			this._arrowReleased(node);
		} else {
			this._arrowPressed(node, (node == this.upArrowNode) ? 1 : -1, inc);
		}
	}, _wheelTimer:null, _mouseWheeled:function (evt) {
		dojo.stopEvent(evt);
		var scrollAmount = evt.detail ? (evt.detail * -1) : (evt.wheelDelta / 120);
		if (scrollAmount !== 0) {
			var node = this[(scrollAmount > 0 ? "upArrowNode" : "downArrowNode")];
			this._arrowPressed(node, scrollAmount, this.smallDelta);
			if (!this._wheelTimer) {
				clearTimeout(this._wheelTimer);
			}
			this._wheelTimer = setTimeout(dojo.hitch(this, "_arrowReleased", node), 50);
		}
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, !dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll", "_mouseWheeled");
		this._connects.push(dijit.typematic.addListener(this.upArrowNode, this.textbox, {charOrCode:dojo.keys.UP_ARROW, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout));
		this._connects.push(dijit.typematic.addListener(this.downArrowNode, this.textbox, {charOrCode:dojo.keys.DOWN_ARROW, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout));
		this._connects.push(dijit.typematic.addListener(this.upArrowNode, this.textbox, {charOrCode:dojo.keys.PAGE_UP, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout));
		this._connects.push(dijit.typematic.addListener(this.downArrowNode, this.textbox, {charOrCode:dojo.keys.PAGE_DOWN, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout));
	}});
}

