define("dijit/form/CheckBox", ["dojo", "dijit", "text!dijit/form/templates/CheckBox.html", "dijit/form/ToggleButton", "dijit/form/_CheckBoxMixin"], function(dojo, dijit) {

dojo.declare(
	"dijit.form.CheckBox",
	[dijit.form.ToggleButton, dijit.form._CheckBoxMixin],
	{
		// summary:
		// 		Same as an HTML checkbox, but with fancy styling.
		//
		// description:
		//		User interacts with real html inputs.
		//		On onclick (which occurs by mouse click, space-bar, or
		//		using the arrow keys to switch the selected radio button),
		//		we update the state of the checkbox/radio.
		//
		//		There are two modes:
		//			1. High contrast mode
		//			2. Normal mode
		//
		//		In case 1, the regular html inputs are shown and used by the user.
		//		In case 2, the regular html inputs are invisible but still used by
		//		the user. They are turned quasi-invisible and overlay the background-image.

		templateString: dojo.cache("dijit.form", "templates/CheckBox.html"),

		baseClass: "dijitCheckBox",

		_setValueAttr: function(/*String|Boolean*/ newValue, /*Boolean*/ priorityChange){
			// summary:
			//		Handler for value= attribute to constructor, and also calls to
			//		set('value', val).
			// description:
			//		During initialization, just saves as attribute to the <input type=checkbox>.
			//
			//		After initialization,
			//		when passed a boolean, controls whether or not the CheckBox is checked.
			//		If passed a string, changes the value attribute of the CheckBox (the one
			//		specified as "value" when the CheckBox was constructed (ex: <input
			//		dojoType="dijit.CheckBox" value="chicken">)
			//		widget.set('value', string) will check the checkbox and change the value to the
			//		specified string
			//		widget.set('value', boolean) will change the checked state.
			if(typeof newValue == "string"){
				this._set("value", newValue);
				dojo.attr(this.focusNode, 'value', newValue);
				newValue = true;
			}
			if(this._created){
				this.set('checked', newValue, priorityChange);
			}
		},
		_getValueAttr: function(){
			// summary:
			//		Hook so get('value') works.
			// description:
			//		If the CheckBox is checked, returns the value attribute.
			//		Otherwise returns false.
			return (this.checked ? this.value : false);
		},

		postMixInProperties: function(){
			this.inherited(arguments);

			// Need to set initial checked state as part of template, so that form submit works.
			// dojo.attr(node, "checked", bool) doesn't work on IE until node has been attached
			// to <body>, see #8666
			this.checkedAttrSetting = this.checked ? "checked" : "";
		},

		 _fillContent: function(/*DomNode*/ source){
			// Override Button::_fillContent() since it doesn't make sense for CheckBox,
			// since CheckBox doesn't even have a container
		},

		_onFocus: function(){
			if(this.id){
				dojo.query("label[for='"+this.id+"']").addClass("dijitFocusedLabel");
			}
			this.inherited(arguments);
		},

		_onBlur: function(){
			if(this.id){
				dojo.query("label[for='"+this.id+"']").removeClass("dijitFocusedLabel");
			}
			this.inherited(arguments);
		}
	}
);

return dijit.form.CheckBox;
});
