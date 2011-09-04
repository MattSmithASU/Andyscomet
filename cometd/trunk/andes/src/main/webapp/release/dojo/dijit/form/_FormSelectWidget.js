/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._FormSelectWidget"]) {
	dojo._hasResource["dijit.form._FormSelectWidget"] = true;
	dojo.provide("dijit.form._FormSelectWidget");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dojo.data.util.sorter");
	dojo.declare("dijit.form._FormSelectWidget", dijit.form._FormValueWidget, {multiple:false, options:null, store:null, query:null, queryOptions:null, onFetch:null, sortByLabel:true, loadChildrenOnOpen:false, getOptions:function (valueOrIdx) {
		var lookupValue = valueOrIdx, opts = this.options || [], l = opts.length;
		if (lookupValue === undefined) {
			return opts;
		}
		if (dojo.isArray(lookupValue)) {
			return dojo.map(lookupValue, "return this.getOptions(item);", this);
		}
		if (dojo.isObject(valueOrIdx)) {
			if (!dojo.some(this.options, function (o, idx) {
				if (o === lookupValue || (o.value && o.value === lookupValue.value)) {
					lookupValue = idx;
					return true;
				}
				return false;
			})) {
				lookupValue = -1;
			}
		}
		if (typeof lookupValue == "string") {
			for (var i = 0; i < l; i++) {
				if (opts[i].value === lookupValue) {
					lookupValue = i;
					break;
				}
			}
		}
		if (typeof lookupValue == "number" && lookupValue >= 0 && lookupValue < l) {
			return this.options[lookupValue];
		}
		return null;
	}, addOption:function (option) {
		if (!dojo.isArray(option)) {
			option = [option];
		}
		dojo.forEach(option, function (i) {
			if (i && dojo.isObject(i)) {
				this.options.push(i);
			}
		}, this);
		this._loadChildren();
	}, removeOption:function (valueOrIdx) {
		if (!dojo.isArray(valueOrIdx)) {
			valueOrIdx = [valueOrIdx];
		}
		var oldOpts = this.getOptions(valueOrIdx);
		dojo.forEach(oldOpts, function (i) {
			if (i) {
				this.options = dojo.filter(this.options, function (node, idx) {
					return (node.value !== i.value || node.label !== i.label);
				});
				this._removeOptionItem(i);
			}
		}, this);
		this._loadChildren();
	}, updateOption:function (newOption) {
		if (!dojo.isArray(newOption)) {
			newOption = [newOption];
		}
		dojo.forEach(newOption, function (i) {
			var oldOpt = this.getOptions(i), k;
			if (oldOpt) {
				for (k in i) {
					oldOpt[k] = i[k];
				}
			}
		}, this);
		this._loadChildren();
	}, setStore:function (store, selectedValue, fetchArgs) {
		var oStore = this.store;
		fetchArgs = fetchArgs || {};
		if (oStore !== store) {
			dojo.forEach(this._notifyConnections || [], dojo.disconnect);
			delete this._notifyConnections;
			if (store && store.getFeatures()["dojo.data.api.Notification"]) {
				this._notifyConnections = [dojo.connect(store, "onNew", this, "_onNewItem"), dojo.connect(store, "onDelete", this, "_onDeleteItem"), dojo.connect(store, "onSet", this, "_onSetItem")];
			}
			this._set("store", store);
		}
		this._onChangeActive = false;
		if (this.options && this.options.length) {
			this.removeOption(this.options);
		}
		if (store) {
			this._loadingStore = true;
			store.fetch(dojo.delegate(fetchArgs, {onComplete:function (items, opts) {
				if (this.sortByLabel && !fetchArgs.sort && items.length) {
					items.sort(dojo.data.util.sorter.createSortFunction([{attribute:store.getLabelAttributes(items[0])[0]}], store));
				}
				if (fetchArgs.onFetch) {
					items = fetchArgs.onFetch.call(this, items, opts);
				}
				dojo.forEach(items, function (i) {
					this._addOptionForItem(i);
				}, this);
				this._loadingStore = false;
				this.set("value", "_pendingValue" in this ? this._pendingValue : selectedValue);
				delete this._pendingValue;
				if (!this.loadChildrenOnOpen) {
					this._loadChildren();
				} else {
					this._pseudoLoadChildren(items);
				}
				this._fetchedWith = opts;
				this._lastValueReported = this.multiple ? [] : null;
				this._onChangeActive = true;
				this.onSetStore();
				this._handleOnChange(this.value);
			}, scope:this}));
		} else {
			delete this._fetchedWith;
		}
		return oStore;
	}, _setValueAttr:function (newValue, priorityChange) {
		if (this._loadingStore) {
			this._pendingValue = newValue;
			return;
		}
		var opts = this.getOptions() || [];
		if (!dojo.isArray(newValue)) {
			newValue = [newValue];
		}
		dojo.forEach(newValue, function (i, idx) {
			if (!dojo.isObject(i)) {
				i = i + "";
			}
			if (typeof i === "string") {
				newValue[idx] = dojo.filter(opts, function (node) {
					return node.value === i;
				})[0] || {value:"", label:""};
			}
		}, this);
		newValue = dojo.filter(newValue, function (i) {
			return i && i.value;
		});
		if (!this.multiple && (!newValue[0] || !newValue[0].value) && opts.length) {
			newValue[0] = opts[0];
		}
		dojo.forEach(opts, function (i) {
			i.selected = dojo.some(newValue, function (v) {
				return v.value === i.value;
			});
		});
		var val = dojo.map(newValue, function (i) {
			return i.value;
		}), disp = dojo.map(newValue, function (i) {
			return i.label;
		});
		this._set("value", this.multiple ? val : val[0]);
		this._setDisplay(this.multiple ? disp : disp[0]);
		this._updateSelection();
		this._handleOnChange(this.value, priorityChange);
	}, _getDisplayedValueAttr:function () {
		var val = this.get("value");
		if (!dojo.isArray(val)) {
			val = [val];
		}
		var ret = dojo.map(this.getOptions(val), function (v) {
			if (v && "label" in v) {
				return v.label;
			} else {
				if (v) {
					return v.value;
				}
			}
			return null;
		}, this);
		return this.multiple ? ret : ret[0];
	}, _loadChildren:function () {
		if (this._loadingStore) {
			return;
		}
		dojo.forEach(this._getChildren(), function (child) {
			child.destroyRecursive();
		});
		dojo.forEach(this.options, this._addOptionItem, this);
		this._updateSelection();
	}, _updateSelection:function () {
		this._set("value", this._getValueFromOpts());
		var val = this.value;
		if (!dojo.isArray(val)) {
			val = [val];
		}
		if (val && val[0]) {
			dojo.forEach(this._getChildren(), function (child) {
				var isSelected = dojo.some(val, function (v) {
					return child.option && (v === child.option.value);
				});
				dojo.toggleClass(child.domNode, this.baseClass + "SelectedOption", isSelected);
				dijit.setWaiState(child.domNode, "selected", isSelected);
			}, this);
		}
	}, _getValueFromOpts:function () {
		var opts = this.getOptions() || [];
		if (!this.multiple && opts.length) {
			var opt = dojo.filter(opts, function (i) {
				return i.selected;
			})[0];
			if (opt && opt.value) {
				return opt.value;
			} else {
				opts[0].selected = true;
				return opts[0].value;
			}
		} else {
			if (this.multiple) {
				return dojo.map(dojo.filter(opts, function (i) {
					return i.selected;
				}), function (i) {
					return i.value;
				}) || [];
			}
		}
		return "";
	}, _onNewItem:function (item, parentInfo) {
		if (!parentInfo || !parentInfo.parent) {
			this._addOptionForItem(item);
		}
	}, _onDeleteItem:function (item) {
		var store = this.store;
		this.removeOption(store.getIdentity(item));
	}, _onSetItem:function (item) {
		this.updateOption(this._getOptionObjForItem(item));
	}, _getOptionObjForItem:function (item) {
		var store = this.store, label = store.getLabel(item), value = (label ? store.getIdentity(item) : null);
		return {value:value, label:label, item:item};
	}, _addOptionForItem:function (item) {
		var store = this.store;
		if (!store.isItemLoaded(item)) {
			store.loadItem({item:item, onComplete:function (i) {
				this._addOptionForItem(item);
			}, scope:this});
			return;
		}
		var newOpt = this._getOptionObjForItem(item);
		this.addOption(newOpt);
	}, constructor:function (keywordArgs) {
		this._oValue = (keywordArgs || {}).value || null;
	}, buildRendering:function () {
		this.inherited(arguments);
		dojo.setSelectable(this.focusNode, false);
	}, _fillContent:function () {
		var opts = this.options;
		if (!opts) {
			opts = this.options = this.srcNodeRef ? dojo.query(">", this.srcNodeRef).map(function (node) {
				if (node.getAttribute("type") === "separator") {
					return {value:"", label:"", selected:false, disabled:false};
				}
				return {value:(node.getAttribute("data-" + dojo._scopeName + "-value") || node.getAttribute("value")), label:String(node.innerHTML), selected:node.getAttribute("selected") || false, disabled:node.getAttribute("disabled") || false};
			}, this) : [];
		}
		if (!this.value) {
			this._set("value", this._getValueFromOpts());
		} else {
			if (this.multiple && typeof this.value == "string") {
				this_set("value", this.value.split(","));
			}
		}
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this, "onChange", "_updateSelection");
		this.connect(this, "startup", "_loadChildren");
		this._setValueAttr(this.value, null);
	}, startup:function () {
		this.inherited(arguments);
		var store = this.store, fetchArgs = {};
		dojo.forEach(["query", "queryOptions", "onFetch"], function (i) {
			if (this[i]) {
				fetchArgs[i] = this[i];
			}
			delete this[i];
		}, this);
		if (store && store.getFeatures()["dojo.data.api.Identity"]) {
			this.store = null;
			this.setStore(store, this._oValue, fetchArgs);
		}
	}, destroy:function () {
		dojo.forEach(this._notifyConnections || [], dojo.disconnect);
		this.inherited(arguments);
	}, _addOptionItem:function (option) {
	}, _removeOptionItem:function (option) {
	}, _setDisplay:function (newDisplay) {
	}, _getChildren:function () {
		return [];
	}, _getSelectedOptionsAttr:function () {
		return this.getOptions(this.get("value"));
	}, _pseudoLoadChildren:function (items) {
	}, onSetStore:function () {
	}});
}

