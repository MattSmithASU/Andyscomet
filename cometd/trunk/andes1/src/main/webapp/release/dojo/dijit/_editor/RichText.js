/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.RichText"]) {
	dojo._hasResource["dijit._editor.RichText"] = true;
	dojo.provide("dijit._editor.RichText");
	dojo.require("dijit._Widget");
	dojo.require("dijit._CssStateMixin");
	dojo.require("dijit._editor.selection");
	dojo.require("dijit._editor.range");
	dojo.require("dijit._editor.html");
	if (!dojo.config["useXDomain"] || dojo.config["allowXdRichTextSave"]) {
		if (dojo._postLoad) {
			(function () {
				var savetextarea = dojo.doc.createElement("textarea");
				savetextarea.id = dijit._scopeName + "._editor.RichText.value";
				dojo.style(savetextarea, {display:"none", position:"absolute", top:"-100px", height:"3px", width:"3px"});
				dojo.body().appendChild(savetextarea);
			})();
		} else {
			try {
				dojo.doc.write("<textarea id=\"" + dijit._scopeName + "._editor.RichText.value\" " + "style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
			}
			catch (e) {
			}
		}
	}
	dojo.declare("dijit._editor.RichText", [dijit._Widget, dijit._CssStateMixin], {constructor:function (params) {
		this.contentPreFilters = [];
		this.contentPostFilters = [];
		this.contentDomPreFilters = [];
		this.contentDomPostFilters = [];
		this.editingAreaStyleSheets = [];
		this.events = [].concat(this.events);
		this._keyHandlers = {};
		if (params && dojo.isString(params.value)) {
			this.value = params.value;
		}
		this.onLoadDeferred = new dojo.Deferred();
	}, baseClass:"dijitEditor", inheritWidth:false, focusOnLoad:false, name:"", styleSheets:"", height:"300px", minHeight:"1em", isClosed:true, isLoaded:false, _SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@", _NAME_CONTENT_SEP:"@@**%%:%%**@@", onLoadDeferred:null, isTabIndent:false, disableSpellCheck:false, postCreate:function () {
		if ("textarea" == this.domNode.tagName.toLowerCase()) {
			console.warn("RichText should not be used with the TEXTAREA tag.  See dijit._editor.RichText docs.");
		}
		this.contentPreFilters = [dojo.hitch(this, "_preFixUrlAttributes")].concat(this.contentPreFilters);
		if (dojo.isMoz) {
			this.contentPreFilters = [this._normalizeFontStyle].concat(this.contentPreFilters);
			this.contentPostFilters = [this._removeMozBogus].concat(this.contentPostFilters);
		}
		if (dojo.isWebKit) {
			this.contentPreFilters = [this._removeWebkitBogus].concat(this.contentPreFilters);
			this.contentPostFilters = [this._removeWebkitBogus].concat(this.contentPostFilters);
		}
		if (dojo.isIE) {
			this.contentPostFilters = [this._normalizeFontStyle].concat(this.contentPostFilters);
		}
		this.inherited(arguments);
		dojo.publish(dijit._scopeName + "._editor.RichText::init", [this]);
		this.open();
		this.setupDefaultShortcuts();
	}, setupDefaultShortcuts:function () {
		var exec = dojo.hitch(this, function (cmd, arg) {
			return function () {
				return !this.execCommand(cmd, arg);
			};
		});
		var ctrlKeyHandlers = {b:exec("bold"), i:exec("italic"), u:exec("underline"), a:exec("selectall"), s:function () {
			this.save(true);
		}, m:function () {
			this.isTabIndent = !this.isTabIndent;
		}, "1":exec("formatblock", "h1"), "2":exec("formatblock", "h2"), "3":exec("formatblock", "h3"), "4":exec("formatblock", "h4"), "\\":exec("insertunorderedlist")};
		if (!dojo.isIE) {
			ctrlKeyHandlers.Z = exec("redo");
		}
		for (var key in ctrlKeyHandlers) {
			this.addKeyHandler(key, true, false, ctrlKeyHandlers[key]);
		}
	}, events:["onKeyPress", "onKeyDown", "onKeyUp"], captureEvents:[], _editorCommandsLocalized:false, _localizeEditorCommands:function () {
		if (dijit._editor._editorCommandsLocalized) {
			this._local2NativeFormatNames = dijit._editor._local2NativeFormatNames;
			this._native2LocalFormatNames = dijit._editor._native2LocalFormatNames;
			return;
		}
		dijit._editor._editorCommandsLocalized = true;
		dijit._editor._local2NativeFormatNames = {};
		dijit._editor._native2LocalFormatNames = {};
		this._local2NativeFormatNames = dijit._editor._local2NativeFormatNames;
		this._native2LocalFormatNames = dijit._editor._native2LocalFormatNames;
		var formats = ["div", "p", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "ul", "address"];
		var localhtml = "", format, i = 0;
		while ((format = formats[i++])) {
			if (format.charAt(1) !== "l") {
				localhtml += "<" + format + "><span>content</span></" + format + "><br/>";
			} else {
				localhtml += "<" + format + "><li>content</li></" + format + "><br/>";
			}
		}
		var style = {position:"absolute", top:"0px", zIndex:10, opacity:0.01};
		var div = dojo.create("div", {style:style, innerHTML:localhtml});
		dojo.body().appendChild(div);
		var inject = dojo.hitch(this, function () {
			var node = div.firstChild;
			while (node) {
				try {
					dijit._editor.selection.selectElement(node.firstChild);
					var nativename = node.tagName.toLowerCase();
					this._local2NativeFormatNames[nativename] = document.queryCommandValue("formatblock");
					this._native2LocalFormatNames[this._local2NativeFormatNames[nativename]] = nativename;
					node = node.nextSibling.nextSibling;
				}
				catch (e) {
				}
			}
			div.parentNode.removeChild(div);
			div.innerHTML = "";
		});
		setTimeout(inject, 0);
	}, open:function (element) {
		if (!this.onLoadDeferred || this.onLoadDeferred.fired >= 0) {
			this.onLoadDeferred = new dojo.Deferred();
		}
		if (!this.isClosed) {
			this.close();
		}
		dojo.publish(dijit._scopeName + "._editor.RichText::open", [this]);
		if (arguments.length == 1 && element.nodeName) {
			this.domNode = element;
		}
		var dn = this.domNode;
		var html;
		if (dojo.isString(this.value)) {
			html = this.value;
			delete this.value;
			dn.innerHTML = "";
		} else {
			if (dn.nodeName && dn.nodeName.toLowerCase() == "textarea") {
				var ta = (this.textarea = dn);
				this.name = ta.name;
				html = ta.value;
				dn = this.domNode = dojo.doc.createElement("div");
				dn.setAttribute("widgetId", this.id);
				ta.removeAttribute("widgetId");
				dn.cssText = ta.cssText;
				dn.className += " " + ta.className;
				dojo.place(dn, ta, "before");
				var tmpFunc = dojo.hitch(this, function () {
					dojo.style(ta, {display:"block", position:"absolute", top:"-1000px"});
					if (dojo.isIE) {
						var s = ta.style;
						this.__overflow = s.overflow;
						s.overflow = "hidden";
					}
				});
				if (dojo.isIE) {
					setTimeout(tmpFunc, 10);
				} else {
					tmpFunc();
				}
				if (ta.form) {
					var resetValue = ta.value;
					this.reset = function () {
						var current = this.getValue();
						if (current != resetValue) {
							this.replaceValue(resetValue);
						}
					};
					dojo.connect(ta.form, "onsubmit", this, function () {
						dojo.attr(ta, "disabled", this.disabled);
						ta.value = this.getValue();
					});
				}
			} else {
				html = dijit._editor.getChildrenHtml(dn);
				dn.innerHTML = "";
			}
		}
		var content = dojo.contentBox(dn);
		this._oldHeight = content.h;
		this._oldWidth = content.w;
		this.value = html;
		if (dn.nodeName && dn.nodeName == "LI") {
			dn.innerHTML = " <br>";
		}
		this.header = dn.ownerDocument.createElement("div");
		dn.appendChild(this.header);
		this.editingArea = dn.ownerDocument.createElement("div");
		dn.appendChild(this.editingArea);
		this.footer = dn.ownerDocument.createElement("div");
		dn.appendChild(this.footer);
		if (!this.name) {
			this.name = this.id + "_AUTOGEN";
		}
		if (this.name !== "" && (!dojo.config["useXDomain"] || dojo.config["allowXdRichTextSave"])) {
			var saveTextarea = dojo.byId(dijit._scopeName + "._editor.RichText.value");
			if (saveTextarea && saveTextarea.value !== "") {
				var datas = saveTextarea.value.split(this._SEPARATOR), i = 0, dat;
				while ((dat = datas[i++])) {
					var data = dat.split(this._NAME_CONTENT_SEP);
					if (data[0] == this.name) {
						html = data[1];
						datas = datas.splice(i, 1);
						saveTextarea.value = datas.join(this._SEPARATOR);
						break;
					}
				}
			}
			if (!dijit._editor._globalSaveHandler) {
				dijit._editor._globalSaveHandler = {};
				dojo.addOnUnload(function () {
					var id;
					for (id in dijit._editor._globalSaveHandler) {
						var f = dijit._editor._globalSaveHandler[id];
						if (dojo.isFunction(f)) {
							f();
						}
					}
				});
			}
			dijit._editor._globalSaveHandler[this.id] = dojo.hitch(this, "_saveContent");
		}
		this.isClosed = false;
		var ifr = (this.editorObject = this.iframe = dojo.doc.createElement("iframe"));
		ifr.id = this.id + "_iframe";
		this._iframeSrc = this._getIframeDocTxt();
		ifr.style.border = "none";
		ifr.style.width = "100%";
		if (this._layoutMode) {
			ifr.style.height = "100%";
		} else {
			if (dojo.isIE >= 7) {
				if (this.height) {
					ifr.style.height = this.height;
				}
				if (this.minHeight) {
					ifr.style.minHeight = this.minHeight;
				}
			} else {
				ifr.style.height = this.height ? this.height : this.minHeight;
			}
		}
		ifr.frameBorder = 0;
		ifr._loadFunc = dojo.hitch(this, function (win) {
			this.window = win;
			this.document = this.window.document;
			if (dojo.isIE) {
				this._localizeEditorCommands();
			}
			this.onLoad(html);
		});
		var s = "javascript:parent." + dijit._scopeName + ".byId(\"" + this.id + "\")._iframeSrc";
		ifr.setAttribute("src", s);
		this.editingArea.appendChild(ifr);
		if (dojo.isSafari <= 4) {
			var src = ifr.getAttribute("src");
			if (!src || src.indexOf("javascript") == -1) {
				setTimeout(function () {
					ifr.setAttribute("src", s);
				}, 0);
			}
		}
		if (dn.nodeName == "LI") {
			dn.lastChild.style.marginTop = "-1.2em";
		}
		dojo.addClass(this.domNode, this.baseClass);
	}, _local2NativeFormatNames:{}, _native2LocalFormatNames:{}, _getIframeDocTxt:function () {
		var _cs = dojo.getComputedStyle(this.domNode);
		var html = "";
		var setBodyId = true;
		if (dojo.isIE || dojo.isWebKit || (!this.height && !dojo.isMoz)) {
			html = "<div id='dijitEditorBody'></div>";
			setBodyId = false;
		} else {
			if (dojo.isMoz) {
				this._cursorToStart = true;
				html = "&nbsp;";
			}
		}
		var font = [_cs.fontWeight, _cs.fontSize, _cs.fontFamily].join(" ");
		var lineHeight = _cs.lineHeight;
		if (lineHeight.indexOf("px") >= 0) {
			lineHeight = parseFloat(lineHeight) / parseFloat(_cs.fontSize);
		} else {
			if (lineHeight.indexOf("em") >= 0) {
				lineHeight = parseFloat(lineHeight);
			} else {
				lineHeight = "normal";
			}
		}
		var userStyle = "";
		var self = this;
		this.style.replace(/(^|;)\s*(line-|font-?)[^;]+/ig, function (match) {
			match = match.replace(/^;/ig, "") + ";";
			var s = match.split(":")[0];
			if (s) {
				s = dojo.trim(s);
				s = s.toLowerCase();
				var i;
				var sC = "";
				for (i = 0; i < s.length; i++) {
					var c = s.charAt(i);
					switch (c) {
					  case "-":
						i++;
						c = s.charAt(i).toUpperCase();
					  default:
						sC += c;
					}
				}
				dojo.style(self.domNode, sC, "");
			}
			userStyle += match + ";";
		});
		var label = dojo.query("label[for=\"" + this.id + "\"]");
		return [this.isLeftToRight() ? "<html>\n<head>\n" : "<html dir='rtl'>\n<head>\n", (dojo.isMoz && label.length ? "<title>" + label[0].innerHTML + "</title>\n" : ""), "<meta http-equiv='Content-Type' content='text/html'>\n", "<style>\n", "\tbody,html {\n", "\t\tbackground:transparent;\n", "\t\tpadding: 1px 0 0 0;\n", "\t\tmargin: -1px 0 0 0;\n", ((dojo.isWebKit) ? "\t\twidth: 100%;\n" : ""), ((dojo.isWebKit) ? "\t\theight: 100%;\n" : ""), "\t}\n", "\tbody{\n", "\t\ttop:0px;\n", "\t\tleft:0px;\n", "\t\tright:0px;\n", "\t\tfont:", font, ";\n", ((this.height || dojo.isOpera) ? "" : "\t\tposition: fixed;\n"), "\t\tmin-height:", this.minHeight, ";\n", "\t\tline-height:", lineHeight, ";\n", "\t}\n", "\tp{ margin: 1em 0; }\n", (!setBodyId && !this.height ? "\tbody,html {overflow-y: hidden;}\n" : ""), "\t#dijitEditorBody{overflow-x: auto; overflow-y:" + (this.height ? "auto;" : "hidden;") + " outline: 0px;}\n", "\tli > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; }\n", (!dojo.isIE ? "\tli{ min-height:1.2em; }\n" : ""), "</style>\n", this._applyEditingAreaStyleSheets(), "\n", "</head>\n<body ", (setBodyId ? "id='dijitEditorBody' " : ""), "onload='frameElement._loadFunc(window,document)' style='" + userStyle + "'>", html, "</body>\n</html>"].join("");
	}, _applyEditingAreaStyleSheets:function () {
		var files = [];
		if (this.styleSheets) {
			files = this.styleSheets.split(";");
			this.styleSheets = "";
		}
		files = files.concat(this.editingAreaStyleSheets);
		this.editingAreaStyleSheets = [];
		var text = "", i = 0, url;
		while ((url = files[i++])) {
			var abstring = (new dojo._Url(dojo.global.location, url)).toString();
			this.editingAreaStyleSheets.push(abstring);
			text += "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + abstring + "\"/>";
		}
		return text;
	}, addStyleSheet:function (uri) {
		var url = uri.toString();
		if (url.charAt(0) == "." || (url.charAt(0) != "/" && !uri.host)) {
			url = (new dojo._Url(dojo.global.location, url)).toString();
		}
		if (dojo.indexOf(this.editingAreaStyleSheets, url) > -1) {
			return;
		}
		this.editingAreaStyleSheets.push(url);
		this.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			if (this.document.createStyleSheet) {
				this.document.createStyleSheet(url);
			} else {
				var head = this.document.getElementsByTagName("head")[0];
				var stylesheet = this.document.createElement("link");
				stylesheet.rel = "stylesheet";
				stylesheet.type = "text/css";
				stylesheet.href = url;
				head.appendChild(stylesheet);
			}
		}));
	}, removeStyleSheet:function (uri) {
		var url = uri.toString();
		if (url.charAt(0) == "." || (url.charAt(0) != "/" && !uri.host)) {
			url = (new dojo._Url(dojo.global.location, url)).toString();
		}
		var index = dojo.indexOf(this.editingAreaStyleSheets, url);
		if (index == -1) {
			return;
		}
		delete this.editingAreaStyleSheets[index];
		dojo.withGlobal(this.window, "query", dojo, ["link:[href=\"" + url + "\"]"]).orphan();
	}, disabled:false, _mozSettingProps:{"styleWithCSS":false}, _setDisabledAttr:function (value) {
		value = !!value;
		this._set("disabled", value);
		if (!this.isLoaded) {
			return;
		}
		if (dojo.isIE || dojo.isWebKit || dojo.isOpera) {
			var preventIEfocus = dojo.isIE && (this.isLoaded || !this.focusOnLoad);
			if (preventIEfocus) {
				this.editNode.unselectable = "on";
			}
			this.editNode.contentEditable = !value;
			if (preventIEfocus) {
				var _this = this;
				setTimeout(function () {
					_this.editNode.unselectable = "off";
				}, 0);
			}
		} else {
			try {
				this.document.designMode = (value ? "off" : "on");
			}
			catch (e) {
				return;
			}
			if (!value && this._mozSettingProps) {
				var ps = this._mozSettingProps;
				for (var n in ps) {
					if (ps.hasOwnProperty(n)) {
						try {
							this.document.execCommand(n, false, ps[n]);
						}
						catch (e2) {
						}
					}
				}
			}
		}
		this._disabledOK = true;
	}, onLoad:function (html) {
		if (!this.window.__registeredWindow) {
			this.window.__registeredWindow = true;
			this._iframeRegHandle = dijit.registerIframe(this.iframe);
		}
		if (!dojo.isIE && !dojo.isWebKit && (this.height || dojo.isMoz)) {
			this.editNode = this.document.body;
		} else {
			this.editNode = this.document.body.firstChild;
			var _this = this;
			if (dojo.isIE) {
				this.tabStop = dojo.create("div", {tabIndex:-1}, this.editingArea);
				this.iframe.onfocus = function () {
					_this.editNode.setActive();
				};
			}
		}
		this.focusNode = this.editNode;
		var events = this.events.concat(this.captureEvents);
		var ap = this.iframe ? this.document : this.editNode;
		dojo.forEach(events, function (item) {
			this.connect(ap, item.toLowerCase(), item);
		}, this);
		this.connect(ap, "onmouseup", "onClick");
		if (dojo.isIE) {
			this.connect(this.document, "onmousedown", "_onIEMouseDown");
			this.editNode.style.zoom = 1;
		} else {
			this.connect(this.document, "onmousedown", function () {
				delete this._cursorToStart;
			});
		}
		if (dojo.isWebKit) {
			this._webkitListener = this.connect(this.document, "onmouseup", "onDisplayChanged");
			this.connect(this.document, "onmousedown", function (e) {
				var t = e.target;
				if (t && (t === this.document.body || t === this.document)) {
					setTimeout(dojo.hitch(this, "placeCursorAtEnd"), 0);
				}
			});
		}
		if (dojo.isIE) {
			try {
				this.document.execCommand("RespectVisibilityInDesign", true, null);
			}
			catch (e) {
			}
		}
		this.isLoaded = true;
		this.set("disabled", this.disabled);
		var setContent = dojo.hitch(this, function () {
			this.setValue(html);
			if (this.onLoadDeferred) {
				this.onLoadDeferred.callback(true);
			}
			this.onDisplayChanged();
			if (this.focusOnLoad) {
				dojo.addOnLoad(dojo.hitch(this, function () {
					setTimeout(dojo.hitch(this, "focus"), this.updateInterval);
				}));
			}
			this.value = this.getValue(true);
		});
		if (this.setValueDeferred) {
			this.setValueDeferred.addCallback(setContent);
		} else {
			setContent();
		}
	}, onKeyDown:function (e) {
		if (e.keyCode === dojo.keys.TAB && this.isTabIndent) {
			dojo.stopEvent(e);
			if (this.queryCommandEnabled((e.shiftKey ? "outdent" : "indent"))) {
				this.execCommand((e.shiftKey ? "outdent" : "indent"));
			}
		}
		if (dojo.isIE) {
			if (e.keyCode == dojo.keys.TAB && !this.isTabIndent) {
				if (e.shiftKey && !e.ctrlKey && !e.altKey) {
					this.iframe.focus();
				} else {
					if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
						this.tabStop.focus();
					}
				}
			} else {
				if (e.keyCode === dojo.keys.BACKSPACE && this.document.selection.type === "Control") {
					dojo.stopEvent(e);
					this.execCommand("delete");
				} else {
					if ((65 <= e.keyCode && e.keyCode <= 90) || (e.keyCode >= 37 && e.keyCode <= 40)) {
						e.charCode = e.keyCode;
						this.onKeyPress(e);
					}
				}
			}
		}
		return true;
	}, onKeyUp:function (e) {
		return;
	}, setDisabled:function (disabled) {
		dojo.deprecated("dijit.Editor::setDisabled is deprecated", "use dijit.Editor::attr(\"disabled\",boolean) instead", 2);
		this.set("disabled", disabled);
	}, _setValueAttr:function (value) {
		this.setValue(value);
	}, _setDisableSpellCheckAttr:function (disabled) {
		if (this.document) {
			dojo.attr(this.document.body, "spellcheck", !disabled);
		} else {
			this.onLoadDeferred.addCallback(dojo.hitch(this, function () {
				dojo.attr(this.document.body, "spellcheck", !disabled);
			}));
		}
		this._set("disableSpellCheck", disabled);
	}, onKeyPress:function (e) {
		var c = (e.keyChar && e.keyChar.toLowerCase()) || e.keyCode, handlers = this._keyHandlers[c], args = arguments;
		if (handlers && !e.altKey) {
			dojo.some(handlers, function (h) {
				if (!(h.shift ^ e.shiftKey) && !(h.ctrl ^ (e.ctrlKey || e.metaKey))) {
					if (!h.handler.apply(this, args)) {
						e.preventDefault();
					}
					return true;
				}
			}, this);
		}
		if (!this._onKeyHitch) {
			this._onKeyHitch = dojo.hitch(this, "onKeyPressed");
		}
		setTimeout(this._onKeyHitch, 1);
		return true;
	}, addKeyHandler:function (key, ctrl, shift, handler) {
		if (!dojo.isArray(this._keyHandlers[key])) {
			this._keyHandlers[key] = [];
		}
		this._keyHandlers[key].push({shift:shift || false, ctrl:ctrl || false, handler:handler});
	}, onKeyPressed:function () {
		this.onDisplayChanged();
	}, onClick:function (e) {
		this.onDisplayChanged(e);
	}, _onIEMouseDown:function (e) {
		if (!this._focused && !this.disabled) {
			this.focus();
		}
	}, _onBlur:function (e) {
		this.inherited(arguments);
		var newValue = this.getValue(true);
		if (newValue != this.value) {
			this.onChange(newValue);
		}
		this._set("value", newValue);
	}, _onFocus:function (e) {
		if (!this.disabled) {
			if (!this._disabledOK) {
				this.set("disabled", false);
			}
			this.inherited(arguments);
		}
	}, blur:function () {
		if (!dojo.isIE && this.window.document.documentElement && this.window.document.documentElement.focus) {
			this.window.document.documentElement.focus();
		} else {
			if (dojo.doc.body.focus) {
				dojo.doc.body.focus();
			}
		}
	}, focus:function () {
		if (!this.isLoaded) {
			this.focusOnLoad = true;
			return;
		}
		if (this._cursorToStart) {
			delete this._cursorToStart;
			if (this.editNode.childNodes) {
				this.placeCursorAtStart();
				return;
			}
		}
		if (!dojo.isIE) {
			dijit.focus(this.iframe);
		} else {
			if (this.editNode && this.editNode.focus) {
				this.iframe.fireEvent("onfocus", document.createEventObject());
			}
		}
	}, updateInterval:200, _updateTimer:null, onDisplayChanged:function (e) {
		if (this._updateTimer) {
			clearTimeout(this._updateTimer);
		}
		if (!this._updateHandler) {
			this._updateHandler = dojo.hitch(this, "onNormalizedDisplayChanged");
		}
		this._updateTimer = setTimeout(this._updateHandler, this.updateInterval);
	}, onNormalizedDisplayChanged:function () {
		delete this._updateTimer;
	}, onChange:function (newContent) {
	}, _normalizeCommand:function (cmd, argument) {
		var command = cmd.toLowerCase();
		if (command == "formatblock") {
			if (dojo.isSafari && argument === undefined) {
				command = "heading";
			}
		} else {
			if (command == "hilitecolor" && !dojo.isMoz) {
				command = "backcolor";
			}
		}
		return command;
	}, _qcaCache:{}, queryCommandAvailable:function (command) {
		var ca = this._qcaCache[command];
		if (ca !== undefined) {
			return ca;
		}
		return (this._qcaCache[command] = this._queryCommandAvailable(command));
	}, _queryCommandAvailable:function (command) {
		var ie = 1;
		var mozilla = 1 << 1;
		var webkit = 1 << 2;
		var opera = 1 << 3;
		function isSupportedBy(browsers) {
			return {ie:Boolean(browsers & ie), mozilla:Boolean(browsers & mozilla), webkit:Boolean(browsers & webkit), opera:Boolean(browsers & opera)};
		}
		var supportedBy = null;
		switch (command.toLowerCase()) {
		  case "bold":
		  case "italic":
		  case "underline":
		  case "subscript":
		  case "superscript":
		  case "fontname":
		  case "fontsize":
		  case "forecolor":
		  case "hilitecolor":
		  case "justifycenter":
		  case "justifyfull":
		  case "justifyleft":
		  case "justifyright":
		  case "delete":
		  case "selectall":
		  case "toggledir":
			supportedBy = isSupportedBy(mozilla | ie | webkit | opera);
			break;
		  case "createlink":
		  case "unlink":
		  case "removeformat":
		  case "inserthorizontalrule":
		  case "insertimage":
		  case "insertorderedlist":
		  case "insertunorderedlist":
		  case "indent":
		  case "outdent":
		  case "formatblock":
		  case "inserthtml":
		  case "undo":
		  case "redo":
		  case "strikethrough":
		  case "tabindent":
			supportedBy = isSupportedBy(mozilla | ie | opera | webkit);
			break;
		  case "blockdirltr":
		  case "blockdirrtl":
		  case "dirltr":
		  case "dirrtl":
		  case "inlinedirltr":
		  case "inlinedirrtl":
			supportedBy = isSupportedBy(ie);
			break;
		  case "cut":
		  case "copy":
		  case "paste":
			supportedBy = isSupportedBy(ie | mozilla | webkit);
			break;
		  case "inserttable":
			supportedBy = isSupportedBy(mozilla | ie);
			break;
		  case "insertcell":
		  case "insertcol":
		  case "insertrow":
		  case "deletecells":
		  case "deletecols":
		  case "deleterows":
		  case "mergecells":
		  case "splitcell":
			supportedBy = isSupportedBy(ie | mozilla);
			break;
		  default:
			return false;
		}
		return (dojo.isIE && supportedBy.ie) || (dojo.isMoz && supportedBy.mozilla) || (dojo.isWebKit && supportedBy.webkit) || (dojo.isOpera && supportedBy.opera);
	}, execCommand:function (command, argument) {
		var returnValue;
		this.focus();
		command = this._normalizeCommand(command, argument);
		if (argument !== undefined) {
			if (command == "heading") {
				throw new Error("unimplemented");
			} else {
				if ((command == "formatblock") && dojo.isIE) {
					argument = "<" + argument + ">";
				}
			}
		}
		var implFunc = "_" + command + "Impl";
		if (this[implFunc]) {
			returnValue = this[implFunc](argument);
		} else {
			argument = arguments.length > 1 ? argument : null;
			if (argument || command != "createlink") {
				returnValue = this.document.execCommand(command, false, argument);
			}
		}
		this.onDisplayChanged();
		return returnValue;
	}, queryCommandEnabled:function (command) {
		if (this.disabled || !this._disabledOK) {
			return false;
		}
		command = this._normalizeCommand(command);
		if (dojo.isMoz || dojo.isWebKit) {
			if (command == "unlink") {
				return this._sCall("hasAncestorElement", ["a"]);
			} else {
				if (command == "inserttable") {
					return true;
				}
			}
		}
		if (dojo.isWebKit) {
			if (command == "cut" || command == "copy") {
				var sel = this.window.getSelection();
				if (sel) {
					sel = sel.toString();
				}
				return !!sel;
			} else {
				if (command == "paste") {
					return true;
				}
			}
		}
		var elem = dojo.isIE ? this.document.selection.createRange() : this.document;
		try {
			return elem.queryCommandEnabled(command);
		}
		catch (e) {
			return false;
		}
	}, queryCommandState:function (command) {
		if (this.disabled || !this._disabledOK) {
			return false;
		}
		command = this._normalizeCommand(command);
		try {
			return this.document.queryCommandState(command);
		}
		catch (e) {
			return false;
		}
	}, queryCommandValue:function (command) {
		if (this.disabled || !this._disabledOK) {
			return false;
		}
		var r;
		command = this._normalizeCommand(command);
		if (dojo.isIE && command == "formatblock") {
			r = this._native2LocalFormatNames[this.document.queryCommandValue(command)];
		} else {
			if (dojo.isMoz && command === "hilitecolor") {
				var oldValue;
				try {
					oldValue = this.document.queryCommandValue("styleWithCSS");
				}
				catch (e) {
					oldValue = false;
				}
				this.document.execCommand("styleWithCSS", false, true);
				r = this.document.queryCommandValue(command);
				this.document.execCommand("styleWithCSS", false, oldValue);
			} else {
				r = this.document.queryCommandValue(command);
			}
		}
		return r;
	}, _sCall:function (name, args) {
		return dojo.withGlobal(this.window, name, dijit._editor.selection, args);
	}, placeCursorAtStart:function () {
		this.focus();
		var isvalid = false;
		if (dojo.isMoz) {
			var first = this.editNode.firstChild;
			while (first) {
				if (first.nodeType == 3) {
					if (first.nodeValue.replace(/^\s+|\s+$/g, "").length > 0) {
						isvalid = true;
						this._sCall("selectElement", [first]);
						break;
					}
				} else {
					if (first.nodeType == 1) {
						isvalid = true;
						var tg = first.tagName ? first.tagName.toLowerCase() : "";
						if (/br|input|img|base|meta|area|basefont|hr|link/.test(tg)) {
							this._sCall("selectElement", [first]);
						} else {
							this._sCall("selectElementChildren", [first]);
						}
						break;
					}
				}
				first = first.nextSibling;
			}
		} else {
			isvalid = true;
			this._sCall("selectElementChildren", [this.editNode]);
		}
		if (isvalid) {
			this._sCall("collapse", [true]);
		}
	}, placeCursorAtEnd:function () {
		this.focus();
		var isvalid = false;
		if (dojo.isMoz) {
			var last = this.editNode.lastChild;
			while (last) {
				if (last.nodeType == 3) {
					if (last.nodeValue.replace(/^\s+|\s+$/g, "").length > 0) {
						isvalid = true;
						this._sCall("selectElement", [last]);
						break;
					}
				} else {
					if (last.nodeType == 1) {
						isvalid = true;
						if (last.lastChild) {
							this._sCall("selectElement", [last.lastChild]);
						} else {
							this._sCall("selectElement", [last]);
						}
						break;
					}
				}
				last = last.previousSibling;
			}
		} else {
			isvalid = true;
			this._sCall("selectElementChildren", [this.editNode]);
		}
		if (isvalid) {
			this._sCall("collapse", [false]);
		}
	}, getValue:function (nonDestructive) {
		if (this.textarea) {
			if (this.isClosed || !this.isLoaded) {
				return this.textarea.value;
			}
		}
		return this._postFilterContent(null, nonDestructive);
	}, _getValueAttr:function () {
		return this.getValue(true);
	}, setValue:function (html) {
		if (!this.isLoaded) {
			this.onLoadDeferred.addCallback(dojo.hitch(this, function () {
				this.setValue(html);
			}));
			return;
		}
		this._cursorToStart = true;
		if (this.textarea && (this.isClosed || !this.isLoaded)) {
			this.textarea.value = html;
		} else {
			html = this._preFilterContent(html);
			var node = this.isClosed ? this.domNode : this.editNode;
			if (html && dojo.isMoz && html.toLowerCase() == "<p></p>") {
				html = "<p>&nbsp;</p>";
			}
			if (!html && dojo.isWebKit) {
				html = "&nbsp;";
			}
			node.innerHTML = html;
			this._preDomFilterContent(node);
		}
		this.onDisplayChanged();
		this._set("value", this.getValue(true));
	}, replaceValue:function (html) {
		if (this.isClosed) {
			this.setValue(html);
		} else {
			if (this.window && this.window.getSelection && !dojo.isMoz) {
				this.setValue(html);
			} else {
				if (this.window && this.window.getSelection) {
					html = this._preFilterContent(html);
					this.execCommand("selectall");
					if (!html) {
						this._cursorToStart = true;
						html = "&nbsp;";
					}
					this.execCommand("inserthtml", html);
					this._preDomFilterContent(this.editNode);
				} else {
					if (this.document && this.document.selection) {
						this.setValue(html);
					}
				}
			}
		}
		this._set("value", this.getValue(true));
	}, _preFilterContent:function (html) {
		var ec = html;
		dojo.forEach(this.contentPreFilters, function (ef) {
			if (ef) {
				ec = ef(ec);
			}
		});
		return ec;
	}, _preDomFilterContent:function (dom) {
		dom = dom || this.editNode;
		dojo.forEach(this.contentDomPreFilters, function (ef) {
			if (ef && dojo.isFunction(ef)) {
				ef(dom);
			}
		}, this);
	}, _postFilterContent:function (dom, nonDestructive) {
		var ec;
		if (!dojo.isString(dom)) {
			dom = dom || this.editNode;
			if (this.contentDomPostFilters.length) {
				if (nonDestructive) {
					dom = dojo.clone(dom);
				}
				dojo.forEach(this.contentDomPostFilters, function (ef) {
					dom = ef(dom);
				});
			}
			ec = dijit._editor.getChildrenHtml(dom);
		} else {
			ec = dom;
		}
		if (!dojo.trim(ec.replace(/^\xA0\xA0*/, "").replace(/\xA0\xA0*$/, "")).length) {
			ec = "";
		}
		dojo.forEach(this.contentPostFilters, function (ef) {
			ec = ef(ec);
		});
		return ec;
	}, _saveContent:function (e) {
		var saveTextarea = dojo.byId(dijit._scopeName + "._editor.RichText.value");
		if (saveTextarea.value) {
			saveTextarea.value += this._SEPARATOR;
		}
		saveTextarea.value += this.name + this._NAME_CONTENT_SEP + this.getValue(true);
	}, escapeXml:function (str, noSingleQuotes) {
		str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
		if (!noSingleQuotes) {
			str = str.replace(/'/gm, "&#39;");
		}
		return str;
	}, getNodeHtml:function (node) {
		dojo.deprecated("dijit.Editor::getNodeHtml is deprecated", "use dijit._editor.getNodeHtml instead", 2);
		return dijit._editor.getNodeHtml(node);
	}, getNodeChildrenHtml:function (dom) {
		dojo.deprecated("dijit.Editor::getNodeChildrenHtml is deprecated", "use dijit._editor.getChildrenHtml instead", 2);
		return dijit._editor.getChildrenHtml(dom);
	}, close:function (save) {
		if (this.isClosed) {
			return;
		}
		if (!arguments.length) {
			save = true;
		}
		if (save) {
			this._set("value", this.getValue(true));
		}
		if (this.interval) {
			clearInterval(this.interval);
		}
		if (this._webkitListener) {
			this.disconnect(this._webkitListener);
			delete this._webkitListener;
		}
		if (dojo.isIE) {
			this.iframe.onfocus = null;
		}
		this.iframe._loadFunc = null;
		if (this._iframeRegHandle) {
			dijit.unregisterIframe(this._iframeRegHandle);
			delete this._iframeRegHandle;
		}
		if (this.textarea) {
			var s = this.textarea.style;
			s.position = "";
			s.left = s.top = "";
			if (dojo.isIE) {
				s.overflow = this.__overflow;
				this.__overflow = null;
			}
			this.textarea.value = this.value;
			dojo.destroy(this.domNode);
			this.domNode = this.textarea;
		} else {
			this.domNode.innerHTML = this.value;
		}
		delete this.iframe;
		dojo.removeClass(this.domNode, this.baseClass);
		this.isClosed = true;
		this.isLoaded = false;
		delete this.editNode;
		delete this.focusNode;
		if (this.window && this.window._frameElement) {
			this.window._frameElement = null;
		}
		this.window = null;
		this.document = null;
		this.editingArea = null;
		this.editorObject = null;
	}, destroy:function () {
		if (!this.isClosed) {
			this.close(false);
		}
		this.inherited(arguments);
		if (dijit._editor._globalSaveHandler) {
			delete dijit._editor._globalSaveHandler[this.id];
		}
	}, _removeMozBogus:function (html) {
		return html.replace(/\stype="_moz"/gi, "").replace(/\s_moz_dirty=""/gi, "").replace(/_moz_resizing="(true|false)"/gi, "");
	}, _removeWebkitBogus:function (html) {
		html = html.replace(/\sclass="webkit-block-placeholder"/gi, "");
		html = html.replace(/\sclass="apple-style-span"/gi, "");
		html = html.replace(/<meta charset=\"utf-8\" \/>/gi, "");
		return html;
	}, _normalizeFontStyle:function (html) {
		return html.replace(/<(\/)?strong([ \>])/gi, "<$1b$2").replace(/<(\/)?em([ \>])/gi, "<$1i$2");
	}, _preFixUrlAttributes:function (html) {
		return html.replace(/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi, "$1$4$2$3$5$2 _djrealurl=$2$3$5$2").replace(/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi, "$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
	}, _inserthorizontalruleImpl:function (argument) {
		if (dojo.isIE) {
			return this._inserthtmlImpl("<hr>");
		}
		return this.document.execCommand("inserthorizontalrule", false, argument);
	}, _unlinkImpl:function (argument) {
		if ((this.queryCommandEnabled("unlink")) && (dojo.isMoz || dojo.isWebKit)) {
			var a = this._sCall("getAncestorElement", ["a"]);
			this._sCall("selectElement", [a]);
			return this.document.execCommand("unlink", false, null);
		}
		return this.document.execCommand("unlink", false, argument);
	}, _hilitecolorImpl:function (argument) {
		var returnValue;
		if (dojo.isMoz) {
			this.document.execCommand("styleWithCSS", false, true);
			returnValue = this.document.execCommand("hilitecolor", false, argument);
			this.document.execCommand("styleWithCSS", false, false);
		} else {
			returnValue = this.document.execCommand("hilitecolor", false, argument);
		}
		return returnValue;
	}, _backcolorImpl:function (argument) {
		if (dojo.isIE) {
			argument = argument ? argument : null;
		}
		return this.document.execCommand("backcolor", false, argument);
	}, _forecolorImpl:function (argument) {
		if (dojo.isIE) {
			argument = argument ? argument : null;
		}
		return this.document.execCommand("forecolor", false, argument);
	}, _inserthtmlImpl:function (argument) {
		argument = this._preFilterContent(argument);
		var rv = true;
		if (dojo.isIE) {
			var insertRange = this.document.selection.createRange();
			if (this.document.selection.type.toUpperCase() == "CONTROL") {
				var n = insertRange.item(0);
				while (insertRange.length) {
					insertRange.remove(insertRange.item(0));
				}
				n.outerHTML = argument;
			} else {
				insertRange.pasteHTML(argument);
			}
			insertRange.select();
		} else {
			if (dojo.isMoz && !argument.length) {
				this._sCall("remove");
			} else {
				rv = this.document.execCommand("inserthtml", false, argument);
			}
		}
		return rv;
	}, _boldImpl:function (argument) {
		if (dojo.isIE) {
			this._adaptIESelection();
		}
		return this.document.execCommand("bold", false, argument);
	}, _italicImpl:function (argument) {
		if (dojo.isIE) {
			this._adaptIESelection();
		}
		return this.document.execCommand("italic", false, argument);
	}, _underlineImpl:function (argument) {
		if (dojo.isIE) {
			this._adaptIESelection();
		}
		return this.document.execCommand("underline", false, argument);
	}, _strikethroughImpl:function (argument) {
		if (dojo.isIE) {
			this._adaptIESelection();
		}
		return this.document.execCommand("strikethrough", false, argument);
	}, getHeaderHeight:function () {
		return this._getNodeChildrenHeight(this.header);
	}, getFooterHeight:function () {
		return this._getNodeChildrenHeight(this.footer);
	}, _getNodeChildrenHeight:function (node) {
		var h = 0;
		if (node && node.childNodes) {
			var i;
			for (i = 0; i < node.childNodes.length; i++) {
				var size = dojo.position(node.childNodes[i]);
				h += size.h;
			}
		}
		return h;
	}, _isNodeEmpty:function (node, startOffset) {
		if (node.nodeType == 1) {
			if (node.childNodes.length > 0) {
				return this._isNodeEmpty(node.childNodes[0], startOffset);
			}
			return true;
		} else {
			if (node.nodeType == 3) {
				return (node.nodeValue.substring(startOffset) == "");
			}
		}
		return false;
	}, _removeStartingRangeFromRange:function (node, range) {
		if (node.nextSibling) {
			range.setStart(node.nextSibling, 0);
		} else {
			var parent = node.parentNode;
			while (parent && parent.nextSibling == null) {
				parent = parent.parentNode;
			}
			if (parent) {
				range.setStart(parent.nextSibling, 0);
			}
		}
		return range;
	}, _adaptIESelection:function () {
		var selection = dijit.range.getSelection(this.window);
		if (selection && selection.rangeCount && !selection.isCollapsed) {
			var range = selection.getRangeAt(0);
			var firstNode = range.startContainer;
			var startOffset = range.startOffset;
			while (firstNode.nodeType == 3 && startOffset >= firstNode.length && firstNode.nextSibling) {
				startOffset = startOffset - firstNode.length;
				firstNode = firstNode.nextSibling;
			}
			var lastNode = null;
			while (this._isNodeEmpty(firstNode, startOffset) && firstNode != lastNode) {
				lastNode = firstNode;
				range = this._removeStartingRangeFromRange(firstNode, range);
				firstNode = range.startContainer;
				startOffset = 0;
			}
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}});
}

