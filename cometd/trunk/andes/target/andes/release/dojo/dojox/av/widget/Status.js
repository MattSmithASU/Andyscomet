/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.av.widget.Status"]) {
	dojo._hasResource["dojox.av.widget.Status"] = true;
	dojo.provide("dojox.av.widget.Status");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dojox.av.widget.Status", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dojox.av.widget", "resources/Status.html", "<table class=\"Status\">\n	<tr>\n		<td class=\"Time\"><span dojoAttachPoint=\"timeNode\">0.00</span></td>\n		<td class=\"Status\"><div dojoAttachPoint=\"titleNode\">Loading...</div></td>\n		<td class=\"Duration\"><span dojoAttachPoint=\"durNode\">0.00</span></td>\n	</tr>\n</table>\n"), setMedia:function (med) {
		this.media = med;
		dojo.connect(this.media, "onMetaData", this, function (data) {
			this.duration = data.duration;
			this.durNode.innerHTML = this.toSeconds(this.duration);
		});
		dojo.connect(this.media, "onPosition", this, function (time) {
			this.timeNode.innerHTML = this.toSeconds(time);
		});
		var cons = ["onMetaData", "onPosition", "onStart", "onBuffer", "onPlay", "onPaused", "onStop", "onEnd", "onError", "onLoad"];
		dojo.forEach(cons, function (c) {
			dojo.connect(this.media, c, this, c);
		}, this);
	}, onMetaData:function (data) {
		this.duration = data.duration;
		this.durNode.innerHTML = this.toSeconds(this.duration);
		if (this.media.title) {
			this.title = this.media.title;
		} else {
			var a = this.media.mediaUrl.split("/");
			var b = a[a.length - 1].split(".")[0];
			this.title = b;
		}
	}, onBuffer:function (isBuffering) {
		this.isBuffering = isBuffering;
		console.warn("status onBuffer", this.isBuffering);
		if (this.isBuffering) {
			this.setStatus("buffering...");
		} else {
			this.setStatus("Playing");
		}
	}, onPosition:function (time) {
	}, onStart:function () {
		this.setStatus("Starting");
	}, onPlay:function () {
		this.setStatus("Playing");
	}, onPaused:function () {
		this.setStatus("Paused");
	}, onStop:function () {
		this.setStatus("Stopped");
	}, onEnd:function () {
		this.setStatus("Stopped");
	}, onError:function (evt) {
		console.log("status error:", evt);
		var msg = evt.info.code;
		if (msg == "NetStream.Play.StreamNotFound") {
			msg = "Stream Not Found";
		}
		this.setStatus("ERROR: " + msg, true);
	}, onLoad:function () {
		this.setStatus("Loading...");
	}, setStatus:function (str, isError) {
		if (isError) {
			dojo.addClass(this.titleNode, "statusError");
		} else {
			dojo.removeClass(this.titleNode, "statusError");
			if (this.isBuffering) {
				str = "buffering...";
			}
		}
		this.titleNode.innerHTML = "<span class=\"statusTitle\">" + this.title + "</span> <span class=\"statusInfo\">" + str + "</span>";
	}, toSeconds:function (time) {
		var ts = time.toString();
		if (ts.indexOf(".") < 0) {
			ts += ".00";
		} else {
			if (ts.length - ts.indexOf(".") == 2) {
				ts += "0";
			} else {
				if (ts.length - ts.indexOf(".") > 2) {
					ts = ts.substring(0, ts.indexOf(".") + 3);
				}
			}
		}
		return ts;
	}});
}

