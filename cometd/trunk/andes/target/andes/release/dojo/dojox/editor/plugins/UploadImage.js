/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.UploadImage"]) {
	dojo._hasResource["dojox.editor.plugins.UploadImage"] = true;
	dojo.provide("dojox.editor.plugins.UploadImage");
	dojo.require("dojox.form.FileUploader");
	dojo.require("dijit._editor._Plugin");
	dojo.experimental("dojox.editor.plugins.UploadImage");
	dojo.declare("dojox.editor.plugins.UploadImage", dijit._editor._Plugin, {tempImageUrl:"", iconClassPrefix:"editorIcon", useDefaultCommand:false, uploadUrl:"", button:null, label:"Upload", setToolbar:function (toolbar) {
		this.button.destroy();
		this.createFileInput();
		toolbar.addChild(this.button);
	}, _initButton:function () {
		this.command = "uploadImage";
		this.editor.commands[this.command] = "Upload Image";
		this.inherited("_initButton", arguments);
		delete this.command;
	}, updateState:function () {
		this.button.set("disabled", this.get("disabled"));
	}, createFileInput:function () {
		var node = dojo.create("span", {innerHTML:"."}, document.body);
		dojo.style(node, {width:"40px", height:"20px", paddingLeft:"8px", paddingRight:"8px"});
		this.button = new dojox.form.FileUploader({isDebug:true, uploadUrl:this.uploadUrl, uploadOnChange:true, selectMultipleFiles:false, baseClass:"dojoxEditorUploadNorm", hoverClass:"dojoxEditorUploadHover", activeClass:"dojoxEditorUploadActive", disabledClass:"dojoxEditorUploadDisabled"}, node);
		this.connect(this.button, "onChange", "insertTempImage");
		this.connect(this.button, "onComplete", "onComplete");
	}, onComplete:function (data, ioArgs, widgetRef) {
		data = data[0];
		var tmpImgNode = dojo.withGlobal(this.editor.window, "byId", dojo, [this.currentImageId]);
		var file;
		if (this.downloadPath) {
			file = this.downloadPath + data.name;
		} else {
			file = data.file;
		}
		tmpImgNode.src = file;
		dojo.attr(tmpImgNode, "_djrealurl", file);
		if (data.width) {
			tmpImgNode.width = data.width;
			tmpImgNode.height = data.height;
		}
	}, insertTempImage:function () {
		this.currentImageId = "img_" + (new Date().getTime());
		var iTxt = "<img id=\"" + this.currentImageId + "\" src=\"" + this.tempImageUrl + "\" width=\"32\" height=\"32\"/>";
		this.editor.execCommand("inserthtml", iTxt);
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		switch (o.args.name) {
		  case "uploadImage":
			o.plugin = new dojox.editor.plugins.UploadImage({url:o.args.url});
		}
	});
}

