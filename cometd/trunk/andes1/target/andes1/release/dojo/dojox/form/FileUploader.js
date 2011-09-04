/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.FileUploader"]) {
	dojo._hasResource["dojox.form.FileUploader"] = true;
	dojo.provide("dojox.form.FileUploader");
	dojo.require("dojox.embed.Flash");
	dojo.require("dojo.io.iframe");
	dojo.require("dojox.html.styles");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dojox.embed.flashVars");
	dojo.require("dijit._Contained");
	dojo.deprecated("dojox.form.FileUploader", "Use dojox.form.Uploader", "2.0");
	dojo.declare("dojox.form.FileUploader", [dijit._Widget, dijit._Templated, dijit._Contained], {swfPath:dojo.config.uploaderPath || dojo.moduleUrl("dojox.form", "resources/fileuploader.swf"), templateString:"<div><div dojoAttachPoint=\"progNode\"><div dojoAttachPoint=\"progTextNode\"></div></div><div dojoAttachPoint=\"insideNode\" class=\"uploaderInsideNode\"></div></div>", uploadUrl:"", isDebug:false, devMode:false, baseClass:"dojoxUploaderNorm", hoverClass:"dojoxUploaderHover", activeClass:"dojoxUploaderActive", disabledClass:"dojoxUploaderDisabled", force:"", uploaderType:"", flashObject:null, flashMovie:null, insideNode:null, deferredUploading:1, fileListId:"", uploadOnChange:false, selectMultipleFiles:true, htmlFieldName:"uploadedfile", flashFieldName:"flashUploadFiles", fileMask:null, minFlashVersion:9, tabIndex:-1, showProgress:false, progressMessage:"Loading", progressBackgroundUrl:dojo.moduleUrl("dijit", "themes/tundra/images/buttonActive.png"), progressBackgroundColor:"#ededed", progressWidgetId:"", skipServerCheck:false, serverTimeout:5000, log:function () {
		if (this.isDebug) {
			console["log"](Array.prototype.slice.call(arguments).join(" "));
		}
	}, constructor:function () {
		this._subs = [];
	}, postMixInProperties:function () {
		this.fileList = [];
		this._cons = [];
		this.fileMask = this.fileMask || [];
		this.fileInputs = [];
		this.fileCount = 0;
		this.flashReady = false;
		this._disabled = false;
		this.force = this.force.toLowerCase();
		this.uploaderType = ((dojox.embed.Flash.available >= this.minFlashVersion || this.force == "flash") && this.force != "html") ? "flash" : "html";
		this.deferredUploading = this.deferredUploading === true ? 1 : this.deferredUploading;
		this._refNode = this.srcNodeRef;
		this.getButtonStyle();
	}, startup:function () {
	}, postCreate:function () {
		this.inherited(arguments);
		this.setButtonStyle();
		var createMethod;
		if (this.uploaderType == "flash") {
			createMethod = "createFlashUploader";
		} else {
			this.uploaderType = "html";
			createMethod = "createHtmlUploader";
		}
		this[createMethod]();
		if (this.fileListId) {
			this.connect(dojo.byId(this.fileListId), "click", function (evt) {
				var p = evt.target.parentNode.parentNode.parentNode;
				if (p.id && p.id.indexOf("file_") > -1) {
					this.removeFile(p.id.split("file_")[1]);
				}
			});
		}
		dojo.addOnUnload(this, this.destroy);
	}, getHiddenWidget:function () {
		var node = this.domNode.parentNode;
		while (node) {
			var id = node.getAttribute && node.getAttribute("widgetId");
			if (id && dijit.byId(id).onShow) {
				return dijit.byId(id);
			}
			node = node.parentNode;
		}
		return null;
	}, getHiddenNode:function (node) {
		if (!node) {
			return null;
		}
		var hidden = null;
		var p = node.parentNode;
		while (p && p.tagName.toLowerCase() != "body") {
			var d = dojo.style(p, "display");
			if (d == "none") {
				hidden = p;
				break;
			}
			p = p.parentNode;
		}
		return hidden;
	}, getButtonStyle:function () {
		var refNode = this.srcNodeRef;
		this._hiddenNode = this.getHiddenNode(refNode);
		if (this._hiddenNode) {
			dojo.style(this._hiddenNode, "display", "block");
		}
		if (!refNode && this.button && this.button.domNode) {
			var isDijitButton = true;
			var cls = this.button.domNode.className + " dijitButtonNode";
			var txt = this.getText(dojo.query(".dijitButtonText", this.button.domNode)[0]);
			var domTxt = "<button id=\"" + this.button.id + "\" class=\"" + cls + "\">" + txt + "</button>";
			refNode = dojo.place(domTxt, this.button.domNode, "after");
			this.srcNodeRef = refNode;
			this.button.destroy();
			this.baseClass = "dijitButton";
			this.hoverClass = "dijitButtonHover";
			this.pressClass = "dijitButtonActive";
			this.disabledClass = "dijitButtonDisabled";
		} else {
			if (!this.srcNodeRef && this.button) {
				refNode = this.button;
			}
		}
		if (dojo.attr(refNode, "class")) {
			this.baseClass += " " + dojo.attr(refNode, "class");
		}
		dojo.attr(refNode, "class", this.baseClass);
		this.norm = this.getStyle(refNode);
		this.width = this.norm.w;
		this.height = this.norm.h;
		if (this.uploaderType == "flash") {
			this.over = this.getTempNodeStyle(refNode, this.baseClass + " " + this.hoverClass, isDijitButton);
			this.down = this.getTempNodeStyle(refNode, this.baseClass + " " + this.activeClass, isDijitButton);
			this.dsbl = this.getTempNodeStyle(refNode, this.baseClass + " " + this.disabledClass, isDijitButton);
			this.fhtml = {cn:this.getText(refNode), nr:this.norm, ov:this.over, dn:this.down, ds:this.dsbl};
		} else {
			this.fhtml = {cn:this.getText(refNode), nr:this.norm};
			if (this.norm.va == "middle") {
				this.norm.lh = this.norm.h;
			}
		}
		if (this.devMode) {
			this.log("classes - base:", this.baseClass, " hover:", this.hoverClass, "active:", this.activeClass);
			this.log("fhtml:", this.fhtml);
			this.log("norm:", this.norm);
			this.log("over:", this.over);
			this.log("down:", this.down);
		}
	}, setButtonStyle:function () {
		dojo.style(this.domNode, {width:this.fhtml.nr.w + "px", height:(this.fhtml.nr.h) + "px", padding:"0px", lineHeight:"normal", position:"relative"});
		if (this.uploaderType == "html" && this.norm.va == "middle") {
			dojo.style(this.domNode, "lineHeight", this.norm.lh + "px");
		}
		if (this.showProgress) {
			this.progTextNode.innerHTML = this.progressMessage;
			dojo.style(this.progTextNode, {width:this.fhtml.nr.w + "px", height:(this.fhtml.nr.h + 0) + "px", padding:"0px", margin:"0px", left:"0px", lineHeight:(this.fhtml.nr.h + 0) + "px", position:"absolute"});
			dojo.style(this.progNode, {width:this.fhtml.nr.w + "px", height:(this.fhtml.nr.h + 0) + "px", padding:"0px", margin:"0px", left:"0px", position:"absolute", display:"none", backgroundImage:"url(" + this.progressBackgroundUrl + ")", backgroundPosition:"bottom", backgroundRepeat:"repeat-x", backgroundColor:this.progressBackgroundColor});
		} else {
			dojo.destroy(this.progNode);
		}
		dojo.style(this.insideNode, {position:"absolute", top:"0px", left:"0px", display:""});
		dojo.addClass(this.domNode, this.srcNodeRef.className);
		if (this.fhtml.nr.d.indexOf("inline") > -1) {
			dojo.addClass(this.domNode, "dijitInline");
		}
		try {
			this.insideNode.innerHTML = this.fhtml.cn;
		}
		catch (e) {
			if (this.uploaderType == "flash") {
				this.insideNode = this.insideNode.parentNode.removeChild(this.insideNode);
				dojo.body().appendChild(this.insideNode);
				this.insideNode.innerHTML = this.fhtml.cn;
				var c = dojo.connect(this, "onReady", this, function () {
					dojo.disconnect(c);
					this.insideNode = this.insideNode.parentNode.removeChild(this.insideNode);
					this.domNode.appendChild(this.insideNode);
				});
			} else {
				this.insideNode.appendChild(document.createTextNode(this.fhtml.cn));
			}
		}
		if (this._hiddenNode) {
			dojo.style(this._hiddenNode, "display", "none");
		}
	}, onChange:function (dataArray) {
	}, onProgress:function (dataArray) {
	}, onComplete:function (dataArray) {
	}, onCancel:function () {
	}, onError:function (evtObject) {
	}, onReady:function (uploader) {
	}, onLoad:function (uploader) {
	}, submit:function (form) {
		var data = form ? dojo.formToObject(form) : null;
		this.upload(data);
		return false;
	}, upload:function (data) {
		if (!this.fileList.length) {
			return false;
		}
		if (!this.uploadUrl) {
			console.warn("uploadUrl not provided. Aborting.");
			return false;
		}
		if (!this.showProgress) {
			this.set("disabled", true);
		}
		if (this.progressWidgetId) {
			var node = dijit.byId(this.progressWidgetId).domNode;
			if (dojo.style(node, "display") == "none") {
				this.restoreProgDisplay = "none";
				dojo.style(node, "display", "block");
			}
			if (dojo.style(node, "visibility") == "hidden") {
				this.restoreProgDisplay = "hidden";
				dojo.style(node, "visibility", "visible");
			}
		}
		if (data && !data.target) {
			this.postData = data;
		}
		this.log("upload type:", this.uploaderType, " - postData:", this.postData);
		for (var i = 0; i < this.fileList.length; i++) {
			var f = this.fileList[i];
			f.bytesLoaded = 0;
			f.bytesTotal = f.size || 100000;
			f.percent = 0;
		}
		if (this.uploaderType == "flash") {
			this.uploadFlash();
		} else {
			this.uploadHTML();
		}
		return false;
	}, removeFile:function (name, noListEdit) {
		var i;
		for (i = 0; i < this.fileList.length; i++) {
			if (this.fileList[i].name == name) {
				if (!noListEdit) {
					this.fileList.splice(i, 1);
				}
				break;
			}
		}
		if (this.uploaderType == "flash") {
			this.flashMovie.removeFile(name);
		} else {
			if (!noListEdit) {
				dojo.destroy(this.fileInputs[i]);
				this.fileInputs.splice(i, 1);
				this._renumberInputs();
			}
		}
		if (this.fileListId) {
			dojo.destroy("file_" + name);
		}
	}, destroy:function () {
		if (this.uploaderType == "flash" && !this.flashMovie) {
			this._cons.push(dojo.connect(this, "onLoad", this, "destroy"));
			return;
		}
		dojo.forEach(this._subs, dojo.unsubscribe, dojo);
		dojo.forEach(this._cons, dojo.disconnect, dojo);
		if (this.scrollConnect) {
			dojo.disconnect(this.scrollConnect);
		}
		if (this.uploaderType == "flash") {
			this.flashObject.destroy();
			delete this.flashObject;
		} else {
			dojo.destroy(this._fileInput);
			dojo.destroy(this._formNode);
		}
		this.inherited(arguments);
	}, _displayProgress:function (display) {
		if (display === true) {
			if (this.uploaderType == "flash") {
				dojo.style(this.insideNode, "top", "-2500px");
			} else {
				dojo.style(this.insideNode, "display", "none");
			}
			dojo.style(this.progNode, "display", "");
		} else {
			if (display === false) {
				dojo.style(this.insideNode, {display:"", left:"0px"});
				dojo.style(this.progNode, "display", "none");
			} else {
				var w = display * this.fhtml.nr.w;
				dojo.style(this.progNode, "width", w + "px");
			}
		}
	}, _animateProgress:function () {
		this._displayProgress(true);
		var _uploadDone = false;
		var c = dojo.connect(this, "_complete", function () {
			dojo.disconnect(c);
			_uploadDone = true;
		});
		var w = 0;
		var interval = setInterval(dojo.hitch(this, function () {
			w += 5;
			if (w > this.fhtml.nr.w) {
				w = 0;
				_uploadDone = true;
			}
			this._displayProgress(w / this.fhtml.nr.w);
			if (_uploadDone) {
				clearInterval(interval);
				setTimeout(dojo.hitch(this, function () {
					this._displayProgress(false);
				}), 500);
			}
		}), 50);
	}, _error:function (evt) {
		if (typeof (evt) == "string") {
			evt = new Error(evt);
		}
		this.onError(evt);
	}, _addToFileList:function () {
		if (this.fileListId) {
			var str = "";
			dojo.forEach(this.fileList, function (d) {
				str += "<table id=\"file_" + d.name + "\" class=\"fileToUpload\"><tr><td class=\"fileToUploadClose\"></td><td class=\"fileToUploadName\">" + d.name + "</td><td class=\"fileToUploadSize\">" + (d.size ? Math.ceil(d.size * 0.001) + "kb" : "") + "</td></tr></table>";
			}, this);
			dojo.byId(this.fileListId).innerHTML = str;
		}
	}, _change:function (dataArray) {
		if (dojo.isIE) {
			dojo.forEach(dataArray, function (f) {
				f.name = f.name.split("\\")[f.name.split("\\").length - 1];
			});
		}
		if (this.selectMultipleFiles) {
			this.fileList = this.fileList.concat(dataArray);
		} else {
			if (this.fileList[0]) {
				this.removeFile(this.fileList[0].name, true);
			}
			this.fileList = dataArray;
		}
		this._addToFileList();
		this.onChange(dataArray);
		if (this.uploadOnChange) {
			if (this.uploaderType == "html") {
				this._buildFileInput();
			}
			this.upload();
		} else {
			if (this.uploaderType == "html" && this.selectMultipleFiles) {
				this._buildFileInput();
				this._connectInput();
			}
		}
	}, _complete:function (dataArray) {
		dataArray = dojo.isArray(dataArray) ? dataArray : [dataArray];
		dojo.forEach(dataArray, function (f) {
			if (f.ERROR) {
				this._error(f.ERROR);
			}
		}, this);
		dojo.forEach(this.fileList, function (f) {
			f.bytesLoaded = 1;
			f.bytesTotal = 1;
			f.percent = 100;
			this._progress(f);
		}, this);
		dojo.forEach(this.fileList, function (f) {
			this.removeFile(f.name, true);
		}, this);
		this.onComplete(dataArray);
		this.fileList = [];
		this._resetHTML();
		this.set("disabled", false);
		if (this.restoreProgDisplay) {
			setTimeout(dojo.hitch(this, function () {
				dojo.style(dijit.byId(this.progressWidgetId).domNode, this.restoreProgDisplay == "none" ? "display" : "visibility", this.restoreProgDisplay);
			}), 500);
		}
	}, _progress:function (dataObject) {
		var total = 0;
		var loaded = 0;
		for (var i = 0; i < this.fileList.length; i++) {
			var f = this.fileList[i];
			if (f.name == dataObject.name) {
				f.bytesLoaded = dataObject.bytesLoaded;
				f.bytesTotal = dataObject.bytesTotal;
				f.percent = Math.ceil(f.bytesLoaded / f.bytesTotal * 100);
				this.log(f.name, "percent:", f.percent);
			}
			loaded += Math.ceil(0.001 * f.bytesLoaded);
			total += Math.ceil(0.001 * f.bytesTotal);
		}
		var percent = Math.ceil(loaded / total * 100);
		if (this.progressWidgetId) {
			dijit.byId(this.progressWidgetId).update({progress:percent + "%"});
		}
		if (this.showProgress) {
			this._displayProgress(percent * 0.01);
		}
		this.onProgress(this.fileList);
	}, _getDisabledAttr:function () {
		return this._disabled;
	}, _setDisabledAttr:function (disabled) {
		if (this._disabled == disabled) {
			return;
		}
		if (this.uploaderType == "flash") {
			if (!this.flashReady) {
				var _fc = dojo.connect(this, "onLoad", this, function () {
					dojo.disconnect(_fc);
					this._setDisabledAttr(disabled);
				});
				return;
			}
			this._disabled = disabled;
			this.flashMovie.doDisable(disabled);
		} else {
			this._disabled = disabled;
			dojo.style(this._fileInput, "display", this._disabled ? "none" : "");
		}
		dojo.toggleClass(this.domNode, this.disabledClass, disabled);
	}, _onFlashBlur:function () {
		this.flashMovie.blur();
		if (!this.nextFocusObject && this.tabIndex) {
			var nodes = dojo.query("[tabIndex]");
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].tabIndex >= Number(this.tabIndex) + 1) {
					this.nextFocusObject = nodes[i];
					break;
				}
			}
		}
		this.nextFocusObject.focus();
	}, _disconnect:function () {
		dojo.forEach(this._cons, dojo.disconnect, dojo);
	}, uploadHTML:function () {
		if (this.selectMultipleFiles) {
			dojo.destroy(this._fileInput);
		}
		this._setHtmlPostData();
		if (this.showProgress) {
			this._animateProgress();
		}
		var dfd = dojo.io.iframe.send({url:this.uploadUrl.toString(), form:this._formNode, handleAs:"json", error:dojo.hitch(this, function (err) {
			this._error("HTML Upload Error:" + err.message);
		}), load:dojo.hitch(this, function (data, ioArgs, widgetRef) {
			this._complete(data);
		})});
	}, createHtmlUploader:function () {
		this._buildForm();
		this._setFormStyle();
		this._buildFileInput();
		this._connectInput();
		this._styleContent();
		dojo.style(this.insideNode, "visibility", "visible");
		this.onReady();
	}, _connectInput:function () {
		this._disconnect();
		this._cons.push(dojo.connect(this._fileInput, "mouseover", this, function (evt) {
			dojo.addClass(this.domNode, this.hoverClass);
			this.onMouseOver(evt);
		}));
		this._cons.push(dojo.connect(this._fileInput, "mouseout", this, function (evt) {
			dojo.removeClass(this.domNode, this.activeClass);
			dojo.removeClass(this.domNode, this.hoverClass);
			this.onMouseOut(evt);
			this._checkHtmlCancel("off");
		}));
		this._cons.push(dojo.connect(this._fileInput, "mousedown", this, function (evt) {
			dojo.addClass(this.domNode, this.activeClass);
			dojo.removeClass(this.domNode, this.hoverClass);
			this.onMouseDown(evt);
		}));
		this._cons.push(dojo.connect(this._fileInput, "mouseup", this, function (evt) {
			dojo.removeClass(this.domNode, this.activeClass);
			this.onMouseUp(evt);
			this.onClick(evt);
			this._checkHtmlCancel("up");
		}));
		this._cons.push(dojo.connect(this._fileInput, "change", this, function () {
			this._checkHtmlCancel("change");
			this._change([{name:this._fileInput.value, type:"", size:0}]);
		}));
		if (this.tabIndex >= 0) {
			dojo.attr(this.domNode, "tabIndex", this.tabIndex);
		}
	}, _checkHtmlCancel:function (mouseType) {
		if (mouseType == "change") {
			this.dialogIsOpen = false;
		}
		if (mouseType == "up") {
			this.dialogIsOpen = true;
		}
		if (mouseType == "off") {
			if (this.dialogIsOpen) {
				this.onCancel();
			}
			this.dialogIsOpen = false;
		}
	}, _styleContent:function () {
		var o = this.fhtml.nr;
		dojo.style(this.insideNode, {width:o.w + "px", height:o.va == "middle" ? o.h + "px" : "auto", textAlign:o.ta, paddingTop:o.p[0] + "px", paddingRight:o.p[1] + "px", paddingBottom:o.p[2] + "px", paddingLeft:o.p[3] + "px"});
		try {
			dojo.style(this.insideNode, "lineHeight", "inherit");
		}
		catch (e) {
		}
	}, _resetHTML:function () {
		if (this.uploaderType == "html" && this._formNode) {
			this.fileInputs = [];
			dojo.query("*", this._formNode).forEach(function (n) {
				dojo.destroy(n);
			});
			this.fileCount = 0;
			this._buildFileInput();
			this._connectInput();
		}
	}, _buildForm:function () {
		if (this._formNode) {
			return;
		}
		if (dojo.isIE < 9 || (dojo.isIE && dojo.isQuirks)) {
			this._formNode = document.createElement("<form enctype=\"multipart/form-data\" method=\"post\">");
			this._formNode.encoding = "multipart/form-data";
			this._formNode.id = dijit.getUniqueId("FileUploaderForm");
			this.domNode.appendChild(this._formNode);
		} else {
			this._formNode = dojo.create("form", {enctype:"multipart/form-data", method:"post", id:dijit.getUniqueId("FileUploaderForm")}, this.domNode);
		}
	}, _buildFileInput:function () {
		if (this._fileInput) {
			this._disconnect();
			this._fileInput.id = this._fileInput.id + this.fileCount;
			dojo.style(this._fileInput, "display", "none");
		}
		this._fileInput = document.createElement("input");
		this.fileInputs.push(this._fileInput);
		var nm = this.htmlFieldName;
		var _id = this.id;
		if (this.selectMultipleFiles) {
			nm += this.fileCount;
			_id += this.fileCount;
			this.fileCount++;
		}
		dojo.attr(this._fileInput, {id:this.id, name:nm, type:"file"});
		dojo.addClass(this._fileInput, "dijitFileInputReal");
		this._formNode.appendChild(this._fileInput);
		var real = dojo.marginBox(this._fileInput);
		dojo.style(this._fileInput, {position:"relative", left:(this.fhtml.nr.w - real.w) + "px", opacity:0});
	}, _renumberInputs:function () {
		if (!this.selectMultipleFiles) {
			return;
		}
		var nm;
		this.fileCount = 0;
		dojo.forEach(this.fileInputs, function (inp) {
			nm = this.htmlFieldName + this.fileCount;
			this.fileCount++;
			dojo.attr(inp, "name", nm);
		}, this);
	}, _setFormStyle:function () {
		var size = Math.max(2, Math.max(Math.ceil(this.fhtml.nr.w / 60), Math.ceil(this.fhtml.nr.h / 15)));
		dojox.html.insertCssRule("#" + this._formNode.id + " input", "font-size:" + size + "em");
		dojo.style(this.domNode, {overflow:"hidden", position:"relative"});
		dojo.style(this.insideNode, "position", "absolute");
	}, _setHtmlPostData:function () {
		if (this.postData) {
			for (var nm in this.postData) {
				dojo.create("input", {type:"hidden", name:nm, value:this.postData[nm]}, this._formNode);
			}
		}
	}, uploadFlash:function () {
		try {
			if (this.showProgress) {
				this._displayProgress(true);
				var c = dojo.connect(this, "_complete", this, function () {
					dojo.disconnect(c);
					this._displayProgress(false);
				});
			}
			var o = {};
			for (var nm in this.postData) {
				o[nm] = this.postData[nm];
			}
			this.flashMovie.doUpload(o);
		}
		catch (err) {
			this._error("FileUploader - Sorry, the SWF failed to initialize." + err);
		}
	}, createFlashUploader:function () {
		this.uploadUrl = this.uploadUrl.toString();
		if (this.uploadUrl) {
			if (this.uploadUrl.toLowerCase().indexOf("http") < 0 && this.uploadUrl.indexOf("/") != 0) {
				var loc = window.location.href.split("/");
				loc.pop();
				loc = loc.join("/") + "/";
				this.uploadUrl = loc + this.uploadUrl;
				this.log("SWF Fixed - Relative loc:", loc, " abs loc:", this.uploadUrl);
			} else {
				this.log("SWF URL unmodified:", this.uploadUrl);
			}
		} else {
			console.warn("Warning: no uploadUrl provided.");
		}
		var w = this.fhtml.nr.w;
		var h = this.fhtml.nr.h;
		var args = {expressInstall:true, path:this.swfPath.uri || this.swfPath, width:w, height:h, allowScriptAccess:"always", allowNetworking:"all", vars:{uploadDataFieldName:this.flashFieldName, uploadUrl:this.uploadUrl, uploadOnSelect:this.uploadOnChange, deferredUploading:this.deferredUploading || 0, selectMultipleFiles:this.selectMultipleFiles, id:this.id, isDebug:this.isDebug, devMode:this.devMode, flashButton:dojox.embed.flashVars.serialize("fh", this.fhtml), fileMask:dojox.embed.flashVars.serialize("fm", this.fileMask), noReturnCheck:this.skipServerCheck, serverTimeout:this.serverTimeout}, params:{scale:"noscale", wmode:"opaque", allowScriptAccess:"always", allowNetworking:"all"}};
		this.flashObject = new dojox.embed.Flash(args, this.insideNode);
		this.flashObject.onError = dojo.hitch(function (msg) {
			this._error("Flash Error: " + msg);
		});
		this.flashObject.onReady = dojo.hitch(this, function () {
			dojo.style(this.insideNode, "visibility", "visible");
			this.log("FileUploader flash object ready");
			this.onReady(this);
		});
		this.flashObject.onLoad = dojo.hitch(this, function (mov) {
			this.flashMovie = mov;
			this.flashReady = true;
			this.onLoad(this);
		});
		this._connectFlash();
	}, _connectFlash:function () {
		this._doSub("/filesSelected", "_change");
		this._doSub("/filesUploaded", "_complete");
		this._doSub("/filesProgress", "_progress");
		this._doSub("/filesError", "_error");
		this._doSub("/filesCanceled", "onCancel");
		this._doSub("/stageBlur", "_onFlashBlur");
		this._doSub("/up", "onMouseUp");
		this._doSub("/down", "onMouseDown");
		this._doSub("/over", "onMouseOver");
		this._doSub("/out", "onMouseOut");
		this.connect(this.domNode, "focus", function () {
			this.flashMovie.focus();
			this.flashMovie.doFocus();
		});
		if (this.tabIndex >= 0) {
			dojo.attr(this.domNode, "tabIndex", this.tabIndex);
		}
	}, _doSub:function (subStr, funcStr) {
		this._subs.push(dojo.subscribe(this.id + subStr, this, funcStr));
	}, urlencode:function (url) {
		if (!url || url == "none") {
			return false;
		}
		return url.replace(/:/g, "||").replace(/\./g, "^^").replace("url(", "").replace(")", "").replace(/'/g, "").replace(/"/g, "");
	}, isButton:function (node) {
		var tn = node.tagName.toLowerCase();
		return tn == "button" || tn == "input";
	}, getTextStyle:function (node) {
		var o = {};
		o.ff = dojo.style(node, "fontFamily");
		if (o.ff) {
			o.ff = o.ff.replace(", ", ",");
			o.ff = o.ff.replace(/\"|\'/g, "");
			o.ff = o.ff == "sans-serif" ? "Arial" : o.ff;
			o.fw = dojo.style(node, "fontWeight");
			o.fi = dojo.style(node, "fontStyle");
			o.fs = parseInt(dojo.style(node, "fontSize"), 10);
			if (dojo.style(node, "fontSize").indexOf("%") > -1) {
				var n = node;
				while (n.tagName) {
					if (dojo.style(n, "fontSize").indexOf("%") == -1) {
						o.fs = parseInt(dojo.style(n, "fontSize"), 10);
						break;
					}
					if (n.tagName.toLowerCase() == "body") {
						o.fs = 16 * 0.01 * parseInt(dojo.style(n, "fontSize"), 10);
					}
					n = n.parentNode;
				}
			}
			o.fc = new dojo.Color(dojo.style(node, "color")).toHex();
			o.fc = parseInt(o.fc.substring(1, Infinity), 16);
		}
		o.lh = dojo.style(node, "lineHeight");
		o.ta = dojo.style(node, "textAlign");
		o.ta = o.ta == "start" || !o.ta ? "left" : o.ta;
		o.va = this.isButton(node) ? "middle" : o.lh == o.h ? "middle" : dojo.style(node, "verticalAlign");
		return o;
	}, getText:function (node) {
		var cn = dojo.trim(node.innerHTML);
		if (cn.indexOf("<") > -1) {
			cn = escape(cn);
		}
		return cn;
	}, getStyle:function (node) {
		var o = {};
		var dim = dojo.contentBox(node);
		var pad = dojo._getPadExtents(node);
		o.p = [pad.t, pad.w - pad.l, pad.h - pad.t, pad.l];
		o.w = dim.w + pad.w;
		o.h = dim.h + pad.h;
		o.d = dojo.style(node, "display");
		var clr = new dojo.Color(dojo.style(node, "backgroundColor"));
		o.bc = clr.a == 0 ? "#ffffff" : clr.toHex();
		o.bc = parseInt(o.bc.substring(1, Infinity), 16);
		var url = this.urlencode(dojo.style(node, "backgroundImage"));
		if (url) {
			o.bi = {url:url, rp:dojo.style(node, "backgroundRepeat"), pos:escape(dojo.style(node, "backgroundPosition"))};
			if (!o.bi.pos) {
				var rx = dojo.style(node, "backgroundPositionX");
				var ry = dojo.style(node, "backgroundPositionY");
				rx = (rx == "left") ? "0%" : (rx == "right") ? "100%" : rx;
				ry = (ry == "top") ? "0%" : (ry == "bottom") ? "100%" : ry;
				o.bi.pos = escape(rx + " " + ry);
			}
		}
		return dojo.mixin(o, this.getTextStyle(node));
	}, getTempNodeStyle:function (node, _class, isDijitButton) {
		var temp, style;
		if (isDijitButton) {
			temp = dojo.place("<" + node.tagName + "><span>" + node.innerHTML + "</span></" + node.tagName + ">", node.parentNode);
			var first = temp.firstChild;
			dojo.addClass(first, node.className);
			dojo.addClass(temp, _class);
			style = this.getStyle(first);
		} else {
			temp = dojo.place("<" + node.tagName + ">" + node.innerHTML + "</" + node.tagName + ">", node.parentNode);
			dojo.addClass(temp, node.className);
			dojo.addClass(temp, _class);
			temp.id = node.id;
			style = this.getStyle(temp);
		}
		dojo.destroy(temp);
		return style;
	}});
}

