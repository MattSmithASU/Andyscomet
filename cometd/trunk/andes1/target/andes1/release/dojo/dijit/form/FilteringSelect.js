/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.FilteringSelect"]) {
	dojo._hasResource["dijit.form.FilteringSelect"] = true;
	dojo.provide("dijit.form.FilteringSelect");
	dojo.require("dijit.form.MappedTextBox");
	dojo.require("dijit.form.ComboBoxMixin");
	dojo.declare("dijit.form.FilteringSelect", [dijit.form.MappedTextBox, dijit.form.ComboBoxMixin], {required:true, _lastDisplayedValue:"", _isValidSubset:function () {
		return this._opened;
	}, isValid:function () {
		return this.item || (!this.required && this.get("displayedValue") == "");
	}, _refreshState:function () {
		if (!this.searchTimer) {
			this.inherited(arguments);
		}
	}, _callbackSetLabel:function (result, dataObject, priorityChange) {
		if ((dataObject && dataObject.query[this.searchAttr] != this._lastQuery) || (!dataObject && result.length && this.store.getIdentity(result[0]) != this._lastQuery)) {
			return;
		}
		if (!result.length) {
			this.set("value", "", priorityChange || (priorityChange === undefined && !this._focused), this.textbox.value, null);
		} else {
			this.set("item", result[0], priorityChange);
		}
	}, _openResultList:function (results, dataObject) {
		if (dataObject.query[this.searchAttr] != this._lastQuery) {
			return;
		}
		this.inherited(arguments);
		if (this.item === undefined) {
			this.validate(true);
		}
	}, _getValueAttr:function () {
		return this.valueNode.value;
	}, _getValueField:function () {
		return "value";
	}, _setValueAttr:function (value, priorityChange, displayedValue, item) {
		if (!this._onChangeActive) {
			priorityChange = null;
		}
		if (item === undefined) {
			if (value === null || value === "") {
				value = "";
				if (!dojo.isString(displayedValue)) {
					this._setDisplayedValueAttr(displayedValue || "", priorityChange);
					return;
				}
			}
			var self = this;
			this._lastQuery = value;
			this.store.fetchItemByIdentity({identity:value, onItem:function (item) {
				self._callbackSetLabel(item ? [item] : [], undefined, priorityChange);
			}});
		} else {
			this.valueNode.value = value;
			this.inherited(arguments);
		}
	}, _setItemAttr:function (item, priorityChange, displayedValue) {
		this.inherited(arguments);
		this._lastDisplayedValue = this.textbox.value;
	}, _getDisplayQueryString:function (text) {
		return text.replace(/([\\\*\?])/g, "\\$1");
	}, _setDisplayedValueAttr:function (label, priorityChange) {
		if (label == null) {
			label = "";
		}
		if (!this._created) {
			if (!("displayedValue" in this.params)) {
				return;
			}
			priorityChange = false;
		}
		if (this.store) {
			this.closeDropDown();
			var query = dojo.clone(this.query);
			this._lastQuery = query[this.searchAttr] = this._getDisplayQueryString(label);
			this.textbox.value = label;
			this._lastDisplayedValue = label;
			this._set("displayedValue", label);
			var _this = this;
			var fetch = {query:query, queryOptions:{ignoreCase:this.ignoreCase, deep:true}, onComplete:function (result, dataObject) {
				_this._fetchHandle = null;
				dojo.hitch(_this, "_callbackSetLabel")(result, dataObject, priorityChange);
			}, onError:function (errText) {
				_this._fetchHandle = null;
				console.error("dijit.form.FilteringSelect: " + errText);
				dojo.hitch(_this, "_callbackSetLabel")([], undefined, false);
			}};
			dojo.mixin(fetch, this.fetchProperties);
			this._fetchHandle = this.store.fetch(fetch);
		}
	}, undo:function () {
		this.set("displayedValue", this._lastDisplayedValue);
	}});
}

