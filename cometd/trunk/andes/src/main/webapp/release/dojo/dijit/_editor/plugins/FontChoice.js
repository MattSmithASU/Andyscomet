/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.FontChoice"]) {
	dojo._hasResource["dijit._editor.plugins.FontChoice"] = true;
	dojo.provide("dijit._editor.plugins.FontChoice");
	dojo.require("dijit._Widget");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit._WidgetsInTemplateMixin");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit._editor.range");
	dojo.require("dijit._editor.selection");
	dojo.require("dijit.form.FilteringSelect");
	dojo.require("dojo.data.ItemFileReadStore");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dijit._editor", "FontChoice", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit._editor.plugins._FontDropDown", [dijit._Widget, dijit._TemplatedMixin, dijit._WidgetsInTemplateMixin], {label:"", plainText:false, templateString:"<span style='white-space: nowrap' class='dijit dijitReset dijitInline'>" + "<label class='dijitLeft dijitInline' for='${selectId}'>${label}</label>" + "<input dojoType='dijit.form.FilteringSelect' required='false' labelType='html' labelAttr='label' searchAttr='name' " + "tabIndex='-1' id='${selectId}' dojoAttachPoint='select' value=''/>" + "</span>", postMixInProperties:function () {
		this.inherited(arguments);
		this.strings = dojo.i18n.getLocalization("dijit._editor", "FontChoice");
		this.label = this.strings[this.command];
		this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
		this.selectId = this.id + "_select";
		this.inherited(arguments);
	}, postCreate:function () {
		var items = dojo.map(this.values, function (value) {
			var name = this.strings[value] || value;
			return {label:this.getLabel(value, name), name:name, value:value};
		}, this);
		this.select.store = new dojo.data.ItemFileReadStore({data:{identifier:"value", items:items}});
		this.select.set("value", "", false);
		this.disabled = this.select.get("disabled");
	}, _setValueAttr:function (value, priorityChange) {
		priorityChange = priorityChange !== false ? true : false;
		this.select.set("value", dojo.indexOf(this.values, value) < 0 ? "" : value, priorityChange);
		if (!priorityChange) {
			this.select._lastValueReported = null;
		}
	}, _getValueAttr:function () {
		return this.select.get("value");
	}, focus:function () {
		this.select.focus();
	}, _setDisabledAttr:function (value) {
		this.disabled = value;
		this.select.set("disabled", value);
	}});
	dojo.declare("dijit._editor.plugins._FontNameDropDown", dijit._editor.plugins._FontDropDown, {generic:false, command:"fontName", postMixInProperties:function () {
		if (!this.values) {
			this.values = this.generic ? ["serif", "sans-serif", "monospace", "cursive", "fantasy"] : ["Arial", "Times New Roman", "Comic Sans MS", "Courier New"];
		}
		this.inherited(arguments);
	}, getLabel:function (value, name) {
		if (this.plainText) {
			return name;
		} else {
			return "<div style='font-family: " + value + "'>" + name + "</div>";
		}
	}, _setValueAttr:function (value, priorityChange) {
		priorityChange = priorityChange !== false ? true : false;
		if (this.generic) {
			var map = {"Arial":"sans-serif", "Helvetica":"sans-serif", "Myriad":"sans-serif", "Times":"serif", "Times New Roman":"serif", "Comic Sans MS":"cursive", "Apple Chancery":"cursive", "Courier":"monospace", "Courier New":"monospace", "Papyrus":"fantasy"};
			value = map[value] || value;
		}
		this.inherited(arguments, [value, priorityChange]);
	}});
	dojo.declare("dijit._editor.plugins._FontSizeDropDown", dijit._editor.plugins._FontDropDown, {command:"fontSize", values:[1, 2, 3, 4, 5, 6, 7], getLabel:function (value, name) {
		if (this.plainText) {
			return name;
		} else {
			return "<font size=" + value + "'>" + name + "</font>";
		}
	}, _setValueAttr:function (value, priorityChange) {
		priorityChange = priorityChange !== false ? true : false;
		if (value.indexOf && value.indexOf("px") != -1) {
			var pixels = parseInt(value, 10);
			value = {10:1, 13:2, 16:3, 18:4, 24:5, 32:6, 48:7}[pixels] || value;
		}
		this.inherited(arguments, [value, priorityChange]);
	}});
	dojo.declare("dijit._editor.plugins._FormatBlockDropDown", dijit._editor.plugins._FontDropDown, {command:"formatBlock", values:["noFormat", "p", "h1", "h2", "h3", "pre"], postCreate:function () {
		this.inherited(arguments);
		this.set("value", "noFormat", false);
	}, getLabel:function (value, name) {
		if (this.plainText || value == "noFormat") {
			return name;
		} else {
			return "<" + value + ">" + name + "</" + value + ">";
		}
	}, _execCommand:function (editor, command, choice) {
		if (choice === "noFormat") {
			var start;
			var end;
			var sel = dijit.range.getSelection(editor.window);
			if (sel && sel.rangeCount > 0) {
				var range = sel.getRangeAt(0);
				var node, tag;
				if (range) {
					start = range.startContainer;
					end = range.endContainer;
					while (start && start !== editor.editNode && start !== editor.document.body && start.nodeType !== 1) {
						start = start.parentNode;
					}
					while (end && end !== editor.editNode && end !== editor.document.body && end.nodeType !== 1) {
						end = end.parentNode;
					}
					var processChildren = dojo.hitch(this, function (node, array) {
						if (node.childNodes && node.childNodes.length) {
							var i;
							for (i = 0; i < node.childNodes.length; i++) {
								var c = node.childNodes[i];
								if (c.nodeType == 1) {
									if (dojo.withGlobal(editor.window, "inSelection", dijit._editor.selection, [c])) {
										var tag = c.tagName ? c.tagName.toLowerCase() : "";
										if (dojo.indexOf(this.values, tag) !== -1) {
											array.push(c);
										}
										processChildren(c, array);
									}
								}
							}
						}
					});
					var unformatNodes = dojo.hitch(this, function (nodes) {
						if (nodes && nodes.length) {
							editor.beginEditing();
							while (nodes.length) {
								this._removeFormat(editor, nodes.pop());
							}
							editor.endEditing();
						}
					});
					var clearNodes = [];
					if (start == end) {
						var block;
						node = start;
						while (node && node !== editor.editNode && node !== editor.document.body) {
							if (node.nodeType == 1) {
								tag = node.tagName ? node.tagName.toLowerCase() : "";
								if (dojo.indexOf(this.values, tag) !== -1) {
									block = node;
									break;
								}
							}
							node = node.parentNode;
						}
						processChildren(start, clearNodes);
						if (block) {
							clearNodes = [block].concat(clearNodes);
						}
						unformatNodes(clearNodes);
					} else {
						node = start;
						while (dojo.withGlobal(editor.window, "inSelection", dijit._editor.selection, [node])) {
							if (node.nodeType == 1) {
								tag = node.tagName ? node.tagName.toLowerCase() : "";
								if (dojo.indexOf(this.values, tag) !== -1) {
									clearNodes.push(node);
								}
								processChildren(node, clearNodes);
							}
							node = node.nextSibling;
						}
						unformatNodes(clearNodes);
					}
					editor.onDisplayChanged();
				}
			}
		} else {
			editor.execCommand(command, choice);
		}
	}, _removeFormat:function (editor, node) {
		if (editor.customUndo) {
			while (node.firstChild) {
				dojo.place(node.firstChild, node, "before");
			}
			node.parentNode.removeChild(node);
		} else {
			dojo.withGlobal(editor.window, "selectElementChildren", dijit._editor.selection, [node]);
			var html = dojo.withGlobal(editor.window, "getSelectedHtml", dijit._editor.selection, [null]);
			dojo.withGlobal(editor.window, "selectElement", dijit._editor.selection, [node]);
			editor.execCommand("inserthtml", html || "");
		}
	}});
	dojo.declare("dijit._editor.plugins.FontChoice", dijit._editor._Plugin, {useDefaultCommand:false, _initButton:function () {
		var clazz = {fontName:dijit._editor.plugins._FontNameDropDown, fontSize:dijit._editor.plugins._FontSizeDropDown, formatBlock:dijit._editor.plugins._FormatBlockDropDown}[this.command], params = this.params;
		if (this.params.custom) {
			params.values = this.params.custom;
		}
		var editor = this.editor;
		this.button = new clazz(dojo.delegate({dir:editor.dir, lang:editor.lang}, params));
		this.connect(this.button.select, "onChange", function (choice) {
			this.editor.focus();
			if (this.command == "fontName" && choice.indexOf(" ") != -1) {
				choice = "'" + choice + "'";
			}
			if (this.button._execCommand) {
				this.button._execCommand(this.editor, this.command, choice);
			} else {
				this.editor.execCommand(this.command, choice);
			}
		});
	}, updateState:function () {
		var _e = this.editor;
		var _c = this.command;
		if (!_e || !_e.isLoaded || !_c.length) {
			return;
		}
		if (this.button) {
			var disabled = this.get("disabled");
			this.button.set("disabled", disabled);
			if (disabled) {
				return;
			}
			var value;
			try {
				value = _e.queryCommandValue(_c) || "";
			}
			catch (e) {
				value = "";
			}
			var quoted = dojo.isString(value) && value.match(/'([^']*)'/);
			if (quoted) {
				value = quoted[1];
			}
			if (_c === "formatBlock") {
				if (!value || value == "p") {
					value = null;
					var elem;
					var sel = dijit.range.getSelection(this.editor.window);
					if (sel && sel.rangeCount > 0) {
						var range = sel.getRangeAt(0);
						if (range) {
							elem = range.endContainer;
						}
					}
					while (elem && elem !== _e.editNode && elem !== _e.document) {
						var tg = elem.tagName ? elem.tagName.toLowerCase() : "";
						if (tg && dojo.indexOf(this.button.values, tg) > -1) {
							value = tg;
							break;
						}
						elem = elem.parentNode;
					}
					if (!value) {
						value = "noFormat";
					}
				} else {
					if (dojo.indexOf(this.button.values, value) < 0) {
						value = "noFormat";
					}
				}
			}
			if (value !== this.button.get("value")) {
				this.button.set("value", value, false);
			}
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		switch (o.args.name) {
		  case "fontName":
		  case "fontSize":
		  case "formatBlock":
			o.plugin = new dijit._editor.plugins.FontChoice({command:o.args.name, plainText:o.args.plainText ? o.args.plainText : false});
		}
	});
}

