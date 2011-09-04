/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.av.widget.Player"]) {
	dojo._hasResource["dojox.av.widget.Player"] = true;
	dojo.provide("dojox.av.widget.Player");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dojox.av.widget.Player", [dijit._Widget, dijit._Templated], {playerWidth:"480px", widgetsInTemplate:true, templateString:dojo.cache("dojox.av.widget", "resources/Player.html", "<div class=\"playerContainer\">\n\t<div class=\"PlayerScreen\" dojoAttachPoint=\"playerScreen\"></div>\n\t<table class=\"Controls\">\n\t\t<tr>\n\t\t\t<td colspan=\"2\" dojoAttachPoint=\"progressContainer\"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class=\"PlayContainer\" dojoAttachPoint=\"playContainer\"></td>\n\t\t\t<td class=\"ControlsRight\">\n\t\t\t<table class=\"StatusContainer\">\n\t\t\t\t<tr dojoAttachPoint=\"statusContainer\">\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td colspan=\"3\" class=\"ControlsBottom\" dojoAttachPoint=\"controlsBottom\"></td>\n\t\t\t\t</tr>\n\t\t\t</table>\n\t\t</td>\n\t\t</tr>\n\t</table>\n</div>\n"), _fillContent:function () {
		if (!this.items && this.srcNodeRef) {
			this.items = [];
			var nodes = dojo.query("*", this.srcNodeRef);
			dojo.forEach(nodes, function (n) {
				this.items.push(n);
			}, this);
		}
	}, postCreate:function () {
		dojo.style(this.domNode, "width", this.playerWidth + (dojo.isString(this.playerWidth) ? "" : "px"));
		if (dojo.isString(this.playerWidth) && this.playerWidth.indexOf("%")) {
			dojo.connect(window, "resize", this, "onResize");
		}
		this.children = [];
		var domNode;
		dojo.forEach(this.items, function (n, i) {
			n.id = dijit.getUniqueId("player_control");
			switch (dojo.attr(n, "controlType")) {
			  case "play":
				this.playContainer.appendChild(n);
				break;
			  case "volume":
				this.controlsBottom.appendChild(n);
				break;
			  case "status":
				this.statusContainer.appendChild(n);
				break;
			  case "progress":
			  case "slider":
				this.progressContainer.appendChild(n);
				break;
			  case "video":
				this.mediaNode = n;
				this.playerScreen.appendChild(n);
				break;
			  default:
			}
			this.items[i] = n.id;
		}, this);
	}, startup:function () {
		this.media = dijit.byId(this.mediaNode.id);
		if (!dojo.isAIR) {
			dojo.style(this.media.domNode, "width", "100%");
			dojo.style(this.media.domNode, "height", "100%");
		}
		dojo.forEach(this.items, function (id) {
			if (id !== this.mediaNode.id) {
				var child = dijit.byId(id);
				this.children.push(child);
				if (child) {
					child.setMedia(this.media, this);
				}
			}
		}, this);
	}, onResize:function (evt) {
		var dim = dojo.marginBox(this.domNode);
		if (this.media && this.media.onResize !== null) {
			this.media.onResize(dim);
		}
		dojo.forEach(this.children, function (child) {
			if (child.onResize) {
				child.onResize(dim);
			}
		});
	}});
}

