/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._HasDropDown"]) {
	dojo._hasResource["dijit._HasDropDown"] = true;
	dojo.provide("dijit._HasDropDown");
	dojo.require("dijit._Widget");
	dojo.declare("dijit._HasDropDown", null, {_buttonNode:null, _arrowWrapperNode:null, _popupStateNode:null, _aroundNode:null, dropDown:null, autoWidth:true, forceWidth:false, maxHeight:0, dropDownPosition:["below", "above"], _stopClickEvents:true, _onDropDownMouseDown:function (e) {
		if (this.disabled || this.readOnly) {
			return;
		}
		dojo.stopEvent(e);
		this._docHandler = this.connect(dojo.doc, "onmouseup", "_onDropDownMouseUp");
		this.toggleDropDown();
	}, _onDropDownMouseUp:function (e) {
		if (e && this._docHandler) {
			this.disconnect(this._docHandler);
		}
		var dropDown = this.dropDown, overMenu = false;
		if (e && this._opened) {
			var c = dojo.position(this._buttonNode, true);
			if (!(e.pageX >= c.x && e.pageX <= c.x + c.w) || !(e.pageY >= c.y && e.pageY <= c.y + c.h)) {
				var t = e.target;
				while (t && !overMenu) {
					if (dojo.hasClass(t, "dijitPopup")) {
						overMenu = true;
					} else {
						t = t.parentNode;
					}
				}
				if (overMenu) {
					t = e.target;
					if (dropDown.onItemClick) {
						var menuItem;
						while (t && !(menuItem = dijit.byNode(t))) {
							t = t.parentNode;
						}
						if (menuItem && menuItem.onClick && menuItem.getParent) {
							menuItem.getParent().onItemClick(menuItem, e);
						}
					}
					return;
				}
			}
		}
		if (this._opened && dropDown.focus && dropDown.autoFocus !== false) {
			window.setTimeout(dojo.hitch(dropDown, "focus"), 1);
		}
	}, _onDropDownClick:function (e) {
		if (this._stopClickEvents) {
			dojo.stopEvent(e);
		}
	}, buildRendering:function () {
		this.inherited(arguments);
		this._buttonNode = this._buttonNode || this.focusNode || this.domNode;
		this._popupStateNode = this._popupStateNode || this.focusNode || this._buttonNode;
		var defaultPos = {"after":this.isLeftToRight() ? "Right" : "Left", "before":this.isLeftToRight() ? "Left" : "Right", "above":"Up", "below":"Down", "left":"Left", "right":"Right"}[this.dropDownPosition[0]] || this.dropDownPosition[0] || "Down";
		dojo.addClass(this._arrowWrapperNode || this._buttonNode, "dijit" + defaultPos + "ArrowButton");
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this._buttonNode, "onmousedown", "_onDropDownMouseDown");
		this.connect(this._buttonNode, "onclick", "_onDropDownClick");
		this.connect(this.focusNode, "onkeypress", "_onKey");
	}, destroy:function () {
		if (this.dropDown) {
			if (!this.dropDown._destroyed) {
				this.dropDown.destroyRecursive();
			}
			delete this.dropDown;
		}
		this.inherited(arguments);
	}, _onKey:function (e) {
		if (this.disabled || this.readOnly) {
			return;
		}
		var d = this.dropDown, target = e.target;
		if (d && this._opened && d.handleKey) {
			if (d.handleKey(e) === false) {
				dojo.stopEvent(e);
				return;
			}
		}
		if (d && this._opened && e.charOrCode == dojo.keys.ESCAPE) {
			this.closeDropDown();
			dojo.stopEvent(e);
		} else {
			if (!this._opened && (e.charOrCode == dojo.keys.DOWN_ARROW || ((e.charOrCode == dojo.keys.ENTER || e.charOrCode == " ") && ((target.tagName || "").toLowerCase() !== "input" || (target.type && target.type.toLowerCase() !== "text"))))) {
				this.toggleDropDown();
				d = this.dropDown;
				if (d && d.focus) {
					setTimeout(dojo.hitch(d, "focus"), 1);
				}
				dojo.stopEvent(e);
			}
		}
	}, _onBlur:function () {
		var focusMe = dijit._curFocus && this.dropDown && dojo.isDescendant(dijit._curFocus, this.dropDown.domNode);
		this.closeDropDown(focusMe);
		this.inherited(arguments);
	}, isLoaded:function () {
		return true;
	}, loadDropDown:function (loadCallback) {
		loadCallback();
	}, toggleDropDown:function () {
		if (this.disabled || this.readOnly) {
			return;
		}
		if (!this._opened) {
			if (!this.isLoaded()) {
				this.loadDropDown(dojo.hitch(this, "openDropDown"));
				return;
			} else {
				this.openDropDown();
			}
		} else {
			this.closeDropDown();
		}
	}, openDropDown:function () {
		var dropDown = this.dropDown, ddNode = dropDown.domNode, aroundNode = this._aroundNode || this.domNode, self = this;
		if (!this._preparedNode) {
			this._preparedNode = true;
			if (ddNode.style.width) {
				this._explicitDDWidth = true;
			}
			if (ddNode.style.height) {
				this._explicitDDHeight = true;
			}
		}
		if (this.maxHeight || this.forceWidth || this.autoWidth) {
			var myStyle = {display:"", visibility:"hidden"};
			if (!this._explicitDDWidth) {
				myStyle.width = "";
			}
			if (!this._explicitDDHeight) {
				myStyle.height = "";
			}
			dojo.style(ddNode, myStyle);
			var maxHeight = this.maxHeight;
			if (maxHeight == -1) {
				var viewport = dojo.window.getBox(), position = dojo.position(aroundNode, false);
				maxHeight = Math.floor(Math.max(position.y, viewport.h - (position.y + position.h)));
			}
			dijit.popup.moveOffScreen(dropDown);
			if (dropDown.startup && !dropDown._started) {
				dropDown.startup();
			}
			var mb = dojo._getMarginSize(ddNode);
			var overHeight = (maxHeight && mb.h > maxHeight);
			dojo.style(ddNode, {overflowX:"hidden", overflowY:overHeight ? "auto" : "hidden"});
			if (overHeight) {
				mb.h = maxHeight;
				if ("w" in mb) {
					mb.w += 16;
				}
			} else {
				delete mb.h;
			}
			if (this.forceWidth) {
				mb.w = aroundNode.offsetWidth;
			} else {
				if (this.autoWidth) {
					mb.w = Math.max(mb.w, aroundNode.offsetWidth);
				} else {
					delete mb.w;
				}
			}
			if (dojo.isFunction(dropDown.resize)) {
				dropDown.resize(mb);
			} else {
				dojo.marginBox(ddNode, mb);
			}
		}
		var retVal = dijit.popup.open({parent:this, popup:dropDown, around:aroundNode, orient:dijit.getPopupAroundAlignment((this.dropDownPosition && this.dropDownPosition.length) ? this.dropDownPosition : ["below"], this.isLeftToRight()), onExecute:function () {
			self.closeDropDown(true);
		}, onCancel:function () {
			self.closeDropDown(true);
		}, onClose:function () {
			dojo.attr(self._popupStateNode, "popupActive", false);
			dojo.removeClass(self._popupStateNode, "dijitHasDropDownOpen");
			self._opened = false;
		}});
		dojo.attr(this._popupStateNode, "popupActive", "true");
		dojo.addClass(self._popupStateNode, "dijitHasDropDownOpen");
		this._opened = true;
		return retVal;
	}, closeDropDown:function (focus) {
		if (this._opened) {
			if (focus) {
				this.focus();
			}
			dijit.popup.close(this.dropDown);
			this._opened = false;
		}
	}});
}

