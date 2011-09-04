/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.LinkDialog"]) {
	dojo._hasResource["dijit._editor.plugins.LinkDialog"] = true;
	dojo.provide("dijit._editor.plugins.LinkDialog");
	dojo.require("dijit._Widget");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.TooltipDialog");
	dojo.require("dijit.form.DropDownButton");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dijit.form.Select");
	dojo.require("dijit._editor.range");
	dojo.require("dojo.i18n");
	dojo.require("dojo.string");
	dojo.requireLocalization("dijit", "common", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.requireLocalization("dijit._editor", "LinkDialog", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit._editor.plugins.LinkDialog", dijit._editor._Plugin, {buttonClass:dijit.form.DropDownButton, useDefaultCommand:false, urlRegExp:"((https?|ftps?|file)\\://|./|/|)(/[a-zA-Z]{1,1}:/|)(((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)*(?:[a-zA-Z](?:[-\\da-zA-Z]{0,80}[\\da-zA-Z])?)\\.?)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])))(\\:\\d+)?(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]{0,}(?:\\?[^?#\\s/]*)?(?:#.*)?)?)?", emailRegExp:"<?(mailto\\:)([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+" + "@" + "((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)+(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)\\.?)|localhost|^[^-][a-zA-Z0-9_-]*>?", htmlTemplate:"<a href=\"${urlInput}\" _djrealurl=\"${urlInput}\"" + " target=\"${targetSelect}\"" + ">${textInput}</a>", tag:"a", _hostRxp:new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$"), _userAtRxp:new RegExp("^([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+@", "i"), linkDialogTemplate:["<table><tr><td>", "<label for='${id}_urlInput'>${url}</label>", "</td><td>", "<input dojoType='dijit.form.ValidationTextBox' required='true' " + "id='${id}_urlInput' name='urlInput' intermediateChanges='true'/>", "</td></tr><tr><td>", "<label for='${id}_textInput'>${text}</label>", "</td><td>", "<input dojoType='dijit.form.ValidationTextBox' required='true' id='${id}_textInput' " + "name='textInput' intermediateChanges='true'/>", "</td></tr><tr><td>", "<label for='${id}_targetSelect'>${target}</label>", "</td><td>", "<select id='${id}_targetSelect' name='targetSelect' dojoType='dijit.form.Select'>", "<option selected='selected' value='_self'>${currentWindow}</option>", "<option value='_blank'>${newWindow}</option>", "<option value='_top'>${topWindow}</option>", "<option value='_parent'>${parentWindow}</option>", "</select>", "</td></tr><tr><td colspan='2'>", "<button dojoType='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>", "<button dojoType='dijit.form.Button' type='button' id='${id}_cancelButton'>${buttonCancel}</button>", "</td></tr></table>"].join(""), _initButton:function () {
		var _this = this;
		this.tag = this.command == "insertImage" ? "img" : "a";
		var messages = dojo.delegate(dojo.i18n.getLocalization("dijit", "common", this.lang), dojo.i18n.getLocalization("dijit._editor", "LinkDialog", this.lang));
		var dropDown = (this.dropDown = new dijit.TooltipDialog({title:messages[this.command + "Title"], execute:dojo.hitch(this, "setValue"), onOpen:function () {
			_this._onOpenDialog();
			dijit.TooltipDialog.prototype.onOpen.apply(this, arguments);
		}, onCancel:function () {
			setTimeout(dojo.hitch(_this, "_onCloseDialog"), 0);
		}}));
		messages.urlRegExp = this.urlRegExp;
		messages.id = dijit.getUniqueId(this.editor.id);
		this._uniqueId = messages.id;
		this._setContent(dropDown.title + "<div style='border-bottom: 1px black solid;padding-bottom:2pt;margin-bottom:4pt'></div>" + dojo.string.substitute(this.linkDialogTemplate, messages));
		dropDown.startup();
		this._urlInput = dijit.byId(this._uniqueId + "_urlInput");
		this._textInput = dijit.byId(this._uniqueId + "_textInput");
		this._setButton = dijit.byId(this._uniqueId + "_setButton");
		this.connect(dijit.byId(this._uniqueId + "_cancelButton"), "onClick", function () {
			this.dropDown.onCancel();
		});
		if (this._urlInput) {
			this.connect(this._urlInput, "onChange", "_checkAndFixInput");
		}
		if (this._textInput) {
			this.connect(this._textInput, "onChange", "_checkAndFixInput");
		}
		this._urlRegExp = new RegExp("^" + this.urlRegExp + "$", "i");
		this._emailRegExp = new RegExp("^" + this.emailRegExp + "$", "i");
		this._urlInput.isValid = dojo.hitch(this, function () {
			var value = this._urlInput.get("value");
			return this._urlRegExp.test(value) || this._emailRegExp.test(value);
		});
		this._connectTagEvents();
		this.inherited(arguments);
	}, _checkAndFixInput:function () {
		var self = this;
		var url = this._urlInput.get("value");
		var fixupUrl = function (url) {
			var appendHttp = false;
			var appendMailto = false;
			if (url && url.length > 1) {
				url = dojo.trim(url);
				if (url.indexOf("mailto:") !== 0) {
					if (url.indexOf("/") > 0) {
						if (url.indexOf("://") === -1) {
							if (url.charAt(0) !== "/" && url.indexOf("./") !== 0) {
								if (self._hostRxp.test(url)) {
									appendHttp = true;
								}
							}
						}
					} else {
						if (self._userAtRxp.test(url)) {
							appendMailto = true;
						}
					}
				}
			}
			if (appendHttp) {
				self._urlInput.set("value", "http://" + url);
			}
			if (appendMailto) {
				self._urlInput.set("value", "mailto:" + url);
			}
			self._setButton.set("disabled", !self._isValid());
		};
		if (this._delayedCheck) {
			clearTimeout(this._delayedCheck);
			this._delayedCheck = null;
		}
		this._delayedCheck = setTimeout(function () {
			fixupUrl(url);
		}, 250);
	}, _connectTagEvents:function () {
		this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			this.connect(this.editor.editNode, "ondblclick", this._onDblClick);
		}));
	}, _isValid:function () {
		return this._urlInput.isValid() && this._textInput.isValid();
	}, _setContent:function (staticPanel) {
		this.dropDown.set({parserScope:"dojo", content:staticPanel});
	}, _checkValues:function (args) {
		if (args && args.urlInput) {
			args.urlInput = args.urlInput.replace(/"/g, "&quot;");
		}
		return args;
	}, setValue:function (args) {
		this._onCloseDialog();
		if (dojo.isIE < 9) {
			var sel = dijit.range.getSelection(this.editor.window);
			var range = sel.getRangeAt(0);
			var a = range.endContainer;
			if (a.nodeType === 3) {
				a = a.parentNode;
			}
			if (a && (a.nodeName && a.nodeName.toLowerCase() !== this.tag)) {
				a = dojo.withGlobal(this.editor.window, "getSelectedElement", dijit._editor.selection, [this.tag]);
			}
			if (a && (a.nodeName && a.nodeName.toLowerCase() === this.tag)) {
				if (this.editor.queryCommandEnabled("unlink")) {
					dojo.withGlobal(this.editor.window, "selectElementChildren", dijit._editor.selection, [a]);
					this.editor.execCommand("unlink");
				}
			}
		}
		args = this._checkValues(args);
		this.editor.execCommand("inserthtml", dojo.string.substitute(this.htmlTemplate, args));
	}, _onCloseDialog:function () {
		this.editor.focus();
	}, _getCurrentValues:function (a) {
		var url, text, target;
		if (a && a.tagName.toLowerCase() === this.tag) {
			url = a.getAttribute("_djrealurl") || a.getAttribute("href");
			target = a.getAttribute("target") || "_self";
			text = a.textContent || a.innerText;
			dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [a, true]);
		} else {
			text = dojo.withGlobal(this.editor.window, dijit._editor.selection.getSelectedText);
		}
		return {urlInput:url || "", textInput:text || "", targetSelect:target || ""};
	}, _onOpenDialog:function () {
		var a;
		if (dojo.isIE < 9) {
			var sel = dijit.range.getSelection(this.editor.window);
			var range = sel.getRangeAt(0);
			a = range.endContainer;
			if (a.nodeType === 3) {
				a = a.parentNode;
			}
			if (a && (a.nodeName && a.nodeName.toLowerCase() !== this.tag)) {
				a = dojo.withGlobal(this.editor.window, "getSelectedElement", dijit._editor.selection, [this.tag]);
			}
		} else {
			a = dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, [this.tag]);
		}
		this.dropDown.reset();
		this._setButton.set("disabled", true);
		this.dropDown.set("value", this._getCurrentValues(a));
	}, _onDblClick:function (e) {
		if (e && e.target) {
			var t = e.target;
			var tg = t.tagName ? t.tagName.toLowerCase() : "";
			if (tg === this.tag && dojo.attr(t, "href")) {
				dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [t]);
				this.editor.onDisplayChanged();
				setTimeout(dojo.hitch(this, function () {
					this.button.set("disabled", false);
					this.button.openDropDown();
				}), 10);
			}
		}
	}});
	dojo.declare("dijit._editor.plugins.ImgLinkDialog", [dijit._editor.plugins.LinkDialog], {linkDialogTemplate:["<table><tr><td>", "<label for='${id}_urlInput'>${url}</label>", "</td><td>", "<input dojoType='dijit.form.ValidationTextBox' regExp='${urlRegExp}' " + "required='true' id='${id}_urlInput' name='urlInput' intermediateChanges='true'/>", "</td></tr><tr><td>", "<label for='${id}_textInput'>${text}</label>", "</td><td>", "<input dojoType='dijit.form.ValidationTextBox' required='false' id='${id}_textInput' " + "name='textInput' intermediateChanges='true'/>", "</td></tr><tr><td>", "</td><td>", "</td></tr><tr><td colspan='2'>", "<button dojoType='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>", "<button dojoType='dijit.form.Button' type='button' id='${id}_cancelButton'>${buttonCancel}</button>", "</td></tr></table>"].join(""), htmlTemplate:"<img src=\"${urlInput}\" _djrealurl=\"${urlInput}\" alt=\"${textInput}\" />", tag:"img", _getCurrentValues:function (img) {
		var url, text;
		if (img && img.tagName.toLowerCase() === this.tag) {
			url = img.getAttribute("_djrealurl") || img.getAttribute("src");
			text = img.getAttribute("alt");
			dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [img, true]);
		} else {
			text = dojo.withGlobal(this.editor.window, dijit._editor.selection.getSelectedText);
		}
		return {urlInput:url || "", textInput:text || ""};
	}, _isValid:function () {
		return this._urlInput.isValid();
	}, _connectTagEvents:function () {
		this.inherited(arguments);
		this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			this.connect(this.editor.editNode, "onmousedown", this._selectTag);
		}));
	}, _selectTag:function (e) {
		if (e && e.target) {
			var t = e.target;
			var tg = t.tagName ? t.tagName.toLowerCase() : "";
			if (tg === this.tag) {
				dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [t]);
			}
		}
	}, _checkValues:function (args) {
		if (args && args.urlInput) {
			args.urlInput = args.urlInput.replace(/"/g, "&quot;");
		}
		if (args && args.textInput) {
			args.textInput = args.textInput.replace(/"/g, "&quot;");
		}
		return args;
	}, _onDblClick:function (e) {
		if (e && e.target) {
			var t = e.target;
			var tg = t.tagName ? t.tagName.toLowerCase() : "";
			if (tg === this.tag && dojo.attr(t, "src")) {
				dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [t]);
				this.editor.onDisplayChanged();
				setTimeout(dojo.hitch(this, function () {
					this.button.set("disabled", false);
					this.button.openDropDown();
				}), 10);
			}
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		switch (o.args.name) {
		  case "createLink":
			o.plugin = new dijit._editor.plugins.LinkDialog({command:o.args.name});
			break;
		  case "insertImage":
			o.plugin = new dijit._editor.plugins.ImgLinkDialog({command:o.args.name});
			break;
		}
	});
}

