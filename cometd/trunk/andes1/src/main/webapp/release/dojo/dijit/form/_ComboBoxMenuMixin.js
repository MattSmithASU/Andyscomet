/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._ComboBoxMenuMixin"]) {
	dojo._hasResource["dijit.form._ComboBoxMenuMixin"] = true;
	dojo.provide("dijit.form._ComboBoxMenuMixin");
	dojo.declare("dijit.form._ComboBoxMenuMixin", null, {_messages:null, postMixInProperties:function () {
		this.inherited(arguments);
		this._messages = dojo.i18n.getLocalization("dijit.form", "ComboBox", this.lang);
	}, buildRendering:function () {
		this.inherited(arguments);
		this.previousButton.innerHTML = this._messages["previousMessage"];
		this.nextButton.innerHTML = this._messages["nextMessage"];
	}, _setValueAttr:function (value) {
		this.value = value;
		this.onChange(value);
	}, onClick:function (node) {
		if (node == this.previousButton) {
			this._setSelectedAttr(null);
			this.onPage(-1);
		} else {
			if (node == this.nextButton) {
				this._setSelectedAttr(null);
				this.onPage(1);
			} else {
				this.onChange(node);
			}
		}
	}, onPage:function (direction) {
	}, onClose:function () {
		this._setSelectedAttr(null);
	}, _createOption:function (item, labelFunc) {
		var menuitem = this._createMenuItem();
		var labelObject = labelFunc(item);
		if (labelObject.html) {
			menuitem.innerHTML = labelObject.label;
		} else {
			menuitem.appendChild(dojo.doc.createTextNode(labelObject.label));
		}
		if (menuitem.innerHTML == "") {
			menuitem.innerHTML = "&nbsp;";
		}
		this.applyTextDir(menuitem, (menuitem.innerText || menuitem.textContent || ""));
		menuitem.item = item;
		return menuitem;
	}, createOptions:function (results, dataObject, labelFunc) {
		this.previousButton.style.display = (dataObject.start == 0) ? "none" : "";
		dojo.attr(this.previousButton, "id", this.id + "_prev");
		dojo.forEach(results, function (item, i) {
			var menuitem = this._createOption(item, labelFunc);
			dojo.attr(menuitem, "id", this.id + i);
			this.nextButton.parentNode.insertBefore(menuitem, this.nextButton);
		}, this);
		var displayMore = false;
		if (dataObject._maxOptions && dataObject._maxOptions != -1) {
			if ((dataObject.start + dataObject.count) < dataObject._maxOptions) {
				displayMore = true;
			} else {
				if ((dataObject.start + dataObject.count) > dataObject._maxOptions && dataObject.count == results.length) {
					displayMore = true;
				}
			}
		} else {
			if (dataObject.count == results.length) {
				displayMore = true;
			}
		}
		this.nextButton.style.display = displayMore ? "" : "none";
		dojo.attr(this.nextButton, "id", this.id + "_next");
		return this.containerNode.childNodes;
	}, clearResultList:function () {
		var container = this.containerNode;
		while (container.childNodes.length > 2) {
			container.removeChild(container.childNodes[container.childNodes.length - 2]);
		}
		this._setSelectedAttr(null);
	}, highlightFirstOption:function () {
		this.selectFirstNode();
	}, highlightLastOption:function () {
		this.selectLastNode();
	}, selectFirstNode:function () {
		this.inherited(arguments);
		if (this.getHighlightedOption() == this.previousButton) {
			this.selectNextNode();
		}
	}, selectLastNode:function () {
		this.inherited(arguments);
		if (this.getHighlightedOption() == this.nextButton) {
			this.selectPreviousNode();
		}
	}, getHighlightedOption:function () {
		return this._getSelectedAttr();
	}});
}

