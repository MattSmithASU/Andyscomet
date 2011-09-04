/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.Editor"]) {
	dojo._hasResource["dijit.Editor"] = true;
	dojo.provide("dijit.Editor");
	dojo.require("dijit._editor.RichText");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.ToolbarSeparator");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit._editor.plugins.EnterKeyHandling");
	dojo.require("dijit._editor.range");
	dojo.require("dijit._Container");
	dojo.require("dojo.i18n");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.requireLocalization("dijit._editor", "commands", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.require("dijit.form.ToggleButton");
	dojo.declare("dijit.Editor", dijit._editor.RichText, {plugins:null, extraPlugins:null, constructor:function () {
		if (!dojo.isArray(this.plugins)) {
			this.plugins = ["undo", "redo", "|", "cut", "copy", "paste", "|", "bold", "italic", "underline", "strikethrough", "|", "insertOrderedList", "insertUnorderedList", "indent", "outdent", "|", "justifyLeft", "justifyRight", "justifyCenter", "justifyFull", "dijit._editor.plugins.EnterKeyHandling"];
		}
		this._plugins = [];
		this._editInterval = this.editActionInterval * 1000;
		if (dojo.isIE) {
			this.events.push("onBeforeDeactivate");
			this.events.push("onBeforeActivate");
		}
	}, postMixInProperties:function () {
		this.setValueDeferred = new dojo.Deferred();
		this.inherited(arguments);
	}, postCreate:function () {
		this._steps = this._steps.slice(0);
		this._undoedSteps = this._undoedSteps.slice(0);
		if (dojo.isArray(this.extraPlugins)) {
			this.plugins = this.plugins.concat(this.extraPlugins);
		}
		this.inherited(arguments);
		this.commands = dojo.i18n.getLocalization("dijit._editor", "commands", this.lang);
		if (!this.toolbar) {
			this.toolbar = new dijit.Toolbar({dir:this.dir, lang:this.lang});
			this.header.appendChild(this.toolbar.domNode);
		}
		dojo.forEach(this.plugins, this.addPlugin, this);
		this.setValueDeferred.callback(true);
		dojo.addClass(this.iframe.parentNode, "dijitEditorIFrameContainer");
		dojo.addClass(this.iframe, "dijitEditorIFrame");
		dojo.attr(this.iframe, "allowTransparency", true);
		if (dojo.isWebKit) {
			dojo.style(this.domNode, "KhtmlUserSelect", "none");
		}
		this.toolbar.startup();
		this.onNormalizedDisplayChanged();
	}, destroy:function () {
		dojo.forEach(this._plugins, function (p) {
			if (p && p.destroy) {
				p.destroy();
			}
		});
		this._plugins = [];
		this.toolbar.destroyRecursive();
		delete this.toolbar;
		this.inherited(arguments);
	}, addPlugin:function (plugin, index) {
		var args = dojo.isString(plugin) ? {name:plugin} : plugin;
		if (!args.setEditor) {
			var o = {"args":args, "plugin":null, "editor":this};
			dojo.publish(dijit._scopeName + ".Editor.getPlugin", [o]);
			if (!o.plugin) {
				var pc = dojo.getObject(args.name);
				if (pc) {
					o.plugin = new pc(args);
				}
			}
			if (!o.plugin) {
				console.warn("Cannot find plugin", plugin);
				return;
			}
			plugin = o.plugin;
		}
		if (arguments.length > 1) {
			this._plugins[index] = plugin;
		} else {
			this._plugins.push(plugin);
		}
		plugin.setEditor(this);
		if (dojo.isFunction(plugin.setToolbar)) {
			plugin.setToolbar(this.toolbar);
		}
	}, startup:function () {
	}, resize:function (size) {
		if (size) {
			dijit.layout._LayoutWidget.prototype.resize.apply(this, arguments);
		}
	}, layout:function () {
		var areaHeight = (this._contentBox.h - (this.getHeaderHeight() + this.getFooterHeight() + dojo._getPadBorderExtents(this.iframe.parentNode).h + dojo._getMarginExtents(this.iframe.parentNode).h));
		this.editingArea.style.height = areaHeight + "px";
		if (this.iframe) {
			this.iframe.style.height = "100%";
		}
		this._layoutMode = true;
	}, _onIEMouseDown:function (e) {
		var outsideClientArea;
		var b = this.document.body;
		var clientWidth = b.clientWidth;
		var clientHeight = b.clientHeight;
		var clientLeft = b.clientLeft;
		var offsetWidth = b.offsetWidth;
		var offsetHeight = b.offsetHeight;
		var offsetLeft = b.offsetLeft;
		bodyDir = b.dir ? b.dir.toLowerCase() : "";
		if (bodyDir != "rtl") {
			if (clientWidth < offsetWidth && e.x > clientWidth && e.x < offsetWidth) {
				outsideClientArea = true;
			}
		} else {
			if (e.x < clientLeft && e.x > offsetLeft) {
				outsideClientArea = true;
			}
		}
		if (!outsideClientArea) {
			if (clientHeight < offsetHeight && e.y > clientHeight && e.y < offsetHeight) {
				outsideClientArea = true;
			}
		}
		if (!outsideClientArea) {
			delete this._cursorToStart;
			delete this._savedSelection;
			if (e.target.tagName == "BODY") {
				setTimeout(dojo.hitch(this, "placeCursorAtEnd"), 0);
			}
			this.inherited(arguments);
		}
	}, onBeforeActivate:function (e) {
		this._restoreSelection();
	}, onBeforeDeactivate:function (e) {
		if (this.customUndo) {
			this.endEditing(true);
		}
		if (e.target.tagName != "BODY") {
			this._saveSelection();
		}
	}, customUndo:true, editActionInterval:3, beginEditing:function (cmd) {
		if (!this._inEditing) {
			this._inEditing = true;
			this._beginEditing(cmd);
		}
		if (this.editActionInterval > 0) {
			if (this._editTimer) {
				clearTimeout(this._editTimer);
			}
			this._editTimer = setTimeout(dojo.hitch(this, this.endEditing), this._editInterval);
		}
	}, _steps:[], _undoedSteps:[], execCommand:function (cmd) {
		if (this.customUndo && (cmd == "undo" || cmd == "redo")) {
			return this[cmd]();
		} else {
			if (this.customUndo) {
				this.endEditing();
				this._beginEditing();
			}
			var r = this.inherited(arguments);
			if (this.customUndo) {
				this._endEditing();
			}
			return r;
		}
	}, _pasteImpl:function () {
		return this._clipboardCommand("paste");
	}, _cutImpl:function () {
		return this._clipboardCommand("cut");
	}, _copyImpl:function () {
		return this._clipboardCommand("copy");
	}, _clipboardCommand:function (cmd) {
		var r;
		try {
			r = this.document.execCommand(cmd, false, null);
			if (dojo.isWebKit && !r) {
				throw {code:1011};
			}
		}
		catch (e) {
			if (e.code == 1011) {
				var sub = dojo.string.substitute, accel = {cut:"X", copy:"C", paste:"V"};
				alert(sub(this.commands.systemShortcut, [this.commands[cmd], sub(this.commands[dojo.isMac ? "appleKey" : "ctrlKey"], [accel[cmd]])]));
			}
			r = false;
		}
		return r;
	}, queryCommandEnabled:function (cmd) {
		if (this.customUndo && (cmd == "undo" || cmd == "redo")) {
			return cmd == "undo" ? (this._steps.length > 1) : (this._undoedSteps.length > 0);
		} else {
			return this.inherited(arguments);
		}
	}, _moveToBookmark:function (b) {
		var bookmark = b.mark;
		var mark = b.mark;
		var col = b.isCollapsed;
		var r, sNode, eNode, sel;
		if (mark) {
			if (dojo.isIE < 9) {
				if (dojo.isArray(mark)) {
					bookmark = [];
					dojo.forEach(mark, function (n) {
						bookmark.push(dijit.range.getNode(n, this.editNode));
					}, this);
					dojo.withGlobal(this.window, "moveToBookmark", dijit, [{mark:bookmark, isCollapsed:col}]);
				} else {
					if (mark.startContainer && mark.endContainer) {
						sel = dijit.range.getSelection(this.window);
						if (sel && sel.removeAllRanges) {
							sel.removeAllRanges();
							r = dijit.range.create(this.window);
							sNode = dijit.range.getNode(mark.startContainer, this.editNode);
							eNode = dijit.range.getNode(mark.endContainer, this.editNode);
							if (sNode && eNode) {
								r.setStart(sNode, mark.startOffset);
								r.setEnd(eNode, mark.endOffset);
								sel.addRange(r);
							}
						}
					}
				}
			} else {
				sel = dijit.range.getSelection(this.window);
				if (sel && sel.removeAllRanges) {
					sel.removeAllRanges();
					r = dijit.range.create(this.window);
					sNode = dijit.range.getNode(mark.startContainer, this.editNode);
					eNode = dijit.range.getNode(mark.endContainer, this.editNode);
					if (sNode && eNode) {
						r.setStart(sNode, mark.startOffset);
						r.setEnd(eNode, mark.endOffset);
						sel.addRange(r);
					}
				}
			}
		}
	}, _changeToStep:function (from, to) {
		this.setValue(to.text);
		var b = to.bookmark;
		if (!b) {
			return;
		}
		this._moveToBookmark(b);
	}, undo:function () {
		var ret = false;
		if (!this._undoRedoActive) {
			this._undoRedoActive = true;
			this.endEditing(true);
			var s = this._steps.pop();
			if (s && this._steps.length > 0) {
				this.focus();
				this._changeToStep(s, this._steps[this._steps.length - 1]);
				this._undoedSteps.push(s);
				this.onDisplayChanged();
				delete this._undoRedoActive;
				ret = true;
			}
			delete this._undoRedoActive;
		}
		return ret;
	}, redo:function () {
		var ret = false;
		if (!this._undoRedoActive) {
			this._undoRedoActive = true;
			this.endEditing(true);
			var s = this._undoedSteps.pop();
			if (s && this._steps.length > 0) {
				this.focus();
				this._changeToStep(this._steps[this._steps.length - 1], s);
				this._steps.push(s);
				this.onDisplayChanged();
				ret = true;
			}
			delete this._undoRedoActive;
		}
		return ret;
	}, endEditing:function (ignore_caret) {
		if (this._editTimer) {
			clearTimeout(this._editTimer);
		}
		if (this._inEditing) {
			this._endEditing(ignore_caret);
			this._inEditing = false;
		}
	}, _getBookmark:function () {
		var b = dojo.withGlobal(this.window, dijit.getBookmark);
		var tmp = [];
		if (b && b.mark) {
			var mark = b.mark;
			if (dojo.isIE < 9) {
				var sel = dijit.range.getSelection(this.window);
				if (!dojo.isArray(mark)) {
					if (sel) {
						var range;
						if (sel.rangeCount) {
							range = sel.getRangeAt(0);
						}
						if (range) {
							b.mark = range.cloneRange();
						} else {
							b.mark = dojo.withGlobal(this.window, dijit.getBookmark);
						}
					}
				} else {
					dojo.forEach(b.mark, function (n) {
						tmp.push(dijit.range.getIndex(n, this.editNode).o);
					}, this);
					b.mark = tmp;
				}
			}
			try {
				if (b.mark && b.mark.startContainer) {
					tmp = dijit.range.getIndex(b.mark.startContainer, this.editNode).o;
					b.mark = {startContainer:tmp, startOffset:b.mark.startOffset, endContainer:b.mark.endContainer === b.mark.startContainer ? tmp : dijit.range.getIndex(b.mark.endContainer, this.editNode).o, endOffset:b.mark.endOffset};
				}
			}
			catch (e) {
				b.mark = null;
			}
		}
		return b;
	}, _beginEditing:function (cmd) {
		if (this._steps.length === 0) {
			this._steps.push({"text":dijit._editor.getChildrenHtml(this.editNode), "bookmark":this._getBookmark()});
		}
	}, _endEditing:function (ignore_caret) {
		var v = dijit._editor.getChildrenHtml(this.editNode);
		this._undoedSteps = [];
		this._steps.push({text:v, bookmark:this._getBookmark()});
	}, onKeyDown:function (e) {
		if (!dojo.isIE && !this.iframe && e.keyCode == dojo.keys.TAB && !this.tabIndent) {
			this._saveSelection();
		}
		if (!this.customUndo) {
			this.inherited(arguments);
			return;
		}
		var k = e.keyCode, ks = dojo.keys;
		if (e.ctrlKey && !e.altKey) {
			if (k == 90 || k == 122) {
				dojo.stopEvent(e);
				this.undo();
				return;
			} else {
				if (k == 89 || k == 121) {
					dojo.stopEvent(e);
					this.redo();
					return;
				}
			}
		}
		this.inherited(arguments);
		switch (k) {
		  case ks.ENTER:
		  case ks.BACKSPACE:
		  case ks.DELETE:
			this.beginEditing();
			break;
		  case 88:
		  case 86:
			if (e.ctrlKey && !e.altKey && !e.metaKey) {
				this.endEditing();
				if (e.keyCode == 88) {
					this.beginEditing("cut");
					setTimeout(dojo.hitch(this, this.endEditing), 1);
				} else {
					this.beginEditing("paste");
					setTimeout(dojo.hitch(this, this.endEditing), 1);
				}
				break;
			}
		  default:
			if (!e.ctrlKey && !e.altKey && !e.metaKey && (e.keyCode < dojo.keys.F1 || e.keyCode > dojo.keys.F15)) {
				this.beginEditing();
				break;
			}
		  case ks.ALT:
			this.endEditing();
			break;
		  case ks.UP_ARROW:
		  case ks.DOWN_ARROW:
		  case ks.LEFT_ARROW:
		  case ks.RIGHT_ARROW:
		  case ks.HOME:
		  case ks.END:
		  case ks.PAGE_UP:
		  case ks.PAGE_DOWN:
			this.endEditing(true);
			break;
		  case ks.CTRL:
		  case ks.SHIFT:
		  case ks.TAB:
			break;
		}
	}, _onBlur:function () {
		this.inherited(arguments);
		this.endEditing(true);
	}, _saveSelection:function () {
		try {
			this._savedSelection = this._getBookmark();
		}
		catch (e) {
		}
	}, _restoreSelection:function () {
		if (this._savedSelection) {
			delete this._cursorToStart;
			if (dojo.withGlobal(this.window, "isCollapsed", dijit)) {
				this._moveToBookmark(this._savedSelection);
			}
			delete this._savedSelection;
		}
	}, onClick:function () {
		this.endEditing(true);
		this.inherited(arguments);
	}, replaceValue:function (html) {
		if (!this.customUndo) {
			this.inherited(arguments);
		} else {
			if (this.isClosed) {
				this.setValue(html);
			} else {
				this.beginEditing();
				if (!html) {
					html = "&nbsp;";
				}
				this.setValue(html);
				this.endEditing();
			}
		}
	}, _setDisabledAttr:function (value) {
		var disableFunc = dojo.hitch(this, function () {
			if ((!this.disabled && value) || (!this._buttonEnabledPlugins && value)) {
				dojo.forEach(this._plugins, function (p) {
					p.set("disabled", true);
				});
			} else {
				if (this.disabled && !value) {
					dojo.forEach(this._plugins, function (p) {
						p.set("disabled", false);
					});
				}
			}
		});
		this.setValueDeferred.addCallback(disableFunc);
		this.inherited(arguments);
	}, _setStateClass:function () {
		try {
			this.inherited(arguments);
			if (this.document && this.document.body) {
				dojo.style(this.document.body, "color", dojo.style(this.iframe, "color"));
			}
		}
		catch (e) {
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var args = o.args, p;
		var _p = dijit._editor._Plugin;
		var name = args.name;
		switch (name) {
		  case "undo":
		  case "redo":
		  case "cut":
		  case "copy":
		  case "paste":
		  case "insertOrderedList":
		  case "insertUnorderedList":
		  case "indent":
		  case "outdent":
		  case "justifyCenter":
		  case "justifyFull":
		  case "justifyLeft":
		  case "justifyRight":
		  case "delete":
		  case "selectAll":
		  case "removeFormat":
		  case "unlink":
		  case "insertHorizontalRule":
			p = new _p({command:name});
			break;
		  case "bold":
		  case "italic":
		  case "underline":
		  case "strikethrough":
		  case "subscript":
		  case "superscript":
			p = new _p({buttonClass:dijit.form.ToggleButton, command:name});
			break;
		  case "|":
			p = new _p({button:new dijit.ToolbarSeparator(), setEditor:function (editor) {
				this.editor = editor;
			}});
		}
		o.plugin = p;
	});
}

