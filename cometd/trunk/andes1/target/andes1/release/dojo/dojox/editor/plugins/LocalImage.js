/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.LocalImage"]) {
	dojo._hasResource["dojox.editor.plugins.LocalImage"] = true;
	dojo.provide("dojox.editor.plugins.LocalImage");
	dojo.require("dijit._editor.plugins.LinkDialog");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.DropDownButton");
	dojo.require("dojox.form.FileUploader");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "LocalImage", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dojox.editor.plugins.LocalImage", dijit._editor.plugins.ImgLinkDialog, {uploadable:false, uploadUrl:"", baseImageUrl:"", fileMask:"*.jpg;*.jpeg;*.gif;*.png;*.bmp", urlRegExp:"", _fileUploader:null, htmlFieldName:"uploadedfile", _isLocalFile:false, _messages:"", _cssPrefix:"dijitEditorEilDialog", _closable:true, linkDialogTemplate:["<div style='border-bottom: 1px solid black; padding-bottom: 2pt; margin-bottom: 4pt;'></div>", "<div class='dijitEditorEilDialogDescription'>${prePopuTextUrl}${prePopuTextBrowse}</div>", "<table><tr><td colspan='2'>", "<label for='${id}_urlInput' title='${prePopuTextUrl}${prePopuTextBrowse}'>${url}</label>", "</td></tr><tr><td class='dijitEditorEilDialogField'>", "<input dojoType='dijit.form.ValidationTextBox' class='dijitEditorEilDialogField'" + "regExp='${urlRegExp}' title='${prePopuTextUrl}${prePopuTextBrowse}'  selectOnClick='true' required='true' " + "id='${id}_urlInput' name='urlInput' intermediateChanges='true' invalidMessage='${invalidMessage}' " + "prePopuText='&lt;${prePopuTextUrl}${prePopuTextBrowse}&gt'>", "</td><td>", "<div id='${id}_browse' style='display:${uploadable}'>${browse}</div>", "</td></tr><tr><td colspan='2'>", "<label for='${id}_textInput'>${text}</label>", "</td></tr><tr><td>", "<input dojoType='dijit.form.TextBox' required='false' id='${id}_textInput' " + "name='textInput' intermediateChanges='true' selectOnClick='true' class='dijitEditorEilDialogField'>", "</td><td></td></tr><tr><td>", "</td><td>", "</td></tr><tr><td colspan='2'>", "<button dojoType='dijit.form.Button' id='${id}_setButton'>${set}</button>", "</td></tr></table>"].join(""), _initButton:function () {
		var _this = this, messages = (this._messages = dojo.i18n.getLocalization("dojox.editor.plugins", "LocalImage"));
		this.tag = "img";
		var dropDown = (this.dropDown = new dijit.TooltipDialog({title:messages[this.command + "Title"], onOpen:function () {
			_this._initialFileUploader();
			_this._onOpenDialog();
			dijit.TooltipDialog.prototype.onOpen.apply(this, arguments);
			setTimeout(function () {
				dijit.selectInputText(_this._urlInput.textbox);
				_this._urlInput.isLoadComplete = true;
			}, 0);
		}, onClose:function () {
			dojo.disconnect(_this.blurHandler);
			_this.blurHandler = null;
			this.onHide();
		}, onCancel:function () {
			setTimeout(dojo.hitch(_this, "_onCloseDialog"), 0);
		}}));
		var label = this.getLabel(this.command), className = this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1), props = dojo.mixin({label:label, showLabel:false, iconClass:className, dropDown:this.dropDown, tabIndex:"-1"}, this.params || {});
		if (!dojo.isIE && (!dojo.isFF || dojo.isFF < 4)) {
			props.closeDropDown = function (focus) {
				if (_this._closable) {
					if (this._opened) {
						dijit.popup.close(this.dropDown);
						if (focus) {
							this.focus();
						}
						this._opened = false;
						this.state = "";
					}
				}
				setTimeout(function () {
					_this._closable = true;
				}, 10);
			};
		}
		this.button = new dijit.form.DropDownButton(props);
		var masks = this.fileMask.split(";"), temp = "";
		dojo.forEach(masks, function (m) {
			m = m.replace(/\./, "\\.").replace(/\*/g, ".*");
			temp += "|" + m + "|" + m.toUpperCase();
		});
		messages.urlRegExp = this.urlRegExp = temp.substring(1);
		if (!this.uploadable) {
			messages["prePopuTextBrowse"] = ".";
		}
		messages.id = dijit.getUniqueId(this.editor.id);
		messages.uploadable = this.uploadable ? "inline" : "none";
		this._uniqueId = messages.id;
		this._setContent("<div class='" + this._cssPrefix + "Title'>" + dropDown.title + "</div>" + dojo.string.substitute(this.linkDialogTemplate, messages));
		dropDown.startup();
		var urlInput = (this._urlInput = dijit.byId(this._uniqueId + "_urlInput"));
		this._textInput = dijit.byId(this._uniqueId + "_textInput");
		this._setButton = dijit.byId(this._uniqueId + "_setButton");
		if (urlInput) {
			var pt = dijit.form.ValidationTextBox.prototype;
			urlInput = dojo.mixin(urlInput, {isLoadComplete:false, isValid:function (isFocused) {
				if (this.isLoadComplete) {
					return pt.isValid.apply(this, arguments);
				} else {
					return this.get("value").length > 0;
				}
			}, reset:function () {
				this.isLoadComplete = false;
				pt.reset.apply(this, arguments);
			}});
			this.connect(urlInput, "onKeyDown", "_cancelFileUpload");
			this.connect(urlInput, "onChange", "_checkAndFixInput");
		}
		if (this._setButton) {
			this.connect(this._setButton, "onClick", "_checkAndSetValue");
		}
		this._connectTagEvents();
	}, _initialFileUploader:function () {
		var fup = null, _this = this, widgetId = _this._uniqueId, fUpId = widgetId + "_browse", urlInput = _this._urlInput;
		if (_this.uploadable && !_this._fileUploader) {
			fup = _this._fileUploader = new dojox.form.FileUploader({force:"html", uploadUrl:_this.uploadUrl, htmlFieldName:_this.htmlFieldName, uploadOnChange:false, selectMultipleFiles:false, showProgress:true}, fUpId);
			fup.reset = function () {
				_this._isLocalFile = false;
				fup._resetHTML();
			};
			_this.connect(fup, "onClick", function () {
				urlInput.validate(false);
				if (!dojo.isIE && (!dojo.isFF || dojo.isFF < 4)) {
					_this._closable = false;
				}
			});
			_this.connect(fup, "onChange", function (data) {
				_this._isLocalFile = true;
				urlInput.set("value", data[0].name);
				urlInput.focus();
			});
			_this.connect(fup, "onComplete", function (data) {
				var urlPrefix = _this.baseImageUrl;
				urlPrefix = urlPrefix && urlPrefix.charAt(urlPrefix.length - 1) == "/" ? urlPrefix : urlPrefix + "/";
				urlInput.set("value", urlPrefix + data[0].file);
				_this._isLocalFile = false;
				_this._setDialogStatus(true);
				_this.setValue(_this.dropDown.get("value"));
			});
			_this.connect(fup, "onError", function (evtObject) {
				console.log("Error occurred when uploading image file!");
				_this._setDialogStatus(true);
			});
		}
	}, _checkAndFixInput:function () {
		this._setButton.set("disabled", !this._isValid());
	}, _isValid:function () {
		return this._urlInput.isValid();
	}, _cancelFileUpload:function () {
		this._fileUploader.reset();
		this._isLocalFile = false;
	}, _checkAndSetValue:function () {
		if (this._fileUploader && this._isLocalFile) {
			this._setDialogStatus(false);
			this._fileUploader.upload();
		} else {
			this.setValue(this.dropDown.get("value"));
		}
	}, _setDialogStatus:function (value) {
		this._urlInput.set("disabled", !value);
		this._textInput.set("disabled", !value);
		this._setButton.set("disabled", !value);
	}, destroy:function () {
		this.inherited(arguments);
		if (this._fileUploader) {
			this._fileUploader.destroy();
			this._fileUploader = null;
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "localimage") {
			o.plugin = new dojox.editor.plugins.LocalImage({command:"insertImage", uploadable:("uploadable" in o.args) ? o.args.uploadable : false, uploadUrl:("uploadable" in o.args && "uploadUrl" in o.args) ? o.args.uploadUrl : "", htmlFieldName:("uploadable" in o.args && "htmlFieldName" in o.args) ? o.args.htmlFieldName : "uploadedfile", baseImageUrl:("uploadable" in o.args && "baseImageUrl" in o.args) ? o.args.baseImageUrl : "", fileMask:("fileMask" in o.args) ? o.args.fileMask : "*.jpg;*.jpeg;*.gif;*.png;*.bmp"});
		}
	});
}

