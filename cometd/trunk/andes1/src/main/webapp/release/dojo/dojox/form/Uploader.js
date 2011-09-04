/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.Uploader"]) {
	dojo._hasResource["dojox.form.Uploader"] = true;
	dojo.provide("dojox.form.Uploader");
	dojo.require("dojox.form.uploader.Base");
	dojo.require("dijit.form.Button");
	dojo.experimental("dojox.form.Uploader");
	dojo.declare("dojox.form.Uploader", [dojox.form.uploader.Base], {uploadOnSelect:false, tabIndex:0, multiple:false, label:"Upload...", url:"", name:"uploadedfile", flashFieldName:"", uploadType:"form", _nameIndex:0, widgetsInTemplate:true, templateString:"<div class=\"dojoxFileInput\"><div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"button\">${label}</div></div>", postMixInProperties:function () {
		this._inputs = [];
		this._getButtonStyle(this.srcNodeRef);
		this.inherited(arguments);
	}, postCreate:function () {
		var restore = false;
		var parent = this.domNode.parentNode;
		var position = this._getNodePosition(this.domNode);
		if (!this.btnSize.w || !this.btnSize.h) {
			dojo.body().appendChild(this.domNode);
			this._getButtonStyle(this.domNode);
			restore = true;
		}
		this._setButtonStyle();
		if (restore) {
			dojo.place(this.domNode, position.node, position.pos);
		}
		this.inherited(arguments);
	}, onChange:function (fileArray) {
	}, onBegin:function (dataArray) {
	}, onProgress:function (customEvent) {
	}, onComplete:function (customEvent) {
		this.reset();
	}, onCancel:function () {
	}, onAbort:function () {
	}, onError:function (evtObject) {
	}, upload:function (formData) {
	}, submit:function (form) {
	}, reset:function () {
		this._disconnectButton();
		dojo.forEach(this._inputs, dojo.destroy, dojo);
		this._inputs = [];
		this._nameIndex = 0;
		this._createInput();
	}, getFileList:function () {
		var fileArray = [];
		if (this.supports("multiple")) {
			dojo.forEach(this.inputNode.files, function (f, i) {
				fileArray.push({index:i, name:f.name, size:f.size, type:f.type});
			}, this);
		} else {
			dojo.forEach(this._inputs, function (n, i) {
				fileArray.push({index:i, name:n.value.substring(n.value.lastIndexOf("\\") + 1), size:0, type:n.value.substring(n.value.lastIndexOf(".") + 1)});
			}, this);
		}
		return fileArray;
	}, _getValueAttr:function () {
		return this.getFileList();
	}, _setValueAttr:function (disabled) {
		console.error("Uploader value is read only");
	}, _getDisabledAttr:function () {
		return this._disabled;
	}, _setDisabledAttr:function (disabled) {
		if (this._disabled == disabled) {
			return;
		}
		this.button.set("disabled", disabled);
		dojo.style(this.inputNode, "display", disabled ? "none" : "block");
	}, _getNodePosition:function (node) {
		if (node.previousSibling) {
			return {node:node.previousSibling, pos:"after"};
		}
		return {node:node.nextSibling, pos:"before"};
	}, _getButtonStyle:function (node) {
		if (!node) {
			this.btnSize = {w:200, h:25};
		} else {
			this.btnSize = dojo.marginBox(node);
		}
	}, _setButtonStyle:function () {
		var hasParent = true;
		if (!this.domNode.parentNode || !this.domNode.parentNode.tagName) {
			document.body.appendChild(this.domNode);
			hasParent = false;
		}
		dojo.style(this.domNode, {width:this.btnSize.w + "px", height:(this.btnSize.h + 4) + "px", overflow:"hidden", position:"relative"});
		this.inputNodeFontSize = Math.max(2, Math.max(Math.ceil(this.btnSize.w / 60), Math.ceil(this.btnSize.h / 15)));
		this._createInput();
		dojo.style(this.button.domNode, {margin:"0px", display:"block", verticalAlign:"top"});
		dojo.style(this.button.domNode.firstChild, {margin:"0px", display:"block"});
		if (!hasParent) {
			document.body.removeChild(this.domNode);
		}
	}, _createInput:function () {
		if (this._inputs.length) {
			dojo.style(this.inputNode, {top:"500px"});
			this._disconnectButton();
			this._nameIndex++;
		}
		var name;
		if (this.supports("multiple")) {
			name = this.name + "s[]";
		} else {
			name = this.name + (this.multiple ? this._nameIndex : "");
		}
		this.inputNode = dojo.create("input", {type:"file", name:name, className:"dojoxInputNode"}, this.domNode, "first");
		if (this.supports("multiple") && this.multiple) {
			dojo.attr(this.inputNode, "multiple", true);
		}
		this._inputs.push(this.inputNode);
		dojo.style(this.inputNode, {fontSize:this.inputNodeFontSize + "em"});
		var size = dojo.marginBox(this.inputNode);
		dojo.style(this.inputNode, {position:"absolute", top:"-2px", left:"-" + (size.w - this.btnSize.w - 2) + "px", opacity:0});
		this._connectButton();
	}, _connectButton:function () {
		this._cons = [];
		var cs = dojo.hitch(this, function (nm) {
			this._cons.push(dojo.connect(this.inputNode, nm, this, function (evt) {
				this.button._cssMouseEvent({type:nm});
			}));
		});
		cs("mouseover");
		cs("mouseout");
		cs("mousedown");
		this._cons.push(dojo.connect(this.inputNode, "change", this, function (evt) {
			this.onChange(this.getFileList(evt));
			if (!this.supports("multiple") && this.multiple) {
				this._createInput();
			}
		}));
		this.button.set("tabIndex", -1);
		if (this.tabIndex > -1) {
			this.inputNode.tabIndex = this.tabIndex;
			var restoreBorderStyle = dojo.style(this.button.domNode.firstChild, "border");
			this._cons.push(dojo.connect(this.inputNode, "focus", this, function () {
				dojo.style(this.button.domNode.firstChild, "border", "1px dashed #ccc");
			}));
			this._cons.push(dojo.connect(this.inputNode, "blur", this, function () {
				dojo.style(this.button.domNode.firstChild, "border", restoreBorderStyle);
			}));
		}
	}, _disconnectButton:function () {
		dojo.forEach(this._cons, dojo.disconnect, dojo);
	}});
	(function () {
		dojox.form.UploaderOrg = dojox.form.Uploader;
		var extensions = [dojox.form.UploaderOrg];
		dojox.form.addUploaderPlugin = function (plug) {
			extensions.push(plug);
			dojo.declare("dojox.form.Uploader", extensions, {});
		};
	})();
}

