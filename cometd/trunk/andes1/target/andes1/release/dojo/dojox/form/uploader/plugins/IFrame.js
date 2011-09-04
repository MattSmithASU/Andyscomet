/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.uploader.plugins.IFrame"]) {
	dojo._hasResource["dojox.form.uploader.plugins.IFrame"] = true;
	dojo.provide("dojox.form.uploader.plugins.IFrame");
	dojo.require("dojox.form.uploader.plugins.HTML5");
	dojo.require("dojo.io.iframe");
	dojo.declare("dojox.form.uploader.plugins.IFrame", [], {force:"", postMixInProperties:function () {
		this.inherited(arguments);
		if (!this.supports("multiple")) {
			this.uploadType = "iframe";
		}
	}, upload:function (data) {
		if (!this.supports("multiple") || this.force == "iframe") {
			this.uploadIFrame(data);
			dojo.stopEvent(data);
			return;
		}
	}, uploadIFrame:function () {
		var url = this.getUrl();
		var dfd = dojo.io.iframe.send({url:this.getUrl(), form:this.form, handleAs:"json", error:dojo.hitch(this, function (err) {
			console.error("HTML Upload Error:" + err.message);
		}), load:dojo.hitch(this, function (data, ioArgs, widgetRef) {
			this.onComplete(data);
		})});
	}});
	dojox.form.addUploaderPlugin(dojox.form.uploader.plugins.IFrame);
}

