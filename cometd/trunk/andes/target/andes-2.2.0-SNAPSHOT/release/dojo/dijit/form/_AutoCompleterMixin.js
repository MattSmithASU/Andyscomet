/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._AutoCompleterMixin"]) {
	dojo._hasResource["dijit.form._AutoCompleterMixin"] = true;
	dojo.provide("dijit.form._AutoCompleterMixin");
	dojo.require("dojo.regexp");
	dojo.requireLocalization("dijit.form", "ComboBox", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dijit.form.DataList");
	dojo.require("dijit._HasDropDown");
	dojo.declare("dijit.form._AutoCompleterMixin", dijit._HasDropDown, {item:null, pageSize:Infinity, store:null, fetchProperties:{}, query:{}, autoComplete:true, highlightMatch:"first", searchDelay:100, searchAttr:"name", labelAttr:"", labelType:"text", queryExpr:"${0}*", ignoreCase:true, maxHeight:-1, _stopClickEvents:false, _getCaretPos:function (element) {
		var pos = 0;
		if (typeof (element.selectionStart) == "number") {
			pos = element.selectionStart;
		} else {
			if (dojo.isIE) {
				var tr = dojo.doc.selection.createRange().duplicate();
				var ntr = element.createTextRange();
				tr.move("character", 0);
				ntr.move("character", 0);
				try {
					ntr.setEndPoint("EndToEnd", tr);
					pos = String(ntr.text).replace(/\r/g, "").length;
				}
				catch (e) {
				}
			}
		}
		return pos;
	}, _setCaretPos:function (element, location) {
		location = parseInt(location);
		dijit.selectInputText(element, location, location);
	}, _setDisabledAttr:function (value) {
		this.inherited(arguments);
		this.domNode.setAttribute("aria-disabled", value);
	}, _abortQuery:function () {
		if (this.searchTimer) {
			clearTimeout(this.searchTimer);
			this.searchTimer = null;
		}
		if (this._fetchHandle) {
			if (this._fetchHandle.abort) {
				this._fetchHandle.abort();
			}
			this._fetchHandle = null;
		}
	}, _onInput:function (evt) {
		this.inherited(arguments);
		if (evt.charOrCode == 229) {
			this._onKey(evt);
		}
	}, _onKey:function (evt) {
		var key = evt.charOrCode;
		if (evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != "x" && key != "v")) || key == dojo.keys.SHIFT) {
			return;
		}
		var doSearch = false;
		var pw = this.dropDown;
		var dk = dojo.keys;
		var highlighted = null;
		this._prev_key_backspace = false;
		this._abortQuery();
		this.inherited(arguments);
		if (this._opened) {
			highlighted = pw.getHighlightedOption();
		}
		switch (key) {
		  case dk.PAGE_DOWN:
		  case dk.DOWN_ARROW:
		  case dk.PAGE_UP:
		  case dk.UP_ARROW:
			if (this._opened) {
				this._announceOption(highlighted);
			}
			dojo.stopEvent(evt);
			break;
		  case dk.ENTER:
			if (highlighted) {
				if (highlighted == pw.nextButton) {
					this._nextSearch(1);
					dojo.stopEvent(evt);
					break;
				} else {
					if (highlighted == pw.previousButton) {
						this._nextSearch(-1);
						dojo.stopEvent(evt);
						break;
					}
				}
			} else {
				this._setBlurValue();
				this._setCaretPos(this.focusNode, this.focusNode.value.length);
			}
			if (this._opened || this._fetchHandle) {
				evt.preventDefault();
			}
		  case dk.TAB:
			var newvalue = this.get("displayedValue");
			if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
				break;
			}
			if (highlighted) {
				this._selectOption(highlighted);
			}
			if (this._opened) {
				this._lastQuery = null;
				this.closeDropDown();
			}
			break;
		  case " ":
			if (highlighted) {
				dojo.stopEvent(evt);
				this._selectOption(highlighted);
				this.closeDropDown();
			} else {
				doSearch = true;
			}
			break;
		  case dk.DELETE:
		  case dk.BACKSPACE:
			this._prev_key_backspace = true;
			doSearch = true;
			break;
		  default:
			doSearch = typeof key == "string" || key == 229;
		}
		if (doSearch) {
			this.item = undefined;
			this.searchTimer = setTimeout(dojo.hitch(this, "_startSearchFromInput"), 1);
		}
	}, _autoCompleteText:function (text) {
		var fn = this.focusNode;
		dijit.selectInputText(fn, fn.value.length);
		var caseFilter = this.ignoreCase ? "toLowerCase" : "substr";
		if (text[caseFilter](0).indexOf(this.focusNode.value[caseFilter](0)) == 0) {
			var cpos = this._getCaretPos(fn);
			if ((cpos + 1) > fn.value.length) {
				fn.value = text;
				dijit.selectInputText(fn, cpos);
			}
		} else {
			fn.value = text;
			dijit.selectInputText(fn);
		}
	}, _openResultList:function (results, dataObject) {
		this._fetchHandle = null;
		if (this.disabled || this.readOnly || (dataObject.query[this.searchAttr] != this._lastQuery)) {
			return;
		}
		var wasSelected = this.dropDown.getHighlightedOption();
		this.dropDown.clearResultList();
		if (!results.length && !this._maxOptions) {
			this.closeDropDown();
			return;
		}
		dataObject._maxOptions = this._maxOptions;
		var nodes = this.dropDown.createOptions(results, dataObject, dojo.hitch(this, "_getMenuLabelFromItem"));
		this._showResultList();
		if (dataObject.direction) {
			if (1 == dataObject.direction) {
				this.dropDown.highlightFirstOption();
			} else {
				if (-1 == dataObject.direction) {
					this.dropDown.highlightLastOption();
				}
			}
			if (wasSelected) {
				this._announceOption(this.dropDown.getHighlightedOption());
			}
		} else {
			if (this.autoComplete && !this._prev_key_backspace && !/^[*]+$/.test(dataObject.query[this.searchAttr])) {
				this._announceOption(nodes[1]);
			}
		}
	}, _showResultList:function () {
		this.closeDropDown(true);
		this.openDropDown();
		this.domNode.setAttribute("aria-expanded", "true");
	}, loadDropDown:function (callback) {
		this._startSearchAll();
	}, isLoaded:function () {
		return false;
	}, closeDropDown:function () {
		this._abortQuery();
		if (this._opened) {
			this.inherited(arguments);
			this.domNode.setAttribute("aria-expanded", "false");
			this.focusNode.removeAttribute("aria-activedescendant");
		}
	}, _setBlurValue:function () {
		var newvalue = this.get("displayedValue");
		var pw = this.dropDown;
		if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
			this._setValueAttr(this._lastValueReported, true);
		} else {
			if (typeof this.item == "undefined") {
				this.item = null;
				this.set("displayedValue", newvalue);
			} else {
				if (this.value != this._lastValueReported) {
					this._handleOnChange(this.value, true);
				}
				this._refreshState();
			}
		}
	}, _onBlur:function () {
		this.closeDropDown();
		this.inherited(arguments);
	}, _setItemAttr:function (item, priorityChange, displayedValue) {
		var value = "";
		if (item) {
			if (!displayedValue) {
				displayedValue = this.store.getValue(item, this.searchAttr);
			}
			value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
		}
		this.set("value", value, priorityChange, displayedValue, item);
	}, _announceOption:function (node) {
		if (!node) {
			return;
		}
		var newValue;
		if (node == this.dropDown.nextButton || node == this.dropDown.previousButton) {
			newValue = node.innerHTML;
			this.item = undefined;
			this.value = "";
		} else {
			newValue = this.store.getValue(node.item, this.searchAttr).toString();
			this.set("item", node.item, false, newValue);
		}
		this.focusNode.value = this.focusNode.value.substring(0, this._lastInput.length);
		this.focusNode.setAttribute("aria-activedescendant", dojo.attr(node, "id"));
		this._autoCompleteText(newValue);
	}, _selectOption:function (target) {
		if (target) {
			this._announceOption(target);
		}
		this.closeDropDown();
		this._setCaretPos(this.focusNode, this.focusNode.value.length);
		this._handleOnChange(this.value, true);
	}, _startSearchAll:function () {
		this._startSearch("");
	}, _startSearchFromInput:function () {
		this._startSearch(this.focusNode.value.replace(/([\\\*\?])/g, "\\$1"));
	}, _getQueryString:function (text) {
		return dojo.string.substitute(this.queryExpr, [text]);
	}, _startSearch:function (key) {
		if (!this.dropDown) {
			var popupId = this.id + "_popup", dropDownConstructor = dojo.getObject(this.dropDownClass, false);
			this.dropDown = new dropDownConstructor({onChange:dojo.hitch(this, this._selectOption), id:popupId, dir:this.dir, textDir:this.textDir});
			this.focusNode.removeAttribute("aria-activedescendant");
			this.textbox.setAttribute("aria-owns", popupId);
		}
		var query = dojo.clone(this.query);
		this._lastInput = key;
		this._lastQuery = query[this.searchAttr] = this._getQueryString(key);
		this.searchTimer = setTimeout(dojo.hitch(this, function (query, _this) {
			this.searchTimer = null;
			var fetch = {queryOptions:{ignoreCase:this.ignoreCase, deep:true}, query:query, onBegin:dojo.hitch(this, "_setMaxOptions"), onComplete:dojo.hitch(this, "_openResultList"), onError:function (errText) {
				_this._fetchHandle = null;
				console.error(this.declaredClass + " " + errText);
				_this.closeDropDown();
			}, start:0, count:this.pageSize};
			dojo.mixin(fetch, _this.fetchProperties);
			this._fetchHandle = _this.store.fetch(fetch);
			var nextSearch = function (dataObject, direction) {
				dataObject.start += dataObject.count * direction;
				dataObject.direction = direction;
				this._fetchHandle = this.store.fetch(dataObject);
				this.focus();
			};
			this._nextSearch = this.dropDown.onPage = dojo.hitch(this, nextSearch, this._fetchHandle);
		}, query, this), this.searchDelay);
	}, _setMaxOptions:function (size, request) {
		this._maxOptions = size;
	}, _getValueField:function () {
		return this.searchAttr;
	}, constructor:function () {
		this.query = {};
		this.fetchProperties = {};
	}, postMixInProperties:function () {
		if (!this.store) {
			var srcNodeRef = this.srcNodeRef;
			var list = this.list;
			if (list) {
				this.store = dijit.byId(list);
			}
			if (!this.store) {
				this.store = new dijit.form.DataList({}, srcNodeRef);
			}
			if (!("value" in this.params)) {
				var item = (this.item = this.store.fetchSelectedItem());
				if (item) {
					var valueField = this._getValueField();
					this.value = this.store.getValue(item, valueField);
				}
			}
		}
		this.inherited(arguments);
	}, postCreate:function () {
		var label = dojo.query("label[for=\"" + this.id + "\"]");
		if (label.length) {
			label[0].id = (this.id + "_label");
			this.domNode.setAttribute("aria-labelledby", label[0].id);
		}
		this.inherited(arguments);
	}, _getMenuLabelFromItem:function (item) {
		var label = this.labelFunc(item, this.store), labelType = this.labelType;
		if (this.highlightMatch != "none" && this.labelType == "text" && this._lastInput) {
			label = this.doHighlight(label, this._escapeHtml(this._lastInput));
			labelType = "html";
		}
		return {html:labelType == "html", label:label};
	}, doHighlight:function (label, find) {
		var modifiers = (this.ignoreCase ? "i" : "") + (this.highlightMatch == "all" ? "g" : ""), i = this.queryExpr.indexOf("${0}");
		find = dojo.regexp.escapeString(find);
		return this._escapeHtml(label).replace(new RegExp((i == 0 ? "^" : "") + "(" + find + ")" + (i == (this.queryExpr.length - 4) ? "$" : ""), modifiers), "<span class=\"dijitComboBoxHighlightMatch\">$1</span>");
	}, _escapeHtml:function (str) {
		str = String(str).replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
		return str;
	}, reset:function () {
		this.item = null;
		this.inherited(arguments);
	}, labelFunc:function (item, store) {
		return store.getValue(item, this.labelAttr || this.searchAttr).toString();
	}, _setValueAttr:function (value, priorityChange, displayedValue, item) {
		this._set("item", item || null);
		if (!value) {
			value = "";
		}
		this.inherited(arguments);
	}, _setTextDirAttr:function (textDir) {
		this.inherited(arguments);
		if (this.dropDown) {
			this.dropDown._set("textDir", textDir);
		}
	}});
}

